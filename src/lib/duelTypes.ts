import type { Sport } from '../types';
import type { CharacterId } from '../types/profile';
import type { CharacterStatLevels } from './characterCards';

export type DuelRoomStatus = 'lobby' | 'playing' | 'finished';

export interface DuelPlayerInfo {
  id: string;
  name: string;
  characterId: string;
  ready: boolean;
  score: number;
  finished: boolean;
  correct: number;
  wrong: number;
  maxStreak: number;
  wagerDecided?: boolean;
  /** Coins put on the line (0 = no stake). */
  wagerCoins?: number;
  /** Per-stat upgrade levels for the equipped skin card. */
  cardLevels?: CharacterStatLevels;
}

export interface DuelLobbyState {
  code: string;
  sport: Sport;
  status: DuelRoomStatus;
  hostId: string;
  youId: string;
  players: DuelPlayerInfo[];
}

export interface DuelMatchStart {
  code: string;
  sport: Sport;
  seed: string;
  players: DuelPlayerInfo[];
}

export interface DuelMatchResult {
  winnerId: string | 'draw';
  you: {
    id: string;
    name: string;
    score: number;
    correct: number;
    wrong: number;
    maxStreak: number;
  };
  opponent: {
    id: string;
    name: string;
    score: number;
    correct: number;
    wrong: number;
    maxStreak: number;
  };
  /** Opponent disconnected mid-match — you win by default. */
  disconnected?: boolean;
  wager?: {
    yourCoins: number;
    opponentCoins: number;
  };
}

export type DuelServerMessage =
  | ({ type: 'created' | 'joined' | 'lobby' } & DuelLobbyState & { youId?: string })
  | { type: 'start' } & DuelMatchStart
  | { type: 'opponent_score'; playerId: string; score: number }
  | {
      type: 'opponent_finished';
      playerId: string;
      score: number;
      correct: number;
      wrong: number;
      maxStreak: number;
    }
  | { type: 'result' } & DuelMatchResult
  | { type: 'opponent_left'; players: DuelPlayerInfo[]; hostId: string }
  | { type: 'left' }
  | { type: 'error'; message: string };

export interface CreateDuelPayload {
  name: string;
  characterId: CharacterId;
  sport: Sport;
  cardLevels?: CharacterStatLevels;
}

export interface JoinDuelPayload {
  code: string;
  name: string;
  characterId: CharacterId;
  cardLevels?: CharacterStatLevels;
}

export function duelWsUrl(): string {
  const env = import.meta.env.VITE_DUEL_WS as string | undefined;
  if (env) return env;

  // Same-origin /duel — Vite proxies in dev; production server hosts both
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/duel`;
}

/** Presence channel for live player count (same host as duel server). */
export function liveWsUrl(): string {
  const duel = import.meta.env.VITE_DUEL_WS as string | undefined;
  if (duel) return duel.replace(/\/duel\/?$/, '/live');

  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/live`;
}

export function onlineApiUrl(): string {
  const duel = import.meta.env.VITE_DUEL_WS as string | undefined;
  if (duel) {
    try {
      const u = new URL(duel);
      u.protocol = u.protocol === 'wss:' ? 'https:' : 'http:';
      u.pathname = '/api/online';
      u.search = '';
      u.hash = '';
      return u.toString();
    } catch {
      /* fall through */
    }
  }
  return '/api/online';
}

export function presenceApiUrl(): string {
  const online = onlineApiUrl();
  return online.replace(/\/api\/online\/?$/, '/api/presence');
}
