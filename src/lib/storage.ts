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

function getLocalToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Repair dates saved with UTC midnight rollover vs local calendar day. */
function normalizeDailyCompleted(dates: string[]): string[] {
  const localToday = getLocalToday();
  const utcToday = new Date().toISOString().slice(0, 10);
  const next = new Set(dates);
  if (localToday !== utcToday && next.has(utcToday) && !next.has(localToday)) {
    next.delete(utcToday);
    next.add(localToday);
  }
  return [...next];
}

function mergeSportStats(s?: Partial<GameStats>): GameStats {
  const base = defaultStats();
  const next = { ...base, ...s };
  const rawDates = Array.isArray(s?.dailyCompleted) ? s.dailyCompleted : [];
  next.dailyCompleted = normalizeDailyCompleted(rawDates);
  const utcToday = new Date().toISOString().slice(0, 10);
  if (next.lastDailyDate === utcToday && utcToday !== getLocalToday()) {
    next.lastDailyDate = getLocalToday();
  }
  return next;
}

export function loadStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { soccer: defaultStats(), basketball: defaultStats(), baseball: defaultStats() };
    const parsed = JSON.parse(raw) as PlayerStats;
    const next = {
      soccer: mergeSportStats(parsed.soccer),
      basketball: mergeSportStats(parsed.basketball),
      baseball: mergeSportStats(parsed.baseball),
    };
    // Persist UTC→local date repairs so Record stays correct after reload
    const changed = (['soccer', 'basketball', 'baseball'] as Sport[]).some(sp => {
      const before = JSON.stringify(parsed[sp]?.dailyCompleted ?? []);
      const after = JSON.stringify(next[sp].dailyCompleted);
      return before !== after;
    });
    if (changed) saveStats(next);
    return next;
  } catch {
    return { soccer: defaultStats(), basketball: defaultStats(), baseball: defaultStats() };
  }
}

export function saveStats(stats: PlayerStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function recordGameResult(sport: Sport, result: GameResult): PlayerStats {
  const all = loadStats();
  const stats = { ...all[sport], dailyCompleted: [...all[sport].dailyCompleted] };
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
  return {
    soccer: { ...all.soccer, dailyCompleted: [...all.soccer.dailyCompleted] },
    basketball: { ...all.basketball, dailyCompleted: [...all.basketball.dailyCompleted] },
    baseball: { ...all.baseball, dailyCompleted: [...all.baseball.dailyCompleted] },
  };
}
