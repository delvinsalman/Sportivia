import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { CharacterPodium } from './3d/CharacterPodium';
import {
  getCharacterDef,
  getPetDef,
  type CharacterId,
  type PetId,
  type RabbitVariantId,
  type MakoVariantId,
  type DogVariantId,
} from '../types/profile';
import type { CreativeLoadout } from '../types/creativeCharacter';
import type { AthleteLoadout } from '../types/athleteCharacter';
import type { BobLoadout } from '../types/bobCharacter';
import type { Sport } from '../types';
import { playMenuClick } from '../lib/menuAudio';

export type UnlockReveal =
  | { kind: 'character'; id: CharacterId }
  | { kind: 'pet'; id: PetId };

interface UnlockShowcaseProps {
  reveal: UnlockReveal;
  sport: Sport;
  creativeLoadout?: CreativeLoadout;
  athleteLoadout?: AthleteLoadout;
  bobLoadout?: BobLoadout;
  rabbitVariant?: RabbitVariantId;
  makoVariant?: MakoVariantId;
  dogVariant?: DogVariantId;
  onDone: () => void;
  /** Auto-close after this many ms. */
  durationMs?: number;
}

const SPARKS = [
  { top: '12%', left: '18%', delay: 0.1, size: 6 },
  { top: '22%', left: '78%', delay: 0.35, size: 8 },
  { top: '68%', left: '14%', delay: 0.55, size: 5 },
  { top: '74%', left: '82%', delay: 0.2, size: 7 },
  { top: '40%', left: '8%', delay: 0.7, size: 5 },
  { top: '48%', left: '90%', delay: 0.45, size: 6 },
] as const;

export function UnlockShowcase({
  reveal,
  sport,
  creativeLoadout,
  athleteLoadout,
  bobLoadout,
  rabbitVariant,
  makoVariant,
  dogVariant,
  onDone,
  durationMs = 4200,
}: UnlockShowcaseProps) {
  const isPet = reveal.kind === 'pet';
  const def = isPet ? getPetDef(reveal.id) : getCharacterDef(reveal.id);
  const accent = def.accent;
  const characterId = !isPet ? reveal.id : undefined;
  const petId = isPet ? reveal.id : undefined;

  useEffect(() => {
    const t = window.setTimeout(onDone, durationMs);
    return () => window.clearTimeout(t);
  }, [onDone, durationMs, reveal.kind, reveal.id]);

  function dismiss() {
    playMenuClick();
    onDone();
  }

  return (
    <motion.div
      role="dialog"
      aria-label={`${def.name} unlocked`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[90] overflow-hidden bg-[#050506]"
      onClick={dismiss}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 55% 48% at 50% 48%, ${accent}38 0%, transparent 62%),
            radial-gradient(ellipse 80% 60% at 50% 100%, ${accent}14 0%, transparent 55%)
          `,
        }}
      />

      {SPARKS.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="pointer-events-none absolute rounded-full"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: accent,
            boxShadow: `0 0 12px ${accent}`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.4, 1, 0], scale: [0, 1.4, 0.8, 1.2, 0] }}
          transition={{ duration: 2.4, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Title — top */}
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 340, damping: 22, delay: 0.08 }}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center gap-2 pt-[max(1.25rem,calc(env(safe-area-inset-top)+0.75rem))]"
      >
        <span
          className="inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#ffe08a] shadow-[0_3px_0_#8a6814]"
          style={{
            borderColor: 'rgba(240,178,50,0.85)',
            background: 'linear-gradient(180deg, #2a2414 0%, #14110a 100%)',
          }}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          Unlocked
        </span>
        <h2
          className="max-w-[90vw] text-center text-3xl font-black tracking-tight text-[#f2f3f5] sm:text-5xl"
          style={{ textShadow: `0 4px 0 rgba(0,0,0,0.4), 0 0 36px ${accent}55` }}
        >
          {def.name}
        </h2>
        <p className="max-w-sm px-4 text-center text-sm font-semibold text-[#b5bac1] sm:text-base">
          {def.tagline}
        </p>
      </motion.div>

      {/* Character — true viewport center */}
      <motion.div
        initial={{ opacity: 0, scale: 0.78, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.12 }}
        className="absolute left-1/2 top-1/2 z-10 w-[min(92vw,420px)] -translate-x-[34%] -translate-y-1/2"
        onClick={(e) => e.stopPropagation()}
      >
        {isPet ? (
          <CharacterPodium
            petId={petId}
            accent={accent}
            bare
            hero
            height={400}
            className="w-full pointer-events-none"
            sport={sport}
            {...(petId === 'dog' && dogVariant ? { dogVariant } : {})}
          />
        ) : (
          <CharacterPodium
            characterId={characterId}
            accent={accent}
            bare
            hero
            height={420}
            className="w-full pointer-events-none"
            sport={sport}
            {...(characterId === 'creative' && creativeLoadout
              ? { creativeLoadout }
              : {})}
            {...(characterId === 'athlete' && athleteLoadout
              ? { athleteLoadout }
              : {})}
            {...(characterId === 'bob' && bobLoadout ? { bobLoadout } : {})}
            {...(characterId === 'bunny' && rabbitVariant
              ? { rabbitVariant }
              : {})}
            {...(characterId === 'mako' && makoVariant ? { makoVariant } : {})}
          />
        )}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.75 }}
        transition={{ delay: 1.1 }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-[#7a7f88]"
      >
        Tap to continue
      </motion.p>
    </motion.div>
  );
}
