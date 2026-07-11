import type { PlayerProfile } from '../types/profile';
import { xpProgress } from '../lib/progression';

interface LevelBarProps {
  profile: PlayerProfile;
  accent?: string;
  compact?: boolean;
}

export function LevelBar({ profile, accent = '#5865f2', compact = false }: LevelBarProps) {
  const { level, current, needed, pct } = xpProgress(profile.xp);
  const remaining = Math.max(0, needed - current);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#949ba4]">Lv</span>
        <span className="text-sm font-black text-[#f2f3f5] font-mono">{level}</span>
        <div className="w-16 h-2 rounded-full bg-[#2b2d31] border-2 border-[#3f4147] overflow-hidden shadow-[0_2px_0_#1a1b1f]">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: accent }} />
        </div>
        <span className="text-[9px] font-black text-[#949ba4] font-mono">{current}/{needed}</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 gap-3">
        <span className="text-xs font-black text-[#f2f3f5]">
          Level <span className="font-mono" style={{ color: accent }}>{level}</span>
        </span>
        <span className="text-[10px] text-[#949ba4] font-mono font-bold">
          {current}/{needed} XP
          <span className="text-[#5c5e66]"> · </span>
          {remaining} to go
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-[#2b2d31] border-2 border-[#3f4147] overflow-hidden shadow-[0_2px_0_#1a1b1f]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
        />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[9px] font-black uppercase tracking-wider text-[#5c5e66]">
          {Math.round(pct)}%
        </span>
        <span className="text-[9px] font-black uppercase tracking-wider text-[#5c5e66]">
          Next · Lv {level + 1}
        </span>
      </div>
    </div>
  );
}

interface CoinBadgeProps {
  coins: number;
  onClick?: () => void;
}

export function CoinBadge({ coins, onClick }: CoinBadgeProps) {
  const inner = (
    <>
      <span className="text-sm leading-none">🪙</span>
      <span className="text-xs font-black text-[#f0b232] font-mono">{coins}</span>
    </>
  );

  const chipClass =
    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#1e1f22] border-[2.5px] border-[#f0b232]/70 shadow-[0_3px_0_#8a6814] backdrop-blur-md transition-all';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${chipClass} hover:translate-y-[1px] hover:shadow-[0_2px_0_#8a6814]`}
      >
        {inner}
      </button>
    );
  }

  return <div className={chipClass}>{inner}</div>;
}

export function HeaderStats({ profile }: { profile: PlayerProfile }) {
  return (
    <div className="flex items-center gap-1.5">
      <CoinBadge coins={profile.coins} />
    </div>
  );
}

interface LevelCornerProps {
  profile: PlayerProfile;
  accent?: string;
}

export function LevelCorner({ profile, accent = '#5865f2' }: LevelCornerProps) {
  const { level, current, needed, pct } = xpProgress(profile.xp);
  const remaining = Math.max(0, needed - current);

  return (
    <div className="w-[168px] sm:w-[196px] flex flex-col gap-1.5 px-3 py-2.5 rounded-2xl bg-[#1e1f22]/95 border-[3px] border-[#3f4147] shadow-[0_5px_0_#0c0d0f] backdrop-blur-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#949ba4]">Level</span>
          <span className="text-sm font-black text-[#f2f3f5] font-mono" style={{ color: accent }}>
            {level}
          </span>
          <span className="text-[10px] font-black text-[#5c5e66]">→ {level + 1}</span>
        </div>
        <span className="text-[10px] font-black text-[#949ba4] font-mono tabular-nums">
          {current}/{needed}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-[#2b2d31] overflow-hidden border-2 border-[#3f4147]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-wider text-[#5c5e66]">
          {Math.round(pct)}%
        </span>
        <span className="text-[9px] font-black uppercase tracking-wider text-[#949ba4]">
          {remaining} XP to go
        </span>
      </div>
    </div>
  );
}
