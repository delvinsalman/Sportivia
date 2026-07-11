import type { Sport } from '../types';
import type { CharacterId } from '../types/profile';

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
}

export interface JoinDuelPayload {
  code: string;
  name: string;
  characterId: CharacterId;
}

export function duelWsUrl(): string {
  const env = import.meta.env.VITE_DUEL_WS as string | undefined;
  if (env) return env;

  // Same-origin /duel — Vite proxies in dev; production server hosts both
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${proto}://${window.location.host}/duel`;
}
