import type { BotDifficulty, Sport } from '../types';
import type { CardRarity, CollectibleCard } from '../types/cards';
import { CARD_BY_KEY, CARDS_BY_SPORT } from './cardCatalog';

export interface CardWagerStake {
  cardKey: string;
  name: string;
  rarity: CardRarity;
  rating: number;
}

export interface CardWagerAgreement {
  yourCard: CardWagerStake | null;
  opponentCard: CardWagerStake | null;
}

export interface CardWagerSettlement {
  active: boolean;
  outcome: 'win' | 'loss' | 'draw' | 'none';
  gained: CollectibleCard | null;
  lost: CollectibleCard | null;
  message: string;
}

const RARITY_ORDER: Record<CardRarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

const BOT_DECLINE_CHANCE: Record<BotDifficulty, number> = {
  beginner: 0.42,
  pro: 0.28,
  expert: 0.16,
};

/** Harder bots stake better cards — beginner stays mostly commons/rares, expert can put up icons. */
const BOT_RARITY_WEIGHTS: Record<BotDifficulty, Record<CardRarity, number>> = {
  beginner: { common: 72, rare: 24, epic: 4, legendary: 0 },
  pro: { common: 28, rare: 42, epic: 26, legendary: 4 },
  expert: { common: 10, rare: 28, epic: 40, legendary: 22 },
};

const BOT_RATING_BAND: Record<BotDifficulty, { min: number; max: number }> = {
  beginner: { min: 55, max: 78 },
  pro: { min: 72, max: 90 },
  expert: { min: 82, max: 99 },
};

export function toWagerStake(card: CollectibleCard): CardWagerStake {
  return {
    cardKey: card.key,
    name: card.name,
    rarity: card.rarity,
    rating: card.rating,
  };
}

export function stakeFromKey(cardKey: string | null | undefined): CardWagerStake | null {
  if (!cardKey) return null;
  const card = CARD_BY_KEY.get(cardKey);
  return card ? toWagerStake(card) : null;
}

export function isWagerActive(agreement: CardWagerAgreement | null | undefined): boolean {
  return !!(agreement?.yourCard && agreement?.opponentCard);
}

function rollWeightedRarity(
  weights: Record<CardRarity, number>,
  random: () => number,
): CardRarity {
  const entries = (Object.entries(weights) as [CardRarity, number][]).filter(([, w]) => w > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (total <= 0) return 'common';
  let roll = random() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries.at(-1)?.[0] ?? 'common';
}

function pickBotCard(
  pool: CollectibleCard[],
  rarity: CardRarity,
  band: { min: number; max: number },
  random: () => number,
): CollectibleCard | null {
  const byRarity = pool.filter(card => card.rarity === rarity);
  const inBand = byRarity.filter(card => card.rating >= band.min && card.rating <= band.max);
  let choices = inBand.length ? inBand : byRarity.filter(card => card.rating <= band.max);
  if (!choices.length) choices = byRarity;
  if (!choices.length) {
    const fallbackBand = pool.filter(card => card.rating >= band.min && card.rating <= band.max);
    choices = fallbackBand.length ? fallbackBand : pool;
  }
  if (!choices.length) return null;

  // Prefer weaker cards for beginner (lower OVR), stronger for expert.
  const sorted = [...choices].sort((a, b) => a.rating - b.rating);
  const preferLow = band.max <= 80;
  const preferHigh = band.min >= 80;
  if (preferLow) {
    const weakHalf = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.65)));
    return weakHalf[Math.floor(random() * weakHalf.length)]!;
  }
  if (preferHigh) {
    const strongHalf = sorted.slice(Math.floor(sorted.length * 0.35));
    return strongHalf[Math.floor(random() * strongHalf.length)]!;
  }
  return sorted[Math.floor(random() * sorted.length)]!;
}

/** AI sometimes sits out; otherwise stakes a card scaled to difficulty. */
export function rollBotWager(
  sport: Sport,
  difficulty: BotDifficulty,
  random: () => number = Math.random,
): CardWagerStake | null {
  if (random() < BOT_DECLINE_CHANCE[difficulty]) return null;

  const pool = CARDS_BY_SPORT[sport];
  if (!pool.length) return null;

  const rarity = rollWeightedRarity(BOT_RARITY_WEIGHTS[difficulty], random);
  const card = pickBotCard(pool, rarity, BOT_RATING_BAND[difficulty], random);
  return card ? toWagerStake(card) : null;
}

export function ownedCardsForSport(
  owned: Record<string, number>,
  sport: Sport,
): CollectibleCard[] {
  return Object.entries(owned)
    .filter(([key, count]) => key.startsWith(`${sport}:`) && count > 0)
    .map(([key]) => CARD_BY_KEY.get(key))
    .filter((card): card is CollectibleCard => !!card)
    .sort(
      (a, b) =>
        RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity] ||
        b.rating - a.rating ||
        a.name.localeCompare(b.name),
    );
}

export function describeWagerSettlement(
  outcome: 'win' | 'loss' | 'draw',
  agreement: CardWagerAgreement,
): CardWagerSettlement {
  if (!isWagerActive(agreement)) {
    return {
      active: false,
      outcome: 'none',
      gained: null,
      lost: null,
      message: 'No card stake this match',
    };
  }

  const yourCard = CARD_BY_KEY.get(agreement.yourCard!.cardKey) ?? null;
  const opponentCard = CARD_BY_KEY.get(agreement.opponentCard!.cardKey) ?? null;

  if (outcome === 'draw') {
    return {
      active: true,
      outcome: 'draw',
      gained: null,
      lost: null,
      message: 'Draw — both keep their cards',
    };
  }

  if (outcome === 'win') {
    return {
      active: true,
      outcome: 'win',
      gained: opponentCard,
      lost: null,
      message: opponentCard
        ? `You won ${opponentCard.name}`
        : 'You won the stake',
    };
  }

  return {
    active: true,
    outcome: 'loss',
    gained: null,
    lost: yourCard,
    message: yourCard
      ? `You lost ${yourCard.name}`
      : 'You lost your stake',
  };
}
