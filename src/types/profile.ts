import type { PlayerStats } from '../types';
import type { CreativeLoadout } from './creativeCharacter';
import { DEFAULT_CREATIVE_LOADOUT } from './creativeCharacter';

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
  | 'astronaut'
  | 'cosmo'
  | 'panda'
  | 'bob'
  | 'bunny'
  | 'ninja'
  | 'mako'
  | 'creative';
export type PetId = 'pug' | 'fish' | 'cat' | 'raccoon' | 'wolf' | 'alpaca' | 'sheep' | 'deer' | 'horse' | 'shark' | 'frog';

export interface CharacterDef {
  id: CharacterId;
  name: string;
  tagline: string;
  price: number;
  modelPath: string;
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
  stats: PlayerStats;
}

export interface GameRewards {
  coinsEarned: number;
  xpEarned: number;
  leveledUp: boolean;
  previousLevel: number;
  newLevel: number;
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'cube-man',
    name: 'Rookie Block',
    tagline: 'Starter kit · first whistle',
    price: 0,
    modelPath: '/models/cube-man.fbx',
    accent: '#23a559',
    footOffsetY: 0.05,
    poseMode: 'procedural',
  },
  {
    id: 'cube-woman',
    name: 'Ace Star',
    tagline: 'Home opener · free agent',
    price: 0,
    modelPath: '/models/cube-woman.fbx',
    accent: '#f97316',
    footOffsetY: 0.05,
    poseMode: 'procedural',
  },
  {
    id: 'ava',
    name: 'Fast Break Ava',
    tagline: 'Quick first step · free roster',
    price: 0,
    modelPath: '/models/ava.glb',
    accent: '#e879f9',
    footOffsetY: 0,
  },
  {
    id: 'citizen-1',
    name: 'Walk-On',
    tagline: 'Practice squad · earn the reps',
    price: 200,
    modelPath: '/models/citizen-1.glb',
    accent: '#94a3b8',
    footOffsetY: 0,
  },
  {
    id: 'citizen-2',
    name: 'Homecourt',
    tagline: 'Crowd energy · local legend',
    price: 500,
    modelPath: '/models/citizen-2.glb',
    accent: '#a78bfa',
    footOffsetY: 0,
  },
  {
    id: 'citizen-3',
    name: 'Sideline',
    tagline: 'Always in the mix · game day',
    price: 1_000,
    modelPath: '/models/citizen-3.glb',
    accent: '#67e8f9',
    footOffsetY: 0,
  },
  {
    id: 'soccer-boy',
    name: 'Soccer Boy',
    tagline: 'Pitch ready · first touch',
    price: 1_800,
    modelPath: '/models/soccer-boy.glb',
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
    accent: '#3b82f6',
    footOffsetY: 0,
    targetHeight: 1.7,
  },
  {
    id: 'astronaut',
    name: 'Orbit Ace',
    tagline: 'Out-of-this-world range · rare pick',
    price: 9_000,
    modelPath: '/models/astronaut.glb',
    accent: '#60a5fa',
    footOffsetY: -0.1,
  },
  {
    id: 'cosmo',
    name: 'Clutch Cosmo',
    tagline: 'Last-second energy · mission mode',
    price: 12_500,
    modelPath: '/models/cosmo.glb',
    accent: '#93c5fd',
    footOffsetY: 0,
  },
  {
    id: 'panda',
    name: 'Power Panda',
    tagline: 'Paint presence · chill dominance',
    price: 17_000,
    modelPath: '/models/panda.glb',
    accent: '#4ade80',
    footOffsetY: 0,
  },
  {
    id: 'creative',
    name: 'Fitness Geek',
    tagline: 'Unlock once · customize forever',
    price: 18_000,
    modelPath: '/models/creative.glb',
    accent: '#f472b6',
    footOffsetY: 0,
    targetHeight: 1.72,
    poseMode: 'animated',
    customizable: true,
    showcaseRestMs: [14_000, 26_000],
  },
  {
    id: 'bob',
    name: 'Boxscore Bob',
    tagline: 'Does it all · always ready',
    price: 23_000,
    modelPath: '/models/bob.glb',
    accent: '#38bdf8',
    footOffsetY: 0,
  },
  {
    id: 'bunny',
    name: 'Hop Shot',
    tagline: 'Vertical threat · ears up',
    price: 32_000,
    modelPath: '/models/bunny.glb',
    accent: '#f472b6',
    footOffsetY: 0,
  },
  {
    id: 'ninja',
    name: 'Shadow Stealer',
    tagline: 'Lockdown D · silent pick',
    price: 45_000,
    modelPath: '/models/ninja.glb',
    accent: '#a78bfa',
    footOffsetY: 0,
  },
  {
    id: 'mako',
    name: 'Finisher Mako',
    tagline: 'Shark in the paint · ice cold',
    price: 65_000,
    modelPath: '/models/mako.glb',
    accent: '#2dd4bf',
    footOffsetY: 0,
  },
];

export const PETS: PetDef[] = [
  {
    id: 'pug',
    name: 'Bench Pug',
    tagline: 'Loyal mascot · free buddy',
    price: 0,
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
    targetHeight: 1.65,
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
];

export const STARTER_CHARACTERS: CharacterId[] = ['cube-man', 'cube-woman', 'ava'];
export const FREE_CHARACTERS: CharacterId[] = STARTER_CHARACTERS;
export const STARTER_PETS: PetId[] = ['pug'];
export const FREE_PETS: PetId[] = STARTER_PETS;

export const DEFAULT_PLAYER_NAME = 'Pro';
export const DEFAULT_CHARACTER: CharacterId = 'cube-man';
export const DEFAULT_PET: PetId = 'pug';
export { DEFAULT_CREATIVE_LOADOUT };

export function getCharacterDef(id: CharacterId): CharacterDef {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0];
}

export function getPetDef(id: PetId): PetDef {
  return PETS.find(p => p.id === id) ?? PETS[0];
}
