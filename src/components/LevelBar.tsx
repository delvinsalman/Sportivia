import type { PlayerProfile } from '../types/profile';
import { xpProgress } from '../lib/progression';
import { useSettings } from '../hooks/useSettings';
import { Users } from 'lucide-react';

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
      <span className="font-mono text-xs font-bold text-[#f0b232]">{coins.toLocaleString()}</span>
    </>
  );

  const chipClass = 'game-chip game-chip-active';

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={chipClass}>
        {inner}
      </button>
    );
  }

  return <div className={chipClass}>{inner}</div>;
}

export function HeaderStats({
  profile,
  online,
}: {
  profile: PlayerProfile;
  online?: number | null;
}) {
  const { settings } = useSettings();
  const showOnline = settings.showOnlineCount;

  return (
    <div className="flex items-center gap-1.5">
      {showOnline && (
        <div className="game-chip" title="Players online right now">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full bg-[#23a559] opacity-60 ${
                typeof online === 'number' ? 'animate-ping' : ''
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                typeof online === 'number' ? 'bg-[#23a559]' : 'bg-[#5c5e66]'
              }`}
            />
          </span>
          <Users className="h-3.5 w-3.5" />
          <span className="min-w-[1ch] font-mono text-[11px] font-bold tabular-nums">
            {typeof online === 'number' ? online : '…'}
          </span>
        </div>
      )}
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
    <div className="game-panel flex w-[168px] flex-col gap-1.5 px-3 py-2.5 sm:w-[196px]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wide text-[#949ba4]">Level</span>
          <span className="font-mono text-sm font-extrabold" style={{ color: accent }}>
            {level}
          </span>
          <span className="text-[10px] font-bold text-[#5c5e66]">→ {level + 1}</span>
        </div>
        <span className="font-mono text-[10px] font-bold tabular-nums text-[#949ba4]">
          {current}/{needed}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/40">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)` }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold text-[#5c5e66]">{Math.round(pct)}%</span>
        <span className="text-[9px] font-bold text-[#949ba4]">{remaining} XP to go</span>
      </div>
    </div>
  );
}
