export const RESET_EVERY = 5;
export const COUNTDOWN_STEPS = ['GET READY', '3', '2', '1', 'GO!'] as const;
export const STEP_MS = 900;
export const READY_MS = 1400;
export const WRONG_PENALTY = 3;
export const WRONG_PENALTY_STEP = 2;
export const BASE_POINTS = 2;

/** Penalty grows with consecutive wrong answers: -3, -5, -7, ... */
export function wrongPenalty(consecutiveWrongs: number): number {
  return WRONG_PENALTY + Math.max(0, consecutiveWrongs - 1) * WRONG_PENALTY_STEP;
}
