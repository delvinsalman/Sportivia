/** Boxscore Bob — solid body tint (eyes/teeth stay put). */

export interface BobLoadout {
  color: string;
}

export interface BobColorOption {
  id: string;
  label: string;
  hex: string;
}

export const BOB_COLORS: BobColorOption[] = [
  { id: 'classic-pink', label: 'Classic Pink', hex: '#e6486b' },
  { id: 'sky', label: 'Sky', hex: '#38bdf8' },
  { id: 'royal', label: 'Royal', hex: '#2563eb' },
  { id: 'navy', label: 'Navy', hex: '#1e3a5f' },
  { id: 'mint', label: 'Mint', hex: '#34d399' },
  { id: 'lime', label: 'Lime', hex: '#84cc16' },
  { id: 'gold', label: 'Gold', hex: '#eab308' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
  { id: 'red', label: 'Red', hex: '#ef4444' },
  { id: 'burgundy', label: 'Burgundy', hex: '#9f1239' },
  { id: 'purple', label: 'Purple', hex: '#a855f7' },
  { id: 'violet', label: 'Violet', hex: '#7c3aed' },
  { id: 'teal', label: 'Teal', hex: '#14b8a6' },
  { id: 'cyan', label: 'Cyan', hex: '#22d3ee' },
  { id: 'white', label: 'White', hex: '#f8fafc' },
  { id: 'grey', label: 'Grey', hex: '#94a3b8' },
  { id: 'charcoal', label: 'Charcoal', hex: '#334155' },
  { id: 'black', label: 'Black', hex: '#0f172a' },
  { id: 'brown', label: 'Brown', hex: '#92400e' },
  { id: 'cream', label: 'Cream', hex: '#fde68a' },
];

export const DEFAULT_BOB_LOADOUT: BobLoadout = {
  color: BOB_COLORS[0].hex,
};

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export function normalizeBobLoadout(raw: unknown): BobLoadout {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_BOB_LOADOUT };
  const color = (raw as Partial<BobLoadout>).color;
  if (typeof color === 'string' && HEX_RE.test(color)) {
    return { color: color.toLowerCase() };
  }
  return { ...DEFAULT_BOB_LOADOUT };
}

export function bobLoadoutKey(loadout: BobLoadout): string {
  return loadout.color.toLowerCase();
}

/** Materials that should keep their original look. */
export function isBobLockedMaterial(name: string): boolean {
  return /eye|tooth|teeth|pupil/i.test(name);
}
