import type { PlayerStats } from '../types';
import type { CreativeLoadout } from './creativeCharacter';
import type { AthleteLoadout } from './athleteCharacter';
import type { BobLoadout } from './bobCharacter';
import { DEFAULT_CREATIVE_LOADOUT } from './creativeCharacter';
import { DEFAULT_ATHLETE_LOADOUT } from './athleteCharacter';
import { DEFAULT_BOB_LOADOUT } from './bobCharacter';

export type CharacterId =
  | 'cube-man'
  | 'cube-woman'
  | 'ava'
  | 'citizen-1'
  | 'citizen-2'
  | 'citizen-3'
  | 'soccer-boy'
  | 'nerd-player'
  | 'ref-bot'
  | 'officer'
  | 'manager'
  | 'astronaut'
  | 'cosmo'
  | 'panda'
  | 'bob'
  | 'bunny'
  | 'ninja'
  | 'mako'
  | 'creative'
  | 'athlete';
export type RabbitVariantId = 'base' | 'grey' | 'blond' | 'pigtails' | 'cyan-hair';
export type DogVariantId = 'husky' | 'shiba' | 'black-shiba' | 'german-shepherd';
export type PetId =
  | 'pug'
  | 'dog'
  | 'fish'
  | 'cat'
  | 'raccoon'
  | 'wolf'
  | 'alpaca'
  | 'sheep'
  | 'deer'
  | 'horse'
  | 'shark'
  | 'frog'
  | 'snake';

export interface RabbitVariantDef {
  id: RabbitVariantId;
  name: string;
  modelPath: string;
}

export interface DogVariantDef {
  id: DogVariantId;
  name: string;
  modelPath: string;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  tagline: string;
  price: number;
  modelPath: string;
  /** Flat card art — preferred on Cards screen to avoid WebGL. */
  cardImage?: string;
  /** Base card overall before upgrades (FIFA-style). */
  baseOvr: number;
  accent: string;
  /** Per-model foot placement on the podium */
  footOffsetY?: number;
  /** Override default podium height fit */
  targetHeight?: number;
  /**
   * procedural = bind pose + hop/lean flourishes (for Mixamo / single-clip models)
   * animated = use skeletal clips (default)
   * skeletal = no clips; drive humanoid bones for idle/breath (Kit Creator)
   */
  poseMode?: 'animated' | 'procedural' | 'skeletal';
  /** Extra yaw so the model faces the camera */
  yawOffset?: number;
  /** Modular outfit builder (Creative Character) */
  customizable?: boolean;
  /** Home showcase: min/max ms between flourishes */
  showcaseRestMs?: [number, number];
}

export interface PetDef {
  id: PetId;
  name: string;
  tagline: string;
  price: number;
  modelPath: string;
  accent: string;
  footOffsetY?: number;
  /** Pets are smaller than characters on the podium */
  targetHeight?: number;
  /** Playback speed for skeletal clips (1 = normal) */
  animTimeScale?: number;
  /** Home showcase: min/max ms between flourishes */
  showcaseRestMs?: [number, number];
}

export interface PlayerProfile {
  playerName: string;
  coins: number;
  xp: number;
  level: number;
  equippedCharacter: CharacterId;
  unlockedCharacters: CharacterId[];
  equippedPet: PetId | null;
  unlockedPets: PetId[];
  /** Outfit for the creative / customizable skin */
  creativeLoadout: CreativeLoadout;
  /** Kit colors for the Athlete skin */
  athleteLoadout: AthleteLoadout;
  /** Body tint for Boxscore Bob */
  bobLoadout: BobLoadout;
  /** Selected look included with the Rabbit skin bundle */
  rabbitVariant: RabbitVariantId;
  /** Selected breed included with the Dog pet */
  dogVariant: DogVariantId;
  /** Per-skin per-stat upgrade bonuses. Overall averages the six live stats (up to 99). */
  characterStatLevels: Partial<Record<CharacterId, Partial<Record<'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy', number>>>>;
  stats: PlayerStats;
}

export interface GameRewards {
  coinsEarned: number;
  xpEarned: number;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
  milestoneBonus: number;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'cube-man',
    name: 'Rookie Block',
    tagline: 'Starter kit · first whistle',
    price: 0,
    modelPath: '/models/cube-man.fbx',
    cardImage: '/cards/cube-man.png',
    baseOvr: 64,
    accent: '#23a559',
    footOffsetY: 0.05,
    poseMode: 'skeletal',
  },
  {
    id: 'cube-woman',
    name: 'Ace Star',
    tagline: 'Home opener · free agent',
    price: 0,
    modelPath: '/models/cube-woman.fbx',
    cardImage: '/cards/cube-woman.png',
    baseOvr: 64,
    accent: '#f97316',
    footOffsetY: 0.05,
    poseMode: 'skeletal',
  },
  {
    id: 'ava',
    name: 'Fast Break Ava',
    tagline: 'Quick first step · free roster',
    price: 0,
    modelPath: '/models/ava.glb',
    cardImage: '/cards/ava.png',
    baseOvr: 65,
    accent: '#e879f9',
    footOffsetY: 0,
  },
  {
    id: 'citizen-1',
    name: 'Walk-On',
    tagline: 'Practice squad · earn the reps',
    price: 200,
    modelPath: '/models/citizen-1.glb',
    cardImage: '/cards/citizen-1.png',
    baseOvr: 65,
    accent: '#94a3b8',
    footOffsetY: 0,
  },
  {
    id: 'citizen-2',
    name: 'Homecourt',
    tagline: 'Crowd energy · local legend',
    price: 500,
    modelPath: '/models/citizen-2.glb',
    cardImage: '/cards/citizen-2.png',
    baseOvr: 66,
    accent: '#a78bfa',
    footOffsetY: 0,
  },
  {
    id: 'citizen-3',
    name: 'Sideline',
    tagline: 'Always in the mix · game day',
    price: 1_000,
    modelPath: '/models/citizen-3.glb',
    cardImage: '/cards/citizen-3.png',
    baseOvr: 67,
    accent: '#67e8f9',
    footOffsetY: 0,
  },
  {
    id: 'soccer-boy',
    name: 'Soccer Boy',
    tagline: 'Pitch ready · first touch',
    price: 1_800,
    modelPath: '/models/soccer-boy.glb',
    cardImage: '/cards/soccer-boy.png',
    baseOvr: 70,
    accent: '#23a559',
    footOffsetY: 0,
    targetHeight: 1.72,
  },
  {
    id: 'nerd-player',
    name: 'Stat Nerd',
    tagline: 'Film room grind · next-gen IQ',
    price: 3_000,
    modelPath: '/models/nerd-player.glb',
    cardImage: '/cards/nerd-player.png',
    baseOvr: 72,
    accent: '#818cf8',
    footOffsetY: 0,
    targetHeight: 1.65,
  },
  {
    id: 'ref-bot',
    name: 'Bribe Ref',
    tagline: 'Whistle for hire · calls favor the bag',
    price: 4_500,
    modelPath: '/models/ref-bot.glb',
    cardImage: '/cards/ref-bot.png',
    baseOvr: 75,
    accent: '#fbbf24',
    footOffsetY: 0,
    targetHeight: 1.68,
  },
  {
    id: 'officer',
    name: 'Pitch Patrol',
    tagline: 'Keeps order · no funny business',
    price: 6_500,
    modelPath: '/models/officer.glb',
    cardImage: '/cards/officer.png',
    baseOvr: 76,
    accent: '#3b82f6',
    footOffsetY: 0,
    targetHeight: 1.7,
  },
  {
    id: 'manager',
    name: 'The Manager',
    tagline: 'Sideline boss · clipboard energy',
    price: 7_500,
    modelPath: '/models/manager.glb',
    baseOvr: 78,
    accent: '#f59e0b',
    footOffsetY: 0,
    targetHeight: 1.72,
    showcaseRestMs: [4200, 7800],
  },
  {
    id: 'astronaut',
    name: 'Orbit Ace',
    tagline: 'Out-of-this-world range · rare pick',
    price: 9_000,
    modelPath: '/models/astronaut.glb',
    baseOvr: 79,
    accent: '#60a5fa',
    footOffsetY: -0.1,
  },
  {
    id: 'cosmo',
    name: 'Clutch Cosmo',
    tagline: 'Last-second energy · mission mode',
    price: 12_500,
    modelPath: '/models/cosmo.glb',
    baseOvr: 80,
    accent: '#93c5fd',
    footOffsetY: 0,
  },
  {
    id: 'panda',
    name: 'Power Panda',
    tagline: 'Paint presence · chill dominance',
    price: 17_000,
    modelPath: '/models/panda.glb',
    baseOvr: 82,
    accent: '#4ade80',
    footOffsetY: 0,
  },
  {
    id: 'creative',
    name: 'Fitness Geek',
    tagline: 'Unlock once · customize forever',
    price: 18_000,
    modelPath: '/models/creative.glb',
    baseOvr: 82,
    accent: '#f472b6',
    footOffsetY: 0,
    targetHeight: 1.72,
    poseMode: 'animated',
    customizable: true,
    showcaseRestMs: [14_000, 26_000],
  },
  {
    id: 'athlete',
    name: 'Pro Athlete',
    tagline: 'Jersey kits · build your look',
    price: 20_000,
    modelPath: '/models/athlete.glb',
    baseOvr: 83,
    accent: '#22c55e',
    footOffsetY: 0,
    targetHeight: 1.7,
    poseMode: 'animated',
    customizable: true,
    showcaseRestMs: [3_200, 5_800],
  },
  {
    id: 'bob',
    name: 'Boxscore Bob',
    tagline: 'Pick a color · customize anytime',
    price: 23_000,
    modelPath: '/models/bob.glb',
    baseOvr: 84,
    accent: '#38bdf8',
    footOffsetY: 0,
    customizable: true,
    poseMode: 'procedural',
    showcaseRestMs: [4_000, 7_500],
  },
  {
    id: 'bunny',
    name: 'Rabbit',
    tagline: 'Five looks included · customize anytime',
    price: 36_000,
    modelPath: '/models/rabbit/base.glb',
    baseOvr: 85,
    accent: '#67e8f9',
    footOffsetY: 0,
    customizable: true,
    showcaseRestMs: [4_200, 7_800],
  },
  {
    id: 'ninja',
    name: 'Shadow Stealer',
    tagline: 'Lockdown D · silent pick',
    price: 45_000,
    modelPath: '/models/ninja.glb',
    baseOvr: 87,
    accent: '#a78bfa',
    footOffsetY: 0,
  },
  {
    id: 'mako',
    name: 'Finisher Mako',
    tagline: 'Shark in the paint · ice cold',
    price: 65_000,
    modelPath: '/models/mako.glb',
    baseOvr: 89,
    accent: '#2dd4bf',
    footOffsetY: 0,
  },
];

export const PETS: PetDef[] = [
  {
    id: 'pug',
    name: 'Bench Pug',
    tagline: 'Loyal mascot · cheap buddy',
    price: 50,
    modelPath: '/models/pets/pug.glb',
    accent: '#d6a77a',
    footOffsetY: 0,
    targetHeight: 1.55,
  },
  {
    id: 'fish',
    name: 'Goldie Goal',
    tagline: 'Budget bite · starter splash',
    price: 100,
    modelPath: '/models/pets/fish.glb',
    accent: '#f59e0b',
    footOffsetY: 0,
    targetHeight: 1.35,
    animTimeScale: 0.55,
    showcaseRestMs: [8000, 15000],
  },
  {
    id: 'raccoon',
    name: 'Loot Bandit',
    tagline: 'Sticky paws · sneaky takeaway',
    price: 250,
    modelPath: '/models/pets/raccoon.glb',
    accent: '#a8a29e',
    footOffsetY: 0,
    targetHeight: 1.4,
  },
  {
    id: 'cat',
    name: 'Cleat Cat',
    tagline: 'Nimble paws · sudden strike',
    price: 700,
    modelPath: '/models/pets/cat.glb',
    accent: '#fbbf24',
    footOffsetY: 0,
    targetHeight: 1.5,
  },
  {
    id: 'alpaca',
    name: 'Mascot Alpaca',
    tagline: 'Crowd favorite · fluffy hype',
    price: 1_500,
    modelPath: '/models/pets/alpaca.glb',
    accent: '#f5d0c5',
    footOffsetY: 0,
    targetHeight: 1.8,
  },
  {
    id: 'sheep',
    name: 'Woolly Wingman',
    tagline: 'Soft support · farm team',
    price: 3_000,
    modelPath: '/models/pets/sheep.glb',
    accent: '#e8e4df',
    footOffsetY: 0,
    targetHeight: 1.55,
  },
  {
    id: 'deer',
    name: 'Dash Deer',
    tagline: 'Breakaway speed · quiet burst',
    price: 5_500,
    modelPath: '/models/pets/deer.glb',
    accent: '#c4a484',
    footOffsetY: 0,
    targetHeight: 1.62,
  },
  {
    id: 'wolf',
    name: 'Pack Captain',
    tagline: 'Locker-room leader · wild focus',
    price: 9_000,
    modelPath: '/models/pets/wolf.glb',
    accent: '#94a3b8',
    footOffsetY: 0,
    targetHeight: 1.6,
  },
  {
    id: 'frog',
    name: 'Hop Foul',
    tagline: 'Sticky hands · clutch rebound',
    price: 15_000,
    modelPath: '/models/pets/frog.glb',
    accent: '#4ade80',
    footOffsetY: 0,
    targetHeight: 1.45,
  },
  {
    id: 'horse',
    name: 'Gallop Glory',
    tagline: 'Homestretch power · open field',
    price: 25_000,
    modelPath: '/models/pets/horse.glb',
    accent: '#f8fafc',
    footOffsetY: 0,
    targetHeight: 1.7,
  },
  {
    id: 'shark',
    name: 'Goal Shark',
    tagline: 'Circles the box · smells blood',
    price: 40_000,
    modelPath: '/models/pets/shark.glb',
    accent: '#38bdf8',
    footOffsetY: 0,
    targetHeight: 1.55,
    animTimeScale: 0.45,
    showcaseRestMs: [8000, 15000],
  },
  {
    id: 'snake',
    name: 'Sideline Snake',
    tagline: 'Coils quiet · strikes on cue',
    price: 52_000,
    modelPath: '/models/pets/snake.glb',
    accent: '#84cc16',
    footOffsetY: 0,
    targetHeight: 1.25,
    animTimeScale: 0.9,
    showcaseRestMs: [9000, 16_000],
  },
  {
    id: 'dog',
    name: 'Street Dog',
    tagline: 'Four breeds · swap anytime',
    price: 68_000,
    modelPath: '/models/pets/dog/husky.glb',
    accent: '#e2e8f0',
    footOffsetY: 0,
    targetHeight: 1.58,
  },
];

export const STARTER_CHARACTERS: CharacterId[] = ['cube-man', 'cube-woman', 'ava'];
export const FREE_CHARACTERS: CharacterId[] = STARTER_CHARACTERS;
/** No free pets — first companion costs a little so new users buy in. */
export const STARTER_PETS: PetId[] = [];
export const FREE_PETS: PetId[] = STARTER_PETS;

export const DEFAULT_PLAYER_NAME = 'Pro';
export const DEFAULT_CHARACTER: CharacterId = 'cube-man';
/** Fallback pet id for migrations only — new profiles start with none equipped. */
export const DEFAULT_PET: PetId = 'pug';
export const DEFAULT_RABBIT_VARIANT: RabbitVariantId = 'base';
export const DEFAULT_DOG_VARIANT: DogVariantId = 'husky';
export { DEFAULT_CREATIVE_LOADOUT };
export { DEFAULT_ATHLETE_LOADOUT };
export { DEFAULT_BOB_LOADOUT };

export const RABBIT_VARIANTS: RabbitVariantDef[] = [
  { id: 'base', name: 'Classic', modelPath: '/models/rabbit/base.glb' },
  { id: 'grey', name: 'Grey', modelPath: '/models/rabbit/grey.glb' },
  { id: 'blond', name: 'Blond', modelPath: '/models/rabbit/blond.glb' },
  { id: 'pigtails', name: 'Pigtails', modelPath: '/models/rabbit/pigtails.glb' },
  { id: 'cyan-hair', name: 'Cyan Hair', modelPath: '/models/rabbit/cyan-hair.glb' },
];

export const DOG_VARIANTS: DogVariantDef[] = [
  { id: 'husky', name: 'Husky', modelPath: '/models/pets/dog/husky.glb' },
  { id: 'shiba', name: 'Shiba', modelPath: '/models/pets/dog/shiba.glb' },
  { id: 'black-shiba', name: 'Black Shiba', modelPath: '/models/pets/dog/black-shiba.glb' },
  { id: 'german-shepherd', name: 'German Shepherd', modelPath: '/models/pets/dog/german-shepherd.glb' },
];

export function getRabbitVariantDef(id: RabbitVariantId): RabbitVariantDef {
  return RABBIT_VARIANTS.find(variant => variant.id === id) ?? RABBIT_VARIANTS[0];
}

export function getDogVariantDef(id: DogVariantId): DogVariantDef {
  return DOG_VARIANTS.find(variant => variant.id === id) ?? DOG_VARIANTS[0];
}

export function getCharacterDef(id: CharacterId): CharacterDef {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
}

export function getPetDef(id: PetId): PetDef {
  return PETS.find(p => p.id === id) ?? PETS[0];
}
