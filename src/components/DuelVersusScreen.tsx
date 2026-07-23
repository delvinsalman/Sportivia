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

  return (
    <div className="relative h-svh overflow-hidden">
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
        className="relative z-10 flex h-svh w-full flex-col items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
        aria-label="Continue to match"
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={PAGE_SPRING}
          className="mb-4 text-[11px] font-black uppercase tracking-[0.28em] text-white/55 sm:mb-6"
        >
          Matchup
        </motion.p>

        <div className="grid w-full max-w-3xl grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          <motion.div
            initial={{ opacity: 0, x: -48, rotate: -4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ ...PAGE_SPRING, delay: 0.05 }}
            className="flex min-w-0 flex-col items-center"
          >
            <p className="mb-2 max-w-full truncate text-center text-xs font-black text-[#f2f3f5] sm:text-sm">
              {you.name}
              <span className="text-white/40"> · you</span>
            </p>
            <div className="w-full max-w-[11.5rem] pointer-events-none sm:max-w-[13.5rem]">
              <CharacterFutCard
                character={youDef}
                profile={youProfile}
                selected
                accent={accent}
                onSelect={() => {}}
              />
            </div>
            {youStake > 0 && (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-black text-[#f0b232]">
                <CoinIcon size={12} />
                {formatCoins(youStake)}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...PAGE_SPRING, delay: 0.18 }}
            className="relative flex flex-col items-center justify-center px-1"
          >
            <div
              className="absolute h-16 w-16 rounded-full blur-2xl sm:h-20 sm:w-20"
              style={{ background: accent }}
            />
            <p
              className="relative text-3xl font-black italic tracking-tight text-white sm:text-5xl"
              style={{
                textShadow: `0 3px 0 rgba(0,0,0,0.55), 0 0 28px ${accent}aa`,
              }}
            >
              VS
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 48, rotate: 4 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ ...PAGE_SPRING, delay: 0.05 }}
            className="flex min-w-0 flex-col items-center"
          >
            <p className="mb-2 max-w-full truncate text-center text-xs font-black text-[#f2f3f5] sm:text-sm">
              {opponent.name}
            </p>
            <div className="w-full max-w-[11.5rem] pointer-events-none sm:max-w-[13.5rem]">
              <CharacterFutCard
                character={oppDef}
                profile={oppProfile}
                onSelect={() => {}}
              />
            </div>
            {oppStake > 0 && (
              <p className="mt-2 flex items-center gap-1 text-[10px] font-black text-[#f0b232]">
                <CoinIcon size={12} />
                {formatCoins(oppStake)}
              </p>
            )}
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40"
        >
          Tap to continue
        </motion.p>
      </button>
    </div>
  );
}
