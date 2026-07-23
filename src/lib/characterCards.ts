import type { CharacterDef, CharacterId, PlayerProfile } from '../types/profile';

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
  { id: 'common', label: 'Grey' },
  { id: 'rare', label: 'Blue' },
  { id: 'epic', label: 'Purple' },
  { id: 'icon', label: 'Gold' },
];

/** Base overall before per-stat upgrades. */
export function baseTierOvr(character: CharacterDef): number {
  const n = character.baseOvr;
  if (typeof n === 'number' && Number.isFinite(n)) {
    return Math.max(40, Math.min(MAX_STAT_VALUE, Math.round(n)));
  }
  return 64;
}

function clampStat(n: number): number {
  return Math.max(40, Math.min(MAX_STAT_VALUE, Math.round(n)));
}

/** Deterministic base six-stat block so the average matches baseOvr. */
export function characterBaseStats(character: CharacterDef): CharacterCardStats {
  const ovr = baseTierOvr(character);
  const seed = [...character.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  // Offsets sum to 0 so average stays on the listed overall.
  const offsets = [0, 0, 0, 0, 0, 0].map((_, i) => ((seed * (i + 3)) % 9) - 4);
  const offsetSum = offsets.reduce((a, b) => a + b, 0);
  offsets[0]! -= offsetSum;

  const raw: CharacterCardStats = {
    pac: clampStat(ovr + offsets[0]!),
    sho: clampStat(ovr + offsets[1]!),
    pas: clampStat(ovr + offsets[2]!),
    dri: clampStat(ovr + offsets[3]!),
    def: clampStat(ovr + offsets[4]!),
    phy: clampStat(ovr + offsets[5]!),
  };

  // Fix clamp edge cases so rounded average still equals ovr.
  let sum = CARD_STAT_KEYS.reduce((acc, key) => acc + raw[key], 0);
  let avg = Math.round(sum / CARD_STAT_KEYS.length);
  let guard = 0;
  while (avg !== ovr && guard < 36) {
    const dir = ovr > avg ? 1 : -1;
    const key = CARD_STAT_KEYS[(seed + guard) % CARD_STAT_KEYS.length]!;
    const next = raw[key] + dir;
    if (next >= 40 && next <= MAX_STAT_VALUE) {
      raw[key] = next;
      sum += dir;
      avg = Math.round(sum / CARD_STAT_KEYS.length);
    }
    guard += 1;
  }
  return raw;
}

export function maxBonusForStat(character: CharacterDef, stat: CardStatKey): number {
  return Math.max(0, MAX_STAT_VALUE - characterBaseStats(character)[stat]);
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
  maxBonus = 40,
): number {
  const raw = getStatLevels(profile, id)[stat] ?? 0;
  return Math.max(0, Math.min(maxBonus, Math.floor(raw)));
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
    const max = maxBonusForStat(character, key);
    const bonus = getStatLevel(profile, character.id, key, max);
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
    (acc, key) => acc + getStatLevel(profile, id, key, 40),
    0,
  );
  return 1 + total;
}

/** Coin cost to raise a live rating by +1 from its current value. */
export function characterStatUpgradeCost(currentValue: number): number {
  const v = Math.max(40, Math.min(98, Math.floor(currentValue)));
  // Low cards stay cheap to climb; elite ratings pay a steep premium per point.
  // ~285 at 64 · ~780 at 75 · ~1.6k at 85 · ~2.2k at 89 · ~3.4k at 95 · ~4.2k at 98
  const mid = Math.pow(Math.max(0, v - 50), 2) * 1.15;
  const elite = Math.pow(Math.max(0, v - 80), 2) * 4.5;
  return Math.round(60 + mid + elite);
}

export type StatPending = Partial<Record<CardStatKey, number>>;

export function emptyStatPending(): StatPending {
  return {};
}

export function pendingCount(pending: StatPending): number {
  return CARD_STAT_KEYS.reduce((acc, key) => acc + (pending[key] ?? 0), 0);
}

/** Stats after applying queued (unpaid) upgrades on top of saved progress. */
export function characterCardStatsWithPending(
  character: CharacterDef,
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
  pending: StatPending = {},
): CharacterCardStats {
  const base = characterBaseStats(character);
  if (!profile.unlockedCharacters.includes(character.id)) return base;

  const next = { ...base };
  for (const key of CARD_STAT_KEYS) {
    const max = maxBonusForStat(character, key);
    const bonus = getStatLevel(profile, character.id, key, max) + (pending[key] ?? 0);
    next[key] = Math.min(MAX_STAT_VALUE, base[key] + Math.min(max, bonus));
  }
  return next;
}

export function characterOverallWithPending(
  character: CharacterDef,
  profile: Pick<PlayerProfile, 'characterStatLevels' | 'unlockedCharacters'>,
  pending: StatPending = {},
): number {
  return characterOverallFromStats(characterCardStatsWithPending(character, profile, pending));
}

/** Cost of one more +1 on a stat, including already-queued pending levels. */
export function nextStatUpgradeCost(
  profile: PlayerProfile,
  character: CharacterDef,
  stat: CardStatKey,
  pending: StatPending = {},
): { ok: boolean; cost: number; level: number; reason?: string } {
  if (!profile.unlockedCharacters.includes(character.id)) {
    return { ok: false, cost: 0, level: 0, reason: 'Locked' };
  }
  const max = maxBonusForStat(character, stat);
  const saved = getStatLevel(profile, character.id, stat, max);
  const queued = pending[stat] ?? 0;
  const level = saved + queued;
  const preview = characterCardStatsWithPending(character, profile, pending);
  if (preview[stat] >= MAX_STAT_VALUE || level >= max) {
    return { ok: false, cost: 0, level, reason: 'Maxed' };
  }
  return { ok: true, cost: characterStatUpgradeCost(preview[stat]), level };
}

/** Total coin cost for a pending upgrade cart. */
export function pendingUpgradeTotal(
  profile: PlayerProfile,
  character: CharacterDef,
  pending: StatPending,
): { total: number; lines: Array<{ stat: CardStatKey; count: number; cost: number }> } {
  const lines: Array<{ stat: CardStatKey; count: number; cost: number }> = [];
  let total = 0;
  const live = characterCardStats(character, profile);
  for (const stat of CARD_STAT_KEYS) {
    const count = pending[stat] ?? 0;
    if (count <= 0) continue;
    let cost = 0;
    for (let i = 0; i < count; i++) {
      cost += characterStatUpgradeCost(live[stat] + i);
    }
    lines.push({ stat, count, cost });
    total += cost;
  }
  return { total, lines };
}

export function canUpgradeCharacterStat(
  profile: PlayerProfile,
  character: CharacterDef,
  stat: CardStatKey,
  pending: StatPending = {},
): { ok: boolean; cost: number; level: number; nextValue: number; reason?: string } {
  const next = nextStatUpgradeCost(profile, character, stat, pending);
  const preview = characterCardStatsWithPending(character, profile, pending);
  if (!next.ok) {
    return {
      ok: false,
      cost: next.cost,
      level: next.level,
      nextValue: preview[stat],
      reason: next.reason,
    };
  }
  return {
    ok: true,
    cost: next.cost,
    level: next.level,
    nextValue: Math.min(MAX_STAT_VALUE, preview[stat] + 1),
  };
}

/** FIFA-style rarity from live overall. */
export function cardTierLabel(ovr: number): 'Common' | 'Rare' | 'Epic' | 'Icon' {
  if (ovr >= 95) return 'Icon';
  if (ovr >= 84) return 'Epic';
  if (ovr >= 73) return 'Rare';
  return 'Common';
}

export function cardTierColors(ovr: number): { border: string; glow: string; badge: string } {
  // 95–99 gold · 84–94 purple · 73–83 blue · 64–72 grey
  if (ovr >= 95) return { border: '#f0b232', glow: 'rgba(240,178,50,0.4)', badge: '#fbbf24' };
  if (ovr >= 84) return { border: '#a855f7', glow: 'rgba(168,85,247,0.32)', badge: '#c084fc' };
  if (ovr >= 73) return { border: '#38bdf8', glow: 'rgba(56,189,248,0.3)', badge: '#7dd3fc' };
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
