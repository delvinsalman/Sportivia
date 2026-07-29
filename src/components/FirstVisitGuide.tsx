import { motion } from 'framer-motion';
import {
  ArrowRight,
  Gamepad2,
  LayoutGrid,
  Sparkles,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { SportBall } from './SportBall';
import { SPORTS } from '../lib/sportTheme';
import { playMenuConfirm } from '../lib/menuAudio';

interface FirstVisitGuideProps {
  onComplete: () => void;
}

const GUIDE_ITEMS: Array<{
  number: string;
  eyebrow: string;
  title: string;
  body: string;
  Icon: LucideIcon;
  accent: string;
}> = [
  {
    number: '01',
    eyebrow: 'The game',
    title: 'Match stars to categories',
    body: 'An athlete appears above a live 3×3 board. Pick the category cell they belong in before the clock runs out.',
    Icon: LayoutGrid,
    accent: '#23a559',
  },
  {
    number: '02',
    eyebrow: 'How to play',
    title: 'Think fast. Build streaks.',
    body: 'Correct picks fill cells and grow your streak. A wrong answer costs time. Clear the board, then keep the run moving.',
    Icon: Sparkles,
    accent: '#f0b232',
  },
  {
    number: '03',
    eyebrow: 'Ways to play',
    title: 'Quick trivia to live duels',
    body: 'Play Training, Quick Play, Daily, Ranked, VS AI, or a live 1v1. Campaign adds a 40-stage journey across all five sports.',
    Icon: Gamepad2,
    accent: '#38bdf8',
  },
  {
    number: '04',
    eyebrow: 'Progression',
    title: 'Earn. Unlock. Upgrade.',
    body: 'Win coins, XP, stars, and rewards. Unlock skins and pets, upgrade character cards, and climb your Career record.',
    Icon: Trophy,
    accent: '#a855f7',
  },
];

export function FirstVisitGuide({ onComplete }: FirstVisitGuideProps) {
  function enter() {
    playMenuConfirm();
    onComplete();
  }

  return (
    <main className="relative h-svh overflow-x-hidden overflow-y-auto bg-[#090b0d] text-[#f2f3f5]">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_15%,rgba(35,165,89,0.2),transparent_32%),radial-gradient(circle_at_82%_82%,rgba(56,189,248,0.15),transparent_34%),linear-gradient(145deg,#0d1511_0%,#090b0d_48%,#111016_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:52px_52px]"
      />

      <div className="relative z-10 mx-auto flex min-h-svh w-full max-w-6xl flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-7 lg:px-10">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-4"
        >
          <span className="text-xl font-black tracking-tight sm:text-2xl">Sportivia</span>
          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-[#949ba4] sm:text-[10px]">
            First-time kickoff
          </span>
        </motion.header>

        <section className="grid flex-1 items-center gap-7 py-8 lg:grid-cols-[0.82fr_1.18fr] lg:gap-12 lg:py-10">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 }}
          >
            <div className="mb-5 flex items-center gap-2">
              {SPORTS.map(sport => (
                <SportBall key={sport} sport={sport} size={25} className="drop-shadow-md sm:!h-8 sm:!w-8" />
              ))}
            </div>
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#23a559] sm:text-xs">
              Welcome to the game
            </p>
            <h1 className="max-w-xl text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
              Know the play
              <span className="block text-[#f0b232]">before kickoff.</span>
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#b5bac1] sm:text-base">
              Sportivia is fast sports trivia across Soccer, Basketball, Baseball, Football, and Hockey. Here is everything you need to start.
            </p>

            <button
              type="button"
              onClick={enter}
              className="mt-7 hidden min-h-12 items-center gap-3 rounded-xl border-[2.5px] border-white/30 bg-[#23a559] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#126c37,0_12px_28px_rgba(35,165,89,0.2)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_#126c37] lg:inline-flex"
            >
              Enter Sportivia
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="mt-3 hidden text-[10px] font-bold uppercase tracking-[0.14em] text-[#6d737c] lg:block">
              This quick guide only appears once
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="grid gap-3 sm:grid-cols-2"
          >
            {GUIDE_ITEMS.map(({ number, eyebrow, title, body, Icon, accent }) => (
              <article
                key={number}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#15181b]/90 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.24)] sm:p-5"
              >
                <div
                  aria-hidden
                  className="absolute -right-9 -top-9 h-28 w-28 rounded-full opacity-15 blur-2xl"
                  style={{ background: accent }}
                />
                <div className="relative flex items-start justify-between gap-3">
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#6d737c]">{number}</span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10"
                    style={{ color: accent, background: `${accent}18` }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <p className="relative mt-2 text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: accent }}>
                  {eyebrow}
                </p>
                <h2 className="relative mt-1.5 text-lg font-black leading-tight sm:text-xl">{title}</h2>
                <p className="relative mt-2 text-xs leading-relaxed text-[#a9afb8] sm:text-[13px]">{body}</p>
              </article>
            ))}
          </motion.div>
        </section>

        <div className="lg:hidden">
          <button
            type="button"
            onClick={enter}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border-[2.5px] border-white/30 bg-[#23a559] px-6 py-3 text-sm font-black uppercase tracking-wide text-white shadow-[0_4px_0_#126c37]"
          >
            Enter Sportivia
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-center text-[9px] font-bold uppercase tracking-[0.14em] text-[#6d737c]">
            This quick guide only appears once
          </p>
        </div>
      </div>
    </main>
  );
}
