import type { BotDifficulty } from '../types';

export type StakeOutcome = 'win' | 'loss' | 'draw';

export interface BotStakeRules {
  min: number;
  max: number;
  /** Winner receives this many coins per coin staked (high risk / high reward). */
  winMult: number;
  blurb: string;
}

/** Required mins + payout curve per AI difficulty. */
export const BOT_STAKE_RULES: Record<BotDifficulty, BotStakeRules> = {
  beginner: {
    min: 100,
    max: 2_500,
    winMult: 1,
    blurb: 'Low risk · even money',
  },
  pro: {
    min: 1_000,
    max: 12_000,
    winMult: 1.75,
    blurb: 'Min 1,000 · 1.75× payout',
  },
  expert: {
    min: 3_000,
    max: 30_000,
    winMult: 2.5,
    blurb: 'Min 3,000 · 2.5× payout',
  },
};

export const DUEL_STAKE_PRESETS = [0, 250, 500, 1_000, 2_500, 5_000, 10_000] as const;
export const DUEL_STAKE_MAX = 50_000;

export function clampBotStake(difficulty: BotDifficulty, amount: number): number {
  const rules = BOT_STAKE_RULES[difficulty];
  const n = Math.floor(Number(amount) || 0);
  return Math.max(rules.min, Math.min(rules.max, n));
}

export function clampDuelStake(amount: number): number {
  const n = Math.floor(Number(amount) || 0);
  return Math.max(0, Math.min(DUEL_STAKE_MAX, n));
}

/** Matched pot size when both players put coins on the line. */
export function matchedDuelStake(yourStake: number, opponentStake: number): number {
  const a = clampDuelStake(yourStake);
  const b = clampDuelStake(opponentStake);
  if (a <= 0 || b <= 0) return 0;
  return Math.min(a, b);
}

export function botWinPayout(stake: number, difficulty: BotDifficulty): number {
  const rules = BOT_STAKE_RULES[difficulty];
  const s = clampBotStake(difficulty, stake);
  return Math.max(0, Math.round(s * rules.winMult));
}

/** Net coin delta after a bot stake is resolved (escrow already deducted). */
export function settleBotStakeDelta(
  stake: number,
  difficulty: BotDifficulty,
  outcome: StakeOutcome,
): { delta: number; label: string } {
  const s = clampBotStake(difficulty, stake);
  if (outcome === 'draw') {
    return { delta: s, label: 'Stake returned' };
  }
  if (outcome === 'win') {
    const payout = botWinPayout(s, difficulty);
    return { delta: s + payout, label: `Won +${payout.toLocaleString()}` };
  }
  return { delta: 0, label: `Lost −${s.toLocaleString()}` };
}

/**
 * Net coin delta after a duel stake is resolved (your escrow already deducted).
 * Winner takes the matched pot; loser forfeits; draw returns escrow.
 */
export function settleDuelStakeDelta(
  yourStake: number,
  opponentStake: number,
  outcome: StakeOutcome,
): { delta: number; matched: number; label: string } {
  const yours = clampDuelStake(yourStake);
  const matched = matchedDuelStake(yours, opponentStake);
  const refundUnmatched = Math.max(0, yours - matched);

  if (matched <= 0) {
    return { delta: yours, matched: 0, label: 'No stake' };
  }
  if (outcome === 'draw') {
    return { delta: yours, matched, label: 'Stakes returned' };
  }
  if (outcome === 'win') {
    return {
      delta: refundUnmatched + matched * 2,
      matched,
      label: `Won +${matched.toLocaleString()}`,
    };
  }
  return {
    delta: refundUnmatched,
    matched,
    label: `Lost −${matched.toLocaleString()}`,
  };
}

export function formatCoins(n: number): string {
  return Math.floor(n).toLocaleString();
}
