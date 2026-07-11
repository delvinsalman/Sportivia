import type { GameStats, PlayerStats, Sport, GameResult } from '../types';

const STORAGE_KEY = 'gridiq-v3';

const defaultStats = (): GameStats => ({
  gamesPlayed: 0,
  bestScore: 0,
  totalCorrect: 0,
  dailyStreak: 0,
  lastDailyDate: null,
  dailyCompleted: [],
  perfectBoards: 0,
});

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { soccer: defaultStats(), basketball: defaultStats(), baseball: defaultStats() };
    const parsed = JSON.parse(raw) as PlayerStats;
    return {
      soccer: { ...defaultStats(), ...parsed.soccer },
      basketball: { ...defaultStats(), ...parsed.basketball },
      baseball: { ...defaultStats(), ...parsed.baseball },
    };
  } catch {
    return { soccer: defaultStats(), basketball: defaultStats(), baseball: defaultStats() };
  }
}

export function saveStats(stats: PlayerStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordGameResult(sport: Sport, result: GameResult): PlayerStats {
  const all = loadStats();
  const stats = all[sport];
  const today = result.date;

  stats.gamesPlayed += 1;
  stats.bestScore = Math.max(stats.bestScore, result.score);
  stats.totalCorrect += result.correct;
  if (result.perfectBoard) stats.perfectBoards += 1;

  if (result.mode === 'daily' && result.completed) {
    if (!stats.dailyCompleted.includes(today)) {
      stats.dailyCompleted.push(today);
      if (stats.lastDailyDate) {
        const diff = Math.round((new Date(today).getTime() - new Date(stats.lastDailyDate).getTime()) / 86400000);
        stats.dailyStreak = diff === 1 ? stats.dailyStreak + 1 : 1;
      } else {
        stats.dailyStreak = 1;
      }
      stats.lastDailyDate = today;
    }
  }

  all[sport] = stats;
  saveStats(all);
  return all;
}
