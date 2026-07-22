import { useEffect, useRef, useState } from 'react';
import type { BoardCell, Sport } from '../types';
import type { Feedback, GamePhase } from './useRoundGame';
import { getValidCellIndices } from '../lib/roundEngine';
import type { PlayerUnion } from '../data/categories';

/** Real-time cooldown after a hint so players can't farm by waiting. */
const HINT_COOLDOWN_MS = 55_000;
/** How long you must sit on a player before a hint can arm. */
const SIT_DELAY_MS = 5_500;

function isStruggling(opts: {
  wrongStreak: number;
  score: number;
  correct: number;
  wrong: number;
}): boolean {
  const { wrongStreak, score, correct, wrong } = opts;
  // Stricter than before — only clearly stuck runs get help.
  return (
    wrongStreak >= 3 ||
    (wrong >= 5 && score < 25) ||
    (correct === 0 && wrong >= 3)
  );
}

/**
 * Candy Crush–style struggle hint — at most one pulse, then a long cooldown
 * so waiting never farms free answers.
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
  const lastHintAtRef = useRef(0);
  const hintedThisPlayerRef = useRef<string | null>(null);
  const playerId = player?.id ?? null;

  // New player → clear on-screen pulse (cooldown still applies).
  useEffect(() => {
    setHintCell(null);
    hintedThisPlayerRef.current = null;
  }, [playerId, boardKey]);

  useEffect(() => {
    if (!enabled || phase !== 'playing' || !player || feedback) return;
    if (hintedThisPlayerRef.current === player.id) return;
    if (Date.now() - lastHintAtRef.current < HINT_COOLDOWN_MS) return;
    if (!isStruggling({ wrongStreak, score, correct, wrong })) return;

    // Only arm late in the player clock — never instantly.
    if (roundTime > 5) return;

    const timer = window.setTimeout(() => {
      if (Date.now() - lastHintAtRef.current < HINT_COOLDOWN_MS) return;
      const indices = getValidCellIndices(sport, board, player);
      if (!indices.length) return;
      const pick = indices[Math.floor(Math.random() * indices.length)]!;
      hintedThisPlayerRef.current = player.id;
      lastHintAtRef.current = Date.now();
      setHintCell(pick);
    }, SIT_DELAY_MS);

    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, phase, playerId, boardKey, feedback, wrongStreak, score, correct, wrong, roundTime, sport]);

  if (feedback) return null;
  return hintCell;
}
