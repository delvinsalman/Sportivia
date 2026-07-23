import { useMemo, useState } from 'react';
import { ArrowLeft, Swords } from 'lucide-react';
import type { BotDifficulty, Sport } from '../types';
import type { PlayerProfile } from '../types/profile';
import { SportBackground } from './SportBackground';
import { HomeCoinMeter } from './LevelBar';
import { CoinIcon } from './CoinIcon';
import { BOT_DIFFICULTIES } from '../lib/botOpponent';
import {
  BOT_STAKE_RULES,
  botWinPayout,
  clampBotStake,
  formatCoins,
} from '../lib/coinStake';
import { playMenuBack, playMenuClick, playMenuConfirm } from '../lib/menuAudio';

interface CoinStakeScreenProps {
  sport: Sport;
  difficulty: BotDifficulty;
  profile: PlayerProfile;
  onBack: () => void;
  onConfirm: (stake: number) => void;
}

export function CoinStakeScreen({
  sport,
  difficulty,
  profile,
  onBack,
  onConfirm,
}: CoinStakeScreenProps) {
  const rules = BOT_STAKE_RULES[difficulty];
  const config = BOT_DIFFICULTIES[difficulty];
  const maxAffordable = Math.min(rules.max, profile.coins);

  const presets = useMemo(() => {
    const base = [0, rules.min, Math.round(rules.min * 2), Math.round(rules.min * 4), rules.max];
    return [...new Set(base.map(n => (n <= 0 ? 0 : clampBotStake(difficulty, n))))].filter(
      n => n === 0 || n <= Math.max(maxAffordable, rules.min),
    );
  }, [difficulty, maxAffordable, rules.max, rules.min]);

  const [stake, setStake] = useState(0);

  const liveStake = clampBotStake(difficulty, stake);
  const payout = botWinPayout(liveStake, difficulty);
  const staking = liveStake > 0;
  const overBalance = liveStake > profile.coins;
  const belowMin = stake > 0 && stake < rules.min;
  const canConfirm = !overBalance && !belowMin && (liveStake === 0 || liveStake <= profile.coins);

  return (
    <div className="relative h-svh overflow-hidden">
      <SportBackground sport={sport} />
      <div className="relative z-10 flex h-svh flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 sm:px-5">
          <button
            type="button"
            onClick={() => {
              playMenuBack();
              onBack();
            }}
            className="flex items-center gap-1.5 rounded-full border-[2.5px] border-[#3f4147] bg-[#1e1f22] px-2.5 py-1.5 text-xs font-black text-[#b5bac1] shadow-[0_3px_0_#1a1b1f]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <HomeCoinMeter coins={profile.coins} />
        </header>

        <div className="flex min-h-0 flex-1 items-center justify-center px-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-5">
          <div className="w-full max-w-md rounded-[28px] border-[3px] border-[#3f4147] bg-[#121316]/95 p-5 shadow-[0_8px_0_#0a0a0b] backdrop-blur-md sm:p-6">
            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border-[3px] border-white/15 shadow-[0_3px_0_rgba(0,0,0,0.35)]"
                style={{ background: `${config.color}33` }}
              >
                <Swords className="h-5 w-5" style={{ color: config.color }} />
              </div>
              <div>
                <p className="text-lg font-black text-[#f2f3f5]">Vs {config.label}</p>
                <p className="text-xs font-semibold text-[#949ba4]">{rules.blurb}</p>
              </div>
            </div>

            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#6d6f78]">
              Coin stake · optional
            </p>
            <p className="mt-1 text-sm font-semibold text-[#b5bac1]">
              {staking
                ? `Win +${formatCoins(payout)} · Lose −${formatCoins(liveStake)}`
                : 'Play free, or put coins on the line for extra reward.'}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {presets.map(amount => {
                const active = liveStake === amount;
                const lockedOut = amount > 0 && amount > profile.coins;
                return (
                  <button
                    key={amount}
                    type="button"
                    disabled={lockedOut}
                    onClick={() => {
                      playMenuClick();
                      setStake(amount);
                    }}
                    className={`rounded-2xl border-[2.5px] px-3 py-3 text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-35 ${
                      active
                        ? 'border-[#f0b232]/80 bg-[#2a2414] text-[#f0b232] shadow-[0_3px_0_#8a6814]'
                        : 'border-[#3f4147] bg-[#1e1f22] text-[#949ba4] hover:text-[#f2f3f5]'
                    }`}
                  >
                    {amount === 0 ? 'No stake' : formatCoins(amount)}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border-[2.5px] border-[#3f4147] bg-[#151619] px-4 py-3">
              <CoinIcon size={22} />
              <input
                type="number"
                min={0}
                max={maxAffordable}
                step={50}
                value={stake}
                onChange={e => setStake(Number(e.target.value) || 0)}
                placeholder="Custom"
                className="w-full bg-transparent text-center font-mono text-xl font-black text-[#f0b232] outline-none"
              />
            </div>
            {staking && (
              <p className="mt-1.5 text-center text-[10px] font-bold text-[#6d6f78]">
                Custom stakes snap to at least {formatCoins(rules.min)} for {config.label}
              </p>
            )}

            {(belowMin || overBalance) && (
              <p className="mt-3 text-center text-xs font-black text-[#ed4245]">
                {overBalance
                  ? 'Stake is higher than your balance.'
                  : `If you stake, minimum is ${formatCoins(rules.min)}.`}
              </p>
            )}

            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => {
                if (!canConfirm) return;
                playMenuConfirm();
                onConfirm(liveStake);
              }}
              className="mt-5 w-full rounded-2xl border-[3px] border-white/25 py-3.5 text-sm font-black text-white shadow-[0_5px_0_#2f3aa8] transition-all hover:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-40"
              style={{ background: config.color }}
            >
              {staking
                ? `Lock ${formatCoins(liveStake)} · Challenge ${config.label}`
                : `Play ${config.label} · no stake`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
