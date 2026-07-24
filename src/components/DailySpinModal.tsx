import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpCircle, Sparkles, X } from 'lucide-react';
import type { PlayerProfile } from '../types/profile';
import {
  DAILY_SPIN_ICON,
  DAILY_SPIN_SEGMENTS,
  dailySpinMsRemaining,
  formatSpinCountdown,
  segmentIndex,
  spinDegreesForIndex,
  type DailySpinPrize,
} from '../lib/dailySpin';
import { claimDailySpin, isDailySpinAvailable } from '../lib/profileStorage';
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

export function DailySpinModal({ profile, onClose, onClaimed }: DailySpinModalProps) {
  const available = isDailySpinAvailable(profile);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prize, setPrize] = useState<DailySpinPrize | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState(() =>
    dailySpinMsRemaining(profile.dailySpinAt),
  );
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const wheelBg = useMemo(() => {
    const n = DAILY_SPIN_SEGMENTS.length;
    const slice = 100 / n;
    const stops = DAILY_SPIN_SEGMENTS.map((seg, i) => {
      const start = i * slice;
      const end = (i + 1) * slice;
      return `${seg.color} ${start}% ${end}%`;
    });
    // from 0deg = 12 o'clock — must match spinDegreesForIndex + label angles
    return `conic-gradient(from 0deg, ${stops.join(', ')})`;
  }, []);

  useEffect(() => {
    setRemainingMs(dailySpinMsRemaining(profile.dailySpinAt));
    if (isDailySpinAvailable(profile)) return;
    const id = window.setInterval(() => {
      setRemainingMs(dailySpinMsRemaining(profile.dailySpinAt));
    }, 1000);
    return () => window.clearInterval(id);
  }, [profile.dailySpinAt, profile]);

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
        <button
          type="button"
          onClick={dismiss}
          disabled={spinning}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] text-[#b5bac1] hover:text-[#f2f3f5] disabled:opacity-40"
          aria-label="Close"
        >
          <X className="h-4 w-4" strokeWidth={2.75} />
        </button>

        <div className="flex items-start gap-3 pr-10">
          <img
            src={DAILY_SPIN_ICON}
            alt=""
            draggable={false}
            className="mt-0.5 h-10 w-10 shrink-0 object-contain drop-shadow-md"
          />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f0b232]">
              Daily Spin
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#f2f3f5]">
              {available ? 'Ready to spin' : 'On cooldown'}
            </h2>
            <p className="mt-1 text-xs font-semibold text-[#949ba4]">
              Coins or free upgrades · next spin 24h.
            </p>
          </div>
        </div>

        <div className="relative mx-auto mt-5 flex w-[min(100%,18.5rem)] flex-col items-center">
          <div
            className="absolute -top-1 z-20 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#f0b232]"
            style={{ filter: 'drop-shadow(0 2px 0 #8a6814)' }}
            aria-hidden
          />
          <div
            className="relative aspect-square w-full rounded-full border-[4px] border-[#1e3a5f] shadow-[inset_0_0_0_6px_#0c0d0f,0_8px_0_#050506]"
            style={{
              background: wheelBg,
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.12, 1)`
                : 'none',
            }}
          >
            {DAILY_SPIN_SEGMENTS.map((seg, i) => {
              const slice = 360 / DAILY_SPIN_SEGMENTS.length;
              // Centers match conic slices: clockwise from 12 o'clock
              const angle = i * slice + slice / 2;
              return (
                <span
                  key={seg.id}
                  className="pointer-events-none absolute left-1/2 top-1/2 flex origin-center flex-col items-center gap-0.5"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-4.85rem)`,
                  }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-black/35 shadow-sm"
                    style={{ transform: `rotate(${-angle}deg)` }}
                  >
                    {seg.kind === 'coins' ? (
                      <CoinIcon size={16} />
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
                      textShadow: '0 1px 0 rgba(0,0,0,0.55)',
                    }}
                  >
                    {seg.face}
                  </span>
                </span>
              );
            })}
            <div className="absolute left-1/2 top-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#f0b232] bg-[#14151a] shadow-[0_3px_0_#8a6814]">
              <img
                src={DAILY_SPIN_ICON}
                alt=""
                draggable={false}
                className="h-8 w-8 object-contain"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 min-h-[3.25rem] text-center">
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
                : available
                  ? 'Hit spin for your prize'
                  : `Next spin in ${formatSpinCountdown(remainingMs)}`}
            </p>
          )}
          {error && <p className="mt-1 text-xs font-bold text-[#ed4245]">{error}</p>}
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning || !available}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-[3px] py-3 text-sm font-black transition-all ${
            spinning || !available
              ? 'cursor-not-allowed border-[#3f4147] bg-[#2b2d31] text-[#5c5e66]'
              : 'border-white/30 bg-[#f0b232] text-[#1a1200] shadow-[0_5px_0_#8a6814] hover:translate-y-[1px] hover:bg-[#d99b2b] hover:shadow-[0_4px_0_#8a6814]'
          }`}
        >
          <img src={DAILY_SPIN_ICON} alt="" className="h-5 w-5 object-contain" draggable={false} />
          {spinning
            ? 'Spinning…'
            : available
              ? 'Spin'
              : `Wait ${formatSpinCountdown(remainingMs)}`}
        </button>

        <p className="mt-3 text-center text-[10px] font-semibold text-[#5c5e66]">
          Free upgrades bank on Cards · {profile.freeUpgradeCredits ?? 0} ready
        </p>
      </motion.div>
    </motion.div>
  );
}
