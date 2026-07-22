import type { CharacterDef, CharacterId, PlayerProfile } from '../types/profile';

export const MAX_CHARACTER_LEVEL = 15;

export interface CharacterCardStats {
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
}

/** Six-stat block for a skin card (pace / shoot / pass / dribble / defend / physical). */
export function baseTierOvr(character: CharacterDef): number {
  if (character.price <= 0) return 64;
  if (character.price < 400) return 68;
  if (character.price < 900) return 72;
  if (character.price < 2000) return 78;
  if (character.price < 5000) return 84;
  return 88;
}

export function getCharacterLevel(
  profile: Pick<PlayerProfile, 'characterLevels' | 'unlockedCharacters'>,
  id: CharacterId,
): number {
  const owned = profile.unlockedCharacters.includes(id);
  if (!owned) return 0;
  const lvl = profile.characterLevels?.[id] ?? 1;
  return Math.max(1, Math.min(MAX_CHARACTER_LEVEL, Math.floor(lvl)));
}

export function characterOverall(character: CharacterDef, level: number): number {
  if (level <= 0) return baseTierOvr(character);
  const capped = Math.min(MAX_CHARACTER_LEVEL, level);
  return Math.min(99, baseTierOvr(character) + (capped - 1) * 2);
}

/** Deterministic stat spread around OVR so each skin feels distinct. */
export function characterCardStats(character: CharacterDef, level: number): CharacterCardStats {
  const ovr = characterOverall(character, Math.max(1, level));
  const seed = [...character.id].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const wobble = (i: number) => ((seed * (i + 3)) % 11) - 5;
  const clamp = (n: number) => Math.max(40, Math.min(99, Math.round(n)));

  return {
    pac: clamp(ovr + wobble(1)),
    sho: clamp(ovr + wobble(2) - 2),
    pas: clamp(ovr + wobble(3)),
    dri: clamp(ovr + wobble(4) + 1),
    def: clamp(ovr + wobble(5) - 3),
    phy: clamp(ovr + wobble(6)),
  };
}

/** Coin cost to go from `level` → `level + 1`. */
export function characterUpgradeCost(level: number): number {
  const from = Math.max(1, Math.min(MAX_CHARACTER_LEVEL - 1, level));
  return Math.round(80 * from * (1 + from * 0.35));
}

export function canUpgradeCharacter(
  profile: PlayerProfile,
  id: CharacterId,
): { ok: boolean; cost: number; level: number; reason?: string } {
  const level = getCharacterLevel(profile, id);
  if (level <= 0) return { ok: false, cost: 0, level, reason: 'Locked' };
  if (level >= MAX_CHARACTER_LEVEL) return { ok: false, cost: 0, level, reason: 'Maxed' };
  const cost = characterUpgradeCost(level);
  if (profile.coins < cost) return { ok: false, cost, level, reason: 'Need more coins' };
  return { ok: true, cost, level };
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
