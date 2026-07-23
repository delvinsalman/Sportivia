import { Lock } from 'lucide-react';
import type { CharacterDef, CharacterId, PlayerProfile } from '../types/profile';
import { CharacterCardPortrait } from './CharacterCardPortrait';
import {
  CARD_STAT_KEYS,
  CARD_STAT_LABELS,
  cardTierColors,
  cardTierLabel,
  characterCardStats,
  characterOverall,
  getCharacterLevel,
} from '../lib/characterCards';

interface CharacterFutCardProps {
  character: CharacterDef;
  profile: PlayerProfile;
  selected?: boolean;
  /** Tighter layout for the collection grid (one-page Cards screen). */
  compact?: boolean;
  accent?: string;
  onSelect: (id: CharacterId) => void;
}

export function CharacterFutCard({
  character,
  profile,
  selected = false,
  compact = false,
  accent,
  onSelect,
}: CharacterFutCardProps) {
  const owned = profile.unlockedCharacters.includes(character.id);
  const level = getCharacterLevel(profile, character.id);
  const stats = characterCardStats(character, profile);
  const ovr = characterOverall(character, profile);
  const tier = cardTierColors(ovr);
  const ring = accent ?? character.accent;
  const label = owned ? cardTierLabel(ovr) : 'Locked';

  return (
    <button
      type="button"
      onClick={() => onSelect(character.id)}
      className="relative w-full text-left transition-[filter,box-shadow] duration-150 hover:brightness-110"
      aria-pressed={selected}
      aria-label={`${character.name}${owned ? '' : ' locked'}`}
    >
      <div
        className={`relative overflow-hidden border-[3px] shadow-[0_4px_0_rgba(0,0,0,0.45)] ${
          compact ? 'rounded-xl' : 'rounded-2xl'
        }`}
        style={{
          borderColor: selected ? ring : tier.border,
          background: `linear-gradient(165deg, ${tier.glow} 0%, #12141a 42%, #0c0d10 100%)`,
          boxShadow: selected
            ? `0 4px 0 rgba(0,0,0,0.45), 0 0 0 2px ${ring}aa, 0 0 16px ${ring}55`
            : `0 4px 0 rgba(0,0,0,0.45), 0 0 14px ${tier.glow}`,
        }}
      >
        <div className={`relative ${compact ? 'px-2 pt-2 pb-1.5' : 'px-2.5 pt-2.5 pb-2'}`}>
          <div className="flex items-start justify-between gap-1">
            <div className="flex flex-col leading-none">
              <span
                className={`font-black text-[#f8fafc] font-mono tracking-tight ${
                  compact ? 'text-xl' : 'text-[1.65rem]'
                }`}
              >
                {owned ? ovr : '—'}
              </span>
              <span className="mt-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-white/55">
                SKN{owned ? ` · Lv ${level}` : ''}
              </span>
            </div>
            <div
              className="rounded-md px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider text-[#0c0d10]"
              style={{ background: tier.badge }}
            >
              {label}
            </div>
          </div>

          <div
            className={`relative mx-auto mt-1 w-full overflow-hidden rounded-lg ${
              compact ? 'h-[4.25rem]' : 'h-[7.5rem] rounded-xl'
            }`}
          >
            <CharacterCardPortrait character={character} owned={owned} size="compact" />
            {!owned && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <div
                  className={`flex items-center justify-center rounded-full border-2 border-white/25 bg-black/55 ${
                    compact ? 'h-7 w-7' : 'h-10 w-10'
                  }`}
                >
                  <Lock className={compact ? 'h-3 w-3 text-white/80' : 'h-4 w-4 text-white/80'} />
                </div>
              </div>
            )}
          </div>

          <p
            className={`mt-1 truncate text-center font-black uppercase tracking-wide text-[#f2f3f5] ${
              compact ? 'text-[10px]' : 'text-[11px]'
            }`}
          >
            {character.name}
          </p>

          <div className={`mt-1 grid grid-cols-2 gap-x-2 ${compact ? 'gap-y-0 px-0.5' : 'gap-y-0.5 px-0.5'}`}>
            {CARD_STAT_KEYS.map(key => (
              <div key={key} className="flex items-baseline justify-between gap-1">
                <span className="text-[7px] font-bold uppercase tracking-wider text-white/45">
                  {CARD_STAT_LABELS[key]}
                </span>
                <span
                  className={`font-mono font-black text-[#f2f3f5] ${compact ? 'text-[10px]' : 'text-[11px]'}`}
                >
                  {owned ? stats[key] : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
