import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, RefreshCw, Sparkles, X } from 'lucide-react';
import type { PlayerProfile } from '../types/profile';
import {
  DAILY_SPIN_ICON,
  DAILY_SPIN_SEGMENT_LIGHT,
  DAILY_SPIN_SEGMENTS,
  dailySpinMsRemaining,
  formatSpinCountdown,
  isDailySpinOnCooldown,
  segmentIndex,
  spinDegreesForIndex,
  type DailySpinPrize,
} from '../lib/dailySpin';
import { claimDailySpin } from '../lib/profileStorage';
import {
  playMenuBack,
  playMenuClick,
  playSpinTick,
  playUnlockFanfare,
} from '../lib/menuAudio';
import { CoinIcon } from './CoinIcon';

interface DailySpinModalProps {
  profile: PlayerProfile;
  onClose: () => void;
  onClaimed: (profile: PlayerProfile, prize: DailySpinPrize) => void;
}

const SPIN_MS = 4_800;
const SEG_COUNT = DAILY_SPIN_SEGMENTS.length;
const SLICE = 360 / SEG_COUNT;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
}

function SpinWheelFace() {
  const cx = 160;
  const cy = 160;
  const r = 148;

  const slices = useMemo(
    () =>
      DAILY_SPIN_SEGMENTS.map((seg, i) => ({
        seg,
        start: i * SLICE,
        end: (i + 1) * SLICE,
      })),
    [],
  );

  return (
    <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
      <defs>
        {DAILY_SPIN_SEGMENTS.map(seg => {
          const light = DAILY_SPIN_SEGMENT_LIGHT[seg.id] ?? seg.color;
          return (
            <linearGradient
              key={`g-${seg.id}`}
              id={`spin-grad-${seg.id}`}
              x1="18%"
              y1="8%"
              x2="88%"
              y2="92%"
            >
              <stop offset="0%" stopColor={light} />
              <stop offset="48%" stopColor={seg.color} />
              <stop offset="100%" stopColor={seg.color} stopOpacity="0.82" />
            </linearGradient>
          );
        })}
        <radialGradient id="spin-gloss" cx="30%" cy="26%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </radialGradient>
        <radialGradient id="spin-inner-shade" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r="158" fill="#0a0b0e" />
      <circle cx={cx} cy={cy} r="155.5" fill="none" stroke="#f0b232" strokeWidth="3.5" />
      <circle cx={cx} cy={cy} r="151.5" fill="none" stroke="#8a6814" strokeWidth="1.5" opacity="0.9" />
      <circle cx={cx} cy={cy} r="149.5" fill="none" stroke="#ffe08a" strokeWidth="1" opacity="0.25" />

      {Array.from({ length: 24 }).map((_, i) => {
        const a = (i * 360) / 24;
        const p = polar(cx, cy, 153.5, a);
        const major = i % 3 === 0;
        return (
          <circle
            key={`peg-${i}`}
            cx={p.x}
            cy={p.y}
            r={major ? 2.5 : 1.6}
            fill={major ? '#f0b232' : '#d7dae0'}
            opacity={major ? 0.95 : 0.4}
          />
        );
      })}

      {slices.map(({ seg, start, end }) => (
        <path
          key={seg.id}
          d={slicePath(cx, cy, r, start, end)}
          fill={`url(#spin-grad-${seg.id})`}
          stroke="#07080a"
          strokeWidth="2.5"
        />
      ))}

      {slices.map(({ seg, start, end }, i) =>
        i % 2 === 0 ? (
          <path
            key={`hi-${seg.id}`}
            d={slicePath(cx, cy, r, start, end)}
            fill="#ffffff"
            opacity="0.08"
          />
        ) : (
          <path
            key={`lo-${seg.id}`}
            d={slicePath(cx, cy, r, start, end)}
            fill="#000000"
            opacity="0.08"
          />
        ),
      )}

      {slices.map(({ start }, i) => {
        const outer = polar(cx, cy, r - 1, start);
        const inner = polar(cx, cy, 42, start);
        return (
          <line
            key={`div-${i}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#f2f3f5"
            strokeOpacity="0.2"
            strokeWidth="1.75"
          />
        );
      })}

      {/* Soft bevel ring just inside the rim */}
      <circle cx={cx} cy={cy} r={r - 3} fill="none" stroke="#ffffff" strokeOpacity="0.12" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r - 10} fill="none" stroke="#000000" strokeOpacity="0.18" strokeWidth="6" />

      <circle cx={cx} cy={cy} r={r} fill="url(#spin-gloss)" />
      <circle cx={cx} cy={cy} r={r} fill="url(#spin-inner-shade)" />

      <circle cx={cx} cy={cy} r="40" fill="#14151a" stroke="#f0b232" strokeWidth="3.5" />
      <circle cx={cx} cy={cy} r="35.5" fill="none" stroke="#8a6814" strokeWidth="1.5" opacity="0.75" />
      <circle cx={cx} cy={cy} r="33" fill="none" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" />
    </svg>
  );
}

export function DailySpinModal({ profile, onClose, onClaimed }: DailySpinModalProps) {
  const dailyReady = !isDailySpinOnCooldown(profile.dailySpinAt);
  const freeSpins = Math.max(0, Math.floor(profile.freeSpinCredits ?? 0));
  const available = dailyReady || freeSpins > 0;
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<DailySpinPrize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(() =>
    dailySpinMsRemaining(profile.dailySpinAt),
  );
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setRemainingMs(dailySpinMsRemaining(profile.dailySpinAt));
    if (dailyReady) return;
    const id = window.setInterval(() => {
      setRemainingMs(dailySpinMsRemaining(profile.dailySpinAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [profile.dailySpinAt, dailyReady]);

  useEffect(() => {
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  function dismiss() {
    if (spinning) return;
    playMenuBack();
    onClose();
  }

  function spin() {
    if (spinning || !available) {
      playMenuClick();
      return;
    }
    setError(null);
    const result = claimDailySpin();
    if (!result.ok || !result.prize) {
      setError(result.error ?? 'Spin unavailable');
      playMenuClick();
      return;
    }

    const landed = result.prize;
    const idx = segmentIndex(landed.id);
    const nextRotation =
      rotation + spinDegreesForIndex(idx, DAILY_SPIN_SEGMENTS.length, 6, rotation);

    setSpinning(true);
    setPrize(null);
    setRotation(nextRotation);

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => playSpinTick(), 90);

    window.setTimeout(() => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      setSpinning(false);
      setPrize(landed);
      playUnlockFanfare();
      onClaimed(result.profile, landed);
    }, SPIN_MS);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 px-3 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
      onClick={dismiss}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl border-[3px] border-[#3f4147] bg-gradient-to-b from-[#1c1e24] to-[#0e0f12] p-4 shadow-[0_10px_0_#050506,0_24px_60px_rgba(0,0,0,0.55)] sm:p-5"
        onClick={e => e.stopPropagation()}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(ellipse at 50% 18%, rgba(240,178,50,0.16) 0%, transparent 52%)',
          }}
        />

        <button
          type="button"
          onClick={dismiss}
          disabled={spinning}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] text-[#b5bac1] shadow-[0_3px_0_#1a1b1f] hover:text-[#f2f3f5] disabled:opacity-40"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.75} />
        </button>

        <div className="relative flex items-start gap-3 pr-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-[#f0b232]/70 bg-[#2a2414] shadow-[0_3px_0_#8a6814]">
            <img
              src={DAILY_SPIN_ICON}
              alt=""
              draggable={false}
              className="h-7 w-7 object-contain drop-shadow-md"
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0b232]">
              Daily Spin
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#f2f3f5]">
              {available ? 'Ready to spin' : 'On cooldown'}
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#949ba4]">
              Coins, upgrades, or banked free spins · daily resets in 24h.
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-5 flex w-[min(100%,18.5rem)] flex-col items-center">
          <div className="absolute -top-2 z-20 flex flex-col items-center" aria-hidden>
            <div className="h-3.5 w-3.5 rounded-full border-[2.5px] border-[#f0b232] bg-[#ffe08a] shadow-[0_2px_0_#8a6814]" />
            <div
              className="mt-[-2px] h-0 w-0 border-l-[9px] border-r-[9px] border-t-[14px] border-l-transparent border-r-transparent border-t-[#f0b232]"
              style={{ filter: 'drop-shadow(0 2px 0 #8a6814)' }}
            />
          </div>

          <div
            className="relative aspect-square w-full rounded-full shadow-[0_10px_0_#050506,0_18px_36px_rgba(0,0,0,0.45)]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.12, 1)`
                : 'none',
            }}
          >
            <SpinWheelFace />

            {DAILY_SPIN_SEGMENTS.map((seg, i) => {
              const angle = i * SLICE + SLICE / 2;
              return (
                <span
                  key={seg.id}
                  className="pointer-events-none absolute left-1/2 top-1/2 flex origin-center flex-col items-center gap-0.5"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-4.55rem)`,
                  }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#111214]/70 shadow-[0_2px_0_rgba(0,0,0,0.35)] backdrop-blur-[1px]"
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {seg.kind === 'coins' ? (
                      <CoinIcon size={15} />
                    ) : seg.kind === 'spins' ? (
                      <RefreshCw
                        className="h-3.5 w-3.5"
                        style={{ color: seg.text }}
                        strokeWidth={2.75}
                      />
                    ) : (
                      <ArrowUpCircle
                        className="h-4 w-4"
                        style={{ color: seg.text }}
                        strokeWidth={2.5}
                      />
                    )}
                  </span>
                  <span
                    className="text-[9px] font-black tracking-wide"
                    style={{
                      color: seg.text,
                      transform: `rotate(${-angle}deg)`,
                      textShadow: '0 1px 0 rgba(0,0,0,0.65), 0 0 6px rgba(0,0,0,0.35)',
                    }}
                  >
                    {seg.face}
                  </span>
                </span>
              );
            })}

            <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#f0b232] bg-[#14151a] shadow-[0_3px_0_#8a6814,inset_0_1px_0_rgba(255,255,255,0.12)]">
              <img
                src={DAILY_SPIN_ICON}
                alt=""
                draggable={false}
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-5 min-h-[3.25rem] text-center">
          {prize ? (
            <div className="inline-flex flex-col items-center gap-1 rounded-2xl border-[2.5px] border-[#f0b232]/70 bg-[#2a2414] px-4 py-2.5 shadow-[0_3px_0_#8a6814]">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#f0b232]">
                You won
              </p>
              <p className="flex items-center gap-1.5 text-lg font-black text-[#ffe08a]">
                {prize.kind === 'coins' ? (
                  <>
                    <CoinIcon size={20} />
                    {prize.label}
                  </>
                ) : prize.kind === 'spins' ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    {prize.label}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {prize.label}
                  </>
                )}
              </p>
            </div>
          ) : (
            <p className="text-xs font-semibold text-[#6d6f78]">
              {spinning
                ? 'Spinning…'
                : dailyReady
                  ? 'Hit spin for your daily prize'
                  : freeSpins > 0
                    ? `Use a banked free spin · ${freeSpins} ready`
                    : `Next daily spin in ${formatSpinCountdown(remainingMs)}`}
            </p>
          )}
          {error && <p className="mt-1 text-xs font-bold text-[#ed4245]">{error}</p>}
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning || !available}
          className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] py-3 text-sm font-black transition-all ${
            spinning || !available
              ? 'cursor-not-allowed border-[#3f4147] bg-[#2b2d31] text-[#5c5e66] shadow-[0_3px_0_#1a1b1f]'
              : 'border-white/30 bg-[#f0b232] text-[#1a1200] shadow-[0_5px_0_#8a6814] hover:translate-y-[1px] hover:bg-[#d99b2b] hover:shadow-[0_4px_0_#8a6814]'
          }`}
        >
          <img src={DAILY_SPIN_ICON} alt="" className="h-5 w-5 object-contain" draggable={false} />
          {spinning
            ? 'Spinning…'
            : dailyReady
              ? 'Spin'
              : freeSpins > 0
                ? `Use free spin (${freeSpins})`
                : `Wait ${formatSpinCountdown(remainingMs)}`}
        </button>

        <p className="relative mt-3 text-center text-[10px] font-semibold text-[#5c5e66]">
          Free spins banked · {freeSpins} · Upgrades · {profile.freeUpgradeCredits ?? 0}
        </p>
      </motion.div>
    </motion.div>
  );
}
