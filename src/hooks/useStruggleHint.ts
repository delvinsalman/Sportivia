import { useEffect, useState } from 'react';
import type { BoardCell, Sport } from '../types';
import type { Feedback, GamePhase } from './useRoundGame';
import { getValidCellIndices } from '../lib/roundEngine';
import type { PlayerUnion } from '../data/categories';

function isStruggling(opts: {
  wrongStreak: number;
  score: number;
  correct: number;
  wrong: number;
}): boolean {
  const { wrongStreak, score, correct, wrong } = opts;
  return (
    wrongStreak >= 2 ||
    (wrong >= 3 && score < 35) ||
    (correct === 0 && wrong >= 1) ||
    (score < 15 && wrong + correct >= 3)
  );
}

/**
 * Candy Crush–style struggle hint: after a natural delay, pulse one correct
 * cell when the player is stuck (slow + low score / consecutive misses).
 */
export function useStruggleHint({
  sport,
  board,
  player,
  phase,
  feedback,
  boardKey,
  roundTime,
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
  const playerId = player?.id ?? null;

  // Arm a delayed hint once per player when they're struggling.
  useEffect(() => {
    setHintCell(null);
    if (!enabled || phase !== 'playing' || !player || feedback) return;
    if (!isStruggling({ wrongStreak, score, correct, wrong })) return;

    // Quicker nudge after a bad miss streak; otherwise wait a beat.
    const delayMs = wrongStreak >= 3 ? 1_600 : 3_600;

    const timer = window.setTimeout(() => {
      const indices = getValidCellIndices(sport, board, player);
      if (!indices.length) return;
      setHintCell(indices[Math.floor(Math.random() * indices.length)]!);
    }, delayMs);

    return () => window.clearTimeout(timer);
    // Intentionally omit board/roundTime — restart only when the player / board cycle changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, phase, playerId, boardKey, feedback, wrongStreak, score, correct, wrong, sport]);

  // Clock almost out while struggling — show the hint right away.
  useEffect(() => {
    if (!enabled || phase !== 'playing' || !player || feedback || hintCell != null) return;
    if (roundTime > 3) return;
    if (!isStruggling({ wrongStreak, score, correct, wrong })) return;

    const indices = getValidCellIndices(sport, board, player);
    if (!indices.length) return;
    setHintCell(indices[Math.floor(Math.random() * indices.length)]!);
  }, [
    enabled,
    phase,
    player,
    feedback,
    hintCell,
    roundTime,
    wrongStreak,
    score,
    correct,
    wrong,
    sport,
    board,
  ]);

  if (feedback) return null;
  return hintCell;
}
