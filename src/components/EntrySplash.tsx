import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SportBall } from './SportBall';
import type { Sport } from '../types';

const SPORTS: Sport[] = ['soccer', 'basketball', 'football', 'baseball', 'hockey'];

interface EntrySplashProps {
  onComplete: () => void;
}

/** Lightweight boot splash — no mouse tracking / reactive field. */
export function EntrySplash({ onComplete }: EntrySplashProps) {
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onComplete();
  }

  useEffect(() => {
    const t = window.setTimeout(finish, 1800);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <button
      type="button"
      aria-label="Enter Sportivia"
      onClick={finish}
      className="entry-splash relative flex h-svh w-full cursor-default items-center justify-center overflow-hidden border-0 p-0 text-left"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 entry-splash-bg" />

      {/* Soft static balls — no continuous JS animation */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="entry-splash-orb entry-splash-orb-a" />
        <span className="entry-splash-orb entry-splash-orb-b" />
        <span className="entry-splash-orb entry-splash-orb-c" />
        <SportBall
          sport="soccer"
          size={52}
          className="absolute left-[9%] top-[18%] opacity-[0.14]"
        />
        <SportBall
          sport="basketball"
          size={58}
          className="absolute right-[10%] top-[22%] opacity-[0.13]"
        />
        <SportBall
          sport="football"
          size={48}
          className="absolute bottom-[20%] left-[14%] opacity-[0.12]"
        />
        <SportBall
          sport="hockey"
          size={44}
          className="absolute bottom-[24%] right-[12%] opacity-[0.13]"
        />
        <SportBall
          sport="baseball"
          size={40}
          className="absolute left-[46%] top-[12%] opacity-[0.1]"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.55)_100%)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center px-6"
      >
        <div className="mb-4 flex items-center gap-2.5 sm:mb-5 sm:gap-3">
          {SPORTS.map(s => (
            <SportBall
              key={s}
              sport={s}
              size={28}
              className="drop-shadow-[0_2px_0_rgba(0,0,0,0.4)] sm:!h-8 sm:!w-8"
            />
          ))}
        </div>

        <h1
          className="text-5xl font-black tracking-tight text-[#f2f3f5] sm:text-7xl"
          style={{ textShadow: '0 4px 0 rgba(0,0,0,0.45)' }}
        >
          Sportivia
        </h1>

        <span
          aria-hidden
          className="mt-4 h-[3px] w-16 rounded-full bg-gradient-to-r from-transparent via-[#f0b232] to-transparent sm:w-20"
        />
      </motion.div>
    </button>
  );
}
