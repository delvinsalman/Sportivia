import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Search, WifiOff } from 'lucide-react';
import type { Sport } from '../types';
import type { DuelConnectionStatus } from '../hooks/useDuel';
import { SPORT_ACCENT, SPORT_LABEL } from '../lib/sportTheme';
import { SportBackground } from './SportBackground';
import { SportBall } from './SportBall';
import { playMenuBack, playMenuConfirm } from '../lib/menuAudio';

interface RandomMatchmakingScreenProps {
  sport: Sport;
  playerName: string;
  status: DuelConnectionStatus;
  searching: boolean;
  error: string | null;
  onRetry: () => void;
  onCancel: () => void;
}

const RINGS = [
  { size: 1, delay: 0 },
  { size: 0.78, delay: 0.45 },
  { size: 0.56, delay: 0.9 },
];

export function RandomMatchmakingScreen({
  sport,
  playerName,
  status,
  searching,
  error,
  onRetry,
  onCancel,
}: RandomMatchmakingScreenProps) {
  const [elapsed, setElapsed] = useState(0);
  const accent = SPORT_ACCENT[sport];
  const failed = !!error && status !== 'connecting';

  useEffect(() => {
    if (!searching && status !== 'connecting') return;
    setElapsed(0);
    const started = Date.now();
    const timer = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [searching, status]);

  function cancel() {
    playMenuBack();
    onCancel();
  }

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 44%, ${accent}26 0%, transparent 55%), linear-gradient(180deg, rgba(6,7,9,0.72) 0%, rgba(6,7,9,0.52) 45%, rgba(6,7,9,0.88) 100%)`,
        }}
      />

      <button
        type="button"
        onClick={cancel}
        className="fixed left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 flex min-h-11 items-center gap-2 rounded-full border-[2.5px] border-white/15 bg-black/40 px-3.5 py-2 text-xs font-black uppercase tracking-wide text-[#b5bac1] backdrop-blur-sm transition hover:border-white/30 hover:text-white sm:left-5"
      >
        <ArrowLeft className="h-4 w-4" />
        Cancel
      </button>

      <main className="relative z-10 flex h-svh flex-col items-center justify-center px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(4.5rem,calc(env(safe-area-inset-top)+4rem))] text-center">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 backdrop-blur-sm"
        >
          <SportBall sport={sport} size={16} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
            {SPORT_LABEL[sport]} · Public matchmaking
          </span>
        </motion.div>

        {failed ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <div className="mt-12 flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#ed4245]/50 bg-[#ed4245]/10 sm:h-32 sm:w-32">
              <WifiOff className="h-12 w-12 text-[#f98998]" />
            </div>
            <h1 className="mt-9 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Search interrupted
            </h1>
            <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-white/55 sm:text-base">
              {error}
            </p>
            <button
              type="button"
              onClick={() => {
                playMenuConfirm();
                onRetry();
              }}
              className="mt-9 inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-[3px] border-white/20 bg-[#5865f2] px-7 py-3 text-sm font-black text-white shadow-[0_5px_0_#2f3aa8] transition hover:translate-y-[1px] hover:shadow-[0_4px_0_#2f3aa8]"
            >
              <RefreshCw className="h-4 w-4" />
              Search again
            </button>
          </motion.div>
        ) : (
          <>
            <div className="relative mt-10 flex h-44 w-44 items-center justify-center sm:mt-14 sm:h-56 sm:w-56">
              {RINGS.map(ring => (
                <motion.span
                  key={ring.size}
                  className="absolute rounded-full border"
                  style={{
                    width: `${ring.size * 100}%`,
                    height: `${ring.size * 100}%`,
                    borderColor: `${accent}55`,
                  }}
                  animate={{ scale: [0.92, 1.12], opacity: [0.55, 0] }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'easeOut',
                    delay: ring.delay,
                  }}
                />
              ))}
              <motion.span
                className="absolute h-[42%] w-[42%] rounded-full blur-2xl"
                style={{ background: accent }}
                animate={{ opacity: [0.18, 0.42, 0.18] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="relative"
                animate={{
                  x: [0, 7, 10, 7, 0, -7, -10, -7, 0],
                  y: [-10, -7, 0, 7, 10, 7, 0, -7, -10],
                  rotate: [-7, -4, 0, 4, 7, 4, 0, -4, -7],
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Search
                  className="h-14 w-14 sm:h-16 sm:w-16"
                  style={{ color: accent }}
                  strokeWidth={2.25}
                />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 text-3xl font-black tracking-tight text-white sm:text-5xl"
            >
              {status === 'connecting' ? 'Connecting…' : 'Searching for a rival'}
            </motion.h1>
            <p className="mt-3 max-w-md text-sm font-semibold text-white/55 sm:text-base">
              Stay here — the match starts the moment another player is found.
            </p>

            <div className="mt-10 flex items-center gap-5 text-left sm:gap-8">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
                  Searching as
                </p>
                <p className="mt-1 max-w-[10rem] truncate text-base font-black text-white sm:text-lg">
                  {playerName}
                </p>
              </div>
              <span className="h-9 w-px bg-white/15" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
                  Queue time
                </p>
                <p className="mt-1 font-mono text-base font-black tabular-nums text-white sm:text-lg">
                  {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}
                </p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
