import type { GameResult, Sport } from '../types';
import type { CharacterId, DogVariantId, PetId, PlayerProfile, RabbitVariantId } from '../types/profile';
import {
  CHARACTERS,
  DEFAULT_ATHLETE_LOADOUT,
  DEFAULT_BOB_LOADOUT,
  DEFAULT_CHARACTER,
  DEFAULT_CREATIVE_LOADOUT,
  DEFAULT_DOG_VARIANT,
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
import { pickRandomPlayerName } from './playerNames';
import { canUpgradeCharacter } from './characterCards';

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
    dogVariant: DEFAULT_DOG_VARIANT,
    characterLevels: {},
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

    const characterLevels: Partial<Record<CharacterId, number>> = {};
    if (parsed.characterLevels && typeof parsed.characterLevels === 'object') {
      for (const [key, value] of Object.entries(parsed.characterLevels)) {
        const id = migrateCharacterId(key);
        if (!id || typeof value !== 'number') continue;
        characterLevels[id] = Math.max(1, Math.min(15, Math.floor(value)));
      }
    }
    for (const id of unlocked) {
      if (characterLevels[id] == null) characterLevels[id] = 1;
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
      dogVariant,
      characterLevels,
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
    const dogChanged = parsed.dogVariant !== dogVariant;
    const hadLegacyCards = 'cardCollection' in parsed;

    if (
      equippedMigrated ||
      unlockedChanged ||
      petsChanged ||
      rabbitChanged ||
      dogChanged ||
      hadLegacyCards
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
  profile.characterLevels = { ...profile.characterLevels, [id]: 1 };
  profile.equippedCharacter = id;
  saveProfile(profile);
  return { ok: true, profile };
}

export function upgradeCharacter(id: CharacterId): { ok: boolean; profile: PlayerProfile; error?: string } {
  const profile = loadProfile();
  const check = canUpgradeCharacter(profile, id);
  if (!check.ok) {
    return { ok: false, profile, error: check.reason ?? 'Cannot upgrade' };
  }
  profile.coins -= check.cost;
  profile.characterLevels = { ...profile.characterLevels, [id]: check.level + 1 };
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
