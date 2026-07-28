import type { Sport } from '../types';
import { loadStats } from './storage';
import { SPORTS } from './sportTheme';

const KEY = 'sportivia-preferred-sport-v1';

function isSport(v: unknown): v is Sport {
  return typeof v === 'string' && (SPORTS as readonly string[]).includes(v);
}

export function savePreferredSport(sport: Sport) {
  try {
    localStorage.setItem(KEY, sport);
  } catch {
    /* ignore quota */
  }
}

/** Saved home sport, or null if the player has never chosen one. */
export function loadPreferredSport(): Sport | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (isSport(raw)) return raw;
  } catch {
    /* ignore */
  }

  // Returning players from before this flag: keep their most-played sport
  try {
    const stats = loadStats();
    let best: Sport | null = null;
    let bestGames = 0;
    for (const s of SPORTS) {
      const n = stats[s]?.gamesPlayed ?? 0;
      if (n > bestGames) {
        bestGames = n;
        best = s;
      }
    }
    if (best && bestGames > 0) {
      savePreferredSport(best);
      return best;
    }
  } catch {
    /* ignore */
  }

  return null;
}
