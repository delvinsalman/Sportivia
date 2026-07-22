import type { CharacterDef, CharacterId, PlayerProfile } from '../types/profile';

export const MAX_STAT_LEVEL = 15;
export const MAX_STAT_VALUE = 99;

export type CardStatKey = 'pac' | 'sho' | 'pas' | 'dri' | 'def' | 'phy';

export interface CharacterCardStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

export const CARD_STAT_KEYS: CardStatKey[] = ['pac', 'sho', 'pas', 'dri', 'def', 'phy'];

export const CARD_STAT_LABELS: Record<CardStatKey, string> = {
  pac: 'PAC',
  sho: 'SHO',
  pas: 'PAS',
  dri: 'DRI',
  def: 'DEF',
  phy: 'PHY',
};

export type CharacterStatLevels = Partial<Record<CardStatKey, number>>;

export type CardCategoryFilter = 'all' | 'owned' | 'locked' | 'common' | 'rare' | 'epic' | 'icon';

export const CARD_CATEGORY_OPTIONS: Array<{ id: CardCategoryFilter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'owned', label: 'Owned' },
  { id: 'locked', label: 'Locked' },
  { id: 'common', label: 'Common' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'icon', label: 'Icon' },
];

/** Base overall before per-stat upgrades (unlock tier). */
export function baseTierOvr(character: CharacterDef): number {
  if (character.price <= 0) return 64;
  if (character.price < 400) return 68;
  if (character.price < 900) return 72;
  if (character.price < 2000) return 78;
  if (character.price < 5000) return 84;
  return 88;
}

function clampStat(n: number): number {
  return Math.max(40, Math.min(MAX_STAT_VALUE, Math.round(n)));
}

/** Deterministic base six-stat block for a skin (before upgrades). */
export function characterBaseStats(character: CharacterDef): CharacterCardStats {
  const ovr = baseTierOvr(character);
  const seed = [...character.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const wobble = (i: number) => ((seed * (i + 3)) % 11) - 5;

  return {
    pac: clampStat(ovr + wobble(1)),
    sho: clampStat(ovr + wobble(2) - 2),
    pas: clampStat(ovr + wobble(3)),
    dri: clampStat(ovr + wobble(4) + 1),
    def: clampStat(ovr + wobble(5) - 3),
    phy: clampStat(ovr + wobble(6)),
  };
}

export function getStatLevels(
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
  id: CharacterId,
): CharacterStatLevels {
  if (!profile.unlockedCharacters.includes(id)) return {};
  return profile.characterStatLevels?.[id] ?? {};
}

export function getStatLevel(
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
  id: CharacterId,
  stat: CardStatKey,
): number {
  const raw = getStatLevels(profile, id)[stat] ?? 0;
  return Math.max(0, Math.min(MAX_STAT_LEVEL, Math.floor(raw)));
}

/** Live six-stat block including per-stat upgrades. */
export function characterCardStats(
  character: CharacterDef,
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
): CharacterCardStats {
  const base = characterBaseStats(character);
  if (!profile.unlockedCharacters.includes(character.id)) return base;

  const next = { ...base };
  for (const key of CARD_STAT_KEYS) {
    const bonus = getStatLevel(profile, character.id, key);
    next[key] = Math.min(MAX_STAT_VALUE, base[key] + bonus);
  }
  return next;
}

/** Overall = rounded average of the six live stats. */
export function characterOverallFromStats(stats: CharacterCardStats): number {
  const sum = CARD_STAT_KEYS.reduce((acc, key) => acc + stats[key], 0);
  return Math.max(1, Math.min(MAX_STAT_VALUE, Math.round(sum / CARD_STAT_KEYS.length)));
}

export function characterOverall(
  character: CharacterDef,
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
): number {
  return characterOverallFromStats(characterCardStats(character, profile));
}

/** Display level from total per-stat upgrades (1 when unlocked with no upgrades). */
export function getCharacterLevel(
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
  id: CharacterId,
): number {
  if (!profile.unlockedCharacters.includes(id)) return 0;
  const total = CARD_STAT_KEYS.reduce(
    (acc, key) => acc + getStatLevel(profile, id, key),
    0,
  );
  return 1 + total;
}

/** Coin cost to raise one stat by +1. */
export function characterStatUpgradeCost(statLevel: number): number {
  const from = Math.max(0, Math.min(MAX_STAT_LEVEL - 1, statLevel));
  return Math.round(55 + from * 28 + from * from * 4);
}

export function canUpgradeCharacterStat(
  profile: PlayerProfile,
  character: CharacterDef,
  stat: CardStatKey,
): { ok: boolean; cost: number; level: number; nextValue: number; reason?: string } {
  if (!profile.unlockedCharacters.includes(character.id)) {
    return { ok: false, cost: 0, level: 0, nextValue: 0, reason: 'Locked' };
  }
  const level = getStatLevel(profile, character.id, stat);
  const live = characterCardStats(character, profile);
  if (live[stat] >= MAX_STAT_VALUE || level >= MAX_STAT_LEVEL) {
    return { ok: false, cost: 0, level, nextValue: live[stat], reason: 'Maxed' };
  }
  const cost = characterStatUpgradeCost(level);
  if (profile.coins < cost) {
    return { ok: false, cost, level, nextValue: live[stat] + 1, reason: 'Need more coins' };
  }
  return { ok: true, cost, level, nextValue: live[stat] + 1 };
}

export function cardTierLabel(ovr: number): 'Common' | 'Rare' | 'Epic' | 'Icon' {
  if (ovr >= 90) return 'Icon';
  if (ovr >= 82) return 'Epic';
  if (ovr >= 74) return 'Rare';
  return 'Common';
}

export function cardTierColors(ovr: number): { border: string; glow: string; badge: string } {
  if (ovr >= 90) return { border: '#f0b232', glow: 'rgba(240,178,50,0.35)', badge: '#fbbf24' };
  if (ovr >= 82) return { border: '#a855f7', glow: 'rgba(168,85,247,0.3)', badge: '#c084fc' };
  if (ovr >= 74) return { border: '#38bdf8', glow: 'rgba(56,189,248,0.28)', badge: '#7dd3fc' };
  return { border: '#94a3b8', glow: 'rgba(148,163,184,0.22)', badge: '#cbd5e1' };
}

export function matchesCardCategory(
  character: CharacterDef,
  profile: PlayerProfile,
  category: CardCategoryFilter,
): boolean {
  const owned = profile.unlockedCharacters.includes(character.id);
  if (category === 'all') return true;
  if (category === 'owned') return owned;
  if (category === 'locked') return !owned;
  const ovr = characterOverall(character, profile);
  const tier = cardTierLabel(ovr).toLowerCase() as 'common' | 'rare' | 'epic' | 'icon';
  return tier === category;
}
