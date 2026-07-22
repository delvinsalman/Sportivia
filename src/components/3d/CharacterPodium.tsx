import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, useAnimations, useFBX, useGLTF } from '@react-three/drei';
import { Box3, Color, Float32BufferAttribute, LoopOnce, LoopRepeat, MeshPhysicalMaterial, Vector3 } from 'three';
import { SkeletonUtils } from 'three-stdlib';
import type { AnimationAction, AnimationClip, Bone, Group, Mesh, MeshStandardMaterial, Object3D, SkinnedMesh } from 'three';
import type {
  CharacterDef,
  CharacterId,
  DogVariantId,
  PetDef,
  PetId,
  RabbitVariantId,
} from '../../types/profile';
import {
  CHARACTERS,
  DOG_VARIANTS,
  getCharacterDef,
  getDogVariantDef,
  getPetDef,
  getRabbitVariantDef,
  PETS,
  RABBIT_VARIANTS,
} from '../../types/profile';
import type { CreativeLoadout } from '../../types/creativeCharacter';
import {
  creativeLoadoutKey,
  creativeVisibleNodes,
  DEFAULT_CREATIVE_LOADOUT,
  isCreativePartNode,
} from '../../types/creativeCharacter';
import type { AthleteLoadout } from '../../types/athleteCharacter';
import {
  athleteLoadoutKey,
  athleteRegionForBone,
  DEFAULT_ATHLETE_LOADOUT,
} from '../../types/athleteCharacter';
import type { BobLoadout } from '../../types/bobCharacter';
import {
  bobLoadoutKey,
  DEFAULT_BOB_LOADOUT,
  getBobFinish,
  isBobLockedMaterial,
} from '../../types/bobCharacter';
import type { Sport } from '../../types';

const TARGET_HEIGHT = 1.35;
const PODIUM_GROUP_Y = -0.92;
const PODIUM_SURFACE_Y = PODIUM_GROUP_Y + 0.094;
const FEET_LIFT = 0.09;
const STAND_Y = PODIUM_SURFACE_Y + FEET_LIFT;
const PODIUM_FACE_Y = 0.35;
/** Kay Lousberg landing pad — bbox top is y=0.5 at unit scale. */
const LANDING_PAD_PATH = '/models/landing-pad.glb';
const LANDING_PAD_HEIGHT = 0.5;
const LANDING_PAD_SCALE = 0.92;

CHARACTERS.filter(c => c.modelPath.endsWith('.fbx')).forEach(c => useFBX.preload(c.modelPath));
CHARACTERS.filter(c => c.modelPath.endsWith('.glb')).forEach(c => useGLTF.preload(c.modelPath));
RABBIT_VARIANTS.forEach(variant => useGLTF.preload(variant.modelPath));
DOG_VARIANTS.forEach(variant => useGLTF.preload(variant.modelPath));
PETS.forEach(p => useGLTF.preload(p.modelPath));
useGLTF.preload(LANDING_PAD_PATH);

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

type ProceduralMove = 'hop' | 'lean' | 'celebrate' | 'nod' | 'doubleHop' | 'spin';

const PROCEDURAL_MOVES: ProceduralMove[] = ['hop', 'lean', 'celebrate', 'nod'];
const RABBIT_PROCEDURAL_MOVES: ProceduralMove[] = ['doubleHop', 'hop', 'spin', 'celebrate', 'nod'];

/** Rabbit-only showcase clips — hoppy / playful set */
const RABBIT_FLOURISH_PATTERNS = [
  'jump(?!_land|_idle)',
  'duck',
  'wave',
  'punch',
  'yes',
  'sitting_eating',
  'sitting_start',
  'chop_start',
  'no',
];

/** Quaternius athlete — punch / jump / work fidgets between idle */
const ATHLETE_FLOURISH_PATTERNS = [
  'jump',
  'punch',
  'working',
];

const ATHLETE_FLOURISH_CHANCE = 0.88;

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

function collectPetFlourishes(names: string[], idleName?: string): string[] {
  return filterAnimNames(names, [
    ...SHOWCASE_EXCLUDE,
    'attack',
    'kick',
    'headbutt',
    'hitreact',
    'death',
  ]).filter(
    name =>
      name !== idleName &&
      (/idle[_|].*(2|head|low)/i.test(name) || /eating/i.test(name)),
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
    case 'doubleHop':
      return 1.35;
    case 'spin':
      return 1.5;
  }
}

function collectRabbitFlourishes(names: string[], idleName?: string): string[] {
  const pool = filterAnimNames(names, [
    ...SHOWCASE_EXCLUDE,
    'sitting_end',
    'sitting_idle',
    'jump_land',
    'jump_idle',
  ]).filter(n => n !== idleName);
  const found: string[] = [];
  for (const pattern of RABBIT_FLOURISH_PATTERNS) {
    const hit = pool.find(n => new RegExp(pattern, 'i').test(n));
    if (hit && !found.includes(hit)) found.push(hit);
  }
  return found;
}

function collectAthleteFlourishes(names: string[], idleName?: string): string[] {
  const pool = filterAnimNames(names, [
    ...SHOWCASE_EXCLUDE,
    'armatureaction',
    'death',
  ]).filter(n => n !== idleName);
  const found: string[] = [];
  for (const pattern of ATHLETE_FLOURISH_PATTERNS) {
    const hits = pool.filter(n => new RegExp(pattern, 'i').test(n));
    for (const hit of hits) {
      if (!found.includes(hit)) found.push(hit);
    }
  }
  return found;
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
    petId?: PetId;
    characterId?: CharacterId;
  },
) {
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastFlourishRef = useRef<string | null>(null);
  const timeScale = opts?.timeScale ?? 1;
  const restMin = opts?.restMs?.[0] ?? 3800;
  const restMax = opts?.restMs?.[1] ?? 7000;
  const sport = opts?.sport;
  const petId = opts?.petId;
  const characterId = opts?.characterId;
  const isAthlete = characterId === 'athlete';

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const idleName = findIdleName(names);
    const flourishes = petId
      ? collectPetFlourishes(names, idleName)
      : isAthlete
        ? collectAthleteFlourishes(names, idleName)
        : collectFlourishes(names, idleName, sport);
    const sportFlourishes = isAthlete ? [] : collectSportFlourishes(names, sport);
    const idleAction = idleName ? actions[idleName] : null;
    // Single Mixamo-style clip: keep it as ambient idle, never "flourish" with itself
    const onlyGenericClip =
      names.length === 1 && !/idle|stand|breath|float/i.test(names[0] ?? '');
    const clipChance = isAthlete ? ATHLETE_FLOURISH_CHANCE : CLIP_FLOURISH_CHANCE;

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
      if (petId && candidates.length === 0) {
        scheduleNextFlourish();
        return;
      }
      const useClip =
        !onlyGenericClip &&
        candidates.length > 0 &&
        (petId ? true : Math.random() < clipChance);

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
      const move = pickRandom(
        isAthlete ? (['hop', 'celebrate', 'doubleHop', 'spin'] as ProceduralMove[]) : PROCEDURAL_MOVES,
      );
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
    // Athlete kicks off flourishes sooner so Jump/Punch show up quickly
    const firstMin = isAthlete ? Math.max(restMin, 2200) : Math.max(restMin, 6000);
    const firstMax = isAthlete ? Math.max(restMax, 4200) : restMax;
    restTimerRef.current = setTimeout(() => {
      if (!cancelled) playFlourish();
    }, randBetween(firstMin, firstMax));

    return () => {
      cancelled = true;
      clearTimers();
      Object.values(actions).forEach(a => {
        a?.fadeOut(0.15);
        a?.stop();
      });
    };
  }, [actions, names, enabled, onProcedural, timeScale, restMin, restMax, sport, petId, characterId, isAthlete]);
}

/**
 * Rabbit personality: bouncy idle + playful clip flourishes (jump/duck/wave/punch).
 * Distinct from the generic character showcase loop.
 */
function useRabbitShowcase(
  actions: Record<string, AnimationAction | null>,
  names: string[],
  enabled: boolean,
  onProcedural: (move: ProceduralMove) => void,
  restMs: [number, number] = [4_200, 7_800],
) {
  const restTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastFlourishRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const idleName = findIdleName(names);
    const flourishes = collectRabbitFlourishes(names, idleName);
    const idleAction = idleName ? actions[idleName] : null;

    const clearTimers = () => {
      clearTimeout(restTimerRef.current);
      clearTimeout(endTimerRef.current);
      restTimerRef.current = undefined;
      endTimerRef.current = undefined;
    };

    const scheduleNext = () => {
      clearTimeout(restTimerRef.current);
      restTimerRef.current = setTimeout(() => {
        if (!cancelled) playFlourish();
      }, randBetween(restMs[0], restMs[1]));
    };

    const startIdle = () => {
      if (cancelled) return;
      if (idleAction) {
        Object.values(actions).forEach(a => {
          if (a && a !== idleAction) a.fadeOut(0.2);
        });
        idleAction.reset();
        idleAction.setLoop(LoopRepeat, Infinity);
        idleAction.clampWhenFinished = false;
        // Slightly peppier than other skins
        idleAction.timeScale = 1.12;
        idleAction.fadeIn(0.25).play();
      }
      scheduleNext();
    };

    const playFlourish = () => {
      if (cancelled) return;

      const pool = flourishes.filter(n => n !== lastFlourishRef.current);
      const candidates = pool.length ? pool : flourishes;
      const useClip = candidates.length > 0 && Math.random() < 0.78;

      if (useClip) {
        const clipName = pickRandom(candidates);
        lastFlourishRef.current = clipName;
        const action = actions[clipName];
        if (!action) {
          const move = pickRandom(RABBIT_PROCEDURAL_MOVES);
          onProcedural(move);
          endTimerRef.current = setTimeout(() => {
            if (!cancelled) scheduleNext();
          }, proceduralDuration(move) * 1000 + 180);
          return;
        }

        if (idleAction) idleAction.fadeOut(0.18);
        Object.values(actions).forEach(a => {
          if (a && a !== action && a !== idleAction) a.stop();
        });

        action.reset();
        action.setLoop(LoopOnce, 1);
        action.clampWhenFinished = true;
        action.timeScale = randBetween(1.0, 1.2);
        action.fadeIn(0.15).play();

        const durationMs = (action.getClip().duration / action.timeScale) * 1000 + 180;
        endTimerRef.current = setTimeout(() => {
          if (!cancelled) startIdle();
        }, durationMs);
        return;
      }

      const move = pickRandom(RABBIT_PROCEDURAL_MOVES);
      onProcedural(move);
      endTimerRef.current = setTimeout(() => {
        if (!cancelled) scheduleNext();
      }, proceduralDuration(move) * 1000 + 180);
    };

    if (idleAction) {
      idleAction.reset();
      idleAction.setLoop(LoopRepeat, Infinity);
      idleAction.timeScale = 1.12;
      idleAction.fadeIn(0.2).play();
    }
    restTimerRef.current = setTimeout(() => {
      if (!cancelled) playFlourish();
    }, randBetween(2_200, 4_000));

    return () => {
      cancelled = true;
      clearTimers();
      Object.values(actions).forEach(a => {
        a?.fadeOut(0.12);
        a?.stop();
      });
    };
  }, [actions, names, enabled, onProcedural, restMs]);
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
  rabbitVariant?: RabbitVariantId;
}

type PodiumModelDef = CharacterDef | PetDef;

type StarterGesture = 'wave' | 'nod' | 'stretch';

function useStarterSkeletalIdle(
  scene: Object3D,
  characterId: CharacterId | undefined,
  enabled: boolean,
  showcase: boolean,
) {
  const bonesRef = useRef<Record<string, Bone>>({});
  const restRef = useRef<Record<string, { x: number; y: number; z: number }>>({});
  const lookRef = useRef({ next: 2, yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
  const gestureRef = useRef<{
    type: StarterGesture;
    start: number;
    duration: number;
  } | null>(null);
  const nextGestureRef = useRef(Date.now() + randBetween(8_000, 14_000));

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
    if (!enabled || (characterId !== 'cube-man' && characterId !== 'cube-woman')) return;

    const bones = bonesRef.current;
    const rest = restRef.current;
    const t = clock.elapsedTime;
    const breath = Math.sin(t * 1.35) * 0.5 + 0.5;
    const weight = Math.sin(t * 0.42);

    const set = (name: string, dx: number, dy: number, dz: number) => {
      const bone = bones[name];
      const base = rest[name];
      if (!bone || !base) return;
      bone.rotation.x = base.x + dx;
      bone.rotation.y = base.y + dy;
      bone.rotation.z = base.z + dz;
    };

    // Continuous skeletal idle: breathing, soft knees, and a slow weight transfer.
    set('Body', 0, weight * 0.015, weight * 0.012);
    set('Hips', 0, weight * 0.025, weight * 0.018);
    set('Abdomen', breath * 0.025, weight * 0.018, 0);
    set('Torso', breath * 0.022, weight * 0.022, -weight * 0.012);
    set('UpperLeg.L', 0.025 + breath * 0.008, 0, weight * 0.018);
    set('UpperLeg.R', 0.025 + breath * 0.008, 0, -weight * 0.018);
    set('LowerLeg.L', -0.045 - breath * 0.012, 0, 0);
    set('LowerLeg.R', -0.045 - breath * 0.012, 0, 0);
    set('Shoulder.L', breath * 0.012, 0, 0.025);
    set('Shoulder.R', breath * 0.012, 0, -0.025);
    set('UpperArm.L', 0.015 + weight * 0.015, 0, 0.035);
    set('UpperArm.R', 0.015 - weight * 0.015, 0, -0.035);
    set('LowerArm.L', 0.025, 0, 0.02);
    set('LowerArm.R', 0.025, 0, -0.02);

    const look = lookRef.current;
    if (t > look.next) {
      look.next = t + randBetween(showcase ? 4.5 : 6, showcase ? 8 : 11);
      look.targetYaw = (Math.random() - 0.5) * (showcase ? 0.42 : 0.25);
      look.targetPitch = (Math.random() - 0.5) * 0.1;
    }
    look.yaw += (look.targetYaw - look.yaw) * 0.035;
    look.pitch += (look.targetPitch - look.pitch) * 0.035;
    set('Neck', look.pitch * 0.35, look.yaw * 0.4, 0);
    set('Head', look.pitch * 0.75, look.yaw * 0.7, weight * 0.012);

    const now = Date.now();
    if (showcase && !gestureRef.current && now > nextGestureRef.current) {
      gestureRef.current = {
        type: pickRandom<StarterGesture>(['wave', 'nod', 'stretch']),
        start: now / 1000,
        duration: randBetween(1.8, 2.5),
      };
      nextGestureRef.current = now + randBetween(13_000, 24_000);
    }

    const gesture = gestureRef.current;
    if (gesture) {
      const elapsed = now / 1000 - gesture.start;
      const u = Math.min(1, elapsed / gesture.duration);
      const ease = Math.sin(u * Math.PI);

      if (gesture.type === 'wave') {
        const wave = Math.sin(elapsed * 8) * 0.18 * ease;
        set('Shoulder.R', 0.08 * ease, -0.08 * ease, -0.18 * ease);
        set('UpperArm.R', -0.15 * ease, 0.15 * ease, -0.95 * ease);
        set('LowerArm.R', -0.2 * ease, 0, -0.75 * ease + wave);
        set('Fist.R', 0, wave * 1.4, -0.12 * ease);
      } else if (gesture.type === 'nod') {
        set('Neck', Math.sin(u * Math.PI * 2) * 0.13 * ease, look.yaw * 0.25, 0);
        set('Head', Math.sin(u * Math.PI * 2) * 0.2 * ease, look.yaw * 0.4, 0);
      } else {
        set('Torso', -0.07 * ease, 0, 0);
        set('UpperArm.L', -0.1 * ease, 0, 0.32 * ease);
        set('UpperArm.R', -0.1 * ease, 0, -0.32 * ease);
        set('LowerArm.L', -0.12 * ease, 0, 0.14 * ease);
        set('LowerArm.R', -0.12 * ease, 0, -0.14 * ease);
      }

      if (u >= 1) gestureRef.current = null;
    }

    scene.updateMatrixWorld(true);
  });
}

type PetSpecialMove =
  | 'look'
  | 'paw'
  | 'alert'
  | 'bark'
  | 'ready'
  | 'rear'
  | 'spin'
  | 'chew'
  | 'lower'
  | 'shake'
  | 'nuzzle'
  | 'step'
  | 'twitch';

const PET_SPECIALS: Record<PetId, PetSpecialMove[]> = {
  wolf: ['look', 'paw', 'alert', 'bark'],
  horse: ['ready', 'shake', 'step', 'rear'],
  deer: ['spin', 'alert', 'nuzzle'],
  alpaca: ['chew', 'lower', 'twitch' as PetSpecialMove],
  pug: [],
  fish: [],
  raccoon: [],
  cat: [],
  sheep: [],
  frog: [],
  shark: [],
  snake: [],
  dog: ['look', 'paw', 'bark'],
};

function petSpecialDuration(type: PetSpecialMove) {
  switch (type) {
    case 'look':
      return 1.4;
    case 'paw':
      return 1.8;
    case 'alert':
      return 1.5;
    case 'bark':
      return 1.6;
    case 'ready':
      return 2.2;
    case 'rear':
      return 3.1;
    case 'shake':
      return 1.8;
    case 'step':
      return 1.5;
    case 'spin':
      return 2.1;
    case 'nuzzle':
      return 2.0;
    case 'chew':
      return 2.4;
    case 'lower':
      return 2.3;
    case 'twitch':
      return 1.8;
    default:
      return 1.6;
  }
}

function usePetSkeletalIdle(scene: Object3D, petId: PetId, enabled: boolean, showcase: boolean) {
  const bonesRef = useRef<Record<string, Bone>>({});
  const restRef = useRef<Record<string, { x: number; y: number; z: number }>>({});
  const lookRef = useRef({ next: 2, yaw: 0, pitch: 0, targetYaw: 0, targetPitch: 0 });
  const specialRef = useRef<{ type: PetSpecialMove; start: number; duration: number } | null>(null);
  const nextSpecialRef = useRef<number>(Date.now() + randBetween(9_000, 15_000));

  useEffect(() => {
    const map: Record<string, Bone> = {};
    scene.traverse(obj => {
      const bone = obj as Bone;
      if (bone.isBone && bone.name) map[bone.name.toLowerCase()] = bone;
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
    if (!Object.keys(bones).length) return;

    const t = clock.elapsedTime;

    const findBone = (pattern: RegExp) =>
      Object.keys(bones).find(name => pattern.test(name)) || undefined;

    const set = (name: string, dx: number, dy: number, dz: number) => {
      const bone = bones[name.toLowerCase()];
      const base = rest[name.toLowerCase()];
      if (!bone || !base) return;
      bone.rotation.x = base.x + dx;
      bone.rotation.y = base.y + dy;
      bone.rotation.z = base.z + dz;
    };

    // KayKit quadrupeds use suffixes (FrontShoulderL, Ear1R), not "left/right".
    const headBone = findBone(/^head$|head|skull|cranium|nose|snout|mouth/);
    const neckBone = findBone(/^neck3$|^neck2$|^neck1$|neck/);
    const spineBone = findBone(/^torso2$|^torso3$|^torso$|spine|back/);
    const hipsBone = findBone(/^body$|^back$|hip|pelvis|root/);
    const tailBone = findBone(/^tail1$|^tail$|tail/);
    const tailBones = Object.keys(bones).filter(name => /^tail\d*$/.test(name));
    const leftFront = findBone(/^frontshoulderl$|^frontupperlegl$|^frontlegl$|left.*(front|fore)/);
    const rightFront = findBone(/^frontshoulderr$|^frontupperlegr$|^frontlegr$|right.*(front|fore)/);
    const leftFrontLower = findBone(/^frontlowerlegl$/);
    const rightFrontLower = findBone(/^frontlowerlegr$/);
    const leftBack = findBone(/^backshoulderl$|^backupperlegl$|^backlegl$|left.*(hind|rear|back)/);
    const rightBack = findBone(/^backshoulderr$|^backupperlegr$|^backlegr$|right.*(hind|rear|back)/);
    const leftEar = findBone(/^ear1l$|^ear2l$|ear.*left|left.*ear/);
    const rightEar = findBone(/^ear1r$|^ear2r$|ear.*right|right.*ear/);

    const breath = Math.sin(t * 1.1) * 0.015 + 0.02;
    const sway = Math.sin(t * 0.55) * 0.04;

    const look = lookRef.current;
    if (t > look.next) {
      look.next = t + (showcase ? randBetween(3.5, 6.5) : randBetween(5.5, 9));
      look.targetYaw = (Math.random() - 0.5) * (showcase ? 0.4 : 0.24);
      look.targetPitch = (Math.random() - 0.5) * 0.08;
    }
    look.yaw += (look.targetYaw - look.yaw) * 0.05;
    look.pitch += (look.targetPitch - look.pitch) * 0.05;

    if (neckBone) set(neckBone, look.pitch * 0.45, look.yaw * 0.45, 0);
    if (headBone) set(headBone, look.pitch * 0.8 + Math.sin(t * 2.3) * 0.012, look.yaw * 0.8, sway * 0.02);
    if (tailBone) set(tailBone, 0, Math.sin(t * 1.9) * 0.14, 0);
    tailBones.forEach((name, index) => {
      const phase = index * 0.35;
      const amount = 0.1 + index * 0.025;
      set(name, 0, Math.sin(t * 1.8 - phase) * amount, 0);
    });
    if (leftEar) set(leftEar, Math.sin(t * 2.8) * 0.08, 0, 0);
    if (rightEar) set(rightEar, Math.sin(t * 2.8 + 0.4) * 0.08, 0, 0);

    if (leftFront) set(leftFront, -0.012 + Math.sin(t * 0.9) * 0.01, 0, 0);
    if (rightFront) set(rightFront, -0.01 + Math.sin(t * 0.9 + 0.7) * 0.01, 0, 0);
    if (leftBack) set(leftBack, -0.008 + Math.sin(t * 0.85) * 0.008, 0, 0);
    if (rightBack) set(rightBack, -0.008 + Math.sin(t * 0.85 + 0.5) * 0.008, 0, 0);
    if (spineBone) set(spineBone, breath * 0.4, sway * 0.2, 0);
    if (hipsBone) set(hipsBone, 0, sway * 0.15, 0);

    const specials = PET_SPECIALS[petId] || ['look'];
    const special = specialRef.current;
    const now = Date.now();
    if (!special && now > nextSpecialRef.current) {
      const pick = pickRandom(specials.length ? specials : (['look'] as PetSpecialMove[]));
      specialRef.current = {
        type: pick,
        start: now / 1000,
        duration: petSpecialDuration(pick),
      };
      nextSpecialRef.current =
        now + randBetween(showcase ? 12_000 : 15_000, showcase ? 21_000 : 25_000);
    }

    if (special) {
      const elapsed = Date.now() / 1000 - special.start;
      const u = Math.min(1, elapsed / special.duration);
      const ease = Math.sin(u * Math.PI);

      switch (petId) {
        case 'wolf':
          if (special.type === 'paw') {
            if (leftFront) set(leftFront, -0.24 * ease, 0, 0);
            if (rightFront) set(rightFront, -0.12 * ease, 0, 0);
            if (headBone) set(headBone, -0.08 * ease, 0, 0);
          } else if (special.type === 'alert') {
            if (spineBone) set(spineBone, 0, ease * 0.18, 0);
            if (hipsBone) set(hipsBone, -0.06 * ease, 0, 0);
            if (headBone) set(headBone, Math.sin(elapsed * 2.4) * 0.18 * ease, 0, 0);
          } else if (special.type === 'bark') {
            if (neckBone) set(neckBone, -0.2 * ease, 0, 0);
            if (headBone) set(headBone, 0.32 * ease, 0, 0);
            if (tailBone) set(tailBone, 0, Math.sin(elapsed * 5.2) * 0.22 * ease, 0);
          }
          break;
        case 'horse':
          if (special.type === 'rear') {
            // Rare showpiece: rear up, curl the forelegs, toss the head, then settle.
            const kick = Math.sin(u * Math.PI * 3) * ease;
            if (hipsBone) set(hipsBone, -0.32 * ease, 0, 0);
            if (spineBone) set(spineBone, -0.42 * ease, 0, 0);
            if (neckBone) set(neckBone, 0.3 * ease, 0, -0.08 * kick);
            if (headBone) set(headBone, -0.26 * ease, 0.08 * kick, 0);
            if (leftFront) set(leftFront, -1.05 * ease + kick * 0.12, 0, 0.12 * ease);
            if (rightFront) set(rightFront, -1.05 * ease - kick * 0.12, 0, -0.12 * ease);
            if (leftFrontLower) set(leftFrontLower, 0.85 * ease, 0, 0);
            if (rightFrontLower) set(rightFrontLower, 0.85 * ease, 0, 0);
            if (leftBack) set(leftBack, 0.18 * ease, 0, 0);
            if (rightBack) set(rightBack, 0.18 * ease, 0, 0);
            tailBones.forEach((name, index) => {
              set(name, 0, Math.sin(elapsed * 6 - index * 0.45) * 0.28 * ease, 0);
            });
          } else if (special.type === 'ready') {
            if (spineBone) set(spineBone, 0.12 * ease, 0, 0);
            if (hipsBone) set(hipsBone, -0.14 * ease, 0, 0);
            if (neckBone) set(neckBone, 0.14 * ease, 0, 0);
            if (headBone) set(headBone, 0.2 * ease, 0, 0);
            if (tailBone) set(tailBone, 0, Math.sin(elapsed * 3.2) * 0.2 * ease, 0);
          } else if (special.type === 'shake') {
            if (headBone) set(headBone, Math.sin(elapsed * 8) * 0.2 * ease, 0, 0);
            if (tailBone) set(tailBone, 0, Math.sin(elapsed * 8 + 1.2) * 0.28 * ease, 0);
          } else if (special.type === 'step') {
            if (leftFront) set(leftFront, -0.18 * ease + Math.sin(elapsed * 5.5) * 0.04, 0, 0);
            if (rightFront) set(rightFront, -0.14 * ease + Math.sin(elapsed * 5.5 + 1.1) * 0.04, 0, 0);
            if (leftBack) set(leftBack, -0.08 * ease, 0, 0);
            if (rightBack) set(rightBack, -0.1 * ease, 0, 0);
          }
          break;
        case 'deer':
          if (special.type === 'spin') {
            if (spineBone) set(spineBone, 0.04 * ease, Math.sin(elapsed * 2.2) * 0.2 * ease, 0);
            if (neckBone) set(neckBone, 0.12 * ease, Math.sin(elapsed * 2.2) * 0.26 * ease, 0);
            if (headBone) set(headBone, 0.18 * ease, Math.sin(elapsed * 2.2) * 0.2 * ease, 0);
          } else if (special.type === 'nuzzle') {
            if (neckBone) set(neckBone, -0.25 * ease, 0, 0);
            if (headBone) set(headBone, -0.22 * ease, 0, 0);
            if (tailBone) set(tailBone, 0, Math.sin(elapsed * 3.4) * 0.16 * ease, 0);
          } else if (special.type === 'alert') {
            if (headBone) set(headBone, 0.22 * ease, 0, 0);
            if (spineBone) set(spineBone, 0, ease * 0.16, 0);
          }
          break;
        case 'alpaca':
          if (special.type === 'chew') {
            if (neckBone) set(neckBone, Math.sin(elapsed * 4.8) * 0.12 * ease, 0, 0);
            if (headBone) set(headBone, Math.sin(elapsed * 4.8) * 0.14 * ease, 0, 0);
          } else if (special.type === 'lower') {
            if (neckBone) set(neckBone, -0.24 * ease, 0, 0);
            if (headBone) set(headBone, -0.18 * ease, 0, 0);
          } else if (special.type === 'twitch') {
            if (leftEar) set(leftEar, 0.18 * ease, 0, 0);
            if (rightEar) set(rightEar, -0.18 * ease, 0, 0);
            if (tailBone) set(tailBone, 0, Math.sin(elapsed * 5.5) * 0.16 * ease, 0);
          }
          break;
      }

      if (elapsed >= special.duration) {
        specialRef.current = null;
      }
    }

    scene.updateMatrixWorld(true);
  });
}

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
  petId,
  characterId,
  frozen = false,
}: {
  scene: Object3D;
  animations: AnimationClip[];
  def: PodiumModelDef;
  showcase?: boolean;
  sport?: Sport;
  petId?: PetId;
  characterId?: CharacterId;
  /** Bind pose only — no idle / flourish motion */
  frozen?: boolean;
}) {
  const group = useRef<Group>(null);
  const targetHeight = def.targetHeight ?? TARGET_HEIGHT;
  const faceYaw = PODIUM_FACE_Y + (('yawOffset' in def ? def.yawOffset : 0) ?? 0);
  const proceduralOnly = 'poseMode' in def && def.poseMode === 'procedural';
  const skeletalIdle = 'poseMode' in def && def.poseMode === 'skeletal';
  const animTimeScale = 'animTimeScale' in def ? def.animTimeScale ?? 1 : 1;
  const { scale, position } = useMemo(
    () => fitModel(scene, def.footOffsetY ?? 0, targetHeight),
    [scene, def.footOffsetY, targetHeight],
  );
  const baseY = useRef(position[1]);
  const isNaturalPet =
    petId === 'wolf' ||
    petId === 'alpaca' ||
    petId === 'horse' ||
    petId === 'deer' ||
    petId === 'dog';
  const isStarterSkeletal =
    skeletalIdle && (characterId === 'cube-man' || characterId === 'cube-woman');
  const isCreativeSkeletal = skeletalIdle && characterId === 'creative';
  const isRabbit = characterId === 'bunny';
  const { actions, names } = useAnimations(
    frozen || isNaturalPet || proceduralOnly || skeletalIdle ? [] : animations,
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

  usePetSkeletalIdle(scene, petId ?? 'pug', !frozen && isNaturalPet, showcase);
  useStarterSkeletalIdle(scene, characterId, !frozen && isStarterSkeletal, showcase);
  useCreativeSkeletalIdle(scene, !frozen && isCreativeSkeletal, showcase);

  const rabbitRest = def.showcaseRestMs ?? ([4_200, 7_800] as [number, number]);
  useRabbitShowcase(
    actions,
    names,
    !frozen && isRabbit && showcase && !proceduralOnly && !skeletalIdle,
    triggerProcedural,
    rabbitRest,
  );

  useHomeShowcase(
    actions,
    names,
    !frozen && !isRabbit && !isNaturalPet && showcase && !proceduralOnly && !skeletalIdle,
    triggerProcedural,
    {
      timeScale: animTimeScale,
      restMs: def.showcaseRestMs ?? (petId ? [10_000, 18_000] : undefined),
      sport,
      petId,
      characterId,
    },
  );
  useSimpleIdle(
    actions,
    names,
    !frozen && !isRabbit && !isNaturalPet && !showcase && !proceduralOnly && !skeletalIdle,
    animTimeScale,
  );
  // Store / peek: keep rabbit's peppy idle looping even without showcase flourishes
  useSimpleIdle(
    actions,
    names,
    !frozen && isRabbit && !showcase && !proceduralOnly && !skeletalIdle,
    1.12,
  );

  useEffect(() => {
    if (frozen || !proceduralOnly) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      triggerProcedural(pickRandom(PROCEDURAL_MOVES));
      const restDelay = showcase ? randBetween(3200, 6200) : randBetween(7500, 14000);
      timer = setTimeout(tick, restDelay);
    };
    const initialDelay = showcase ? randBetween(1600, 2800) : randBetween(4500, 9000);
    let timer = setTimeout(tick, initialDelay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [frozen, showcase, proceduralOnly, triggerProcedural]);

  useFrame(state => {
    if (!group.current) return;

    group.current.rotation.y = faceYaw;
    group.current.position.x = position[0];
    group.current.position.z = position[2];

    if (frozen) {
      group.current.position.y = baseY.current;
      group.current.rotation.x = 0;
      group.current.rotation.z = 0;
      group.current.scale.setScalar(scale);
      return;
    }

    const t = state.clock.elapsedTime;

    // Rabbit: unique springy hop idle (different from other skins' soft sway)
    if (isRabbit && !proceduralOnly && !skeletalIdle) {
      const hopWave = Math.max(0, Math.sin(t * 5.4));
      const squash = 1 + hopWave * 0.045;
      const stretch = 1 - hopWave * 0.03;
      let y = baseY.current + hopWave * (showcase ? 0.11 : 0.055);
      let rotX = Math.sin(t * 2.2) * (showcase ? 0.03 : 0.015);
      let rotZ = Math.sin(t * 1.6) * (showcase ? 0.04 : 0.018);
      let s = scale;

      const proc = procedural.current;
      if (showcase && proc.move) {
        const elapsed = performance.now() / 1000 - proc.start;
        const u = Math.min(1, elapsed / proc.duration);
        const ease = Math.sin(u * Math.PI);

        switch (proc.move) {
          case 'hop':
            y += Math.sin(u * Math.PI) * 0.28;
            s = scale * (1 + Math.sin(u * Math.PI) * 0.06);
            break;
          case 'doubleHop':
            y += Math.abs(Math.sin(u * Math.PI * 2)) * 0.26;
            s = scale * (1 + Math.abs(Math.sin(u * Math.PI * 2)) * 0.05);
            rotZ += Math.sin(u * Math.PI * 2) * 0.12;
            break;
          case 'spin':
            group.current.rotation.y = faceYaw + u * Math.PI * 2;
            y += ease * 0.1;
            break;
          case 'lean':
            rotZ += Math.sin(u * Math.PI * 2) * 0.22;
            break;
          case 'celebrate':
            y += ease * 0.18;
            s = scale * (1 + ease * 0.1);
            rotX -= ease * 0.08;
            break;
          case 'nod':
            rotX += Math.sin(u * Math.PI * 2) * 0.28;
            break;
        }

        if (u >= 1) procedural.current.move = null;
      }

      group.current.position.y = y;
      group.current.rotation.x = rotX;
      group.current.rotation.z = rotZ;
      group.current.scale.set(s * stretch, s * squash, s * stretch);
      return;
    }

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
        case 'doubleHop':
          y += Math.abs(Math.sin(u * Math.PI * 2)) * 0.2;
          break;
        case 'spin':
          group.current.rotation.y = faceYaw + u * Math.PI * 2;
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
  frozen = false,
}: {
  def: CharacterDef;
  showcase?: boolean;
  sport?: Sport;
  frozen?: boolean;
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
      characterId={def.id}
      frozen={frozen}
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

function applyAthleteLoadout(scene: Object3D, loadout: AthleteLoadout) {
  const hex = {
    skin: new Color(loadout.skin),
    jersey: new Color(loadout.jersey),
    shorts: new Color(loadout.shorts),
    shoes: new Color(loadout.shoes),
  };

  scene.traverse(child => {
    const mesh = child as SkinnedMesh;
    if (!mesh.isSkinnedMesh || !mesh.skeleton || !mesh.geometry) return;

    const geo = mesh.geometry;
    const joints = geo.getAttribute('skinIndex');
    const weights = geo.getAttribute('skinWeight');
    if (!joints || !weights) return;

    const boneNames = mesh.skeleton.bones.map(b => b.name);
    const count = joints.count;
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      let bestW = -1;
      let bestBone = 0;
      for (let k = 0; k < 4; k++) {
        const w = weights.getComponent(i, k);
        if (w > bestW) {
          bestW = w;
          bestBone = joints.getComponent(i, k);
        }
      }
      const region = athleteRegionForBone(boneNames[bestBone] ?? '');
      const c = hex[region];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new Float32BufferAttribute(colors, 3));

    const paint = (mat: MeshStandardMaterial) => {
      const next = mat.clone();
      next.vertexColors = true;
      next.color.set('#ffffff');
      next.metalness = 0.05;
      next.roughness = 0.72;
      next.needsUpdate = true;
      return next;
    };

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(m => paint(m as MeshStandardMaterial));
    } else if (mesh.material) {
      mesh.material = paint(mesh.material as MeshStandardMaterial);
    }
  });
}

function applyBobLoadout(scene: Object3D, loadout: BobLoadout) {
  const finish = getBobFinish(loadout);
  const tint = new Color(finish.hex);
  const shade = tint.clone().multiplyScalar(0.88);
  const shift = new Color(finish.shift ?? finish.hex);

  scene.traverse(child => {
    const mesh = child as Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const paint = (mat: MeshStandardMaterial, darker: boolean) => {
      if (isBobLockedMaterial(mat.name)) return mat;
      const base = darker ? shade : tint;

      if (finish.kind === 'chameleon') {
        // GTA-style angle flip — mix primary/shift by fresnel (works without env map)
        const next = new MeshPhysicalMaterial({
          name: mat.name,
          color: base,
          metalness: 0.55,
          roughness: 0.28,
          clearcoat: 0.65,
          clearcoatRoughness: 0.18,
          sheen: 0.85,
          sheenColor: shift,
          sheenRoughness: 0.3,
        });
        const shiftClone = shift.clone();
        const key = `bob-cham-v3-${finish.id}-${darker ? 'd' : 'b'}`;
        next.onBeforeCompile = shader => {
          shader.uniforms.bobShift = { value: shiftClone };
          shader.fragmentShader = shader.fragmentShader
            .replace(
              '#include <common>',
              `#include <common>
uniform vec3 bobShift;`,
            )
            .replace(
              'vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',
              `vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	{
		vec3 viewDir = normalize( vViewPosition );
		float fresnel = pow( clamp( 1.0 - abs( dot( normalize( normal ), viewDir ) ), 0.0, 1.0 ), 1.45 );
		vec3 flipColor = mix( outgoingLight, bobShift, 0.82 );
		outgoingLight = mix( outgoingLight, flipColor, fresnel );
		outgoingLight += bobShift * fresnel * 0.22;
	}`,
            );
        };
        next.customProgramCacheKey = () => key;
        next.needsUpdate = true;
        return next;
      }

      if (finish.kind === 'metal') {
        const next = new MeshPhysicalMaterial({
          name: mat.name,
          color: base,
          metalness: 0.92,
          roughness: 0.18,
          clearcoat: 0.35,
          clearcoatRoughness: 0.15,
        });
        next.needsUpdate = true;
        return next;
      }

      if (finish.kind === 'neon') {
        const next = mat.clone();
        next.color.copy(base);
        next.emissive.copy(base).multiplyScalar(0.85);
        next.emissiveIntensity = 1.35;
        next.metalness = 0.05;
        next.roughness = 0.35;
        next.vertexColors = false;
        next.needsUpdate = true;
        return next;
      }

      const next = mat.clone();
      next.color.copy(base);
      next.emissive?.set('#000000');
      if ('emissiveIntensity' in next) next.emissiveIntensity = 0;
      next.vertexColors = false;
      next.metalness = 0.08;
      next.roughness = 0.55;
      next.needsUpdate = true;
      return next;
    };

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map(m => {
        const std = m as MeshStandardMaterial;
        const darker = /^material$/i.test(std.name);
        return paint(std, darker);
      });
    } else {
      const std = mesh.material as MeshStandardMaterial;
      const darker = /^material$/i.test(std.name);
      mesh.material = paint(std, darker);
    }
  });
}

function GlbModel({
  def,
  showcase = false,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  sport,
  petId,
  frozen = false,
}: {
  def: CharacterDef | PetDef;
  showcase?: boolean;
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  sport?: Sport;
  petId?: PetId;
  frozen?: boolean;
}) {
  const isCreative =
    'customizable' in def && !!def.customizable && def.modelPath.includes('creative');
  const isAthlete = 'id' in def && def.id === 'athlete';
  const isBob = 'id' in def && def.id === 'bob';
  const { scene, animations: embeddedAnims } = useGLTF(def.modelPath);
  const animations = useMemo(
    () => embeddedAnims.map(clip => clip.clone()),
    [embeddedAnims],
  );
  const loadout = creativeLoadout ?? DEFAULT_CREATIVE_LOADOUT;
  const kit = athleteLoadout ?? DEFAULT_ATHLETE_LOADOUT;
  const bobKit = bobLoadout ?? DEFAULT_BOB_LOADOUT;
  const loadoutKey = isCreative
    ? creativeLoadoutKey(loadout)
    : isAthlete
      ? athleteLoadoutKey(kit)
      : isBob
        ? bobLoadoutKey(bobKit)
        : '';
  const clone = useMemo(() => {
    const next = SkeletonUtils.clone(scene);
    if (isCreative) applyCreativeLoadout(next, loadout);
    if (isAthlete) applyAthleteLoadout(next, kit);
    if (isBob) applyBobLoadout(next, bobKit);
    return next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, isCreative, isAthlete, isBob, loadoutKey]);

  return (
    <PodiumRig
      scene={clone}
      animations={animations}
      def={def}
      showcase={showcase}
      sport={sport}
      petId={petId}
      characterId={petId ? undefined : (def.id as CharacterId)}
      frozen={frozen}
    />
  );
}

function CharacterModel({
  characterId,
  showcase = false,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  rabbitVariant,
  sport,
  frozen = false,
}: CharacterModelProps & {
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  sport?: Sport;
  frozen?: boolean;
}) {
  const baseDef = getCharacterDef(characterId);
  const def =
    characterId === 'bunny'
      ? { ...baseDef, modelPath: getRabbitVariantDef(rabbitVariant ?? 'base').modelPath }
      : baseDef;
  if (def.modelPath.endsWith('.glb')) {
    return (
      <GlbModel
        def={def}
        showcase={showcase}
        creativeLoadout={creativeLoadout}
        athleteLoadout={athleteLoadout}
        bobLoadout={bobLoadout}
        sport={sport}
        frozen={frozen}
      />
    );
  }
  return <FbxCharacterModel def={def} showcase={showcase} sport={sport} frozen={frozen} />;
}

function PetModel({
  petId,
  dogVariant,
  showcase = false,
  sport,
}: {
  petId: PetId;
  dogVariant?: DogVariantId;
  showcase?: boolean;
  sport?: Sport;
}) {
  const baseDef = getPetDef(petId);
  const def =
    petId === 'dog'
      ? { ...baseDef, modelPath: getDogVariantDef(dogVariant ?? 'husky').modelPath }
      : baseDef;
  return <GlbModel def={def} showcase={showcase} sport={sport} petId={petId} />;
}

function PodiumStage({ accent }: { accent: string }) {
  const { scene } = useGLTF(LANDING_PAD_PATH);
  const pad = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    cloned.traverse(child => {
      const mesh = child as Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const applyTint = (material: Mesh['material']) => {
        if (!material || Array.isArray(material)) return material;
        const next = material.clone();
        const std = next as {
          emissive?: { set: (c: string) => void };
          emissiveIntensity?: number;
        };
        if (std.emissive?.set) {
          std.emissive.set(accent);
          std.emissiveIntensity = 0.18;
        }
        return next;
      };
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(m => applyTint(m) as typeof m)
        : (applyTint(mesh.material) as typeof mesh.material);
    });
    return cloned;
  }, [accent, scene]);

  const y = PODIUM_SURFACE_Y - LANDING_PAD_HEIGHT * LANDING_PAD_SCALE;

  return (
    <group position={[0, y, 0]} scale={LANDING_PAD_SCALE}>
      <primitive object={pad} />
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
  portrait = false,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  rabbitVariant,
  dogVariant,
  sport,
  frozen = false,
}: {
  characterId?: CharacterId;
  petId?: PetId;
  accent: string;
  hero?: boolean;
  showcase?: boolean;
  hidePodium?: boolean;
  portrait?: boolean;
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  rabbitVariant?: RabbitVariantId;
  dogVariant?: DogVariantId;
  sport?: Sport;
  frozen?: boolean;
}) {
  return (
    <>
      {portrait && <PortraitCamera />}
      <ambientLight intensity={hero || portrait ? 1.25 : 1.1} />
      <hemisphereLight args={['#ffffff', '#3a3a48', hero || portrait ? 1.05 : 0.75]} />
      {hero || portrait ? (
        <HeroSpotlights accent={accent} />
      ) : (
        <>
          <directionalLight position={[4, 6, 4]} intensity={1.8} />
          <spotLight position={[2.5, 5, 3]} angle={0.4} penumbra={0.5} intensity={2.5} />
          <pointLight position={[-2, 2, -1]} intensity={0.9} color={accent} />
          <pointLight position={[2, 1.5, 2]} intensity={0.6} color="#ffffff" />
        </>
      )}
      {portrait && (
        <>
          <directionalLight position={[0.6, 1.4, 2.2]} intensity={2.4} color="#ffffff" />
          <pointLight position={[0, 1.1, 1.6]} intensity={1.8} color="#ffffff" />
        </>
      )}

      {!hidePodium && <PodiumStage accent={accent} />}
      <ModelErrorBoundary characterId={characterId ?? 'cube-man'}>
        {petId ? (
          <PetModel petId={petId} dogVariant={dogVariant} showcase={showcase} sport={sport} />
        ) : characterId ? (
          <CharacterModel
            characterId={characterId}
            showcase={showcase}
            creativeLoadout={creativeLoadout}
            athleteLoadout={athleteLoadout}
            bobLoadout={bobLoadout}
            rabbitVariant={rabbitVariant}
            sport={sport}
            frozen={frozen}
          />
        ) : null}
      </ModelErrorBoundary>

      {!portrait && (
        <ContactShadows
          position={[0, hidePodium ? STAND_Y - 0.02 : PODIUM_SURFACE_Y - 0.06, 0]}
          opacity={hidePodium ? 0.22 : 0.32}
          scale={hidePodium ? 3.2 : 5}
          blur={3.5}
          far={3.5}
        />
      )}
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

/** Frame the upper body / head for the home profile avatar. */
function PortraitCamera() {
  const { camera, scene } = useThree();
  const framed = useRef(false);

  useFrame(() => {
    if (framed.current) return;

    const box = new Box3();
    let hasMesh = false;
    scene.traverse(obj => {
      const mesh = obj as Mesh;
      if (!mesh.isMesh || !mesh.visible) return;
      // Ignore shadow planes / tiny helpers
      const geom = mesh.geometry;
      if (!geom) return;
      box.expandByObject(mesh);
      hasMesh = true;
    });
    if (!hasMesh || box.isEmpty()) return;

    const size = box.getSize(new Vector3());
    if (size.y < 0.05) return;

    const center = box.getCenter(new Vector3());
    // Aim at face band (upper ~22% of the fitted body)
    const headY = box.min.y + size.y * 0.78;
    const focus = new Vector3(center.x, headY, center.z);
    const dist = Math.max(size.y * 0.4, size.x * 0.9, size.z * 0.9, 0.9);
    camera.position.set(focus.x, headY + size.y * 0.015, focus.z + dist);
    camera.near = 0.05;
    camera.far = 40;
    camera.lookAt(focus);
    camera.updateProjectionMatrix();
    framed.current = true;
  });

  return null;
}

interface CharacterPodiumProps {
  characterId?: CharacterId;
  petId?: PetId;
  accent?: string;
  className?: string;
  height?: number | string;
  bare?: boolean;
  hero?: boolean;
  /** Same camera/podium framing as hero, without showcase motion */
  peek?: boolean;
  /** Companion mode — model only, no disc */
  hidePodium?: boolean;
  /** Static bind pose — no idle / flourish motion */
  frozen?: boolean;
  /** Close-up head framing (implies frozen + hidePodium) */
  portrait?: boolean;
  /** Outfit for Kit Creator skin */
  creativeLoadout?: CreativeLoadout;
  /** Kit colors for Pro Athlete skin */
  athleteLoadout?: AthleteLoadout;
  /** Body tint for Boxscore Bob */
  bobLoadout?: BobLoadout;
  /** Appearance included with the Rabbit skin */
  rabbitVariant?: RabbitVariantId;
  /** Breed included with the Street Dog pet */
  dogVariant?: DogVariantId;
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
  frozen = false,
  portrait = false,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  rabbitVariant,
  dogVariant,
  sport,
}: CharacterPodiumProps) {
  const def = petId ? getPetDef(petId) : getCharacterDef(characterId ?? 'cube-man');
  const glow = accent ?? def.accent;
  const framed = hero || peek;
  const isPortrait = portrait;
  const isFrozen = frozen || isPortrait;
  const noPodium = hidePodium || isPortrait;
  const loadoutKey =
    characterId === 'creative' && creativeLoadout
      ? creativeLoadoutKey(creativeLoadout)
      : characterId === 'athlete' && athleteLoadout
        ? athleteLoadoutKey(athleteLoadout)
        : characterId === 'bob' && bobLoadout
          ? bobLoadoutKey(bobLoadout)
          : '';
  const sceneKey = petId ? `pet-${petId}` : `char-${characterId}-${loadoutKey}`;
  const variantKey =
    characterId === 'bunny'
      ? rabbitVariant ?? 'base'
      : petId === 'dog'
        ? dogVariant ?? 'husky'
        : '';

  return (
    <div
      className={`relative ${framed || bare || isPortrait ? 'overflow-hidden' : 'overflow-hidden'} ${bare ? className : `rounded-2xl border border-[#2b2d31]/80 ${className}`}`}
      style={{
        height,
        paddingBottom: framed || bare ? (isPortrait ? 0 : 20) : 0,
        ...(bare
          ? { background: 'transparent' }
          : {
              background: `radial-gradient(ellipse 70% 60% at 50% 90%, ${glow}14 0%, transparent 65%), linear-gradient(180deg, #101114 0%, #0a0a0b 100%)`,
            }),
      }}
    >
      {framed && !noPodium && (
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
          position: isPortrait
            ? [0, 0.35, 1.55]
            : framed
              ? petId
                ? [0, 0.35, 5.8]
                : [0, 0.05, 4.4]
              : [0, 0.55, 3.1],
          fov: isPortrait ? 32 : framed ? (petId ? 38 : 34) : 42,
        }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent', height: '100%', width: '100%' }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMappingExposure = framed || isPortrait ? 1.2 : 1;
          if (isPortrait) camera.lookAt(0, 0.25, 0);
          else if (framed) camera.lookAt(0, petId ? 0.15 : -0.15, 0);
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <Scene
            key={`${sceneKey}-${variantKey}-${glow}-${noPodium ? 'flat' : 'pod'}-${isFrozen ? 'still' : 'live'}-${sport ?? 'any'}-p${isPortrait ? 1 : 0}`}
            characterId={characterId}
            petId={petId}
            accent={glow}
            hero={framed || isPortrait}
            showcase={hero && !isFrozen}
            hidePodium={noPodium}
            portrait={isPortrait}
            creativeLoadout={creativeLoadout}
            athleteLoadout={athleteLoadout}
            bobLoadout={bobLoadout}
            rabbitVariant={rabbitVariant}
            dogVariant={dogVariant}
            sport={sport}
            frozen={isFrozen}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
