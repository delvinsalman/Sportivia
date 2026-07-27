import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Sport } from '../types';
import { SportBall } from './SportBall';
import { SPORT_ACCENT, SPORT_LABEL } from '../lib/sportTheme';
import { PAGE_SPRING } from '../lib/pageTransitions';

interface BallRainIntroProps {
  sport: Sport;
  /** When set (e.g. mixed campaign stages), rain + hero use all of these. */
  sports?: Sport[];
  mode: string;
  detail?: string;
  onComplete: () => void;
}

const RAIN_COUNT = 36;

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function BallRainIntro({
  sport,
  sports,
  mode,
  detail,
  onComplete,
}: BallRainIntroProps) {
  const mix = useMemo(() => {
    const list = (sports?.length ? sports : [sport]).filter(Boolean);
    return list.length > 0 ? list : ([sport] as Sport[]);
  }, [sport, sports]);
  const mixed = mix.length > 1;

  const balls = useMemo(
    () =>
      Array.from({ length: RAIN_COUNT }, (_, i) => ({
        id: i,
        sport: mix[i % mix.length]!,
        x: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.2 + Math.random() * 0.8,
        size: 22 + Math.random() * 28,
        rotate: Math.random() * 720 - 360,
        drift: (Math.random() - 0.5) * 80,
      })),
    [mix],
  );

  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  const accent = SPORT_ACCENT[mix[0]!];
  const bgGradient = mixed
    ? [
        ...mix.map((s, i) => {
          const x = mix.length === 2 ? (i === 0 ? 22 : 78) : 18 + (i * 64) / Math.max(1, mix.length - 1);
          return `radial-gradient(ellipse 55% 45% at ${x}% 28%, ${hexToRgba(SPORT_ACCENT[s], 0.28)} 0%, transparent 62%)`;
        }),
        'linear-gradient(180deg, #0a0a0b 0%, #0a0a0b 100%)',
      ].join(', ')
    : sport === 'soccer'
      ? 'radial-gradient(ellipse at 50% 30%, rgba(35,165,89,0.25) 0%, #0a0a0b 70%)'
      : sport === 'basketball'
        ? 'radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.25) 0%, #0a0a0b 70%)'
        : sport === 'football'
          ? 'radial-gradient(ellipse at 50% 30%, rgba(139,90,43,0.28) 0%, #0a0a0b 70%)'
          : sport === 'hockey'
            ? 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.25) 0%, #0a0a0b 70%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.14) 0%, #0a0a0b 70%)';

  const mixLabel = mix.map(s => SPORT_LABEL[s]).join(' · ');

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: bgGradient }}
    >
      {balls.map(b => (
        <motion.div
          key={b.id}
          className="absolute pointer-events-none"
          style={{ left: `${b.x}%`, top: -60 }}
          initial={{ y: -80, opacity: 0, rotate: 0 }}
          animate={{
            y: '110vh',
            opacity: [0, 1, 1, 0.6],
            rotate: b.rotate,
            x: b.drift,
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          <SportBall sport={b.sport} size={b.size} />
        </motion.div>
      ))}

      <motion.div
        initial={{ scale: 0.72, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ ...PAGE_SPRING, delay: 0.08 }}
        className="relative z-10 px-6 text-center"
      >
        <motion.div
          animate={mixed ? { y: [0, -4, 0] } : { rotate: [0, 8, -8, 0] }}
          transition={{ duration: mixed ? 1.1 : 0.5, delay: 0.3 }}
          className="mb-4 flex items-center justify-center gap-2 sm:gap-3"
        >
          {mixed ? (
            mix.map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.18 + i * 0.08, ...PAGE_SPRING }}
                className="relative"
                style={{ zIndex: mix.length - i }}
              >
                <SportBall sport={s} size={mix.length >= 4 ? 48 : mix.length === 3 ? 56 : 64} />
                {i < mix.length - 1 && (
                  <span className="pointer-events-none absolute -right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-black text-white/50 sm:-right-3">
                    ·
                  </span>
                )}
              </motion.div>
            ))
          ) : (
            <SportBall sport={sport} size={72} />
          )}
        </motion.div>

        {mixed && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/55"
          >
            Mixed stage
          </motion.p>
        )}

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl font-extrabold tracking-tight text-[#f2f3f5]"
        >
          Let&apos;s Go!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {mode}
          {detail ? ` · ${detail}` : ''}
        </motion.p>
        {mixed && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-1.5 text-[10px] font-bold tracking-wide text-white/45"
          >
            {mixLabel}
          </motion.p>
        )}
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0b]/80" />
    </div>
  );
}
