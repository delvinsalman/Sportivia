import type { GameResult, Sport } from '../types';
import type { CharacterId, DogVariantId, PetId, PlayerProfile, RabbitVariantId } from '../types/profile';
import {
  CHARACTERS,
  DEFAULT_ATHLETE_LOADOUT,
  DEFAULT_BOB_LOADOUT,
  DEFAULT_CHARACTER,
  DEFAULT_CREATIVE_LOADOUT,
  DEFAULT_DOG_VARIANT,
  DEFAULT_PLAYER_NAME,
  DEFAULT_RABBIT_VARIANT,
  DOG_VARIANTS,
  PETS,
  RABBIT_VARIANTS,
  STARTER_CHARACTERS,
  STARTER_PETS,
} from '../types/profile';
import { normalizeCreativeLoadout, type CreativeLoadout } from '../types/creativeCharacter';
import {
  normalizeAthleteLoadout,
  type AthleteLoadout,
} from '../types/athleteCharacter';
import { normalizeBobLoadout, type BobLoadout } from '../types/bobCharacter';
import { applyRewards, computeGameRewards, levelFromXp } from './progression';
import { loadStats, saveStats, recordGameResult } from './storage';
import { applySeasonFromResult, grantDuelWinAchievement } from './seasonMeta';
import type { CardPackTier, CardRarity, CollectibleCard, OpenedCard } from '../types/cards';
import { CARD_BY_KEY, CARD_CATALOG, CARDS_BY_SPORT, getPackDefinition } from './cardCatalog';
import {
  describeWagerSettlement,
  isWagerActive,
  type CardWagerAgreement,
  type CardWagerSettlement,
} from './cardWager';

const PROFILE_KEY = 'gridiq-profile-v4';
const PAID_SKINS_MIGRATION_KEY = 'gridiq-paid-skins-v1';

function migrateCharacterId(id?: string): CharacterId | undefined {
  if (id === 'cool-banana-guy') return 'bunny';
  if (CHARACTERS.some(c => c.id === id)) return id as CharacterId;
  return undefined;
}

function migratePetId(id?: string): PetId | undefined {
  if (PETS.some(p => p.id === id)) return id as PetId;
  return undefined;
}

function normalizeUnlocked(unlocked?: CharacterId[]): CharacterId[] {
  // One-time: revoke skins that were unlocked while everything was free
  if (!localStorage.getItem(PAID_SKINS_MIGRATION_KEY)) {
    localStorage.setItem(PAID_SKINS_MIGRATION_KEY, '1');
    return [...STARTER_CHARACTERS];
  }

  const owned = unlocked
    ?.map(id => migrateCharacterId(id))
    .filter((id): id is CharacterId => id !== undefined) ?? [];
  return [...new Set([...STARTER_CHARACTERS, ...owned])];
}

function normalizeUnlockedPets(unlocked?: PetId[]): PetId[] {
  const owned = unlocked
    ?.map(id => migratePetId(id))
    .filter((id): id is PetId => id !== undefined) ?? [];
  return [...new Set([...STARTER_PETS, ...owned])];
}

function defaultProfile(): PlayerProfile {
  return {
    playerName: DEFAULT_PLAYER_NAME,
    coins: 0,
    xp: 0,
    level: 1,
    equippedCharacter: DEFAULT_CHARACTER,
    unlockedCharacters: [...STARTER_CHARACTERS],
    equippedPet: null,
    unlockedPets: [],
    creativeLoadout: { ...DEFAULT_CREATIVE_LOADOUT },
    athleteLoadout: { ...DEFAULT_ATHLETE_LOADOUT },
    bobLoadout: { ...DEFAULT_BOB_LOADOUT },
    rabbitVariant: DEFAULT_RABBIT_VARIANT,
    dogVariant: DEFAULT_DOG_VARIANT,
    cardCollection: {
      owned: {},
      packsOpened: 0,
      legendaryPity: 0,
    },
    stats: loadStats(),
  };
}

function migrateLegacy(): PlayerProfile {
  return defaultProfile();
}

export function loadProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return migrateLegacy();
    const parsed = JSON.parse(raw) as Partial<PlayerProfile>;
    const base = defaultProfile();
    const equipped = migrateCharacterId(parsed.equippedCharacter) ?? DEFAULT_CHARACTER;
    const unlocked = normalizeUnlocked(parsed.unlockedCharacters);
    const safeEquipped = unlocked.includes(equipped) ? equipped : DEFAULT_CHARACTER;

    let unlockedPets = normalizeUnlockedPets(parsed.unlockedPets);
    // Keep pets already equipped on older profiles (they used to get a free starter).
    if (parsed.equippedPet != null) {
      const prior = migratePetId(parsed.equippedPet);
      if (prior && !unlockedPets.includes(prior)) {
        unlockedPets = [...unlockedPets, prior];
      }
    }
    let safePet: PetId | null = null;
    if (parsed.equippedPet != null) {
      const equippedPet = migratePetId(parsed.equippedPet);
      safePet = equippedPet && unlockedPets.includes(equippedPet) ? equippedPet : null;
    }

    const creativeLoadout = normalizeCreativeLoadout(parsed.creativeLoadout);
    const athleteLoadout = normalizeAthleteLoadout(parsed.athleteLoadout);
    const bobLoadout = normalizeBobLoadout(parsed.bobLoadout);
    const rabbitVariant = RABBIT_VARIANTS.some(variant => variant.id === parsed.rabbitVariant)
      ? (parsed.rabbitVariant as RabbitVariantId)
      : DEFAULT_RABBIT_VARIANT;
    const dogVariant = DOG_VARIANTS.some(variant => variant.id === parsed.dogVariant)
      ? (parsed.dogVariant as DogVariantId)
      : DEFAULT_DOG_VARIANT;
    const rawCollection = parsed.cardCollection;
    const cardCollection = {
      owned:
        rawCollection?.owned && typeof rawCollection.owned === 'object'
          ? Object.fromEntries(
              Object.entries(rawCollection.owned)
                .filter(
                  ([key, count]) =>
                    /^(soccer|basketball|baseball|football|hockey):/.test(key) &&
                    typeof count === 'number' &&
                    Number.isFinite(count) &&
                    count > 0,
                )
                .map(([key]) => [key, 1]),
            )
          : {},
      packsOpened:
        typeof rawCollection?.packsOpened === 'number'
          ? Math.max(0, Math.floor(rawCollection.packsOpened))
          : 0,
      legendaryPity:
        typeof rawCollection?.legendaryPity === 'number'
          ? Math.max(0, Math.floor(rawCollection.legendaryPity))
          : 0,
    };

    const profile: PlayerProfile = {
      ...base,
      playerName: parsed.playerName?.trim() || DEFAULT_PLAYER_NAME,
      coins: typeof parsed.coins === 'number' ? Math.max(0, Math.floor(parsed.coins)) : 0,
      xp: parsed.xp ?? 0,
      level: levelFromXp(parsed.xp ?? 0),
      equippedCharacter: safeEquipped,
      unlockedCharacters: unlocked,
      equippedPet: safePet,
      unlockedPets,
      creativeLoadout,
      athleteLoadout,
      bobLoadout,
      rabbitVariant,
      dogVariant,
      cardCollection,
      stats: loadStats(),
    };

    const equippedMigrated =
      (parsed.equippedCharacter as string | undefined) === 'cool-banana-guy' ||
      equipped !== safeEquipped;
    const unlockedChanged =
      unlocked.length !== (parsed.unlockedCharacters?.length ?? 0) ||
      !STARTER_CHARACTERS.every(id => parsed.unlockedCharacters?.includes(id)) ||
      (parsed.unlockedCharacters as string[] | undefined)?.includes('cool-banana-guy') ||
      safeEquipped !== (parsed.equippedCharacter as string | undefined);
    const petsChanged =
      !parsed.unlockedPets ||
      parsed.equippedPet === undefined ||
      safePet !== parsed.equippedPet ||
      unlockedPets.length !== (parsed.unlockedPets?.length ?? 0);
    const hadMultiCopies = Object.values(rawCollection?.owned ?? {}).some(
      count => typeof count === 'number' && count > 1,
    );
    const cardsChanged = !parsed.cardCollection || hadMultiCopies;
    const rabbitChanged = parsed.rabbitVariant !== rabbitVariant;
    const dogChanged = parsed.dogVariant !== dogVariant;

    if (equippedMigrated || unlockedChanged || petsChanged || cardsChanged || rabbitChanged || dogChanged) {
      saveProfile(profile);
    }

    return profile;
  } catch {
    return migrateLegacy();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  const next = {
    ...profile,
    coins: Math.max(0, Math.floor(profile.coins)),
    xp: Math.max(0, Math.floor(profile.xp)),
    level: levelFromXp(profile.xp),
  };
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    saveStats(next.stats);
  } catch {
    /* quota / private mode — keep in-memory play going */
  }
}

/** Apply duelist achievement + coin bonus after a confirmed online win. */
export function grantDuelWin(): { profile: PlayerProfile; granted: boolean } {
  const profile = loadProfile();
  const { newlyUnlocked, bonusCoins } = grantDuelWinAchievement();
  if (!newlyUnlocked && bonusCoins <= 0) {
    return { profile, granted: false };
  }
  if (bonusCoins > 0) profile.coins += bonusCoins;
  saveProfile(profile);
  return { profile, granted: true };
}

export function recordGameWithRewards(
  sport: Sport,
  result: GameResult,
  duelWon?: boolean,
): {
  profile: PlayerProfile;
  rewards: ReturnType<typeof computeGameRewards> | null;
  season?: {
    newlyUnlocked: string[];
    dailyAlreadyClaimed: boolean;
  };
} {
  if (!result.completed || result.mode === 'training') {
    return { profile: loadProfile(), rewards: null };
  }

  const profileWithStats = loadProfile();
  profileWithStats.stats = recordGameResult(sport, result);
  const dailyStreak = profileWithStats.stats[sport].dailyStreak;

  const season = applySeasonFromResult(sport, result, {
    profileLevel: profileWithStats.level,
    profileCoins: profileWithStats.coins,
    dailyStreak,
    duelWon,
  });

  // Second Daily finish today keeps stats, skips payday
  if (season.dailyAlreadyClaimed && result.mode === 'daily') {
    saveProfile(profileWithStats);
    return {
      profile: profileWithStats,
      rewards: null,
      season: {
        newlyUnlocked: season.newlyUnlocked,
        dailyAlreadyClaimed: true,
      },
    };
  }

  const baseRewards = computeGameRewards(result);
  baseRewards.coinsEarned += season.bonusCoins;
  baseRewards.xpEarned += season.bonusXp;

  const applied = applyRewards(profileWithStats.coins, profileWithStats.xp, baseRewards);
  profileWithStats.coins = applied.coins;
  profileWithStats.xp = applied.xp;
  profileWithStats.level = applied.rewards.newLevel;

  saveProfile(profileWithStats);
  return {
    profile: profileWithStats,
    rewards: applied.rewards,
    season: {
      newlyUnlocked: season.newlyUnlocked,
      dailyAlreadyClaimed: false,
    },
  };
}

export function equipCharacter(id: CharacterId): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedCharacters.includes(id)) return profile;
  profile.equippedCharacter = id;
  saveProfile(profile);
  return profile;
}

export function equipPet(id: PetId): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedPets.includes(id)) return profile;
  profile.equippedPet = id;
  saveProfile(profile);
  return profile;
}

export function unequipPet(): PlayerProfile {
  const profile = loadProfile();
  profile.equippedPet = null;
  saveProfile(profile);
  return profile;
}

export function updatePlayerName(name: string): PlayerProfile {
  const profile = loadProfile();
  const trimmed = name.trim().slice(0, 18);
  profile.playerName = trimmed || DEFAULT_PLAYER_NAME;
  saveProfile(profile);
  return profile;
}

export function purchaseCharacter(id: CharacterId): { ok: boolean; profile: PlayerProfile; error?: string } {
  const profile = loadProfile();
  if (profile.unlockedCharacters.includes(id)) {
    return { ok: false, profile, error: 'Already owned' };
  }

  const def = CHARACTERS.find(c => c.id === id);
  if (!def) return { ok: false, profile, error: 'Unknown character' };
  if (def.price > 0 && profile.coins < def.price) {
    return { ok: false, profile, error: `Need ${def.price - profile.coins} more coins` };
  }

  if (def.price > 0) profile.coins -= def.price;
  profile.unlockedCharacters = [...profile.unlockedCharacters, id];
  profile.equippedCharacter = id;
  saveProfile(profile);
  return { ok: true, profile };
}

export function purchasePet(id: PetId): { ok: boolean; profile: PlayerProfile; error?: string } {
  const profile = loadProfile();
  if (profile.unlockedPets.includes(id)) {
    return { ok: false, profile, error: 'Already owned' };
  }

  const def = PETS.find(p => p.id === id);
  if (!def) return { ok: false, profile, error: 'Unknown pet' };
  if (def.price > 0 && profile.coins < def.price) {
    return { ok: false, profile, error: `Need ${def.price - profile.coins} more coins` };
  }

  if (def.price > 0) profile.coins -= def.price;
  profile.unlockedPets = [...profile.unlockedPets, id];
  profile.equippedPet = id;
  saveProfile(profile);
  return { ok: true, profile };
}

export function saveCreativeLoadout(loadout: CreativeLoadout): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedCharacters.includes('creative')) return profile;
  profile.creativeLoadout = normalizeCreativeLoadout(loadout);
  saveProfile(profile);
  return profile;
}

export function saveAthleteLoadout(loadout: AthleteLoadout): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedCharacters.includes('athlete')) return profile;
  profile.athleteLoadout = normalizeAthleteLoadout(loadout);
  saveProfile(profile);
  return profile;
}

export function saveBobLoadout(loadout: BobLoadout): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedCharacters.includes('bob')) return profile;
  profile.bobLoadout = normalizeBobLoadout(loadout);
  saveProfile(profile);
  return profile;
}

export function saveRabbitVariant(variant: RabbitVariantId): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedCharacters.includes('bunny')) return profile;
  if (!RABBIT_VARIANTS.some(item => item.id === variant)) return profile;
  profile.rabbitVariant = variant;
  saveProfile(profile);
  return profile;
}

export function saveDogVariant(variant: DogVariantId): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedPets.includes('dog')) return profile;
  if (!DOG_VARIANTS.some(item => item.id === variant)) return profile;
  profile.dogVariant = variant;
  saveProfile(profile);
  return profile;
}

const RARITY_ORDER: Record<CardRarity, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

function rollRarity(
  odds: Record<CardRarity, number>,
  minimum: CardRarity = 'common',
  random: () => number,
): CardRarity {
  const allowed = (Object.keys(odds) as CardRarity[]).filter(
    rarity => RARITY_ORDER[rarity] >= RARITY_ORDER[minimum],
  );
  const total = allowed.reduce((sum, rarity) => sum + odds[rarity], 0);
  let roll = random() * total;
  for (const rarity of allowed) {
    roll -= odds[rarity];
    if (roll <= 0) return rarity;
  }
  return allowed.at(-1) ?? minimum;
}

function pickCard(
  pool: CollectibleCard[],
  rarity: CardRarity,
  random: () => number,
  excludeKeys: Set<string> = new Set(),
): CollectibleCard | null {
  const available = pool.filter(card => !excludeKeys.has(card.key));
  const source = available.length ? available : pool;
  const rarityPool = source.filter(card => card.rarity === rarity);
  const choices = rarityPool.length ? rarityPool : source;
  if (!choices.length) return null;
  return choices[Math.floor(random() * choices.length)]!;
}

export function openCardPack(
  sport: Sport,
  tier: CardPackTier,
  random: () => number = Math.random,
): {
  ok: boolean;
  profile: PlayerProfile;
  cards: OpenedCard[];
  duplicateCoins: number;
  error?: string;
} {
  const profile = loadProfile();
  const pack = getPackDefinition(tier);
  if (profile.coins < pack.cost) {
    return {
      ok: false,
      profile,
      cards: [],
      duplicateCoins: 0,
      error: `Need ${pack.cost - profile.coins} more coins`,
    };
  }

  const pool = CARDS_BY_SPORT[sport];
  if (!pool.length) {
    return { ok: false, profile, cards: [], duplicateCoins: 0, error: 'No cards available' };
  }

  const rolled: CollectibleCard[] = [];
  const pulledKeys = new Set<string>();
  for (let index = 0; index < pack.cardCount; index++) {
    const isGuaranteedSlot = index === pack.cardCount - 1 && pack.guaranteedRarity;
    const rarity = rollRarity(
      pack.odds,
      isGuaranteedSlot ? pack.guaranteedRarity : 'common',
      random,
    );
    const card = pickCard(pool, rarity, random, pulledKeys);
    if (!card) break;
    rolled.push(card);
    pulledKeys.add(card.key);
  }

  const pityTriggered =
    profile.cardCollection.legendaryPity >= 34 &&
    !rolled.some(card => card.rarity === 'legendary');
  if (pityTriggered && rolled.length > 0) {
    // Prefer a legend not already in this pack so uniqueness holds.
    const legend =
      pickCard(pool, 'legendary', random, pulledKeys) ??
      pickCard(pool, 'legendary', random, new Set());
    if (legend) {
      const previous = rolled[0]!;
      if (previous.key !== legend.key) {
        pulledKeys.delete(previous.key);
        const alreadyInPack = rolled.findIndex((card, i) => i > 0 && card.key === legend.key);
        rolled[0] = legend;
        pulledKeys.add(legend.key);
        if (alreadyInPack >= 0) {
          const refill = pickCard(pool, previous.rarity, random, pulledKeys);
          if (refill) {
            rolled[alreadyInPack] = refill;
            pulledKeys.add(refill.key);
          }
        }
      }
    }
  }

  profile.coins -= pack.cost;
  let duplicateCoins = 0;
  const cards = rolled.map(card => {
    const alreadyOwned = (profile.cardCollection.owned[card.key] ?? 0) > 0;
    const duplicate = alreadyOwned;
    const refund = duplicate ? pack.duplicateRefund[card.rarity] : 0;
    if (!alreadyOwned) {
      profile.cardCollection.owned[card.key] = 1;
    }
    profile.coins += refund;
    duplicateCoins += refund;
    return { card, duplicate, duplicateCoins: refund };
  });

  const pulledLegendary = rolled.some(card => card.rarity === 'legendary');
  profile.cardCollection.packsOpened += 1;
  profile.cardCollection.legendaryPity = pulledLegendary
    ? 0
    : profile.cardCollection.legendaryPity + 1;
  saveProfile(profile);

  return { ok: true, profile, cards, duplicateCoins };
}

export function addCardToCollection(cardKey: string): {
  ok: boolean;
  profile: PlayerProfile;
  duplicate: boolean;
  error?: string;
} {
  const profile = loadProfile();
  const card = CARD_BY_KEY.get(cardKey);
  // Allow sport:id keys even if catalog lookup fails so duel transfers still land.
  if (!card && !/^[a-z]+:.+/.test(cardKey)) {
    return { ok: false, profile, duplicate: false, error: 'Unknown card' };
  }
  const alreadyOwned = (profile.cardCollection.owned[cardKey] ?? 0) > 0;
  if (!alreadyOwned) {
    profile.cardCollection.owned[cardKey] = 1;
    saveProfile(profile);
  }
  return { ok: true, profile, duplicate: alreadyOwned };
}

export function removeCardFromCollection(cardKey: string): {
  ok: boolean;
  profile: PlayerProfile;
  error?: string;
} {
  const profile = loadProfile();
  if ((profile.cardCollection.owned[cardKey] ?? 0) <= 0) {
    return { ok: false, profile, error: 'Card not owned' };
  }
  delete profile.cardCollection.owned[cardKey];
  saveProfile(profile);
  return { ok: true, profile };
}

/** Apply win/loss card stake. Escrow already removed your card at match start. */
export function settleCardWager(
  outcome: 'win' | 'loss' | 'draw',
  agreement: CardWagerAgreement,
): {
  profile: PlayerProfile;
  settlement: CardWagerSettlement;
} {
  const settlement = describeWagerSettlement(outcome, agreement);
  let profile = loadProfile();

  if (!isWagerActive(agreement)) {
    return { profile, settlement };
  }

  // Escrow pulled your card at kickoff — restore it on draw or win.
  if (outcome === 'draw' || outcome === 'win') {
    if (agreement.yourCard) {
      const restored = addCardToCollection(agreement.yourCard.cardKey);
      profile = restored.profile;
    }
  }

  if (outcome === 'win' && agreement.opponentCard) {
    const added = addCardToCollection(agreement.opponentCard.cardKey);
    profile = added.profile;
    if (added.duplicate && settlement.gained) {
      settlement.message = `You won ${settlement.gained.name} (already owned) · you keep yours`;
    }
  }

  // Loss: leave escrowed card removed (do not re-remove / restore).
  return { profile, settlement };
}

export function unlockAllCatalogCards(profile: PlayerProfile): number {
  let added = 0;
  for (const card of CARD_CATALOG) {
    if ((profile.cardCollection.owned[card.key] ?? 0) > 0) continue;
    profile.cardCollection.owned[card.key] = 1;
    added += 1;
  }
  return added;
}

export async function redeemPromoCode(raw: string): Promise<{
  ok: boolean;
  profile: PlayerProfile;
  error?: string;
  coinsGranted?: number;
  cardsUnlocked?: number;
  rewardLabel?: string;
}> {
  const { lookupPromo, markPromoRedeemed } = await import('./promoCodes');
  const result = await lookupPromo(raw);
  const profile = loadProfile();

  if (!result.ok) {
    if (result.error === 'empty') return { ok: false, profile, error: 'Enter a code' };
    if (result.error === 'used') return { ok: false, profile, error: 'Code already used' };
    return { ok: false, profile, error: 'Invalid code' };
  }

  let cardsUnlocked = 0;
  if (result.reward.unlockAllCards) {
    cardsUnlocked = unlockAllCatalogCards(profile);
  }

  profile.coins += result.reward.coins;
  markPromoRedeemed(result.reward.id);
  saveProfile(profile);
  return {
    ok: true,
    profile,
    coinsGranted: result.reward.coins,
    cardsUnlocked,
    rewardLabel: result.reward.label,
  };
}
