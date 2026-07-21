import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, animate } from 'framer-motion';
import type { Sport } from '../types';
import { SoccerBall, BasketballBall, BaseballBall, FootballBall, HockeyPuck } from './SportBall';

interface BallConfig {
  id: number;
  xPct: number;
  yPct: number;
  size: number;
  driftDuration: number;
  driftDelay: number;
}

const SOCCER_BALLS: BallConfig[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  xPct: 8 + (i * 11) % 85,
  // Ball between left peek + center (id 2 ≈ 30%, 46%) — drop it lower
  yPct: i === 2 ? 68 : 12 + (i * 17) % 70,
  size: 32 + (i % 3) * 18,
  driftDelay: i * 0.4,
  driftDuration: 6 + (i % 4) * 2,
}));

const BASKETBALLS: BallConfig[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  xPct: 10 + (i * 13) % 80,
  yPct: 15 + (i * 19) % 65,
  size: 30 + (i % 3) * 16,
  driftDelay: i * 0.35,
  driftDuration: 5 + (i % 4) * 2,
}));

const BASEBALLS: BallConfig[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  xPct: 9 + (i * 12) % 82,
  yPct: 14 + (i * 16) % 68,
  size: 28 + (i % 3) * 14,
  driftDelay: i * 0.38,
  driftDuration: 5.5 + (i % 4) * 2,
}));

const FOOTBALLS: BallConfig[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  xPct: 8 + (i * 14) % 84,
  yPct: 13 + (i * 18) % 66,
  size: 30 + (i % 3) * 15,
  driftDelay: i * 0.36,
  driftDuration: 5.2 + (i % 4) * 2,
}));

const HOCKEY_PUCKS: BallConfig[] = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  xPct: 8 + (i * 15) % 84,
  yPct: 12 + (i * 19) % 68,
  size: 26 + (i % 3) * 14,
  driftDelay: i * 0.34,
  driftDuration: 5.4 + (i % 4) * 2,
}));

const REPEL_RADIUS = 130;

function ReactiveBall({
  config,
  sport,
  mouse,
  containerSize,
  opacity,
}: {
  config: BallConfig;
  sport: Sport;
  mouse: { x: number; y: number } | null;
  containerSize: { w: number; h: number };
  opacity: number;
}) {
  const repelX = useMotionValue(0);
  const repelY = useMotionValue(0);
  const springX = useSpring(repelX, { stiffness: 380, damping: 18, mass: 0.6 });
  const springY = useSpring(repelY, { stiffness: 380, damping: 18, mass: 0.6 });

  useEffect(() => {
    if (!mouse || containerSize.w === 0) {
      animate(repelX, 0, { type: 'spring', stiffness: 280, damping: 22 });
      animate(repelY, 0, { type: 'spring', stiffness: 280, damping: 22 });
      return;
    }

    const ballX = (config.xPct / 100) * containerSize.w + config.size / 2;
    const ballY = (config.yPct / 100) * containerSize.h + config.size / 2;
    const dx = ballX - mouse.x;
    const dy = ballY - mouse.y;
    const dist = Math.hypot(dx, dy);
    const hitRadius = REPEL_RADIUS + config.size * 0.35;

    if (dist < hitRadius && dist > 0.1) {
      const force = (1 - dist / hitRadius) ** 1.4;
      const nx = dx / dist;
      const ny = dy / dist;
      repelX.set(nx * force * 52);
      repelY.set(ny * force * 52 - force * 28);
    } else {
      repelX.set(0);
      repelY.set(0);
    }
  }, [mouse, containerSize, config, repelX, repelY]);

  const Ball =
    sport === 'soccer'
      ? SoccerBall
      : sport === 'basketball'
        ? BasketballBall
        : sport === 'football'
          ? FootballBall
          : sport === 'hockey'
            ? HockeyPuck
            : BaseballBall;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${config.xPct}%`,
        top: `${config.yPct}%`,
        opacity,
        x: springX,
        y: springY,
      }}
    >
      <motion.div
        animate={{
          y: [0, -18, 0, 14, 0],
          x: [0, sport === 'soccer' ? 8 : sport === 'basketball' ? -10 : 6, sport === 'soccer' ? -6 : sport === 'basketball' ? 12 : -8, 0, 0],
          rotate: sport === 'soccer' ? [0, 15, -10, 20, 0] : sport === 'basketball' ? [0, -20, 25, -15, 0] : [0, 12, -18, 14, 0],
        }}
        transition={{
          duration: config.driftDuration,
          delay: config.driftDelay,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Ball size={config.size} />
      </motion.div>
    </motion.div>
  );
}

function SoccerPitch({
  mouse,
  containerSize,
}: {
  mouse: { x: number; y: number } | null;
  containerSize: { w: number; h: number };
}) {
  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 120% 80% at 50% 100%, rgba(35,165,89,0.32) 0%, transparent 55%),
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(35,165,89,0.14) 0%, transparent 70%),
            linear-gradient(180deg, #12161a 0%, #0f1a14 50%, #12161a 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800">
        <rect x="20" y="40" width="360" height="720" fill="none" stroke="#23a559" strokeWidth="2" />
        <line x1="20" y1="400" x2="380" y2="400" stroke="#23a559" strokeWidth="2" />
        <circle cx="200" cy="400" r="60" fill="none" stroke="#23a559" strokeWidth="2" />
        <circle cx="200" cy="400" r="4" fill="#23a559" />
        <rect x="120" y="40" width="160" height="80" fill="none" stroke="#23a559" strokeWidth="1.5" />
        <rect x="120" y="680" width="160" height="80" fill="none" stroke="#23a559" strokeWidth="1.5" />
      </svg>
      {SOCCER_BALLS.map(b => (
        <ReactiveBall
          key={b.id}
          config={b}
          sport="soccer"
          mouse={mouse}
          containerSize={containerSize}
          opacity={0.18}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#23a559]/10 to-transparent" />
    </>
  );
}

function BasketballCourt({
  mouse,
  containerSize,
}: {
  mouse: { x: number; y: number } | null;
  containerSize: { w: number; h: number };
}) {
  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 100% 70% at 50% 80%, rgba(249,115,22,0.28) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 40%, rgba(234,88,12,0.1) 0%, transparent 60%),
            linear-gradient(180deg, #16120f 0%, #1a140e 50%, #16120f 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800">
        <rect x="30" y="50" width="340" height="700" fill="none" stroke="#f97316" strokeWidth="2" rx="4" />
        <line x1="30" y1="400" x2="370" y2="400" stroke="#f97316" strokeWidth="2" />
        <circle cx="200" cy="400" r="50" fill="none" stroke="#f97316" strokeWidth="2" />
        <path d="M 80 50 Q 200 180 320 50" fill="none" stroke="#f97316" strokeWidth="1.5" />
        <path d="M 80 750 Q 200 620 320 750" fill="none" stroke="#f97316" strokeWidth="1.5" />
        <rect x="130" y="50" width="140" height="120" fill="none" stroke="#f97316" strokeWidth="1.5" />
        <rect x="130" y="630" width="140" height="120" fill="none" stroke="#f97316" strokeWidth="1.5" />
      </svg>
      {BASKETBALLS.map(b => (
        <ReactiveBall
          key={b.id}
          config={b}
          sport="basketball"
          mouse={mouse}
          containerSize={containerSize}
          opacity={0.16}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f97316]/10 to-transparent" />
    </>
  );
}

function BaseballField({
  mouse,
  containerSize,
}: {
  mouse: { x: number; y: number } | null;
  containerSize: { w: number; h: number };
}) {
  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 50% 30%, rgba(255,255,255,0.16) 0%, transparent 55%),
            radial-gradient(ellipse 80% 50% at 50% 80%, rgba(244,244,245,0.12) 0%, transparent 60%),
            linear-gradient(180deg, #151618 0%, #1a1b1f 45%, #151618 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800">
        <path d="M 200 120 L 340 380 L 200 640 L 60 380 Z" fill="none" stroke="#f4f4f5" strokeWidth="2" />
        <circle cx="200" cy="380" r="50" fill="none" stroke="#f4f4f5" strokeWidth="1.5" />
        <rect x="170" y="600" width="60" height="50" fill="none" stroke="#f4f4f5" strokeWidth="1.5" />
        <line x1="60" y1="380" x2="340" y2="380" stroke="#f4f4f5" strokeWidth="1" opacity="0.45" />
        <path d="M 200 200 Q 220 240 200 280" fill="none" stroke="#c41e3a" strokeWidth="1" opacity="0.35" />
        <path d="M 200 480 Q 180 520 200 560" fill="none" stroke="#c41e3a" strokeWidth="1" opacity="0.35" />
      </svg>
      {BASEBALLS.map(b => (
        <ReactiveBall
          key={b.id}
          config={b}
          sport="baseball"
          mouse={mouse}
          containerSize={containerSize}
          opacity={0.22}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f4f4f5]/8 to-transparent" />
    </>
  );
}

function FootballField({
  mouse,
  containerSize,
}: {
  mouse: { x: number; y: number } | null;
  containerSize: { w: number; h: number };
}) {
  const leather = '#a67c52';
  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 95% 60% at 50% 45%, rgba(139,90,43,0.34) 0%, transparent 58%),
            radial-gradient(ellipse 80% 50% at 50% 85%, rgba(92,61,46,0.26) 0%, transparent 62%),
            radial-gradient(ellipse 50% 35% at 50% 20%, rgba(166,124,82,0.18) 0%, transparent 55%),
            linear-gradient(180deg, #16120e 0%, #1c1610 40%, #18140f 70%, #16120e 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 w-full h-full opacity-[0.1]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800">
        <rect x="40" y="60" width="320" height="680" fill="none" stroke={leather} strokeWidth="2.5" rx="4" />
        <line x1="40" y1="400" x2="360" y2="400" stroke={leather} strokeWidth="2.5" />
        {[140, 220, 280, 340, 460, 520, 580, 660].map(y => (
          <line key={y} x1="40" y1={y} x2="360" y2={y} stroke={leather} strokeWidth="1" opacity="0.55" />
        ))}
        <rect x="120" y="60" width="160" height="80" fill="none" stroke={leather} strokeWidth="1.5" />
        <rect x="120" y="660" width="160" height="80" fill="none" stroke={leather} strokeWidth="1.5" />
        <circle cx="200" cy="400" r="28" fill="none" stroke={leather} strokeWidth="1.5" />
        <line x1="70" y1="200" x2="100" y2="200" stroke={leather} strokeWidth="1.5" opacity="0.7" />
        <line x1="300" y1="200" x2="330" y2="200" stroke={leather} strokeWidth="1.5" opacity="0.7" />
        <line x1="70" y1="600" x2="100" y2="600" stroke={leather} strokeWidth="1.5" opacity="0.7" />
        <line x1="300" y1="600" x2="330" y2="600" stroke={leather} strokeWidth="1.5" opacity="0.7" />
      </svg>
      {FOOTBALLS.map(b => (
        <ReactiveBall
          key={b.id}
          config={b}
          sport="football"
          mouse={mouse}
          containerSize={containerSize}
          opacity={0.2}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#8b5a2b]/18 to-transparent" />
    </>
  );
}

function HockeyRink({
  mouse,
  containerSize,
}: {
  mouse: { x: number; y: number } | null;
  containerSize: { w: number; h: number };
}) {
  const ice = '#38bdf8';
  return (
    <>
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          background: `
            radial-gradient(ellipse 105% 65% at 50% 48%, rgba(56,189,248,0.28) 0%, transparent 60%),
            radial-gradient(ellipse 75% 45% at 50% 85%, rgba(226,232,240,0.16) 0%, transparent 62%),
            linear-gradient(180deg, #10151c 0%, #12202c 45%, #101820 72%, #10141a 100%)
          `,
        }}
      />
      <svg className="absolute inset-0 h-full w-full opacity-[0.1]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 800">
        <rect x="35" y="45" width="330" height="710" rx="82" fill="none" stroke={ice} strokeWidth="2.5" />
        <line x1="35" y1="400" x2="365" y2="400" stroke="#ef4444" strokeWidth="2" />
        <line x1="35" y1="270" x2="365" y2="270" stroke="#3b82f6" strokeWidth="2" />
        <line x1="35" y1="530" x2="365" y2="530" stroke="#3b82f6" strokeWidth="2" />
        <circle cx="200" cy="400" r="45" fill="none" stroke={ice} strokeWidth="1.5" />
        <circle cx="105" cy="245" r="28" fill="none" stroke={ice} strokeWidth="1" />
        <circle cx="295" cy="245" r="28" fill="none" stroke={ice} strokeWidth="1" />
        <circle cx="105" cy="555" r="28" fill="none" stroke={ice} strokeWidth="1" />
        <circle cx="295" cy="555" r="28" fill="none" stroke={ice} strokeWidth="1" />
        <path d="M160 45 h80 v28 q-40 30-80 0z" fill="none" stroke="#ef4444" strokeWidth="1.5" />
        <path d="M160 755 h80 v-28 q-40-30-80 0z" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      </svg>
      {HOCKEY_PUCKS.map(puck => (
        <ReactiveBall
          key={puck.id}
          config={puck}
          sport="hockey"
          mouse={mouse}
          containerSize={containerSize}
          opacity={0.2}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#38bdf8]/12 to-transparent" />
    </>
  );
}

interface SportBackgroundProps {
  sport: Sport;
}

export function SportBackground({ sport }: SportBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    };
    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(el);

    const onPointerMove = (e: PointerEvent) => handlePointerMove(e);
    const onPointerOut = () => setMouse(null);

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerout', onPointerOut);

    return () => {
      ro.disconnect();
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
    };
  }, [handlePointerMove]);

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        key={sport}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0"
      >
        {sport === 'soccer' ? (
          <SoccerPitch mouse={mouse} containerSize={containerSize} />
        ) : sport === 'basketball' ? (
          <BasketballCourt mouse={mouse} containerSize={containerSize} />
        ) : sport === 'football' ? (
          <FootballField mouse={mouse} containerSize={containerSize} />
        ) : sport === 'hockey' ? (
          <HockeyRink mouse={mouse} containerSize={containerSize} />
        ) : (
          <BaseballField mouse={mouse} containerSize={containerSize} />
        )}
      </motion.div>
    </div>
  );
}
