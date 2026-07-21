import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Sport } from '../types';
import { SportBall } from './SportBall';
import { SPORT_ACCENT } from '../lib/sportTheme';
import { PAGE_SPRING } from '../lib/pageTransitions';

interface BallRainIntroProps {
  sport: Sport;
  mode: string;
  detail?: string;
  onComplete: () => void;
}

const RAIN_COUNT = 36;

function BallComponent({ sport, size }: { sport: Sport; size: number }) {
  return <SportBall sport={sport} size={size} />;
}

export function BallRainIntro({ sport, mode, detail, onComplete }: BallRainIntroProps) {
  const balls = useMemo(() =>
    Array.from({ length: RAIN_COUNT }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.2 + Math.random() * 0.8,
      size: 22 + Math.random() * 28,
      rotate: Math.random() * 720 - 360,
      drift: (Math.random() - 0.5) * 80,
    })),
  []);

  useEffect(() => {
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  const accent = SPORT_ACCENT[sport];

  const bgGradient = sport === 'soccer'
    ? 'radial-gradient(ellipse at 50% 30%, rgba(35,165,89,0.25) 0%, #0a0a0b 70%)'
    : sport === 'basketball'
      ? 'radial-gradient(ellipse at 50% 30%, rgba(249,115,22,0.25) 0%, #0a0a0b 70%)'
      : sport === 'football'
        ? 'radial-gradient(ellipse at 50% 30%, rgba(139,90,43,0.28) 0%, #0a0a0b 70%)'
        : sport === 'hockey'
          ? 'radial-gradient(ellipse at 50% 30%, rgba(56,189,248,0.25) 0%, #0a0a0b 70%)'
          : 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.14) 0%, #0a0a0b 70%)';

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      style={{ background: bgGradient }}
    >
      {/* Raining balls */}
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
          <BallComponent sport={sport} size={b.size} />
        </motion.div>
      ))}

      {/* Center burst */}
      <motion.div
        initial={{ scale: 0.72, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ ...PAGE_SPRING, delay: 0.08 }}
        className="relative z-10 text-center px-6"
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-4 flex justify-center"
        >
          <SportBall sport={sport} size={72} />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-2xl font-extrabold text-[#f2f3f5] tracking-tight"
        >
          Let's Go!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs font-bold uppercase tracking-[0.2em] mt-2"
          style={{ color: accent }}
        >
          {mode}
          {detail ? ` · ${detail}` : ''}
        </motion.p>
      </motion.div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-[#0a0a0b]/80" />
    </div>
  );
}
