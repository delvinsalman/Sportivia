import type { CharacterDef } from '../types/profile';

interface CharacterCardPortraitProps {
  character: CharacterDef;
  owned?: boolean;
  /** Larger featured preview vs compact collection tile. */
  size?: 'compact' | 'featured';
  className?: string;
}

/** Flat card art (or letter fallback) — no WebGL. */
export function CharacterCardPortrait({
  character,
  owned = true,
  size = 'compact',
  className = '',
}: CharacterCardPortraitProps) {
  const featured = size === 'featured';

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${owned ? '' : 'opacity-50 grayscale'} ${className}`}
      style={{
        background: `radial-gradient(ellipse 70% 65% at 50% 35%, ${character.accent}40 0%, transparent 68%), linear-gradient(180deg, #1a1c22 0%, #0c0d10 100%)`,
      }}
    >
      {character.cardImage ? (
        <img
          src={character.cardImage}
          alt=""
          draggable={false}
          className={`absolute inset-0 h-full w-full object-contain object-bottom select-none ${
            featured ? 'scale-[1.05] p-1' : 'p-0.5'
          }`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`font-black tracking-tight ${featured ? 'text-6xl' : 'text-2xl'}`}
            style={{ color: character.accent, textShadow: '0 2px 0 rgba(0,0,0,0.45)' }}
          >
            {character.name.slice(0, 1)}
          </span>
        </div>
      )}
    </div>
  );
}
