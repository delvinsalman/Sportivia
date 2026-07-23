import type { BotDifficulty } from '../types';

export type StakeOutcome = 'win' | 'loss' | 'draw';

export interface BotStakeRules {
  min: number;
  max: number;
  /** Winner receives this many coins per coin staked (high risk / high reward). */
  winMult: number;
  blurb: string;
}

/** Optional mins when staking + payout curve per AI difficulty. */
export const BOT_STAKE_RULES: Record<BotDifficulty, BotStakeRules> = {
  beginner: {
    min: 100,
    max: 2_500,
    winMult: 1,
    blurb: 'Optional · even money if you stake',
  },
  pro: {
    min: 1_000,
    max: 12_000,
    winMult: 1.75,
    blurb: 'Optional · stake 1,000+ for 1.75×',
  },
  expert: {
    min: 3_000,
    max: 30_000,
    winMult: 2.5,
    blurb: 'Optional · stake 3,000+ for 2.5×',
  },
};

export const DUEL_STAKE_PRESETS = [0, 250, 500, 1_000, 2_500, 5_000, 10_000] as const;
export const DUEL_STAKE_MAX = 50_000;

/** 0 = no stake; otherwise clamp into the difficulty band. */
export function clampBotStake(difficulty: BotDifficulty, amount: number): number {
  const rules = BOT_STAKE_RULES[difficulty];
  const n = Math.floor(Number(amount) || 0);
  if (n <= 0) return 0;
  return Math.max(rules.min, Math.min(rules.max, n));
}

export function clampDuelStake(amount: number): number {
  const n = Math.floor(Number(amount) || 0);
  return Math.max(0, Math.min(DUEL_STAKE_MAX, n));
}

export function botWinPayout(stake: number, difficulty: BotDifficulty): number {
  const rules = BOT_STAKE_RULES[difficulty];
  const s = clampBotStake(difficulty, stake);
  if (s <= 0) return 0;
  return Math.max(0, Math.round(s * rules.winMult));
}

/** Net coin delta after a bot stake is resolved (escrow already deducted). */
export function settleBotStakeDelta(
  stake: number,
  difficulty: BotDifficulty,
  outcome: StakeOutcome,
): { delta: number; label: string } {
  const s = clampBotStake(difficulty, stake);
  if (s <= 0) {
    return { delta: 0, label: 'No stake' };
  }
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
 * Winner keeps their stake and takes the opponent's full stake; loser forfeits;
 * draw returns your escrow. Works when only one side put coins up.
 */
export function settleDuelStakeDelta(
  yourStake: number,
  opponentStake: number,
  outcome: StakeOutcome,
): { delta: number; pot: number; label: string } {
  const yours = clampDuelStake(yourStake);
  const opp = clampDuelStake(opponentStake);
  const pot = yours + opp;

  if (pot <= 0) {
    return { delta: 0, pot: 0, label: 'No stake' };
  }
  if (outcome === 'draw') {
    return {
      delta: yours,
      pot,
      label: yours > 0 ? 'Stake returned' : 'No stake',
    };
  }
  if (outcome === 'win') {
    return {
      delta: yours + opp,
      pot,
      label:
        opp > 0
          ? `Won +${opp.toLocaleString()}`
          : yours > 0
            ? 'Stake kept'
            : 'No stake',
    };
  }
  return {
    delta: 0,
    pot,
    label: yours > 0 ? `Lost −${yours.toLocaleString()}` : 'No stake',
  };
}

export function formatCoins(n: number): string {
  return Math.floor(n).toLocaleString();
}
