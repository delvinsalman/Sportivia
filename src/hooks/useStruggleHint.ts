import { useEffect, useRef, useState } from 'react';
import type { BoardCell, Sport } from '../types';
import type { Feedback, GamePhase } from './useRoundGame';
import { getValidCellIndices } from '../lib/roundEngine';
import type { PlayerUnion } from '../data/categories';

/** Real-time cooldown after a hint so waiting can’t farm answers. */
const HINT_COOLDOWN_MS = 60_000;
/** Sit on a player this long before a hint can appear. */
const SIT_DELAY_MS = 6_000;

function isStruggling(opts: {
  wrongStreak: number;
  score: number;
  correct: number;
  wrong: number;
}): boolean {
  const { wrongStreak, score, correct, wrong } = opts;
  return (
    wrongStreak >= 3 ||
    (wrong >= 5 && score < 25) ||
    (correct === 0 && wrong >= 3)
  );
}

/**
 * Candy Crush–style struggle hint — rare, one at a time, long cooldown.
 */
export function useStruggleHint({
  sport,
  board,
  player,
  phase,
  feedback,
  boardKey,
  score,
  correct,
  wrong,
  wrongStreak,
  enabled = true,
}: {
  sport: Sport;
  board: BoardCell[];
  player: PlayerUnion | null;
  phase: GamePhase;
  feedback: Feedback;
  boardKey: number;
  roundTime: number;
  score: number;
  correct: number;
  wrong: number;
  wrongStreak: number;
  enabled?: boolean;
}): number | null {
  const [hintCell, setHintCell] = useState<number | null>(null);
  const lastHintAtRef = useRef(0);
  const hintedPlayerRef = useRef<string | null>(null);
  const boardRef = useRef(board);
  boardRef.current = board;
  const playerId = player?.id ?? null;

  useEffect(() => {
    setHintCell(null);

    if (!enabled || phase !== 'playing' || !player) return;
    if (feedback) return;
    if (hintedPlayerRef.current === player.id) return;
    if (Date.now() - lastHintAtRef.current < HINT_COOLDOWN_MS) return;
    if (!isStruggling({ wrongStreak, score, correct, wrong })) return;

    const timer = window.setTimeout(() => {
      if (Date.now() - lastHintAtRef.current < HINT_COOLDOWN_MS) return;
      const indices = getValidCellIndices(sport, boardRef.current, player);
      if (!indices.length) return;
      hintedPlayerRef.current = player.id;
      lastHintAtRef.current = Date.now();
      setHintCell(indices[Math.floor(Math.random() * indices.length)]!);
    }, SIT_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [
    enabled,
    phase,
    playerId,
    boardKey,
    feedback,
    wrongStreak,
    score,
    correct,
    wrong,
    sport,
    player,
  ]);

  if (feedback) return null;
  return hintCell;
}
