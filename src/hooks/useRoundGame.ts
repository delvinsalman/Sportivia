import { useState, useCallback, useEffect, useRef } from 'react';
import type { BoardCell, Sport, GameMode, GameResult } from '../types';
import { GAME_TIME, ROUND_TIME, TRAINING_TIME } from '../types';
import { RESET_EVERY, COUNTDOWN_STEPS, STEP_MS, READY_MS, wrongPenalty, BASE_POINTS } from '../lib/scoring';
import { generateBoard, pickNextPlayer, validateAnswer, pointsForDifficulty, streakMultiplier } from '../lib/roundEngine';
import { getTodayKey, hashString } from '../lib/seed';
import { recordGameWithRewards } from '../lib/profileStorage';
import { isRunComplete } from '../lib/progression';
import type { GameEndReason } from '../types';
import type { PlayerUnion } from '../data/categories';
import {
  playCorrect, playWrong, playPick, playSkip, playBoardReset,
  playCountdownTick, playGo, playStreakFire, playTimesUp, playClockTick,
} from '../lib/sounds';

export type Feedback = 'correct' | 'wrong' | null;
export type GamePhase = 'countdown' | 'playing' | 'over';

export interface RoundGameOptions {
  /** Shared seed for fair duels / rematches */
  seedKey?: string;
  onScoreChange?: (score: number) => void;
  onFinished?: (payload: {
    score: number;
    correct: number;
    wrong: number;
    maxStreak: number;
  }) => void;
}

export function useRoundGame(sport: Sport, mode: GameMode, options?: RoundGameOptions) {
  const totalGameTime = mode === 'training' ? TRAINING_TIME : GAME_TIME;
  const baseSeedKey =
    options?.seedKey ??
    (mode === 'daily' ? getTodayKey() : `run-${Date.now()}`);

  const [board, setBoard] = useState<BoardCell[]>(() => generateBoard(sport, baseSeedKey));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerUnion | null>(null);
  const [usedPlayerIds, setUsedPlayerIds] = useState<Set<string>>(() => new Set());
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [, setWrongStreak] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctInCycle, setCorrectInCycle] = useState(0);
  const [roundTime, setRoundTime] = useState(ROUND_TIME);
  const [gameTimeLeft, setGameTimeLeft] = useState(totalGameTime);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [feedbackCell, setFeedbackCell] = useState<number | null>(null);
  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [showPoints, setShowPoints] = useState<number | null>(null);
  const [boardResetFlash, setBoardResetFlash] = useState(false);
  const [boardKey, setBoardKey] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  const seed = useRef(hashString(baseSeedKey));
  const boardGen = useRef(0);
  const recorded = useRef(false);
  const locked = useRef(false);
  const abandoned = useRef(false);
  const endReason = useRef<GameEndReason>('abandoned');
  const roundsPlayedRef = useRef(0);
  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const maxStreakRef = useRef(0);
  const streakRef = useRef(0);
  const wrongStreakRef = useRef(0);
  const correctInCycleRef = useRef(0);
  const nextRoundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onScoreChangeRef = useRef(options?.onScoreChange);
  const onFinishedRef = useRef(options?.onFinished);
  onScoreChangeRef.current = options?.onScoreChange;
  onFinishedRef.current = options?.onFinished;

  const boardRef = useRef(board);
  const usedRef = useRef(usedPlayerIds);
  boardRef.current = board;
  usedRef.current = usedPlayerIds;
  scoreRef.current = score;
  correctRef.current = correct;
  wrongRef.current = wrong;
  maxStreakRef.current = maxStreak;
  streakRef.current = streak;
  correctInCycleRef.current = correctInCycle;

  const filledCount = board.filter(c => c.filled).length;
  const isOver = phase === 'over';
  const isPlaying = phase === 'playing';

  const spawnPlayer = useCallback((boardOverride?: BoardCell[]) => {
    const b = boardOverride ?? boardRef.current;
    let player = pickNextPlayer(sport, b, usedRef.current, seed.current + boardGen.current);

    if (!player && (totalGameTime > 0 || mode === 'training')) {
      const recycled = new Set<string>();
      usedRef.current = recycled;
      setUsedPlayerIds(recycled);
      player = pickNextPlayer(sport, b, recycled, seed.current + boardGen.current + 999);
    }

    if (!player) {
      endReason.current = mode === 'training' ? 'pool_empty' : 'pool_empty';
      setPhase('over');
      setCurrentPlayer(null);
      return false;
    }
    setCurrentPlayer(player);
    setRoundTime(ROUND_TIME);
    locked.current = false;
    return true;
  }, [sport, totalGameTime, mode]);

  // Countdown sequence
  useEffect(() => {
    if (phase !== 'countdown') return;

    const isReady = countdownIndex === 0;
    const delay = isReady ? READY_MS : countdownIndex === COUNTDOWN_STEPS.length - 1 ? 600 : STEP_MS;

    if (countdownIndex > 0 && countdownIndex < COUNTDOWN_STEPS.length) {
      playCountdownTick();
    }

    const t = setTimeout(() => {
      if (countdownIndex >= COUNTDOWN_STEPS.length - 1) {
        playGo();
        setPhase('playing');
        spawnPlayer();
      } else {
        setCountdownIndex(i => i + 1);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [phase, countdownIndex, spawnPlayer]);

  const endGame = useCallback(() => {
    if (recorded.current || abandoned.current) return;
    recorded.current = true;
    if (endReason.current === 'timer') playTimesUp();
    const filled = boardRef.current.filter(c => c.filled).length;
    const completed = isRunComplete(mode, endReason.current);
    const gameResult: GameResult = {
      score: scoreRef.current,
      correct: correctRef.current,
      skipped,
      wrong: wrongRef.current,
      boardFilled: filled,
      perfectBoard: correctRef.current > 0 && correctRef.current % RESET_EVERY === 0,
      sport,
      mode,
      date: getTodayKey(),
      timeUsed: totalGameTime > 0 ? totalGameTime - gameTimeLeft : 0,
      maxStreak: maxStreakRef.current,
      completed,
      endReason: endReason.current,
    };
    onFinishedRef.current?.({
      score: gameResult.score,
      correct: gameResult.correct,
      wrong: gameResult.wrong,
      maxStreak: gameResult.maxStreak,
    });
    const { rewards } = recordGameWithRewards(sport, gameResult);
    setResult({ ...gameResult, rewards: rewards ?? undefined });
  }, [skipped, sport, mode, totalGameTime, gameTimeLeft]);

  useEffect(() => {
    if (isOver && !result) endGame();
  }, [isOver, result, endGame]);

  useEffect(() => {
    onScoreChangeRef.current?.(score);
  }, [score]);

  const resetBoard = useCallback(() => {
    boardGen.current += 1;
    const newBoard = generateBoard(sport, `${baseSeedKey}-${boardGen.current}`);
    setBoard(newBoard);
    boardRef.current = newBoard;
    setCorrectInCycle(0);
    setBoardKey(k => k + 1);
    setBoardResetFlash(true);
    playBoardReset();
    setTimeout(() => setBoardResetFlash(false), 950);
    return newBoard;
  }, [sport, baseSeedKey]);

  const completeRound = useCallback(() => {
    const next = roundsPlayedRef.current + 1;
    roundsPlayedRef.current = next;
    setRoundsPlayed(next);
  }, []);

  const goNext = useCallback((boardOverride?: BoardCell[]) => {
    setFeedback(null);
    setFeedbackCell(null);
    setShowPoints(null);
    completeRound();
    spawnPlayer(boardOverride);
  }, [spawnPlayer, completeRound]);

  const scheduleNext = useCallback((delay: number, boardOverride?: BoardCell[]) => {
    if (nextRoundTimer.current) clearTimeout(nextRoundTimer.current);
    nextRoundTimer.current = setTimeout(() => {
      nextRoundTimer.current = null;
      goNext(boardOverride);
    }, delay);
  }, [goNext]);

  const markPlayerUsed = useCallback((playerId: string) => {
    setUsedPlayerIds(ids => {
      const next = new Set(ids);
      next.add(playerId);
      usedRef.current = next;
      return next;
    });
  }, []);

  const handleSkip = useCallback(() => {
    if (!currentPlayer || !isPlaying || locked.current) return;
    locked.current = true;
    playSkip();
    setSkipped(s => s + 1);
    setStreak(0);
    streakRef.current = 0;
    setWrongStreak(0);
    wrongStreakRef.current = 0;
    markPlayerUsed(currentPlayer.id);
    scheduleNext(200);
  }, [currentPlayer, isPlaying, markPlayerUsed, scheduleNext]);

  const handlePick = useCallback((cellIndex: number) => {
    if (!currentPlayer || !isPlaying || locked.current || boardRef.current[cellIndex]?.filled) return;
    locked.current = true;
    // Soccer correct/wrong use dedicated samples only — skip the pick blip
    if (sport !== 'soccer') playPick(sport);

    const isValid = validateAnswer(sport, boardRef.current, cellIndex, currentPlayer);
    setFeedbackCell(cellIndex);

    if (isValid) {
      const newStreak = streakRef.current + 1;
      const mult = streakMultiplier(newStreak);
      const base = pointsForDifficulty(boardRef.current[cellIndex].category.difficulty) + BASE_POINTS - 2;
      const pts = Math.round(base * mult);

      wrongStreakRef.current = 0;
      setWrongStreak(0);
      streakRef.current = newStreak;
      setStreak(newStreak);
      setFeedback('correct');
      setShowPoints(pts);
      setScore(s => Math.max(0, s + pts));
      setCorrect(c => c + 1);
      setMaxStreak(m => Math.max(m, newStreak));
      if (newStreak >= 3 && sport !== 'soccer') playStreakFire();
      playCorrect(sport, newStreak);

      const newCycle = correctInCycleRef.current + 1;
      markPlayerUsed(currentPlayer.id);

      if (newCycle >= RESET_EVERY) {
        // Clear name during board swap so a stale/double spawn can't flash
        setCurrentPlayer(null);
        const fresh = resetBoard();
        correctInCycleRef.current = 0;
        setCorrectInCycle(0);
        scheduleNext(850, fresh);
        return;
      }

      correctInCycleRef.current = newCycle;
      setCorrectInCycle(newCycle);
      const nextBoard = [...boardRef.current];
      nextBoard[cellIndex] = {
        ...nextBoard[cellIndex],
        filled: true,
        playerName: currentPlayer.name,
      };
      setBoard(nextBoard);
      boardRef.current = nextBoard;
      scheduleNext(450, nextBoard);
    } else {
      setFeedback('wrong');
      setWrong(w => w + 1);
      streakRef.current = 0;
      setStreak(0);
      const nextWrong = wrongStreakRef.current + 1;
      wrongStreakRef.current = nextWrong;
      setWrongStreak(nextWrong);
      const penalty = wrongPenalty(nextWrong);
      setShowPoints(-penalty);
      setScore(sc => Math.max(0, sc - penalty));
      playWrong(sport);
      markPlayerUsed(currentPlayer.id);
      scheduleNext(550);
    }
  }, [currentPlayer, isPlaying, sport, resetBoard, markPlayerUsed, scheduleNext]);

  useEffect(() => {
    if (!isPlaying || !currentPlayer || locked.current) return;
    if (roundTime <= 0) { handleSkip(); return; }
    if (roundTime <= 3) playClockTick(roundTime);
    const t = setTimeout(() => setRoundTime(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [roundTime, isPlaying, currentPlayer, handleSkip]);

  useEffect(() => {
    if (!isPlaying) return;
    if (gameTimeLeft <= 0) {
      endReason.current = 'timer';
      setPhase('over');
      return;
    }
    if (gameTimeLeft <= 3) playClockTick(gameTimeLeft);
    const t = setTimeout(() => setGameTimeLeft(g => g - 1), 1000);
    return () => clearTimeout(t);
  }, [gameTimeLeft, isPlaying]);

  const abandonRun = useCallback(() => {
    abandoned.current = true;
    endReason.current = 'abandoned';
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isPlaying) { e.preventDefault(); handleSkip(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSkip, isPlaying]);

  useEffect(() => () => {
    if (nextRoundTimer.current) clearTimeout(nextRoundTimer.current);
  }, []);

  return {
    board, currentPlayer, score, correct, skipped, wrong,
    streak, correctInCycle, maxStreak,
    roundTime, gameTimeLeft, totalGameTime,
    feedback, feedbackCell, showPoints,
    phase, countdownIndex, countdownLabel: COUNTDOWN_STEPS[countdownIndex],
    isOver, result, roundsPlayed, filledCount, boardResetFlash, boardKey,
    handlePick, handleSkip, abandonRun,
  };
}
