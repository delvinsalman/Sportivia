/** Cupboard finishes for the Shelf Trophy pet — single GLB, material tint. */

export type TrophyFinishId =
  | 'gold'
  | 'silver'
  | 'bronze'
  | 'emerald'
  | 'crimson'
  | 'midnight';

export interface TrophyFinishDef {
  id: TrophyFinishId;
  name: string;
  hex: string;
  metalness: number;
  roughness: number;
}

export const TROPHY_FINISHES: TrophyFinishDef[] = [
  { id: 'gold', name: 'Gold', hex: '#f0b232', metalness: 0.95, roughness: 0.22 },
  { id: 'silver', name: 'Silver', hex: '#c8d0dc', metalness: 0.92, roughness: 0.18 },
  { id: 'bronze', name: 'Bronze', hex: '#c87941', metalness: 0.9, roughness: 0.28 },
  { id: 'emerald', name: 'Emerald', hex: '#34d399', metalness: 0.85, roughness: 0.24 },
  { id: 'crimson', name: 'Crimson', hex: '#ef4444', metalness: 0.88, roughness: 0.26 },
  { id: 'midnight', name: 'Midnight', hex: '#818cf8', metalness: 0.9, roughness: 0.2 },
];

export const DEFAULT_TROPHY_FINISH: TrophyFinishId = 'gold';

export function getTrophyFinish(id: TrophyFinishId | null | undefined): TrophyFinishDef {
  return TROPHY_FINISHES.find(f => f.id === id) ?? TROPHY_FINISHES[0]!;
}

export function normalizeTrophyFinish(id: unknown): TrophyFinishId {
  if (typeof id === 'string' && TROPHY_FINISHES.some(f => f.id === id)) {
    return id as TrophyFinishId;
  }
  return DEFAULT_TROPHY_FINISH;
}
