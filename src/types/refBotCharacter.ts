/** Bribe Ref — per-part kit colors (eyes / brows / head / body / arms). */

export type RefBotSlotId = 'eyes' | 'brows' | 'head' | 'body' | 'arms';

export interface RefBotLoadout {
  eyes: string;
  brows: string;
  head: string;
  body: string;
  arms: string;
}

export interface RefBotColorOption {
  id: string;
  label: string;
  hex: string;
}

export interface RefBotPreset {
  id: string;
  label: string;
  loadout: RefBotLoadout;
}

export const REF_BOT_SLOTS: { id: RefBotSlotId; label: string }[] = [
  { id: 'body', label: 'Body' },
  { id: 'arms', label: 'Arms' },
  { id: 'head', label: 'Head' },
  { id: 'brows', label: 'Brows' },
  { id: 'eyes', label: 'Eyes' },
];

/** Eye / lens colors — darker set + a few glow options */
export const REF_BOT_EYE_COLORS: RefBotColorOption[] = [
  { id: 'ink', label: 'Ink', hex: '#0c0c0c' },
  { id: 'void', label: 'Void', hex: '#020617' },
  { id: 'coal', label: 'Coal', hex: '#1c1917' },
  { id: 'slate', label: 'Slate', hex: '#334155' },
  { id: 'steel', label: 'Steel', hex: '#64748b' },
  { id: 'white', label: 'White', hex: '#f8fafc' },
  { id: 'gold', label: 'Gold', hex: '#fbbf24' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b' },
  { id: 'red', label: 'Red', hex: '#ef4444' },
  { id: 'lime', label: 'Lime', hex: '#a3e635' },
  { id: 'cyan', label: 'Cyan', hex: '#22d3ee' },
  { id: 'blue', label: 'Blue', hex: '#38bdf8' },
  { id: 'violet', label: 'Violet', hex: '#a855f7' },
  { id: 'pink', label: 'Pink', hex: '#f472b6' },
  { id: 'neon-green', label: 'Laser', hex: '#39ff14' },
  { id: 'neon-pink', label: 'Hot Pink', hex: '#ff2d95' },
];

/** Shared kit swatches for brows / head / body / arms */
export const REF_BOT_KIT_COLORS: RefBotColorOption[] = [
  { id: 'classic-gold', label: 'Classic Gold', hex: '#c97814' },
  { id: 'amber', label: 'Amber', hex: '#d97706' },
  { id: 'honey', label: 'Honey', hex: '#eab308' },
  { id: 'cream', label: 'Cream', hex: '#fde68a' },
  { id: 'white', label: 'White', hex: '#f8fafc' },
  { id: 'ash', label: 'Ash', hex: '#5f5e55' },
  { id: 'grey', label: 'Grey', hex: '#94a3b8' },
  { id: 'charcoal', label: 'Charcoal', hex: '#334155' },
  { id: 'black', label: 'Black', hex: '#0f172a' },
  { id: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { id: 'royal', label: 'Royal', hex: '#2563eb' },
  { id: 'sky', label: 'Sky', hex: '#38bdf8' },
  { id: 'teal', label: 'Teal', hex: '#14b8a6' },
  { id: 'mint', label: 'Mint', hex: '#34d399' },
  { id: 'lime', label: 'Lime', hex: '#84cc16' },
  { id: 'forest', label: 'Forest', hex: '#14532d' },
  { id: 'green', label: 'Green', hex: '#16a34a' },
  { id: 'red', label: 'Red', hex: '#ef4444' },
  { id: 'burgundy', label: 'Burgundy', hex: '#9f1239' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
  { id: 'copper', label: 'Copper', hex: '#c2410c' },
  { id: 'brown', label: 'Brown', hex: '#92400e' },
  { id: 'purple', label: 'Purple', hex: '#a855f7' },
  { id: 'violet', label: 'Violet', hex: '#7c3aed' },
  { id: 'pink', label: 'Pink', hex: '#ec4899' },
  { id: 'rose', label: 'Rose', hex: '#fb7185' },
  { id: 'chrome', label: 'Chrome', hex: '#d4d4d8' },
  { id: 'gunmetal', label: 'Gunmetal', hex: '#1e293b' },
  { id: 'neon-cyan', label: 'Ice Cyan', hex: '#00fff0' },
  { id: 'neon-lime', label: 'Toxic', hex: '#b8ff00' },
  { id: 'neon-pink', label: 'Hot Pink', hex: '#ff2d95' },
  { id: 'neon-purple', label: 'UV', hex: '#bf00ff' },
];

export const REF_BOT_PRESETS: RefBotPreset[] = [
  {
    id: 'classic-call',
    label: 'Classic Call',
    loadout: {
      eyes: '#0c0c0c',
      brows: '#92400e',
      head: '#5f5e55',
      body: '#c97814',
      arms: '#c97814',
    },
  },
  {
    id: 'yellow-card',
    label: 'Yellow Card',
    loadout: {
      eyes: '#0c0c0c',
      brows: '#1a1a1a',
      head: '#f8fafc',
      body: '#eab308',
      arms: '#0f172a',
    },
  },
  {
    id: 'red-card',
    label: 'Red Card',
    loadout: {
      eyes: '#fbbf24',
      brows: '#1a1a1a',
      head: '#334155',
      body: '#ef4444',
      arms: '#0f172a',
    },
  },
  {
    id: 'night-whistle',
    label: 'Night Whistle',
    loadout: {
      eyes: '#22d3ee',
      brows: '#0f172a',
      head: '#1e293b',
      body: '#0f172a',
      arms: '#334155',
    },
  },
  {
    id: 'chrome-ref',
    label: 'Chrome Ref',
    loadout: {
      eyes: '#0c0c0c',
      brows: '#64748b',
      head: '#d4d4d8',
      body: '#94a3b8',
      arms: '#cbd5e1',
    },
  },
  {
    id: 'royal-bag',
    label: 'Royal Bag',
    loadout: {
      eyes: '#fbbf24',
      brows: '#4c1d95',
      head: '#1e1b4b',
      body: '#7c3aed',
      arms: '#fbbf24',
    },
  },
  {
    id: 'pitch-stripe',
    label: 'Pitch Stripe',
    loadout: {
      eyes: '#0c0c0c',
      brows: '#14532d',
      head: '#f8fafc',
      body: '#16a34a',
      arms: '#f8fafc',
    },
  },
  {
    id: 'ice-call',
    label: 'Ice Call',
    loadout: {
      eyes: '#38bdf8',
      brows: '#0ea5e9',
      head: '#e0f2fe',
      body: '#0284c7',
      arms: '#f8fafc',
    },
  },
  {
    id: 'neon-bribe',
    label: 'Neon Bribe',
    loadout: {
      eyes: '#39ff14',
      brows: '#bf00ff',
      head: '#18181b',
      body: '#ff2d95',
      arms: '#00fff0',
    },
  },
  {
    id: 'sunset-flag',
    label: 'Sunset Flag',
    loadout: {
      eyes: '#0c0c0c',
      brows: '#9f1239',
      head: '#334155',
      body: '#f97316',
      arms: '#fbbf24',
    },
  },
  {
    id: 'copper-whistle',
    label: 'Copper',
    loadout: {
      eyes: '#1c1917',
      brows: '#78350f',
      head: '#44403c',
      body: '#c2410c',
      arms: '#a16207',
    },
  },
  {
    id: 'mint-clean',
    label: 'Mint Clean',
    loadout: {
      eyes: '#0f172a',
      brows: '#0f766e',
      head: '#ecfdf5',
      body: '#14b8a6',
      arms: '#5eead4',
    },
  },
];

export const DEFAULT_REF_BOT_LOADOUT: RefBotLoadout = { ...REF_BOT_PRESETS[0].loadout };

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

function sanitizeHex(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_RE.test(value) ? value.toLowerCase() : fallback;
}

export function normalizeRefBotLoadout(raw: unknown): RefBotLoadout {
  const base = DEFAULT_REF_BOT_LOADOUT;
  if (!raw || typeof raw !== 'object') return { ...base };
  const o = raw as Partial<RefBotLoadout>;
  return {
    eyes: sanitizeHex(o.eyes, base.eyes),
    brows: sanitizeHex(o.brows, base.brows),
    head: sanitizeHex(o.head, base.head),
    body: sanitizeHex(o.body, base.body),
    arms: sanitizeHex(o.arms, base.arms),
  };
}

export function refBotLoadoutKey(loadout: RefBotLoadout): string {
  return `${loadout.eyes}|${loadout.brows}|${loadout.head}|${loadout.body}|${loadout.arms}`;
}

export function refBotColorsForSlot(slot: RefBotSlotId): RefBotColorOption[] {
  return slot === 'eyes' ? REF_BOT_EYE_COLORS : REF_BOT_KIT_COLORS;
}

/**
 * Map mesh + material → kit slot.
 * Head packs eyes (Black), brows (Main), face shell (Grey).
 * Arms / shoulders / hands share Main independently from torso Main.
 * Multi-primitive Head/Torso often arrive as unnamed child meshes — callers
 * should pass the named ancestor (Head, Arm.L, …).
 */
export function refBotSlotForPart(meshName: string, materialName: string): RefBotSlotId {
  const mesh = meshName.replace(/[._]\d+$/i, '').replace(/_Mesh$/i, '');
  const mat = materialName;

  // Black only exists on the Head in ref-bot.glb
  if (/black/i.test(mat)) return 'eyes';

  if (/head/i.test(mesh)) {
    if (/main/i.test(mat)) return 'brows';
    return 'head';
  }

  if (/shoulder|arm|hand/i.test(mesh)) return 'arms';

  return 'body';
}

/** Walk parents for a body-part node name (GLTF multi-prim children are often unnamed). */
export function refBotResolvePartName(obj: { name?: string; parent?: unknown | null }): string {
  let cur: { name?: string; parent?: unknown | null } | null = obj;
  while (cur) {
    const n = (cur.name ?? '').trim();
    if (/^(Head|Torso|Foot|Shoulder|Arm|Hand|Leg|LowerLeg)/i.test(n)) return n;
    cur = (cur.parent as { name?: string; parent?: unknown | null } | null) ?? null;
  }
  cur = obj;
  while (cur) {
    const n = (cur.name ?? '').trim();
    if (n) return n;
    cur = (cur.parent as { name?: string; parent?: unknown | null } | null) ?? null;
  }
  return '';
}
