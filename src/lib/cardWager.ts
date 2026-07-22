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

/** Catalog first; fall back to server/lobby metadata so duel stakes still settle. */
export function resolveStake(
  cardKey: string | null | undefined,
  meta?: {
    name?: string | null;
    rarity?: string | null;
    rating?: number | null;
  } | null,
): CardWagerStake | null {
  if (!cardKey) return null;
  const fromCatalog = stakeFromKey(cardKey);
  if (fromCatalog) return fromCatalog;
  if (!meta?.name) return null;
  const rarity = (meta.rarity as CardRarity | null) ?? 'common';
  const valid: CardRarity =
    rarity === 'rare' || rarity === 'epic' || rarity === 'legendary' || rarity === 'common'
      ? rarity
      : 'common';
  return {
    cardKey,
    name: meta.name,
    rarity: valid,
    rating: typeof meta.rating === 'number' && Number.isFinite(meta.rating) ? meta.rating : 70,
  };
}

/** True when at least one side put a card up — winner keeps theirs and takes the other stake. */
export function isWagerActive(agreement: CardWagerAgreement | null | undefined): boolean {
  return !!(agreement?.yourCard || agreement?.opponentCard);
}

/** Merge local + server stake info; prefer whichever side still has a real card. */
export function mergeWagerAgreement(
  ...parts: Array<CardWagerAgreement | null | undefined>
): CardWagerAgreement | null {
  let yourCard: CardWagerStake | null = null;
  let opponentCard: CardWagerStake | null = null;
  for (const part of parts) {
    if (!part) continue;
    if (!yourCard && part.yourCard) yourCard = part.yourCard;
    if (!opponentCard && part.opponentCard) opponentCard = part.opponentCard;
  }
  if (!yourCard && !opponentCard) return null;
  return { yourCard, opponentCard };
}

function stakeAsCollectible(stake: CardWagerStake): CollectibleCard {
  const existing = CARD_BY_KEY.get(stake.cardKey);
  if (existing) return existing;
  const [sportPart, ...rest] = stake.cardKey.split(':');
  const sport = (sportPart as CollectibleCard['sport']) || 'soccer';
  return {
    key: stake.cardKey,
    sport: ['soccer', 'basketball', 'baseball', 'football', 'hockey'].includes(sport)
      ? sport
      : 'soccer',
    playerId: rest.join(':') || stake.cardKey,
    name: stake.name,
    country: '',
    positions: [],
    team: '',
    retired: false,
    era: '',
    rarity: stake.rarity,
    rating: stake.rating,
  };
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

  const yourCard = agreement.yourCard ? stakeAsCollectible(agreement.yourCard) : null;
  const opponentCard = agreement.opponentCard
    ? stakeAsCollectible(agreement.opponentCard)
    : null;

  if (outcome === 'draw') {
    return {
      active: true,
      outcome: 'draw',
      gained: null,
      lost: null,
      message: yourCard ? `Draw — ${yourCard.name} returned` : 'Draw — no cards moved',
    };
  }

  if (outcome === 'win') {
    if (opponentCard && yourCard) {
      return {
        active: true,
        outcome: 'win',
        gained: opponentCard,
        lost: null,
        message: `Won ${opponentCard.name} · kept ${yourCard.name}`,
      };
    }
    if (opponentCard) {
      return {
        active: true,
        outcome: 'win',
        gained: opponentCard,
        lost: null,
        message: `You won ${opponentCard.name}`,
      };
    }
    return {
      active: true,
      outcome: 'win',
      gained: null,
      lost: null,
      message: yourCard ? `You kept ${yourCard.name}` : 'No card stake this match',
    };
  }

  if (yourCard) {
    return {
      active: true,
      outcome: 'loss',
      gained: null,
      lost: yourCard,
      message: `You lost ${yourCard.name}`,
    };
  }

  return {
    active: true,
    outcome: 'loss',
    gained: null,
    lost: null,
    message: opponentCard ? `They kept ${opponentCard.name}` : 'No card stake this match',
  };
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
