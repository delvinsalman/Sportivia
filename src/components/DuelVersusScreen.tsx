import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Sport } from '../types';
import type { PlayerProfile } from '../types/profile';
import type { DuelMatchStart } from '../lib/duelTypes';
import { duelCharacterDef, duelDisplayProfile } from '../lib/duelCard';
import { CharacterFutCard } from './CharacterFutCard';
import { SportBackground } from './SportBackground';
import { SPORT_ACCENT } from '../lib/sportTheme';
import { PAGE_SPRING } from '../lib/pageTransitions';
import { formatCoins } from '../lib/coinStake';
import { CoinIcon } from './CoinIcon';
import { getSettings } from '../lib/settings';

interface DuelVersusScreenProps {
  sport: Sport;
  profile: PlayerProfile;
  match: DuelMatchStart;
  youId: string;
  onComplete: () => void;
}

const SHOW_MS = 3_400;

export function DuelVersusScreen({
  sport,
  profile,
  match,
  youId,
  onComplete,
}: DuelVersusScreenProps) {
  const accent = SPORT_ACCENT[sport];
  const reduceMotion = getSettings().reduceMotion;

  const { you, opponent } = useMemo(() => {
    const youPlayer =
      match.players.find(p => p.id === youId) ?? match.players[0];
    const oppPlayer =
      match.players.find(p => p.id !== youPlayer?.id) ?? match.players[1];
    return { you: youPlayer, opponent: oppPlayer };
  }, [match.players, youId]);

  useEffect(() => {
    const t = setTimeout(onComplete, SHOW_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (!you || !opponent) {
    return null;
  }

  const youProfile = duelDisplayProfile(you, profile, true);
  const oppProfile = duelDisplayProfile(opponent, profile, false);
  const youDef = duelCharacterDef(you);
  const oppDef = duelCharacterDef(opponent);
  const youStake = you.wagerCoins ?? 0;
  const oppStake = opponent.wagerCoins ?? 0;

  const slide = reduceMotion ? 0 : 36;
  const spring = reduceMotion
    ? { duration: 0.2 }
    : { ...PAGE_SPRING, delay: 0.05 };

  return (
    <div className="relative h-svh overflow-hidden touch-manipulation">
      <SportBackground sport={sport} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 42%, ${accent}33 0%, transparent 70%)`,
        }}
      />

      <button
        type="button"
        onClick={onComplete}
        className="relative z-10 flex h-svh w-full flex-col items-center justify-center px-2.5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] sm:px-4"
        aria-label="Continue to match"
      >
        <motion.p
          initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-white/55 sm:mb-5 sm:text-[11px]"
        >
          Matchup
        </motion.p>

        <div className="grid w-full max-w-3xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -slide }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="flex min-w-0 flex-col items-center"
          >
            <p className="mb-1.5 max-w-full truncate px-0.5 text-center text-[11px] font-black text-[#f2f3f5] sm:mb-2 sm:text-sm">
              {you.name}
              <span className="text-white/40"> · you</span>
            </p>
            <div className="pointer-events-none w-full max-w-[9.25rem] sm:max-w-[13.5rem]">
              <CharacterFutCard
                character={youDef}
                profile={youProfile}
                selected
                compact
                accent={accent}
                onSelect={() => {}}
              />
            </div>
            {youStake > 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-black text-[#f0b232] sm:mt-2">
                <CoinIcon size={12} />
                {formatCoins(youStake)}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduceMotion ? { duration: 0.2 } : { ...PAGE_SPRING, delay: 0.12 }}
            className="relative flex shrink-0 flex-col items-center justify-center px-0.5 sm:px-1"
          >
            <div
              className="absolute h-12 w-12 rounded-full blur-2xl sm:h-20 sm:w-20"
              style={{ background: accent }}
            />
            <p
              className="relative text-2xl font-black italic tracking-tight text-white sm:text-5xl"
              style={{
                textShadow: `0 3px 0 rgba(0,0,0,0.55), 0 0 28px ${accent}aa`,
              }}
            >
              VS
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: slide }}
            animate={{ opacity: 1, x: 0 }}
            transition={spring}
            className="flex min-w-0 flex-col items-center"
          >
            <p className="mb-1.5 max-w-full truncate px-0.5 text-center text-[11px] font-black text-[#f2f3f5] sm:mb-2 sm:text-sm">
              {opponent.name}
            </p>
            <div className="pointer-events-none w-full max-w-[9.25rem] sm:max-w-[13.5rem]">
              <CharacterFutCard
                character={oppDef}
                profile={oppProfile}
                compact
                onSelect={() => {}}
              />
            </div>
            {oppStake > 0 && (
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-black text-[#f0b232] sm:mt-2">
                <CoinIcon size={12} />
                {formatCoins(oppStake)}
              </p>
            )}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.45 }}
          className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40 sm:mt-6"
        >
          Tap to continue
        </motion.p>
      </button>
    </div>
  );
}
