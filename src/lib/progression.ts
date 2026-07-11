import type { GameMode, GameResult, GameEndReason } from '../types';
import type { GameRewards } from '../types/profile';

export function isRunComplete(_mode: GameMode, reason: GameEndReason): boolean {
  if (reason === 'abandoned' || reason === 'pool_empty') return false;
  return reason === 'timer';
}

export function earnsProgression(mode: GameMode): boolean {
  return mode === 'daily' || mode === 'timed' || mode === 'duel';
}

/** Total XP required to reach a given level (level 1 = 0). */
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += xpToNextLevel(l);
  }
  return total;
}

export function xpToNextLevel(level: number): number {
  return 100 + (level - 1) * 50;
}

export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) level++;
  return level;
}

export function xpProgress(xp: number): { level: number; current: number; needed: number; pct: number } {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const current = xp - floor;
  const needed = ceiling - floor;
  return { level, current, needed, pct: needed > 0 ? Math.min(100, (current / needed) * 100) : 100 };
}

export function computeGameRewards(result: GameResult): GameRewards {
  let coins = Math.floor(result.score / 5) + result.correct * 3;
  let xp = result.correct * 12 + Math.floor(result.score / 8);

  if (result.mode === 'daily') {
    coins += 40;
    xp += 30;
  }
  if (result.mode === 'timed') {
    coins += 25;
    xp += 20;
  }
  if (result.mode === 'duel') {
    coins += 35;
    xp += 25;
  }
  if (result.perfectBoard) {
    coins += 100;
    xp += 80;
  }
  if (result.correct >= 5) {
    coins += 15;
  }

  coins = Math.max(10, coins);
  xp = Math.max(15, xp);

  return {
    coinsEarned: coins,
    xpEarned: xp,
    leveledUp: false,
    previousLevel: 1,
    newLevel: 1,
  };
}

export function applyRewards(
  coins: number,
  xp: number,
  rewards: Omit<GameRewards, 'leveledUp' | 'previousLevel' | 'newLevel'>,
): { coins: number; xp: number; rewards: GameRewards } {
  const previousLevel = levelFromXp(xp);
  const newXp = xp + rewards.xpEarned;
  const newCoins = coins + rewards.coinsEarned;
  const newLevel = levelFromXp(newXp);

  return {
    coins: newCoins,
    xp: newXp,
    rewards: {
      ...rewards,
      leveledUp: newLevel > previousLevel,
      previousLevel,
      newLevel,
    },
  };
}

export function modeXpHint(mode: GameMode): string {
  if (mode === 'daily') return '+ daily bonus';
  if (mode === 'timed') return '+ ranked bonus';
  if (mode === 'duel') return '+ duel bonus';
  return 'practice only';
}
