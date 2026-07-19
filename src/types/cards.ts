import type { Sport } from '../types';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardPackTier = 'prospect' | 'elite' | 'icon';

export interface CollectibleCard {
  key: string;
  sport: Sport;
  playerId: string;
  name: string;
  country: string;
  positions: string[];
  team: string;
  retired: boolean;
  era: string;
  rarity: CardRarity;
  rating: number;
  age?: number;
}

export interface CardPackDefinition {
  id: CardPackTier;
  name: string;
  tagline: string;
  cost: number;
  cardCount: number;
  guaranteedRarity?: Exclude<CardRarity, 'common'>;
  odds: Record<CardRarity, number>;
  duplicateRefund: Record<CardRarity, number>;
  colors: [string, string, string];
}

export interface CardCollectionState {
  owned: Record<string, number>;
  packsOpened: number;
  legendaryPity: number;
}

export interface OpenedCard {
  card: CollectibleCard;
  duplicate: boolean;
  duplicateCoins: number;
}

