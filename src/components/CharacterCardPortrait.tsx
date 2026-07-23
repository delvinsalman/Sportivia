import type { CharacterDef } from '../types/profile';

interface CharacterCardPortraitProps {
  character: CharacterDef;
  owned?: boolean;
  /** Larger featured preview vs compact collection tile. */
  size?: 'compact' | 'featured';
  className?: string;
}

/** Flat card art (or letter fallback) — no WebGL, no lightbox plate. */
export function CharacterCardPortrait({
  character,
  owned = true,
  size = 'compact',
  className = '',
}: CharacterCardPortraitProps) {
  const featured = size === 'featured';

  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-transparent ${owned ? '' : 'opacity-50 grayscale'} ${className}`}
    >
      {character.cardImage ? (
        <img
          src={character.cardImage}
          alt=""
          draggable={false}
          className={`absolute inset-0 h-full w-full object-contain object-bottom select-none ${
            featured ? 'scale-[1.05]' : 'scale-105'
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
