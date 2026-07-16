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
import type { AnimationAction, AnimationClip, Bone, Group, Object3D, SkinnedMesh } from 'three';
import type { CharacterDef, CharacterId, PetDef, PetId } from '../../types/profile';
import { CHARACTERS, getCharacterDef, getPetDef, PETS } from '../../types/profile';
import type { CreativeLoadout } from '../../types/creativeCharacter';
import {
  creativeLoadoutKey,
  creativeVisibleNodes,
  DEFAULT_CREATIVE_LOADOUT,
  isCreativePartNode,
} from '../../types/creativeCharacter';
import type { Sport } from '../../types';

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
  'jump_end',
  'jump_loop',
  'runningjump',
  'man_jump',
];

/** Cool one-shot flourishes — matched against clip names (no sport moves here) */
const FLOURISH_PATTERNS = [
  'look_around',
  'relaxed',
  'wave',
  'clap',
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
  'look',
  'relax',
];

/** Rare sport-themed flourishes — exact clip name prefixes */
const SPORT_FLOURISH_PATTERNS: Partial<Record<Sport, string[]>> = {
  soccer: ['^Soccer_'],
  basketball: ['^Basketball_'],
};

const SPORT_FLOURISH_CHANCE = 0.14;
const CLIP_FLOURISH_CHANCE = 0.55;

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

function isSportFlourish(name: string, sport?: Sport): boolean {
  if (!sport) return false;
  const patterns = SPORT_FLOURISH_PATTERNS[sport] ?? [];
  return patterns.some(p => new RegExp(p, 'i').test(name));
}

function collectFlourishes(names: string[], idleName?: string, sport?: Sport): string[] {
  const pool = filterAnimNames(names, SHOWCASE_EXCLUDE).filter(n => n !== idleName);
  const found: string[] = [];
  for (const pattern of FLOURISH_PATTERNS) {
    const hit = pool.find(
      n => new RegExp(pattern, 'i').test(n) && !isSportFlourish(n, sport),
    );
    if (hit && !found.includes(hit)) found.push(hit);
  }
  // Other idle variants (Look Around, Relaxed) read more natural than big moves
  for (const n of pool) {
    if (/idle/i.test(n) && n !== idleName && !found.includes(n)) found.push(n);
  }
  return found;
}

function collectSportFlourishes(names: string[], sport?: Sport): string[] {
  if (!sport) return [];
  const patterns = SPORT_FLOURISH_PATTERNS[sport] ?? [];
  return names.filter(
    n =>
      !/idle/i.test(n) &&
      patterns.some(p => new RegExp(p, 'i').test(n)),
  );
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
    sport?: Sport;
  },
) {
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastFlourishRef = useRef<string | null>(null);
  const timeScale = opts?.timeScale ?? 1;
  const restMin = opts?.restMs?.[0] ?? 3800;
  const restMax = opts?.restMs?.[1] ?? 7000;
  const sport = opts?.sport;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const idleName = findIdleName(names);
    const flourishes = collectFlourishes(names, idleName, sport);
    const sportFlourishes = collectSportFlourishes(names, sport);
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

      const pickPool = (): string[] => {
        const useSport =
          sportFlourishes.length > 0 && Math.random() < SPORT_FLOURISH_CHANCE;
        if (useSport) return sportFlourishes;
        return flourishes;
      };

      const pool = pickPool().filter(n => n !== lastFlourishRef.current);
      const candidates = pool.length > 0 ? pool : pickPool();
      const useClip =
        !onlyGenericClip && candidates.length > 0 && Math.random() < CLIP_FLOURISH_CHANCE;

      if (useClip) {
        const clipName = pickRandom(candidates);
        lastFlourishRef.current = clipName;
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
    }, randBetween(Math.max(restMin, 6000), restMax));

    return () => {
      cancelled = true;
      clearTimers();
      Object.values(actions).forEach(a => {
        a?.fadeOut(0.15);
        a?.stop();
      });
    };
  }, [actions, names, enabled, onProcedural, timeScale, restMin, restMax, sport]);
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
  poseMode?: 'animated' | 'procedural' | 'skeletal';
  yawOffset?: number;
  animTimeScale?: number;
  showcaseRestMs?: [number, number];
};

/** Kit Creator: free GLB has a humanoid rig but no animation clips — drive bones. */
function useCreativeSkeletalIdle(scene: Object3D, enabled: boolean, showcase: boolean) {
  const bonesRef = useRef<Record<string, Bone>>({});
  const restRef = useRef<Record<string, { x: number; y: number; z: number }>>({});
  const lookRef = useRef({ next: 2, yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });

  useEffect(() => {
    const map: Record<string, Bone> = {};
    scene.traverse(obj => {
      const bone = obj as Bone;
      if (bone.isBone && bone.name) map[bone.name] = bone;
    });
    bonesRef.current = map;
    const rest: Record<string, { x: number; y: number; z: number }> = {};
    for (const [name, bone] of Object.entries(map)) {
      rest[name] = { x: bone.rotation.x, y: bone.rotation.y, z: bone.rotation.z };
    }
    restRef.current = rest;
  }, [scene]);

  useFrame(({ clock }) => {
    if (!enabled) return;
    const bones = bonesRef.current;
    const rest = restRef.current;
    const t = clock.elapsedTime;
    const breath = Math.sin(t * 1.7) * 0.5 + 0.5;
    const sway = Math.sin(t * 0.85);

    const set = (name: string, dx: number, dy: number, dz: number) => {
      const bone = bones[name];
      const base = rest[name];
      if (!bone || !base) return;
      bone.rotation.x = base.x + dx;
      bone.rotation.y = base.y + dy;
      bone.rotation.z = base.z + dz;
    };

    // Drop T-pose arms into a resting A-pose (local Z is the drop axis on this rig)
    const armDrop = 1.15;
    const elbow = 0.35;
    set('LeftShoulder', 0.05 + breath * 0.02, 0.08, 0.12);
    set('RightShoulder', 0.05 + breath * 0.02, -0.08, -0.12);
    set('LeftArm', 0.08 + sway * 0.03, 0.12, armDrop + breath * 0.03);
    set('RightArm', 0.08 - sway * 0.03, -0.12, -armDrop - breath * 0.03);
    set('LeftForeArm', 0.05, 0.05, elbow + sway * 0.02);
    set('RightForeArm', 0.05, -0.05, -elbow - sway * 0.02);
    set('LeftHand', 0.1, 0, 0.08);
    set('RightHand', 0.1, 0, -0.08);

    // Breathing torso + soft weight shift
    set('Spine', 0.03 + breath * 0.035, sway * 0.015, 0);
    set('Spine1', 0.025 + breath * 0.03, sway * 0.02, 0);
    set('Hips', 0, sway * 0.02, Math.sin(t * 0.55) * 0.015);

    // Look-around on showcase; subtle on store
    const look = lookRef.current;
    if (t > look.next) {
      look.next = t + (showcase ? randBetween(2.2, 4.5) : randBetween(4, 7));
      look.targetYaw = (Math.random() - 0.5) * (showcase ? 0.55 : 0.28);
      look.targetPitch = (Math.random() - 0.5) * 0.12;
    }
    look.yaw += (look.targetYaw - look.yaw) * 0.04;
    look.pitch += (look.targetPitch - look.pitch) * 0.04;
    set('Neck', look.pitch * 0.4, look.yaw * 0.35, 0);
    set('Head', look.pitch * 0.7 + Math.sin(t * 2.1) * 0.015, look.yaw * 0.75, sway * 0.02);

    // Soft knee ease so stance isn't locked
    set('LeftUpLeg', 0.04 + breath * 0.01, 0.03, 0.02);
    set('RightUpLeg', 0.04 + breath * 0.01, -0.03, -0.02);
    set('LeftLeg', -0.08 - breath * 0.02, 0, 0);
    set('RightLeg', -0.08 - breath * 0.02, 0, 0);

    if (showcase) {
      // Occasional “hey” wrist flick on a slow sinusoid cycle
      const wave = Math.max(0, Math.sin(t * 0.55 - 1.2));
      if (wave > 0.15) {
        set('RightArm', 0.2, -0.35, -0.35 - wave * 0.9);
        set('RightForeArm', 0.15, -0.2, -0.5 - wave * 0.4);
        set('RightHand', 0.2 + wave * 0.3, 0, -0.15);
      }
    }

    scene.updateMatrixWorld(true);
  });
}

function PodiumRig({
  scene,
  animations,
  def,
  showcase = false,
  sport,
}: {
  scene: Object3D;
  animations: AnimationClip[];
  def: PodiumModelDef;
  showcase?: boolean;
  sport?: Sport;
}) {
  const group = useRef<Group>(null);
  const targetHeight = def.targetHeight ?? TARGET_HEIGHT;
  const faceYaw = PODIUM_FACE_Y + (def.yawOffset ?? 0);
  const proceduralOnly = def.poseMode === 'procedural';
  const skeletalIdle = def.poseMode === 'skeletal';
  const animTimeScale = def.animTimeScale ?? 1;
  const { scale, position } = useMemo(
    () => fitModel(scene, def.footOffsetY ?? 0, targetHeight),
    [scene, def.footOffsetY, targetHeight],
  );
  const baseY = useRef(position[1]);
  const { actions, names } = useAnimations(
    proceduralOnly || skeletalIdle ? [] : animations,
    scene,
  );
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

  useCreativeSkeletalIdle(scene, skeletalIdle, showcase);

  useHomeShowcase(actions, names, showcase && !proceduralOnly && !skeletalIdle, triggerProcedural, {
    timeScale: animTimeScale,
    restMs: def.showcaseRestMs,
    sport,
  });
  useSimpleIdle(actions, names, !showcase && !proceduralOnly && !skeletalIdle, animTimeScale);

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

    const t = state.clock.elapsedTime;

    if (!showcase) {
      if (proceduralOnly) {
        group.current.position.y = baseY.current + Math.sin(t * 1.1) * 0.012;
        group.current.rotation.x = 0;
        group.current.rotation.z = Math.sin(t * 0.65) * 0.01;
      } else if (skeletalIdle) {
        group.current.position.y = baseY.current + Math.sin(t * 1.5) * 0.008;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      } else {
        group.current.position.y = baseY.current;
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
      }
      group.current.scale.setScalar(scale);
      return;
    }

    // Showcase + skeletal: light root motion only — bones carry the personality
    if (skeletalIdle) {
      group.current.position.y = baseY.current + Math.sin(t * 1.35) * 0.016;
      group.current.rotation.x = Math.sin(t * 0.9) * 0.012;
      group.current.rotation.z = Math.sin(t * 0.7) * 0.014;
      group.current.scale.setScalar(scale);
      return;
    }

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
  sport,
}: {
  def: CharacterDef;
  showcase?: boolean;
  sport?: Sport;
}) {
  const fbx = useFBX(def.modelPath);
  const scene = useMemo(() => SkeletonUtils.clone(fbx), [fbx]);
  return (
    <PodiumRig
      scene={scene}
      animations={fbx.animations}
      def={def}
      showcase={showcase}
      sport={sport}
    />
  );
}

function applyCreativeLoadout(scene: Object3D, loadout: CreativeLoadout) {
  const visible = creativeVisibleNodes(loadout);
  scene.traverse(child => {
    if (!child.name || !isCreativePartNode(child.name)) return;
    child.visible = visible.has(child.name);
  });
}

function GlbModel({
  def,
  showcase = false,
  creativeLoadout,
  sport,
}: {
  def: CharacterDef | PetDef;
  showcase?: boolean;
  creativeLoadout?: CreativeLoadout;
  sport?: Sport;
}) {
  const isCreative =
    'customizable' in def && !!def.customizable && def.modelPath.includes('creative');
  const { scene, animations: embeddedAnims } = useGLTF(def.modelPath);
  const animations = useMemo(
    () => embeddedAnims.map(clip => clip.clone()),
    [embeddedAnims],
  );
  const loadout = creativeLoadout ?? DEFAULT_CREATIVE_LOADOUT;
  const loadoutKey = isCreative ? creativeLoadoutKey(loadout) : '';
  const clone = useMemo(() => {
    const next = SkeletonUtils.clone(scene);
    if (isCreative) applyCreativeLoadout(next, loadout);
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isCreative, loadoutKey]);

  return (
    <PodiumRig
      scene={clone}
      animations={animations}
      def={def}
      showcase={showcase}
      sport={sport}
    />
  );
}

function CharacterModel({
  characterId,
  showcase = false,
  creativeLoadout,
  sport,
}: CharacterModelProps & { creativeLoadout?: CreativeLoadout; sport?: Sport }) {
  const def = getCharacterDef(characterId);
  if (def.modelPath.endsWith('.glb')) {
    return (
      <GlbModel
        def={def}
        showcase={showcase}
        creativeLoadout={creativeLoadout}
        sport={sport}
      />
    );
  }
  return <FbxCharacterModel def={def} showcase={showcase} sport={sport} />;
}

function PetModel({
  petId,
  showcase = false,
  sport,
}: {
  petId: PetId;
  showcase?: boolean;
  sport?: Sport;
}) {
  const def = getPetDef(petId);
  return <GlbModel def={def} showcase={showcase} sport={sport} />;
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
  creativeLoadout,
  sport,
}: {
  characterId?: CharacterId;
  petId?: PetId;
  accent: string;
  hero?: boolean;
  showcase?: boolean;
  hidePodium?: boolean;
  creativeLoadout?: CreativeLoadout;
  sport?: Sport;
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
          <PetModel petId={petId} showcase={showcase} sport={sport} />
        ) : characterId ? (
          <CharacterModel
            characterId={characterId}
            showcase={showcase}
            creativeLoadout={creativeLoadout}
            sport={sport}
          />
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
  /** Outfit for Kit Creator skin */
  creativeLoadout?: CreativeLoadout;
  /** Prefer sport-themed flourishes when available (Fitness Geek) */
  sport?: Sport;
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
  creativeLoadout,
  sport,
}: CharacterPodiumProps) {
  const def = petId ? getPetDef(petId) : getCharacterDef(characterId ?? 'cube-man');
  const glow = accent ?? def.accent;
  const framed = hero || peek;
  const loadoutKey =
    characterId === 'creative' && creativeLoadout
      ? creativeLoadoutKey(creativeLoadout)
      : '';
  const sceneKey = petId ? `pet-${petId}` : `char-${characterId}-${loadoutKey}`;

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
            key={`${sceneKey}-${glow}-${hidePodium ? 'flat' : 'pod'}-${sport ?? 'any'}`}
            characterId={characterId}
            petId={petId}
            accent={glow}
            hero={framed}
            showcase={hero}
            hidePodium={hidePodium}
            creativeLoadout={creativeLoadout}
            sport={sport}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
