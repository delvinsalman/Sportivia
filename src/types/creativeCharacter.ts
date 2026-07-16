/** Creative Character — modular parts toggled by mesh node name on one GLB. */

export type CreativeSlotId =
  | 'face'
  | 'hair'
  | 'hat'
  | 'glasses'
  | 'faceExtra'
  | 'headphones'
  | 'top'
  | 'gloves'
  | 'bottom'
  | 'socks'
  | 'shoes';

export interface CreativePart {
  id: string;
  /** Exact node name in creative.glb */
  nodeName: string;
  label: string;
}

export interface CreativeSlot {
  id: CreativeSlotId;
  label: string;
  /** Slot may be empty */
  optional: boolean;
  parts: CreativePart[];
}

/** Saved selection: one part id per slot (or null if optional & empty). */
export type CreativeLoadout = Record<CreativeSlotId, string | null>;

export const CREATIVE_BODY_NODE = 'Body_010';

export const CREATIVE_SLOTS: CreativeSlot[] = [
  {
    id: 'face',
    label: 'Face',
    optional: false,
    parts: [
      { id: 'face-usual', nodeName: 'Male_emotion_usual_001', label: 'Chill' },
      { id: 'face-happy', nodeName: 'Male_emotion_happy_002', label: 'Happy' },
      { id: 'face-angry', nodeName: 'Male_emotion_angry_003', label: 'Fired Up' },
    ],
  },
  {
    id: 'hair',
    label: 'Hair',
    optional: true,
    parts: [
      { id: 'hair-010', nodeName: 'Hairstyle_male_010', label: 'Crop' },
      { id: 'hair-012', nodeName: 'Hairstyle_male_012', label: 'Flip' },
    ],
  },
  {
    id: 'hat',
    label: 'Hat',
    optional: true,
    parts: [
      { id: 'hat-010', nodeName: 'Hat_010', label: 'Cap' },
      { id: 'hat-049', nodeName: 'Hat_049', label: 'Beanie' },
      { id: 'hat-057', nodeName: 'Hat_057', label: 'Crown Lid' },
    ],
  },
  {
    id: 'glasses',
    label: 'Glasses',
    optional: true,
    parts: [
      { id: 'glasses-004', nodeName: 'Glasses_004', label: 'Frames' },
      { id: 'glasses-006', nodeName: 'Glasses_006', label: 'Shades' },
    ],
  },
  {
    id: 'faceExtra',
    label: 'Face Extra',
    optional: true,
    parts: [
      { id: 'nose-clown', nodeName: 'Clown_nose_001', label: 'Clown Nose' },
      { id: 'stache-001', nodeName: 'Moustache_001', label: 'Stache A' },
      { id: 'stache-002', nodeName: 'Moustache_002', label: 'Stache B' },
      { id: 'pacifier', nodeName: 'Pacifier_001', label: 'Pacifier' },
    ],
  },
  {
    id: 'headphones',
    label: 'Audio',
    optional: true,
    parts: [{ id: 'headphones', nodeName: 'Headphones_002', label: 'Headphones' }],
  },
  {
    id: 'top',
    label: 'Top',
    optional: false,
    parts: [
      { id: 'tee-009', nodeName: 'T_Shirt_009', label: 'Tee' },
      { id: 'outer-029', nodeName: 'Outerwear_029', label: 'Jacket' },
      { id: 'outer-036', nodeName: 'Outerwear_036', label: 'Coat' },
      { id: 'costume-10', nodeName: 'Costume_10_001', label: 'Costume A' },
      { id: 'costume-6', nodeName: 'Costume_6_001', label: 'Costume B' },
    ],
  },
  {
    id: 'gloves',
    label: 'Gloves',
    optional: true,
    parts: [
      { id: 'gloves-006', nodeName: 'Gloves_006', label: 'Grips' },
      { id: 'gloves-014', nodeName: 'Gloves_014', label: 'Pads' },
    ],
  },
  {
    id: 'bottom',
    label: 'Bottom',
    optional: false,
    parts: [
      { id: 'pants-010', nodeName: 'Pants_010', label: 'Pants' },
      { id: 'pants-014', nodeName: 'Pants_014', label: 'Jeans' },
      { id: 'shorts-003', nodeName: 'Shorts_003', label: 'Shorts' },
    ],
  },
  {
    id: 'socks',
    label: 'Socks',
    optional: true,
    parts: [{ id: 'socks-008', nodeName: 'Socks_008', label: 'Socks' }],
  },
  {
    id: 'shoes',
    label: 'Shoes',
    optional: false,
    parts: [
      { id: 'sneakers', nodeName: 'Shoe_Sneakers_009', label: 'Sneakers' },
      { id: 'slippers-002', nodeName: 'Shoe_Slippers_002', label: 'Slippers' },
      { id: 'slippers-005', nodeName: 'Shoe_Slippers_005', label: 'Slides' },
    ],
  },
];

export const DEFAULT_CREATIVE_LOADOUT: CreativeLoadout = {
  face: 'face-usual',
  hair: 'hair-010',
  hat: null,
  glasses: null,
  faceExtra: null,
  headphones: null,
  top: 'tee-009',
  gloves: null,
  bottom: 'pants-010',
  socks: null,
  shoes: 'sneakers',
};

const PART_BY_ID = new Map(
  CREATIVE_SLOTS.flatMap(slot => slot.parts.map(part => [part.id, part] as const)),
);

const ALL_PART_NODES = new Set([
  CREATIVE_BODY_NODE,
  ...CREATIVE_SLOTS.flatMap(slot => slot.parts.map(part => part.nodeName)),
]);

export function getCreativePart(partId: string | null | undefined) {
  if (!partId) return undefined;
  return PART_BY_ID.get(partId);
}

export function normalizeCreativeLoadout(
  raw?: Partial<CreativeLoadout> | null,
): CreativeLoadout {
  const next: CreativeLoadout = { ...DEFAULT_CREATIVE_LOADOUT };
  if (!raw) return next;

  for (const slot of CREATIVE_SLOTS) {
    const value = raw[slot.id];
    if (value === null && slot.optional) {
      next[slot.id] = null;
      continue;
    }
    if (typeof value === 'string' && slot.parts.some(p => p.id === value)) {
      next[slot.id] = value;
    }
  }
  return next;
}

/** Visible mesh node names for a loadout. */
export function creativeVisibleNodes(loadout: CreativeLoadout): Set<string> {
  const nodes = new Set<string>([CREATIVE_BODY_NODE]);
  for (const slot of CREATIVE_SLOTS) {
    const part = getCreativePart(loadout[slot.id]);
    if (part) nodes.add(part.nodeName);
  }
  return nodes;
}

export function isCreativePartNode(name: string) {
  return ALL_PART_NODES.has(name);
}

export function creativeLoadoutKey(loadout: CreativeLoadout) {
  return CREATIVE_SLOTS.map(s => loadout[s.id] ?? '-').join('|');
}
