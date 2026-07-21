import { useCallback, useEffect, useRef, useState } from 'react';
import type { Sport } from '../types';
import type { CharacterId } from '../types/profile';
import {
  duelWsUrl,
  type DuelLobbyState,
  type DuelMatchResult,
  type DuelMatchStart,
  type DuelServerMessage,
} from '../lib/duelTypes';

export type DuelConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface UseDuelOptions {
  playerName: string;
  characterId: CharacterId;
  sport: Sport;
}

export function useDuel({ playerName, characterId, sport }: UseDuelOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const youIdRef = useRef<string>('');
  const [status, setStatus] = useState<DuelConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lobby, setLobby] = useState<DuelLobbyState | null>(null);
  const [match, setMatch] = useState<DuelMatchStart | null>(null);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentFinished, setOpponentFinished] = useState(false);
  const [duelResult, setDuelResult] = useState<DuelMatchResult | null>(null);

  const cleanupSocket = useCallback(() => {
    const ws = wsRef.current;
    wsRef.current = null;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      try {
        ws.close();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const send = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(payload));
    return true;
  }, []);

  const handleMessage = useCallback((raw: MessageEvent) => {
    let msg: DuelServerMessage;
    try {
      msg = JSON.parse(String(raw.data));
    } catch {
      return;
    }

    if (msg.type === 'error') {
      setError(msg.message);
      return;
    }

    if (msg.type === 'created' || msg.type === 'joined' || msg.type === 'lobby') {
      setError(null);
      if (msg.youId) youIdRef.current = msg.youId;
      setLobby({
        code: msg.code,
        sport: msg.sport,
        status: msg.status,
        hostId: msg.hostId,
        youId: msg.youId ?? youIdRef.current,
        players: msg.players,
      });
      if (msg.type === 'lobby' && msg.status === 'lobby') {
        setMatch(null);
        setDuelResult(null);
        setOpponentScore(0);
        setOpponentFinished(false);
      }
      return;
    }

    if (msg.type === 'start') {
      setError(null);
      setMatch({
        code: msg.code,
        sport: msg.sport,
        seed: msg.seed,
        players: msg.players,
      });
      setOpponentScore(0);
      setOpponentFinished(false);
      setDuelResult(null);
      setLobby(prev =>
        prev
          ? { ...prev, status: 'playing', sport: msg.sport, players: msg.players }
          : prev,
      );
      return;
    }

    if (msg.type === 'opponent_score') {
      setOpponentScore(msg.score);
      return;
    }

    if (msg.type === 'opponent_finished') {
      setOpponentScore(msg.score);
      setOpponentFinished(true);
      return;
    }

    if (msg.type === 'result') {
      setDuelResult(msg);
      setLobby(prev => (prev ? { ...prev, status: 'finished' } : prev));
      return;
    }

    if (msg.type === 'opponent_left') {
      setError('Opponent left the lobby');
      setLobby(prev =>
        prev
          ? {
              ...prev,
              hostId: msg.hostId,
              players: msg.players,
              status: 'lobby',
            }
          : prev,
      );
      setMatch(null);
      setOpponentFinished(false);
      setOpponentScore(0);
      return;
    }

    if (msg.type === 'left') {
      setLobby(null);
      setMatch(null);
      setDuelResult(null);
      setStatus('idle');
      youIdRef.current = '';
    }
  }, []);

  const connect = useCallback((): Promise<WebSocket> => {
    cleanupSocket();
    setStatus('connecting');
    setError(null);

    return new Promise((resolve, reject) => {
      const ws = new WebSocket(duelWsUrl());
      wsRef.current = ws;

      const onOpen = () => {
        setStatus('connected');
        resolve(ws);
      };
      const onError = () => {
        setStatus('error');
        setError('Could not reach the live duel server. Check your connection and try again.');
        reject(new Error('connect failed'));
      };

      ws.addEventListener('open', onOpen, { once: true });
      ws.addEventListener('error', onError, { once: true });
      ws.addEventListener('message', handleMessage);
      ws.addEventListener('close', () => {
        setStatus(s => (s === 'connecting' ? 'error' : 'idle'));
        wsRef.current = null;
      });
    });
  }, [cleanupSocket, handleMessage]);

  const createLobby = useCallback(async () => {
    try {
      const ws = await connect();
      ws.send(
        JSON.stringify({
          type: 'create',
          name: playerName,
          characterId,
          sport,
        }),
      );
    } catch {
      /* error state set in connect */
    }
  }, [connect, playerName, characterId, sport]);

  const joinLobby = useCallback(
    async (code: string) => {
      try {
        const ws = await connect();
        ws.send(
          JSON.stringify({
            type: 'join',
            code: code.toUpperCase().trim(),
            name: playerName,
            characterId,
          }),
        );
      } catch {
        /* error state set in connect */
      }
    },
    [connect, playerName, characterId],
  );

  const setReady = useCallback(
    (ready: boolean) => {
      send({ type: ready ? 'ready' : 'unready' });
    },
    [send],
  );

  const reportScore = useCallback(
    (score: number) => {
      send({ type: 'score', score });
    },
    [send],
  );

  const reportFinish = useCallback(
    (payload: { score: number; correct: number; wrong: number; maxStreak: number }) => {
      send({ type: 'finish', ...payload });
    },
    [send],
  );

  const setWager = useCallback(
    (stake: {
      cardKey: string | null;
      cardName?: string | null;
      cardRarity?: string | null;
      cardRating?: number | null;
    }) => {
      send({
        type: 'wager',
        cardKey: stake.cardKey,
        cardName: stake.cardName ?? null,
        cardRarity: stake.cardRarity ?? null,
        cardRating: stake.cardRating ?? null,
      });
    },
    [send],
  );

  const requestRematch = useCallback(() => {
    send({ type: 'rematch' });
    setDuelResult(null);
    setMatch(null);
    setOpponentScore(0);
    setOpponentFinished(false);
  }, [send]);

  const leaveLobby = useCallback(() => {
    send({ type: 'leave' });
    cleanupSocket();
    setLobby(null);
    setMatch(null);
    setDuelResult(null);
    setOpponentScore(0);
    setOpponentFinished(false);
    setStatus('idle');
    setError(null);
  }, [send, cleanupSocket]);

  useEffect(() => () => cleanupSocket(), [cleanupSocket]);

  const you = lobby?.players.find(p => p.id === lobby.youId) ?? null;
  const opponent = lobby?.players.find(p => p.id !== lobby.youId) ?? null;

  return {
    status,
    error,
    lobby,
    match,
    you,
    opponent,
    opponentScore,
    opponentFinished,
    duelResult,
    createLobby,
    joinLobby,
    setReady,
    reportScore,
    reportFinish,
    setWager,
    requestRematch,
    leaveLobby,
    clearError: () => setError(null),
  };
}
