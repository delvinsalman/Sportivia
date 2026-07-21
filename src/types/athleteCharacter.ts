/** Athlete skin — Quaternius Animated Human recolored by body region. */

export type AthleteRegion = 'skin' | 'jersey' | 'shorts' | 'shoes';

export type AthleteSlotId = AthleteRegion;

export interface AthleteLoadout {
  skin: string;
  jersey: string;
  shorts: string;
  shoes: string;
}

export interface AthleteColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface AthletePreset {
  id: string;
  label: string;
  loadout: AthleteLoadout;
}

export const ATHLETE_SLOTS: { id: AthleteSlotId; label: string }[] = [
  { id: 'jersey', label: 'Jersey' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'skin', label: 'Skin' },
  { id: 'shoes', label: 'Shoes' },
];

export const ATHLETE_SKIN_TONES: AthleteColorOption[] = [
  { id: 'fair', label: 'Fair', hex: '#f0c7a8' },
  { id: 'light', label: 'Light', hex: '#d9a074' },
  { id: 'tan', label: 'Tan', hex: '#c68642' },
  { id: 'brown', label: 'Brown', hex: '#8d5524' },
  { id: 'deep', label: 'Deep', hex: '#5c3317' },
];

export const ATHLETE_KIT_COLORS: AthleteColorOption[] = [
  { id: 'white', label: 'White', hex: '#f5f5f5' },
  { id: 'black', label: 'Black', hex: '#1a1a1a' },
  { id: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { id: 'royal', label: 'Royal', hex: '#2563eb' },
  { id: 'sky', label: 'Sky', hex: '#38bdf8' },
  { id: 'red', label: 'Red', hex: '#dc2626' },
  { id: 'burgundy', label: 'Burgundy', hex: '#7f1d1d' },
  { id: 'green', label: 'Green', hex: '#16a34a' },
  { id: 'forest', label: 'Forest', hex: '#14532d' },
  { id: 'gold', label: 'Gold', hex: '#eab308' },
  { id: 'orange', label: 'Orange', hex: '#ea580c' },
  { id: 'purple', label: 'Purple', hex: '#7c3aed' },
  { id: 'teal', label: 'Teal', hex: '#0d9488' },
  { id: 'pink', label: 'Pink', hex: '#ec4899' },
  { id: 'grey', label: 'Grey', hex: '#6b7280' },
];

export const ATHLETE_PRESETS: AthletePreset[] = [
  {
    id: 'home-white',
    label: 'Home White',
    loadout: { skin: '#d9a074', jersey: '#f5f5f5', shorts: '#1a1a1a', shoes: '#1a1a1a' },
  },
  {
    id: 'away-navy',
    label: 'Away Navy',
    loadout: { skin: '#d9a074', jersey: '#1e3a5f', shorts: '#1e3a5f', shoes: '#f5f5f5' },
  },
  {
    id: 'court-red',
    label: 'Court Red',
    loadout: { skin: '#c68642', jersey: '#dc2626', shorts: '#1a1a1a', shoes: '#f5f5f5' },
  },
  {
    id: 'pitch-green',
    label: 'Pitch Green',
    loadout: { skin: '#f0c7a8', jersey: '#16a34a', shorts: '#f5f5f5', shoes: '#1a1a1a' },
  },
  {
    id: 'ice-blue',
    label: 'Ice Blue',
    loadout: { skin: '#d9a074', jersey: '#2563eb', shorts: '#f5f5f5', shoes: '#1a1a1a' },
  },
  {
    id: 'gridiron-black',
    label: 'Gridiron',
    loadout: { skin: '#8d5524', jersey: '#1a1a1a', shorts: '#1a1a1a', shoes: '#eab308' },
  },
  {
    id: 'sunset',
    label: 'Sunset',
    loadout: { skin: '#c68642', jersey: '#ea580c', shorts: '#1e3a5f', shoes: '#f5f5f5' },
  },
  {
    id: 'royal-kit',
    label: 'Royal Kit',
    loadout: { skin: '#5c3317', jersey: '#7c3aed', shorts: '#1a1a1a', shoes: '#f5f5f5' },
  },
];

export const DEFAULT_ATHLETE_LOADOUT: AthleteLoadout = { ...ATHLETE_PRESETS[0].loadout };

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_RE.test(value) ? value.toLowerCase() : fallback;
}

export function normalizeAthleteLoadout(raw: unknown): AthleteLoadout {
  const base = DEFAULT_ATHLETE_LOADOUT;
  if (!raw || typeof raw !== 'object') return { ...base };
  const o = raw as Partial<AthleteLoadout>;
  return {
    skin: sanitizeHex(o.skin, base.skin),
    jersey: sanitizeHex(o.jersey, base.jersey),
    shorts: sanitizeHex(o.shorts, base.shorts),
    shoes: sanitizeHex(o.shoes, base.shoes),
  };
}

export function athleteLoadoutKey(loadout: AthleteLoadout): string {
  return `${loadout.skin}|${loadout.jersey}|${loadout.shorts}|${loadout.shoes}`;
}

export function colorsForSlot(slot: AthleteSlotId): AthleteColorOption[] {
  return slot === 'skin' ? ATHLETE_SKIN_TONES : ATHLETE_KIT_COLORS;
}

/** Map Mixamo-style bone names → kit regions for the Quaternius human. */
export function athleteRegionForBone(boneName: string): AthleteRegion {
  if (/Head|Neck/i.test(boneName)) return 'skin';
  if (/Hand|Thumb|Index|Finger/i.test(boneName)) return 'skin';
  if (/Foot|Toe/i.test(boneName)) return 'shoes';
  if (/UpLeg|Leg/i.test(boneName)) return 'shorts';
  if (/Hips|Spine|Shoulder|Arm|ForeArm|Clavicle/i.test(boneName)) return 'jersey';
  return 'jersey';
}
