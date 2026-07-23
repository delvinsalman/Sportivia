import type { CharacterId, PlayerProfile, PvpRecord } from '../types/profile';
import {
  CHARACTERS,
  DEFAULT_CHARACTER,
  EMPTY_PVP_RECORD,
  getCharacterDef,
} from '../types/profile';
import type { CharacterStatLevels, CardStatKey } from './characterCards';
import { CARD_STAT_KEYS } from './characterCards';
import type { DuelPlayerInfo } from './duelTypes';

export function sanitizeCardLevels(raw: unknown): CharacterStatLevels {
  if (!raw || typeof raw !== 'object') return {};
  const out: CharacterStatLevels = {};
  const src = raw as Record<string, unknown>;
  for (const key of CARD_STAT_KEYS) {
    const n = Number(src[key]);
    if (!Number.isFinite(n) || n <= 0) continue;
    out[key as CardStatKey] = Math.max(0, Math.min(99, Math.floor(n)));
  }
  return out;
}

export function sanitizePvpRecord(raw: unknown): PvpRecord {
  if (!raw || typeof raw !== 'object') return { ...EMPTY_PVP_RECORD };
  const src = raw as Record<string, unknown>;
  const clamp = (n: unknown) =>
    typeof n === 'number' && Number.isFinite(n) ? Math.max(0, Math.min(99999, Math.floor(n))) : 0;
  return {
    wins: clamp(src.wins),
    losses: clamp(src.losses),
    ties: clamp(src.ties),
  };
}

export function cardLevelsForCharacter(
  profile: PlayerProfile,
  characterId: CharacterId,
): CharacterStatLevels {
  return sanitizeCardLevels(profile.characterStatLevels[characterId] ?? {});
}

export function resolveDuelCharacterId(id: string | undefined): CharacterId {
  if (id && CHARACTERS.some(c => c.id === id)) return id as CharacterId;
  return DEFAULT_CHARACTER;
}

/** Minimal profile so CharacterFutCard can render live OVR / upgrades for a duelist. */
export function duelDisplayProfile(
  player: DuelPlayerInfo,
  you: PlayerProfile,
  isYou: boolean,
): PlayerProfile {
  if (isYou) return you;
  const characterId = resolveDuelCharacterId(player.characterId);
  return {
    ...you,
    playerName: player.name,
    equippedCharacter: characterId,
    unlockedCharacters: [characterId],
    characterStatLevels: {
      [characterId]: sanitizeCardLevels(player.cardLevels),
    },
    pvpRecord: sanitizePvpRecord(player.pvpRecord),
  };
}

export function duelCharacterDef(player: DuelPlayerInfo) {
  return getCharacterDef(resolveDuelCharacterId(player.characterId));
}
