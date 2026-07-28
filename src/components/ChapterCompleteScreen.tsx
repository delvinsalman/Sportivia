import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';
import { SportBall } from './SportBall';
import type { Sport } from '../types';
import { playMenuConfirm } from '../lib/menuAudio';
import { PAGE_SPRING } from '../lib/pageTransitions';

const SPORTS: Sport[] = ['soccer', 'basketball', 'football', 'baseball', 'hockey'];

interface ChapterCompleteScreenProps {
  chapterTitle: string;
  chapterId: number;
  gateId: number;
  isFinale?: boolean;
  onContinue: () => void;
}

export function ChapterCompleteScreen({
  chapterTitle,
  chapterId,
  gateId,
  isFinale = false,
  onContinue,
}: ChapterCompleteScreenProps) {
  return (
    <motion.div
      role="dialog"
      aria-label={isFinale ? 'Campaign conquered' : 'Chapter complete'}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#050506]/92 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: isFinale
            ? 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(240,178,50,0.28) 0%, transparent 65%)'
            : 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(35,165,89,0.22) 0%, transparent 65%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...PAGE_SPRING, delay: 0.05 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="mb-5 flex items-center justify-center gap-2"
        >
          {SPORTS.map((s, i) => (
            <motion.span
              key={s}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.16 + i * 0.05, ...PAGE_SPRING }}
            >
              <SportBall sport={s} size={26} className="drop-shadow-[0_2px_0_rgba(0,0,0,0.4)]" />
            </motion.span>
          ))}
        </motion.div>

        <p
          className={`inline-flex items-center gap-1.5 rounded-full border-2 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${
            isFinale
              ? 'border-[#f0b232]/80 bg-[#f0b232]/15 text-[#ffe08a]'
              : 'border-[#4ade80]/70 bg-[#23a559]/20 text-[#4ade80]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
          {isFinale ? 'Finale cleared' : `Chapter ${chapterId + 1} cleared`}
        </p>

        <h2
          className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl"
          style={{ textShadow: '0 4px 0 rgba(0,0,0,0.45)' }}
        >
          {isFinale ? 'Campaign Conquered!' : 'Congrats!'}
        </h2>

        <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-snug text-white/70">
          {isFinale
            ? 'You finished all 40 stages. Crown Finale is yours — the whole path is cleared.'
            : `You finished ${chapterTitle} (levels ${chapterId === 0 ? '1–10' : chapterId === 1 ? '11–20' : chapterId === 2 ? '21–30' : '31–40'}). Gate ${gateId} is secured — next chapter unlocked.`}
        </p>

        <button
          type="button"
          onClick={() => {
            playMenuConfirm();
            onContinue();
          }}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] border-white/25 bg-[#f0b232] py-3.5 text-sm font-black uppercase tracking-wide text-[#3a2600] shadow-[0_5px_0_#8a6814] transition-all hover:translate-y-[1px] hover:shadow-[0_4px_0_#8a6814]"
        >
          Next
          <ChevronRight className="h-5 w-5" strokeWidth={2.75} />
        </button>
      </motion.div>
    </motion.div>
  );
}
