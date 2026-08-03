import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { Sport } from '../types';
import { SPORT_ACCENT, SPORT_LABEL, SPORTS } from '../lib/sportTheme';
import { playMenuBack, playMenuConfirm } from '../lib/menuAudio';
import { PAGE_TRANSITION } from '../lib/pageTransitions';
import { SportBall } from './SportBall';

interface SportGuideOverlayProps {
  open: boolean;
  onClose: () => void;
  onPickSport?: (sport: Sport) => void;
  currentSport?: Sport | null;
}

const SPORT_BLURB: Record<Sport, string> = {
  soccer: 'Premier clubs, World Cup nations, leagues, and legends.',
  basketball: 'NBA franchises, colleges, positions, and eras.',
  baseball: 'MLB teams, positions, awards, and decades.',
  football: 'NFL teams, colleges, positions, and eras.',
  hockey: 'NHL squads, nations, positions, and eras.',
};

const TIPS = [
  'Same 3×3 board and modes in every sport.',
  'Switching only swaps the roster and categories.',
  'Daily, Ranked, Duel, and the rest all work the same.',
] as const;

/** Soft corner placements for ambient balls — Guess the Player vibe. */
const AMBIENT: Array<{ sport: Sport; className: string; size: number }> = [
  { sport: 'soccer', className: 'absolute -left-8 bottom-[6%] opacity-[0.07]', size: 150 },
  { sport: 'basketball', className: 'absolute -right-5 top-[9%] opacity-[0.06]', size: 130 },
  { sport: 'hockey', className: 'absolute left-[10%] top-[20%] opacity-[0.045] rotate-[-16deg]', size: 72 },
  { sport: 'football', className: 'absolute bottom-[26%] right-[12%] opacity-[0.05] rotate-[18deg]', size: 68 },
  { sport: 'baseball', className: 'absolute right-[28%] bottom-[10%] opacity-[0.04]', size: 56 },
];

export function SportGuideOverlay({
  open,
  onClose,
  onPickSport,
  currentSport,
}: SportGuideOverlayProps) {
  function close() {
    playMenuBack();
    onClose();
  }

  function pick(sp: Sport) {
    if (!onPickSport) return;
    playMenuConfirm();
    onPickSport(sp);
    onClose();
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="sport-guide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#0a0b0e]" />

          {/* Mixed sport glow background */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 55% 45% at 12% 18%, ${SPORT_ACCENT.soccer}33 0%, transparent 55%),
                radial-gradient(ellipse 50% 40% at 88% 22%, ${SPORT_ACCENT.basketball}2e 0%, transparent 52%),
                radial-gradient(ellipse 45% 38% at 78% 78%, ${SPORT_ACCENT.hockey}28 0%, transparent 55%),
                radial-gradient(ellipse 42% 36% at 18% 82%, ${SPORT_ACCENT.football}26 0%, transparent 52%),
                radial-gradient(ellipse 40% 34% at 50% 50%, ${SPORT_ACCENT.baseball}14 0%, transparent 55%)
              `,
            }}
          />

          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'radial-gradient(circle, rgba(240,178,50,0.9) 0.85px, transparent 1px)',
              backgroundSize: '18px 18px',
              maskImage: 'radial-gradient(ellipse at center, black 22%, transparent 78%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 22%, transparent 78%)',
            }}
          />

          {AMBIENT.map(item => (
            <div key={item.sport} aria-hidden className={`pointer-events-none blur-[0.4px] ${item.className}`}>
              <SportBall sport={item.sport} size={item.size} />
            </div>
          ))}

          <button
            type="button"
            onClick={close}
            className="fixed top-0 left-0 z-[81] m-3 flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22]/90 px-3 py-2 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] backdrop-blur-sm sm:m-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <motion.main
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={PAGE_TRANSITION}
            className="relative z-10 mx-auto flex h-svh w-full max-w-6xl flex-col justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.75rem,calc(env(safe-area-inset-top)+2.75rem))] sm:px-8"
          >
            <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] md:gap-9 lg:gap-12">
              {/* Left — crisp info */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {SPORTS.map(sp => (
                    <SportBall
                      key={sp}
                      sport={sp}
                      size={sp === 'football' || sp === 'hockey' ? 22 : 26}
                    />
                  ))}
                </div>

                <p className="mt-4 text-[11px] font-black uppercase tracking-[0.22em] text-[#f0b232]">
                  Sport guide
                </p>
                <h1 className="mt-1.5 text-3xl font-black tracking-tight text-[#f2f3f5] sm:text-4xl">
                  Five sports · one game
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#7a7d86] sm:text-[13px]">
                  Same board · same modes · new roster
                </p>

                <p className="mt-5 max-w-lg text-[15px] font-semibold leading-relaxed text-[#b5bac1] sm:text-base">
                  Every sport uses the same 3×3 trivia board and modes. Switching only swaps the
                  player roster and categories — Daily, Ranked, Duel, and the rest all work the
                  same.
                </p>

                <div className="mt-6 space-y-3">
                  {TIPS.map((tip, index) => (
                    <motion.div
                      key={tip}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...PAGE_TRANSITION, delay: 0.05 + index * 0.04 }}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0b232] text-[11px] font-black text-[#0b0c0e]">
                        {index + 1}
                      </span>
                      <p className="pt-0.5 text-[14px] font-semibold leading-snug text-[#d7dae0] sm:text-[15px]">
                        {tip}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right — sport display (no video) */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...PAGE_TRANSITION, delay: 0.06 }}
                className="min-w-0"
              >
                <div className="space-y-2.5">
                  {SPORTS.map((sp, index) => {
                    const accent = SPORT_ACCENT[sp];
                    const selected = currentSport === sp;
                    return (
                      <motion.button
                        key={sp}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...PAGE_TRANSITION, delay: 0.08 + index * 0.035 }}
                        onClick={() => pick(sp)}
                        className="flex w-full items-center gap-3 rounded-2xl border-[2.5px] bg-[#15161a]/80 px-3.5 py-2.5 text-left shadow-[0_3px_0_#0c0d0f] backdrop-blur-sm transition hover:translate-y-[1px] hover:shadow-[0_2px_0_#0c0d0f]"
                        style={{
                          borderColor: selected ? accent : `${accent}55`,
                          background: selected
                            ? `linear-gradient(160deg, ${accent}28 0%, #15161a 62%)`
                            : undefined,
                        }}
                      >
                        <span
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 bg-black/30"
                          style={{ borderColor: `${accent}66` }}
                        >
                          <SportBall
                            sport={sp}
                            size={sp === 'football' || sp === 'hockey' ? 22 : 26}
                          />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="text-[15px] font-black text-[#f2f3f5]">
                              {SPORT_LABEL[sp]}
                            </span>
                            {selected && (
                              <span
                                className="rounded-full border px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                                style={{
                                  borderColor: `${accent}88`,
                                  background: `${accent}1f`,
                                  color: accent === '#f4f4f5' ? '#f2f3f5' : accent,
                                }}
                              >
                                Selected
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] font-semibold text-[#949ba4]">
                            {SPORT_BLURB[sp]}
                          </span>
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </motion.main>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
