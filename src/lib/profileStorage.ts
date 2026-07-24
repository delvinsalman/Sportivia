import type { GameResult, Sport } from '../types';
import type { CharacterId, DogVariantId, MakoVariantId, PetId, PlayerProfile, PvpRecord, RabbitVariantId } from '../types/profile';
import {
  CHARACTERS,
  DEFAULT_ATHLETE_LOADOUT,
  DEFAULT_BOB_LOADOUT,
  DEFAULT_CHARACTER,
  DEFAULT_CREATIVE_LOADOUT,
  DEFAULT_DOG_VARIANT,
  DEFAULT_MAKO_VARIANT,
  DEFAULT_RABBIT_VARIANT,
  DOG_VARIANTS,
  EMPTY_PVP_RECORD,
  MAKO_VARIANTS,
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
import { pickRandomPlayerName } from './playerNames';
import { maxBonusForStat, pendingUpgradePayment, type CardStatKey } from './characterCards';
import type { BotDifficulty } from '../types';
import {
  isDailySpinOnCooldown,
  rollDailySpinPrize,
  type DailySpinPrize,
} from './dailySpin';
import {
  clampBotStake,
  clampDuelStake,
  settleBotStakeDelta,
  settleDuelStakeDelta,
  type StakeOutcome,
} from './coinStake';

const PROFILE_KEY = 'gridiq-profile-v4';
const PAID_SKINS_MIGRATION_KEY = 'gridiq-paid-skins-v1';
const CARD_STATS_DEFAULT_RESET_KEY = 'gridiq-card-stats-default-v1';
const COIN_STAKE_ESCROW_KEY = 'sportivia-coin-stake-escrow-v1';

type CoinStakeEscrow =
  | {
      mode: 'bot';
      amount: number;
      difficulty: BotDifficulty;
    }
  | {
      mode: 'duel';
      amount: number;
      opponentAmount: number;
    };

function readEscrow(): CoinStakeEscrow | null {
  try {
    const raw = localStorage.getItem(COIN_STAKE_ESCROW_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CoinStakeEscrow>;
    if (parsed.mode === 'bot' && typeof parsed.amount === 'number' && parsed.difficulty) {
      return {
        mode: 'bot',
        amount: Math.max(0, Math.floor(parsed.amount)),
        difficulty: parsed.difficulty,
      };
    }
    if (parsed.mode === 'duel' && typeof parsed.amount === 'number') {
      return {
        mode: 'duel',
        amount: Math.max(0, Math.floor(parsed.amount)),
        opponentAmount: Math.max(0, Math.floor(Number(parsed.opponentAmount) || 0)),
      };
    }
  } catch {
    /* ignore */
  }
  return null;
}

function writeEscrow(escrow: CoinStakeEscrow | null) {
  try {
    if (!escrow) {
      localStorage.removeItem(COIN_STAKE_ESCROW_KEY);
      return;
    }
    // Duel can escrow 0 on your side when only the opponent staked —
    // still persist so the winner can collect their coins.
    if (escrow.mode === 'duel') {
      if (escrow.amount <= 0 && escrow.opponentAmount <= 0) {
        localStorage.removeItem(COIN_STAKE_ESCROW_KEY);
        return;
      }
    } else if (escrow.amount <= 0) {
      localStorage.removeItem(COIN_STAKE_ESCROW_KEY);
      return;
    }
    localStorage.setItem(COIN_STAKE_ESCROW_KEY, JSON.stringify(escrow));
  } catch {
    /* ignore */
  }
}

/** Lock coins before a bot or duel match. Returns false if balance is too low. */
export function lockCoinStake(input: CoinStakeEscrow): {
  ok: boolean;
  profile: PlayerProfile;
  error?: string;
} {
  const profile = loadProfile();
  const amount =
    input.mode === 'bot'
      ? clampBotStake(input.difficulty, input.amount)
      : clampDuelStake(input.amount);
  if (amount > 0 && profile.coins < amount) {
    return { ok: false, profile, error: 'Not enough coins' };
  }
  // Clear any stale escrow first.
  const prior = readEscrow();
  if (prior && prior.amount > 0) {
    profile.coins += prior.amount;
  }
  if (amount > 0) profile.coins -= amount;
  if (input.mode === 'bot') {
    writeEscrow(amount > 0 ? { mode: 'bot', amount, difficulty: input.difficulty } : null);
  } else {
    const opponentAmount = clampDuelStake(input.opponentAmount);
    writeEscrow(
      amount > 0 || opponentAmount > 0
        ? { mode: 'duel', amount, opponentAmount }
        : null,
    );
  }
  saveProfile(profile);
  return { ok: true, profile };
}

/** Refund escrow without settling a match (quit before finish / rematch cancel). */
export function releaseCoinStake(): PlayerProfile {
  const profile = loadProfile();
  const escrow = readEscrow();
  if (escrow && escrow.amount > 0) {
    profile.coins += escrow.amount;
    writeEscrow(null);
    saveProfile(profile);
  } else {
    writeEscrow(null);
  }
  return profile;
}

export function settleLockedCoinStake(outcome: StakeOutcome): {
  profile: PlayerProfile;
  stakeDelta: number;
  stakeLabel: string;
  stakeAmount: number;
} {
  const profile = loadProfile();
  const escrow = readEscrow();
  const duelEmpty =
    escrow?.mode === 'duel' &&
    escrow.amount <= 0 &&
    escrow.opponentAmount <= 0;
  if (!escrow || (escrow.mode === 'bot' && escrow.amount <= 0) || duelEmpty) {
    writeEscrow(null);
    return { profile, stakeDelta: 0, stakeLabel: 'No stake', stakeAmount: 0 };
  }

  const settled =
    escrow.mode === 'bot'
      ? settleBotStakeDelta(escrow.amount, escrow.difficulty, outcome)
      : settleDuelStakeDelta(escrow.amount, escrow.opponentAmount, outcome);

  profile.coins += settled.delta;
  writeEscrow(null);
  saveProfile(profile);
  return {
    profile,
    stakeDelta: settled.delta - escrow.amount,
    stakeLabel: settled.label,
    stakeAmount: escrow.amount,
  };
}

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
    playerName: pickRandomPlayerName(),
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
    makoVariant: DEFAULT_MAKO_VARIANT,
    dogVariant: DEFAULT_DOG_VARIANT,
    characterStatLevels: {},
    pvpRecord: { ...EMPTY_PVP_RECORD },
    freeUpgradeCredits: 0,
    dailySpinAt: null,
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
    const makoVariant = MAKO_VARIANTS.some(variant => variant.id === parsed.makoVariant)
      ? (parsed.makoVariant as MakoVariantId)
      : DEFAULT_MAKO_VARIANT;
    const dogVariant = DOG_VARIANTS.some(variant => variant.id === parsed.dogVariant)
      ? (parsed.dogVariant as DogVariantId)
      : DEFAULT_DOG_VARIANT;

    const STAT_KEYS = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const;
    let characterStatLevels: PlayerProfile['characterStatLevels'] = {};
    const resetDone = localStorage.getItem(CARD_STATS_DEFAULT_RESET_KEY) === '1';
    if (resetDone) {
      const parsedStatLevels = (parsed as { characterStatLevels?: unknown }).characterStatLevels;
      if (parsedStatLevels && typeof parsedStatLevels === 'object') {
        for (const [key, value] of Object.entries(parsedStatLevels as Record<string, unknown>)) {
          const id = migrateCharacterId(key);
          if (!id || !value || typeof value !== 'object') continue;
          const next: Partial<Record<(typeof STAT_KEYS)[number], number>> = {};
          for (const stat of STAT_KEYS) {
            const raw = (value as Record<string, unknown>)[stat];
            if (typeof raw !== 'number') continue;
            next[stat] = Math.max(0, Math.min(40, Math.floor(raw)));
          }
          characterStatLevels[id] = next;
        }
      }
    } else {
      // Wipe glitched / legacy overall→stat migrations so every card starts at base defaults.
      characterStatLevels = {};
      localStorage.setItem(CARD_STATS_DEFAULT_RESET_KEY, '1');
    }

    const profile: PlayerProfile = {
      ...base,
      playerName: parsed.playerName?.trim() || pickRandomPlayerName(),
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
      makoVariant,
      dogVariant,
      characterStatLevels,
      pvpRecord: normalizePvpRecord((parsed as { pvpRecord?: unknown }).pvpRecord),
      freeUpgradeCredits:
        typeof (parsed as { freeUpgradeCredits?: unknown }).freeUpgradeCredits === 'number'
          ? Math.max(0, Math.floor((parsed as { freeUpgradeCredits: number }).freeUpgradeCredits))
          : 0,
      dailySpinAt: normalizeDailySpinAt(parsed),
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
    const rabbitChanged = parsed.rabbitVariant !== rabbitVariant;
    const makoChanged = parsed.makoVariant !== makoVariant;
    const dogChanged = parsed.dogVariant !== dogVariant;
    const hadLegacyCards = 'cardCollection' in parsed;
    const cardStatsReset = !resetDone;

    if (
      equippedMigrated ||
      unlockedChanged ||
      petsChanged ||
      rabbitChanged ||
      makoChanged ||
      dogChanged ||
      hadLegacyCards ||
      cardStatsReset
    ) {
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

function normalizePvpRecord(raw: unknown): PvpRecord {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PVP_RECORD };
  const src = raw as Record<string, unknown>;
  const clamp = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  return {
    wins: clamp(src.wins),
    losses: clamp(src.losses),
    ties: clamp(src.ties),
  };
}

/** Accept ms timestamp, or migrate old YYYY-MM-DD dailySpinDate. */
function normalizeDailySpinAt(parsed: Partial<PlayerProfile> & Record<string, unknown>): number | null {
  const at = parsed.dailySpinAt;
  if (typeof at === 'number' && Number.isFinite(at) && at > 0) return Math.floor(at);
  const legacy = parsed.dailySpinDate;
  if (typeof legacy === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(legacy)) {
    const ms = Date.parse(`${legacy}T12:00:00`);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
}

export function formatPvpRecord(record: PvpRecord): string {
  return `${record.wins}-${record.losses}-${record.ties}`;
}

/** Bump lifetime 1v1 W-L-T after a resolved duel. */
export function recordPvpOutcome(
  outcome: 'win' | 'loss' | 'draw',
): PlayerProfile {
  const profile = loadProfile();
  const next = { ...normalizePvpRecord(profile.pvpRecord) };
  if (outcome === 'win') next.wins += 1;
  else if (outcome === 'loss') next.losses += 1;
  else next.ties += 1;
  profile.pvpRecord = next;
  saveProfile(profile);
  return profile;
}

export function isDailySpinAvailable(profile?: PlayerProfile): boolean {
  const p = profile ?? loadProfile();
  return !isDailySpinOnCooldown(p.dailySpinAt);
}

/** Roll + grant a spin. Locked for 24h from the moment you claim. */
export function claimDailySpin(): {
  ok: boolean;
  profile: PlayerProfile;
  prize?: DailySpinPrize;
  error?: string;
} {
  const profile = loadProfile();
  if (isDailySpinOnCooldown(profile.dailySpinAt)) {
    return { ok: false, profile, error: 'Spin available again in 24 hours' };
  }
  const prize = rollDailySpinPrize();
  if (prize.kind === 'coins') {
    profile.coins += prize.amount;
  } else {
    profile.freeUpgradeCredits = Math.max(0, Math.floor(profile.freeUpgradeCredits ?? 0)) + prize.amount;
  }
  profile.dailySpinAt = Date.now();
  saveProfile(profile);
  return { ok: true, profile, prize };
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
  profile.playerName = trimmed || pickRandomPlayerName();
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
  profile.characterStatLevels = { ...profile.characterStatLevels, [id]: {} };
  profile.equippedCharacter = id;
  saveProfile(profile);
  return { ok: true, profile };
}

export function upgradeCharacterStat(
  id: CharacterId,
  stat: CardStatKey,
): { ok: boolean; profile: PlayerProfile; error?: string } {
  return applyCharacterStatUpgrades(id, { [stat]: 1 });
}

/** Apply a queued multi-stat upgrade cart in one payment. */
export function applyCharacterStatUpgrades(
  id: CharacterId,
  pending: Partial<Record<CardStatKey, number>>,
): { ok: boolean; profile: PlayerProfile; error?: string; total?: number } {
  const profile = loadProfile();
  const def = CHARACTERS.find(c => c.id === id);
  if (!def) return { ok: false, profile, error: 'Unknown character' };
  if (!profile.unlockedCharacters.includes(id)) {
    return { ok: false, profile, error: 'Unlock this skin first' };
  }

  const cleaned: Partial<Record<CardStatKey, number>> = {};
  for (const key of ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const) {
    const n = pending[key];
    if (typeof n === 'number' && n > 0) cleaned[key] = Math.floor(n);
  }
  if (Object.keys(cleaned).length === 0) {
    return { ok: false, profile, error: 'Nothing to upgrade' };
  }

  // Validate each queued step stays under caps.
  const draftLevels = { ...(profile.characterStatLevels?.[id] ?? {}) };
  for (const key of ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const) {
    const add = cleaned[key] ?? 0;
    if (add <= 0) continue;
    const max = maxBonusForStat(def, key);
    const current = Math.max(0, Math.min(max, Math.floor(draftLevels[key] ?? 0)));
    if (current + add > max) {
      return { ok: false, profile, error: `${key.toUpperCase()} would exceed max` };
    }
  }

  const payment = pendingUpgradePayment(profile, def, cleaned);
  if (payment.steps <= 0) return { ok: false, profile, error: 'Nothing to upgrade' };
  if (profile.coins < payment.coinCost) {
    return {
      ok: false,
      profile,
      error: `Need ${payment.coinCost - profile.coins} more coins`,
    };
  }

  profile.coins -= payment.coinCost;
  profile.freeUpgradeCredits = Math.max(
    0,
    Math.floor(profile.freeUpgradeCredits ?? 0) - payment.creditsUsed,
  );
  const nextLevels = { ...(profile.characterStatLevels?.[id] ?? {}) };
  for (const key of ['pac', 'sho', 'pas', 'dri', 'def', 'phy'] as const) {
    const add = cleaned[key] ?? 0;
    if (add <= 0) continue;
    const max = maxBonusForStat(def, key);
    nextLevels[key] = Math.max(0, Math.min(max, Math.floor(nextLevels[key] ?? 0) + add));
  }
  profile.characterStatLevels = { ...profile.characterStatLevels, [id]: nextLevels };
  saveProfile(profile);
  return { ok: true, profile, total: payment.coinCost };
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

export function saveMakoVariant(variant: MakoVariantId): PlayerProfile {
  const profile = loadProfile();
  if (!profile.unlockedCharacters.includes('mako')) return profile;
  if (!MAKO_VARIANTS.some(item => item.id === variant)) return profile;
  profile.makoVariant = variant;
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

export async function redeemPromoCode(raw: string): Promise<{
  ok: boolean;
  profile: PlayerProfile;
  error?: string;
  coinsGranted?: number;
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

  profile.coins += result.reward.coins;
  markPromoRedeemed(result.reward.id);
  saveProfile(profile);
  return {
    ok: true,
    profile,
    coinsGranted: result.reward.coins,
    rewardLabel: result.reward.label,
  };
}
