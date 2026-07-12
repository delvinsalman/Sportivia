import type { GameResult, Sport } from '../types';
import type { CharacterId, PetId, PlayerProfile } from '../types/profile';
import {
  CHARACTERS,
  DEFAULT_CHARACTER,
  DEFAULT_PET,
  DEFAULT_PLAYER_NAME,
  PETS,
  STARTER_CHARACTERS,
  STARTER_PETS,
} from '../types/profile';
import { applyRewards, computeGameRewards, levelFromXp } from './progression';
import { loadStats, saveStats, recordGameResult } from './storage';

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
    equippedPet: DEFAULT_PET,
    unlockedPets: [...STARTER_PETS],
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

    const unlockedPets = normalizeUnlockedPets(parsed.unlockedPets);
    let safePet: PetId | null;
    if (parsed.equippedPet === null) {
      safePet = null;
    } else {
      const equippedPet = migratePetId(parsed.equippedPet) ?? DEFAULT_PET;
      safePet = unlockedPets.includes(equippedPet) ? equippedPet : DEFAULT_PET;
    }

    const profile: PlayerProfile = {
      ...base,
      playerName: parsed.playerName?.trim() || DEFAULT_PLAYER_NAME,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      xp: parsed.xp ?? 0,
      level: levelFromXp(parsed.xp ?? 0),
      equippedCharacter: safeEquipped,
      unlockedCharacters: unlocked,
      equippedPet: safePet,
      unlockedPets,
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

    if (equippedMigrated || unlockedChanged || petsChanged) {
      saveProfile(profile);
    }

    return profile;
  } catch {
    return migrateLegacy();
  }
}

export function saveProfile(profile: PlayerProfile): void {
  const next = { ...profile, level: levelFromXp(profile.xp) };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  saveStats(next.stats);
}

export function recordGameWithRewards(
  sport: Sport,
  result: GameResult,
): {
  profile: PlayerProfile;
  rewards: ReturnType<typeof computeGameRewards> | null;
} {
  if (!result.completed || result.mode === 'training') {
    return { profile: loadProfile(), rewards: null };
  }

  const profileWithStats = loadProfile();
  profileWithStats.stats = recordGameResult(sport, result);

  const baseRewards = computeGameRewards(result);
  const applied = applyRewards(profileWithStats.coins, profileWithStats.xp, baseRewards);
  profileWithStats.coins = applied.coins;
  profileWithStats.xp = applied.xp;
  profileWithStats.level = applied.rewards.newLevel;

  saveProfile(profileWithStats);
  return { profile: profileWithStats, rewards: applied.rewards };
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
