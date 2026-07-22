/** Boxscore Bob — body tint finishes (eyes/teeth stay put). */

export type BobFinishKind = 'solid' | 'neon' | 'metal' | 'chameleon';

export type BobCategoryId = 'solids' | 'neon' | 'metal' | 'chameleon';

export interface BobLoadout {
  /** Selected finish option id */
  finishId: string;
}

export interface BobColorOption {
  id: string;
  label: string;
  /** Primary / swatch color */
  hex: string;
  kind: BobFinishKind;
  /** Second hue for chameleon angle blend */
  shift?: string;
}

export interface BobCategory {
  id: BobCategoryId;
  label: string;
  options: BobColorOption[];
}

export const BOB_CATEGORIES: BobCategory[] = [
  {
    id: 'solids',
    label: 'Solids',
    options: [
      { id: 'classic-pink', label: 'Classic Pink', hex: '#e6486b', kind: 'solid' },
      { id: 'sky', label: 'Sky', hex: '#38bdf8', kind: 'solid' },
      { id: 'royal', label: 'Royal', hex: '#2563eb', kind: 'solid' },
      { id: 'navy', label: 'Navy', hex: '#1e3a5f', kind: 'solid' },
      { id: 'mint', label: 'Mint', hex: '#34d399', kind: 'solid' },
      { id: 'lime', label: 'Lime', hex: '#84cc16', kind: 'solid' },
      { id: 'gold', label: 'Gold', hex: '#eab308', kind: 'solid' },
      { id: 'orange', label: 'Orange', hex: '#f97316', kind: 'solid' },
      { id: 'red', label: 'Red', hex: '#ef4444', kind: 'solid' },
      { id: 'burgundy', label: 'Burgundy', hex: '#9f1239', kind: 'solid' },
      { id: 'purple', label: 'Purple', hex: '#a855f7', kind: 'solid' },
      { id: 'violet', label: 'Violet', hex: '#7c3aed', kind: 'solid' },
      { id: 'teal', label: 'Teal', hex: '#14b8a6', kind: 'solid' },
      { id: 'cyan', label: 'Cyan', hex: '#22d3ee', kind: 'solid' },
      { id: 'white', label: 'White', hex: '#f8fafc', kind: 'solid' },
      { id: 'grey', label: 'Grey', hex: '#94a3b8', kind: 'solid' },
      { id: 'charcoal', label: 'Charcoal', hex: '#334155', kind: 'solid' },
      { id: 'black', label: 'Black', hex: '#0f172a', kind: 'solid' },
      { id: 'brown', label: 'Brown', hex: '#92400e', kind: 'solid' },
      { id: 'cream', label: 'Cream', hex: '#fde68a', kind: 'solid' },
    ],
  },
  {
    id: 'neon',
    label: 'Neon',
    options: [
      { id: 'neon-pink', label: 'Hot Pink', hex: '#ff2d95', kind: 'neon' },
      { id: 'neon-magenta', label: 'Magenta', hex: '#ff00e5', kind: 'neon' },
      { id: 'neon-lime', label: 'Toxic Lime', hex: '#b8ff00', kind: 'neon' },
      { id: 'neon-green', label: 'Laser Green', hex: '#39ff14', kind: 'neon' },
      { id: 'neon-cyan', label: 'Ice Cyan', hex: '#00fff0', kind: 'neon' },
      { id: 'neon-blue', label: 'Electric Blue', hex: '#00a2ff', kind: 'neon' },
      { id: 'neon-purple', label: 'UV Purple', hex: '#bf00ff', kind: 'neon' },
      { id: 'neon-orange', label: 'Blaze', hex: '#ff6a00', kind: 'neon' },
      { id: 'neon-yellow', label: 'Volt', hex: '#ffe600', kind: 'neon' },
      { id: 'neon-red', label: 'Siren', hex: '#ff1a1a', kind: 'neon' },
      { id: 'neon-mint', label: 'Mint Glow', hex: '#00ffa8', kind: 'neon' },
      { id: 'neon-white', label: 'White Hot', hex: '#f0f9ff', kind: 'neon' },
    ],
  },
  {
    id: 'metal',
    label: 'Metal',
    options: [
      { id: 'chrome', label: 'Chrome', hex: '#d4d4d8', kind: 'metal' },
      { id: 'steel', label: 'Steel', hex: '#64748b', kind: 'metal' },
      { id: 'gunmetal', label: 'Gunmetal', hex: '#334155', kind: 'metal' },
      { id: 'gold-metal', label: 'Gold Leaf', hex: '#fbbf24', kind: 'metal' },
      { id: 'rose-gold', label: 'Rose Gold', hex: '#fb7185', kind: 'metal' },
      { id: 'copper', label: 'Copper', hex: '#c2410c', kind: 'metal' },
      { id: 'bronze', label: 'Bronze', hex: '#a16207', kind: 'metal' },
      { id: 'blue-steel', label: 'Blue Steel', hex: '#3b82f6', kind: 'metal' },
      { id: 'purple-chrome', label: 'Amethyst', hex: '#8b5cf6', kind: 'metal' },
      { id: 'green-metal', label: 'Jade Metal', hex: '#059669', kind: 'metal' },
      { id: 'black-chrome', label: 'Black Chrome', hex: '#18181b', kind: 'metal' },
      { id: 'pearl', label: 'Pearl', hex: '#f8fafc', kind: 'metal' },
    ],
  },
  {
    id: 'chameleon',
    label: 'Chameleon',
    options: [
      {
        id: 'cham-flip-purple',
        label: 'Purple Flip',
        hex: '#7c3aed',
        shift: '#22d3ee',
        kind: 'chameleon',
      },
      {
        id: 'cham-sunset',
        label: 'Sunset Flip',
        hex: '#ef4444',
        shift: '#fbbf24',
        kind: 'chameleon',
      },
      {
        id: 'cham-ocean',
        label: 'Ocean Flip',
        hex: '#0369a1',
        shift: '#4ade80',
        kind: 'chameleon',
      },
      {
        id: 'cham-galaxy',
        label: 'Galaxy',
        hex: '#312e81',
        shift: '#e879f9',
        kind: 'chameleon',
      },
      {
        id: 'cham-toxic',
        label: 'Toxic Flip',
        hex: '#166534',
        shift: '#a3e635',
        kind: 'chameleon',
      },
      {
        id: 'cham-heat',
        label: 'Heat Wave',
        hex: '#9f1239',
        shift: '#fb923c',
        kind: 'chameleon',
      },
      {
        id: 'cham-ice',
        label: 'Ice Flip',
        hex: '#e0f2fe',
        shift: '#818cf8',
        kind: 'chameleon',
      },
      {
        id: 'cham-candy',
        label: 'Candy Flip',
        hex: '#db2777',
        shift: '#67e8f9',
        kind: 'chameleon',
      },
      {
        id: 'cham-oil',
        label: 'Oil Slick',
        hex: '#0f172a',
        shift: '#34d399',
        kind: 'chameleon',
      },
      {
        id: 'cham-royal',
        label: 'Royal Flip',
        hex: '#1e3a8a',
        shift: '#f472b6',
        kind: 'chameleon',
      },
      {
        id: 'cham-gold-teal',
        label: 'Gold Teal',
        hex: '#ca8a04',
        shift: '#2dd4bf',
        kind: 'chameleon',
      },
      {
        id: 'cham-gta-green',
        label: 'Street Flip',
        hex: '#14532d',
        shift: '#f97316',
        kind: 'chameleon',
      },
    ],
  },
];

export const BOB_FINISH_BY_ID: Record<string, BobColorOption> = Object.fromEntries(
  BOB_CATEGORIES.flatMap(cat => cat.options.map(opt => [opt.id, opt])),
);

/** Flat list kept for migrations / legacy hex matches */
export const BOB_COLORS: BobColorOption[] = BOB_CATEGORIES.flatMap(c => c.options);

export const DEFAULT_BOB_LOADOUT: BobLoadout = {
  finishId: 'classic-pink',
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function finishIdFromLegacyColor(hex: string): string {
  const hit = BOB_COLORS.find(opt => opt.hex.toLowerCase() === hex.toLowerCase());
  return hit?.id ?? DEFAULT_BOB_LOADOUT.finishId;
}

export function normalizeBobLoadout(raw: unknown): BobLoadout {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_BOB_LOADOUT };
  const o = raw as Partial<BobLoadout> & { color?: string };
  if (typeof o.finishId === 'string' && BOB_FINISH_BY_ID[o.finishId]) {
    return { finishId: o.finishId };
  }
  if (typeof o.color === 'string' && HEX_RE.test(o.color)) {
    return { finishId: finishIdFromLegacyColor(o.color) };
  }
  return { ...DEFAULT_BOB_LOADOUT };
}

export function bobLoadoutKey(loadout: BobLoadout): string {
  return loadout.finishId;
}

export function getBobFinish(loadout: BobLoadout): BobColorOption {
  return BOB_FINISH_BY_ID[loadout.finishId] ?? BOB_FINISH_BY_ID[DEFAULT_BOB_LOADOUT.finishId];
}

export function categoryForFinishId(finishId: string): BobCategoryId {
  for (const cat of BOB_CATEGORIES) {
    if (cat.options.some(opt => opt.id === finishId)) return cat.id;
  }
  return 'solids';
}

/** Materials that should keep their original look. */
export function isBobLockedMaterial(name: string): boolean {
  return /eye|tooth|teeth|pupil/i.test(name);
}
