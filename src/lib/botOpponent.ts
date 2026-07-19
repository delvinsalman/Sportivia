import type { BotDifficulty } from '../types';

export interface BotDifficultyConfig {
  label: string;
  description: string;
  color: string;
  minDelayMs: number;
  maxDelayMs: number;
  accuracy: number;
  minPoints: number;
  maxPoints: number;
}

export const BOT_DIFFICULTIES: Record<BotDifficulty, BotDifficultyConfig> = {
  beginner: {
    label: 'Beginner',
    description: 'Steady answers · occasional mistakes',
    color: '#23a559',
    minDelayMs: 2_300,
    maxDelayMs: 3_000,
    accuracy: 0.72,
    minPoints: 2,
    maxPoints: 4,
  },
  pro: {
    label: 'Pro',
    description: 'Quick answers · competitive score',
    color: '#5865f2',
    minDelayMs: 1_850,
    maxDelayMs: 2_500,
    accuracy: 0.66,
    minPoints: 3,
    maxPoints: 5,
  },
  expert: {
    label: 'Expert',
    description: 'Fast answers · maximum pressure',
    color: '#ed4245',
    minDelayMs: 1_250,
    maxDelayMs: 1_750,
    accuracy: 0.8,
    minPoints: 3,
    maxPoints: 6,
  },
};

export function botName(difficulty: BotDifficulty): string {
  return `${BOT_DIFFICULTIES[difficulty].label} Bot`;
}

export function nextBotDelay(difficulty: BotDifficulty, random = Math.random): number {
  const config = BOT_DIFFICULTIES[difficulty];
  return Math.round(config.minDelayMs + random() * (config.maxDelayMs - config.minDelayMs));
}

export function rollBotPoints(
  difficulty: BotDifficulty,
  random = Math.random,
  forceScore = false,
): number {
  const config = BOT_DIFFICULTIES[difficulty];
  if (!forceScore && random() > config.accuracy) return 0;
  return Math.round(config.minPoints + random() * (config.maxPoints - config.minPoints));
}
