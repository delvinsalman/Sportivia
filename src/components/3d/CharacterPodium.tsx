import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { Box3, LoopOnce, LoopRepeat, Vector3 } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import type { AnimationAction, AnimationClip, Group, Object3D, SkinnedMesh } from 'three';
import type { CharacterDef, CharacterId, PetDef, PetId } from '../../types/profile';
import { CHARACTERS, getCharacterDef, getPetDef, PETS } from '../../types/profile';

const TARGET_HEIGHT = 1.35;
const PODIUM_GROUP_Y = -0.92;
const PODIUM_SURFACE_Y = PODIUM_GROUP_Y + 0.094;
const FEET_LIFT = 0.09;
const STAND_Y = PODIUM_SURFACE_Y + FEET_LIFT;
const PODIUM_FACE_Y = 0.35;

CHARACTERS.filter(c => c.modelPath.endsWith('.fbx')).forEach(c => useFBX.preload(c.modelPath));
CHARACTERS.filter(c => c.modelPath.endsWith('.glb')).forEach(c => useGLTF.preload(c.modelPath));
PETS.forEach(p => useGLTF.preload(p.modelPath));

class ModelErrorBoundary extends Component<
  { children: ReactNode; characterId: CharacterId },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`Failed to load character "${this.props.characterId}":`, error);
  }

  render() {
    if (this.state.hasError) {
      const def = getCharacterDef(this.props.characterId);
      return (
        <mesh>
          <sphereGeometry args={[0.42, 16, 16]} />
          <meshStandardMaterial color={def.accent} roughness={0.35} />
        </mesh>
      );
    }
    return this.props.children;
  }
}

function fitModel(scene: Object3D, footOffsetY = 0, targetHeight = TARGET_HEIGHT) {
  scene.traverse(child => {
    if ('isMesh' in child && child.isMesh) {
      child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;
    }
    const skinned = child as SkinnedMesh;
    if (skinned.isSkinnedMesh && skinned.skeleton) {
      skinned.skeleton.update();
    }
  });

  scene.updateMatrixWorld(true);
  const box = new Box3().setFromObject(scene);
  const size = box.getSize(new Vector3());
  // Fit tall/deep animals (e.g. alpaca) so they don't clip the camera
  const dominant = Math.max(size.y, size.z * 0.72, size.x * 0.72, 1);
  const scale = targetHeight / dominant;
  const center = box.getCenter(new Vector3());

  return {
    scale,
    position: [
      -center.x * scale,
      STAND_Y - box.min.y * scale + footOffsetY,
      -center.z * scale,
    ] as [number, number, number],
  };
}

/** Clips we never want on the home podium */
const SHOWCASE_EXCLUDE = [
  'death',
  'hit',
  'run',
  'walk',
  'gun',
  'weapon',
  'assembly',
  'holding',
  'sword',
  'land',
  'jump',
];

/** Cool one-shot flourishes — matched against clip names */
const FLOURISH_PATTERNS = [
  'wave',
  'clap',
  'punch',
  'duck',
  'yes',
  'cheer',
  'victory',
  'salute',
  'sitting_eating',
  'sitting',
  'chop_start',
  'pan_start',
  'no',
  'eating',
  'headbutt',
  'attack',
];

type ProceduralMove = 'hop' | 'lean' | 'celebrate' | 'nod';

const PROCEDURAL_MOVES: ProceduralMove[] = ['hop', 'lean', 'celebrate', 'nod'];

interface ProceduralState {
  move: ProceduralMove | null;
  start: number;
  duration: number;
}

function filterAnimNames(names: string[], exclude: string[]): string[] {
  if (!exclude.length) return names;
  return names.filter(
    n => !exclude.some(pattern => new RegExp(pattern, 'i').test(n)),
  );
}

function findIdleName(names: string[]): string | undefined {
  const pool = filterAnimNames(names, SHOWCASE_EXCLUDE);
  return (
    pool.find(n => /idle(?!_)/i.test(n)) ??
    pool.find(n => /idle/i.test(n)) ??
    pool.find(n => /stand|breath|float/i.test(n)) ??
    pool[0]
  );
}

function collectFlourishes(names: string[], idleName?: string): string[] {
  const pool = filterAnimNames(names, SHOWCASE_EXCLUDE).filter(n => n !== idleName);
  const found: string[] = [];
  for (const pattern of FLOURISH_PATTERNS) {
    const hit = pool.find(n => new RegExp(pattern, 'i').test(n));
    if (hit && !found.includes(hit)) found.push(hit);
  }
  return found;
}

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function proceduralDuration(move: ProceduralMove) {
  switch (move) {
    case 'hop':
      return 1.1;
    case 'lean':
      return 1.4;
    case 'celebrate':
      return 1.25;
    case 'nod':
      return 1.0;
  }
}

/**
 * Home page only: loop idle, then every few seconds play a random cool flourish
 * (skeletal clip when available, otherwise a procedural move).
 */
function useHomeShowcase(
  actions: Record<string, AnimationAction | null>,
  names: string[],
  enabled: boolean,
  onProcedural: (move: ProceduralMove) => void,
  opts?: {
    timeScale?: number;
    restMs?: [number, number];
  },
) {
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const timeScale = opts?.timeScale ?? 1;
  const restMin = opts?.restMs?.[0] ?? 3800;
  const restMax = opts?.restMs?.[1] ?? 7000;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const idleName = findIdleName(names);
    const flourishes = collectFlourishes(names, idleName);
    const idleAction = idleName ? actions[idleName] : null;
    // Single Mixamo-style clip: keep it as ambient idle, never "flourish" with itself
    const onlyGenericClip =
      names.length === 1 && !/idle|stand|breath|float/i.test(names[0] ?? '');

    const clearTimers = () => {
      clearTimeout(restTimerRef.current);
      clearTimeout(endTimerRef.current);
      restTimerRef.current = undefined;
      endTimerRef.current = undefined;
    };

    const scheduleNextFlourish = () => {
      clearTimeout(restTimerRef.current);
      restTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        playFlourish();
      }, randBetween(restMin, restMax));
    };

    const startIdle = () => {
      if (cancelled) return;
      if (idleAction) {
        Object.values(actions).forEach(a => {
          if (a && a !== idleAction) a.fadeOut(0.25);
        });
        idleAction.reset();
        idleAction.setLoop(LoopRepeat, Infinity);
        idleAction.clampWhenFinished = false;
        idleAction.timeScale = (onlyGenericClip ? 0.9 : 1) * timeScale;
        idleAction.fadeIn(0.3).play();
      }
      scheduleNextFlourish();
    };

    const playFlourish = () => {
      if (cancelled) return;

      const useClip = !onlyGenericClip && flourishes.length > 0 && Math.random() < 0.75;
      if (useClip) {
        const clipName = pickRandom(flourishes);
        const action = actions[clipName];
        if (!action) {
          const move = pickRandom(PROCEDURAL_MOVES);
          onProcedural(move);
          endTimerRef.current = setTimeout(() => {
            if (!cancelled) scheduleNextFlourish();
          }, proceduralDuration(move) * 1000 + 200);
          return;
        }

        if (idleAction) idleAction.fadeOut(0.2);
        Object.values(actions).forEach(a => {
          if (a && a !== action && a !== idleAction) a.stop();
        });

        action.reset();
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.timeScale = randBetween(0.95, 1.15) * timeScale;
        action.fadeIn(0.2).play();

        const durationMs = (action.getClip().duration / action.timeScale) * 1000 + 200;
        endTimerRef.current = setTimeout(() => {
          if (cancelled) return;
          startIdle();
        }, durationMs);
        return;
      }

      // Procedural flourish on top of idle (hop / lean / nod / celebrate)
      const move = pickRandom(PROCEDURAL_MOVES);
      onProcedural(move);
      endTimerRef.current = setTimeout(() => {
        if (!cancelled) scheduleNextFlourish();
      }, proceduralDuration(move) * 1000 + 200);
    };

    if (idleAction) {
      idleAction.reset();
      idleAction.setLoop(LoopRepeat, Infinity);
      idleAction.timeScale = (onlyGenericClip ? 0.9 : 1) * timeScale;
      idleAction.fadeIn(0.25).play();
    }
    restTimerRef.current = setTimeout(() => {
      if (!cancelled) playFlourish();
    }, randBetween(Math.max(restMin, 2800), restMax));

    return () => {
      cancelled = true;
      clearTimers();
      Object.values(actions).forEach(a => {
        a?.fadeOut(0.15);
        a?.stop();
      });
    };
  }, [actions, names, enabled, onProcedural, timeScale, restMin, restMax]);
}

function useSimpleIdle(
  actions: Record<string, AnimationAction | null>,
  names: string[],
  enabled: boolean,
  timeScale = 1,
) {
  useEffect(() => {
    if (!enabled || !names.length) return;
    const idle =
      names.find(n => /idle/i.test(n)) ??
      names.find(n => /stand/i.test(n)) ??
      names[0];
    const action = idle ? actions[idle] : undefined;
    if (!action) return;

    action.reset();
    action.timeScale = timeScale;
    action.fadeIn(0.2).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [actions, names, enabled, timeScale]);
}

interface CharacterModelProps {
  characterId: CharacterId;
  /** Home-page showcase flourishes */
  showcase?: boolean;
}

type PodiumModelDef = {
  footOffsetY?: number;
  targetHeight?: number;
  accent: string;
  modelPath: string;
  name: string;
  poseMode?: 'animated' | 'procedural';
  yawOffset?: number;
  animTimeScale?: number;
  showcaseRestMs?: [number, number];
};

function PodiumRig({
  scene,
  animations,
  def,
  showcase = false,
}: {
  scene: Object3D;
  animations: AnimationClip[];
  def: PodiumModelDef;
  showcase?: boolean;
}) {
  const group = useRef<Group>(null);
  const targetHeight = def.targetHeight ?? TARGET_HEIGHT;
  const faceYaw = PODIUM_FACE_Y + (def.yawOffset ?? 0);
  const proceduralOnly = def.poseMode === 'procedural';
  const animTimeScale = def.animTimeScale ?? 1;
  const { scale, position } = useMemo(
    () => fitModel(scene, def.footOffsetY ?? 0, targetHeight),
    [scene, def.footOffsetY, targetHeight],
  );
  const baseY = useRef(position[1]);
  const { actions, names } = useAnimations(proceduralOnly ? [] : animations, scene);
  const procedural = useRef<ProceduralState>({ move: null, start: 0, duration: 1 });

  useEffect(() => {
    baseY.current = position[1];
  }, [position]);

  const triggerProcedural = useCallback((move: ProceduralMove) => {
    procedural.current = {
      move,
      start: performance.now() / 1000,
      duration: proceduralDuration(move),
    };
  }, []);

  useHomeShowcase(actions, names, showcase && !proceduralOnly, triggerProcedural, {
    timeScale: animTimeScale,
    restMs: def.showcaseRestMs,
  });
  useSimpleIdle(actions, names, !showcase && !proceduralOnly, animTimeScale);

  useEffect(() => {
    if (!showcase || !proceduralOnly) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      triggerProcedural(pickRandom(PROCEDURAL_MOVES));
      timer = setTimeout(tick, randBetween(3200, 6200));
    };
    let timer = setTimeout(tick, randBetween(1600, 2800));
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [showcase, proceduralOnly, triggerProcedural]);

  useFrame(state => {
    if (!group.current) return;

    group.current.rotation.y = faceYaw;
    group.current.position.x = position[0];
    group.current.position.z = position[2];

    if (!showcase) {
      group.current.position.y = baseY.current;
      group.current.rotation.x = 0;
      group.current.rotation.z = 0;
      group.current.scale.setScalar(scale);
      return;
    }

    const t = state.clock.elapsedTime;
    const proc = procedural.current;
    let y = baseY.current;
    let rotX = 0;
    let rotZ = 0;
    let s = scale;

    y += Math.sin(t * 1.2) * 0.028;
    rotZ += Math.sin(t * 0.7) * 0.018;

    if (proc.move) {
      const elapsed = performance.now() / 1000 - proc.start;
      const u = Math.min(1, elapsed / proc.duration);
      const ease = Math.sin(u * Math.PI);

      switch (proc.move) {
        case 'hop':
          y += Math.sin(u * Math.PI) * 0.22;
          s = scale * (1 + Math.sin(u * Math.PI) * 0.04);
          break;
        case 'lean':
          rotZ += Math.sin(u * Math.PI * 2) * 0.18;
          break;
        case 'celebrate':
          y += ease * 0.14;
          s = scale * (1 + ease * 0.08);
          rotX -= ease * 0.06;
          break;
        case 'nod':
          rotX += Math.sin(u * Math.PI * 2) * 0.22;
          break;
      }

      if (u >= 1) {
        procedural.current.move = null;
      }
    }

    group.current.position.y = y;
    group.current.rotation.x = rotX;
    group.current.rotation.z = rotZ;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} position={position} scale={scale} rotation={[0, faceYaw, 0]}>
      <primitive object={scene} />
    </group>
  );
}

function FbxCharacterModel({
  def,
  showcase = false,
}: {
  def: CharacterDef;
  showcase?: boolean;
}) {
  const fbx = useFBX(def.modelPath);
  const scene = useMemo(() => SkeletonUtils.clone(fbx), [fbx]);
  return (
    <PodiumRig
      scene={scene}
      animations={fbx.animations}
      def={def}
      showcase={showcase}
    />
  );
}

function GlbModel({
  def,
  showcase = false,
}: {
  def: CharacterDef | PetDef;
  showcase?: boolean;
}) {
  const { scene, animations } = useGLTF(def.modelPath);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  return (
    <PodiumRig
      scene={clone}
      animations={animations}
      def={def}
      showcase={showcase}
    />
  );
}

function CharacterModel({
  characterId,
  showcase = false,
}: CharacterModelProps) {
  const def = getCharacterDef(characterId);
  if (def.modelPath.endsWith('.glb')) {
    return <GlbModel def={def} showcase={showcase} />;
  }
  return <FbxCharacterModel def={def} showcase={showcase} />;
}

function PetModel({
  petId,
  showcase = false,
}: {
  petId: PetId;
  showcase?: boolean;
}) {
  const def = getPetDef(petId);
  return <GlbModel def={def} showcase={showcase} />;
}

function PodiumStage({ accent }: { accent: string }) {
  return (
    <group position={[0, -0.92, 0]}>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.05, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.1} />
      </mesh>

      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.82, 0.84, 0.07, 64]} />
        <meshStandardMaterial
          color="#141518"
          emissive={accent}
          emissiveIntensity={0.12}
          metalness={0.35}
          roughness={0.72}
        />
      </mesh>

      <mesh position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 64]} />
        <meshStandardMaterial
          color="#0c0d0f"
          emissive={accent}
          emissiveIntensity={0.06}
          metalness={0.15}
          roughness={0.85}
        />
      </mesh>

      <mesh position={[0, 0.094, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.8, 64]} />
        <meshBasicMaterial color={accent} transparent opacity={0.65} />
      </mesh>
    </group>
  );
}

function HeroSpotlights({ accent }: { accent: string }) {
  return (
    <>
      <directionalLight position={[3, 5, 4]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-2, 3, 2]} intensity={1} color="#e8e8ff" />
      <spotLight position={[0, 5.5, 2]} angle={0.5} penumbra={0.3} intensity={5.5} color="#ffffff" castShadow />
      <spotLight position={[-1.5, 3.5, 2.5]} angle={0.55} penumbra={0.5} intensity={2.4} color={accent} />
      <spotLight position={[1.5, 3.5, 2.5]} angle={0.55} penumbra={0.5} intensity={2} color={accent} />
      <pointLight position={[0, 1.5, 3.5]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 3, -1]} intensity={0.65} color={accent} />
    </>
  );
}

function Scene({
  characterId,
  petId,
  accent,
  hero,
  showcase = false,
  hidePodium = false,
}: {
  characterId?: CharacterId;
  petId?: PetId;
  accent: string;
  hero?: boolean;
  showcase?: boolean;
  hidePodium?: boolean;
}) {
  return (
    <>
      <ambientLight intensity={hero ? 1.15 : 1.1} />
      <hemisphereLight args={['#ffffff', '#3a3a48', hero ? 0.95 : 0.75]} />
      {hero ? (
        <HeroSpotlights accent={accent} />
      ) : (
        <>
          <directionalLight position={[4, 6, 4]} intensity={1.8} />
          <spotLight position={[2.5, 5, 3]} angle={0.4} penumbra={0.5} intensity={2.5} />
          <pointLight position={[-2, 2, -1]} intensity={0.9} color={accent} />
          <pointLight position={[2, 1.5, 2]} intensity={0.6} color="#ffffff" />
        </>
      )}

      {!hidePodium && <PodiumStage accent={accent} />}
      <ModelErrorBoundary characterId={characterId ?? 'cube-man'}>
        {petId ? (
          <PetModel petId={petId} showcase={showcase} />
        ) : characterId ? (
          <CharacterModel characterId={characterId} showcase={showcase} />
        ) : null}
      </ModelErrorBoundary>

      <ContactShadows
        position={[0, hidePodium ? STAND_Y - 0.02 : PODIUM_SURFACE_Y - 0.06, 0]}
        opacity={hidePodium ? 0.22 : 0.32}
        scale={hidePodium ? 3.2 : 5}
        blur={3.5}
        far={3.5}
      />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[0.3, 0.6, 0.3]} />
      <meshStandardMaterial color="#3f4147" wireframe />
    </mesh>
  );
}

interface CharacterPodiumProps {
  characterId?: CharacterId;
  petId?: PetId;
  accent?: string;
  className?: string;
  height?: number;
  bare?: boolean;
  hero?: boolean;
  /** Same camera/podium framing as hero, without showcase motion */
  peek?: boolean;
  /** Companion mode — model only, no disc */
  hidePodium?: boolean;
}

export function CharacterPodium({
  characterId,
  petId,
  accent,
  className = '',
  height = 280,
  bare = false,
  hero = false,
  peek = false,
  hidePodium = false,
}: CharacterPodiumProps) {
  const def = petId ? getPetDef(petId) : getCharacterDef(characterId ?? 'cube-man');
  const glow = accent ?? def.accent;
  const framed = hero || peek;
  const sceneKey = petId ? `pet-${petId}` : `char-${characterId}`;

  return (
    <div
      className={`relative ${framed || bare ? 'overflow-visible' : 'overflow-hidden'} ${bare ? className : `rounded-2xl border border-[#2b2d31]/80 ${className}`}`}
      style={{
        height,
        paddingBottom: framed || bare ? 20 : 0,
        ...(bare
          ? { background: 'transparent' }
          : {
              background: `radial-gradient(ellipse 70% 60% at 50% 90%, ${glow}14 0%, transparent 65%), linear-gradient(180deg, #101114 0%, #0a0a0b 100%)`,
            }),
      }}
    >
      {framed && !hidePodium && (
        <div
          className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            bottom: '6%',
            width: '55%',
            height: '22%',
            background: `radial-gradient(ellipse 80% 100% at 50% 100%, ${glow}18 0%, transparent 75%)`,
            filter: 'blur(10px)',
          }}
        />
      )}
      {!bare && !framed && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 80% at 50% 100%, ${glow}18 0%, transparent 70%)` }}
        />
      )}
      <Canvas
        camera={{
          position: framed
            ? petId
              ? [0, 0.35, 5.8]
              : [0, 0.05, 4.4]
            : [0, 0.55, 3.1],
          fov: framed ? (petId ? 38 : 34) : 42,
        }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', height: '100%' }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMappingExposure = framed ? 1.15 : 1;
          if (framed) camera.lookAt(0, petId ? 0.15 : -0.15, 0);
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            key={`${sceneKey}-${glow}-${hidePodium ? 'flat' : 'pod'}`}
            characterId={characterId}
            petId={petId}
            accent={glow}
            hero={framed}
            showcase={hero}
            hidePodium={hidePodium}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
