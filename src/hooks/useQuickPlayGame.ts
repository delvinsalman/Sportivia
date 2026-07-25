import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameResult, Sport } from '../types';
import { getTodayKey } from '../lib/seed';
import { isRunComplete } from '../lib/progression';
import { recordGameWithRewards } from '../lib/profileStorage';
import {
  generateQuickQuestions,
  scoreQuickAnswer,
  QUICK_QUESTION_COUNT,
  QUICK_QUESTION_TIME,
  type QuickQuestion,
} from '../lib/quickPlay';
import { COUNTDOWN_STEPS, STEP_MS, READY_MS } from '../lib/scoring';
import { playCorrect, playWrong, playSkip, playCountdownTick, playGo } from '../lib/sounds';
import { setQuickPlayLive } from '../lib/ambientControl';

export type QuickPhase = 'countdown' | 'playing' | 'over';

export function useQuickPlayGame(sport: Sport) {
  const [questions] = useState(() =>
    generateQuickQuestions(sport, QUICK_QUESTION_COUNT, `run-${Date.now()}`),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUICK_QUESTION_TIME);
  const [locked, setLocked] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [phase, setPhase] = useState<QuickPhase>('countdown');
  const [countdownIndex, setCountdownIndex] = useState(0);
  const [result, setResult] = useState<GameResult | null>(null);

  const scoreRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const skippedRef = useRef(0);
  const maxStreakRef = useRef(0);
  const streakRef = useRef(0);
  const startedAt = useRef(Date.now());
  const advancing = useRef(false);
  const ended = useRef(false);
  const timeLeftRef = useRef(QUICK_QUESTION_TIME);

  const question: QuickQuestion | null = questions[index] ?? null;
  const total = questions.length;

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    setQuickPlayLive(false);
    return () => setQuickPlayLive(false);
  }, []);

  // Countdown: GET READY → 3 → 2 → 1 → GO!
  useEffect(() => {
    if (phase !== 'countdown') return;

    const isReady = countdownIndex === 0;
    const delay =
      isReady ? READY_MS : countdownIndex === COUNTDOWN_STEPS.length - 1 ? 600 : STEP_MS;

    if (countdownIndex > 0 && countdownIndex < COUNTDOWN_STEPS.length) {
      playCountdownTick();
    }

    const t = window.setTimeout(() => {
      if (countdownIndex >= COUNTDOWN_STEPS.length - 1) {
        playGo();
        startedAt.current = Date.now();
        setTimeLeft(QUICK_QUESTION_TIME);
        setPhase('playing');
        setQuickPlayLive(true);
      } else {
        setCountdownIndex(i => i + 1);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [phase, countdownIndex]);

  const finish = useCallback(
    (reason: GameResult['endReason']) => {
      if (ended.current) return;
      ended.current = true;
      setQuickPlayLive(false);
      const timeUsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      const completed = isRunComplete('quick', reason);
      const perfect =
        completed &&
        correctRef.current === questions.length &&
        wrongRef.current === 0 &&
        skippedRef.current === 0;
      const base: GameResult = {
        score: scoreRef.current,
        correct: correctRef.current,
        skipped: skippedRef.current,
        wrong: wrongRef.current,
        boardFilled: 0,
        perfectBoard: perfect,
        sport,
        mode: 'quick',
        date: getTodayKey(),
        timeUsed,
        maxStreak: maxStreakRef.current,
        completed,
        endReason: reason,
      };
      const { rewards } = recordGameWithRewards(sport, base);
      setResult(rewards ? { ...base, rewards } : base);
      setPhase('over');
    },
    [questions.length, sport],
  );

  const advance = useCallback(
    (delayMs: number) => {
      if (advancing.current || ended.current) return;
      advancing.current = true;
      window.setTimeout(() => {
        advancing.current = false;
        setLocked(false);
        setPickedId(null);
        setFeedback(null);
        setIndex(i => {
          const next = i + 1;
          if (next >= total) {
            finish('timer');
            return i;
          }
          setTimeLeft(QUICK_QUESTION_TIME);
          return next;
        });
      }, delayMs);
    },
    [finish, total],
  );

  const resolve = useCallback(
    (choiceId: string | null, timedOut: boolean) => {
      if (phase !== 'playing' || locked || ended.current || !question) return;
      setLocked(true);
      const choice = question.choices.find(c => c.id === choiceId) ?? null;
      const isCorrect = Boolean(choice?.correct);
      setPickedId(choiceId);

      if (timedOut) {
        skippedRef.current += 1;
        setSkipped(skippedRef.current);
        streakRef.current = 0;
        setStreak(0);
        setFeedback('timeout');
        playSkip();
        advance(700);
        return;
      }

      if (isCorrect) {
        const gained = scoreQuickAnswer(true, timeLeftRef.current);
        scoreRef.current += gained;
        correctRef.current += 1;
        streakRef.current += 1;
        maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
        setScore(scoreRef.current);
        setCorrect(correctRef.current);
        setStreak(streakRef.current);
        setMaxStreak(maxStreakRef.current);
        setFeedback('correct');
        playCorrect(sport, streakRef.current);
      } else {
        wrongRef.current += 1;
        streakRef.current = 0;
        setWrong(wrongRef.current);
        setStreak(0);
        setFeedback('wrong');
        playWrong(sport);
      }
      advance(850);
    },
    [advance, locked, phase, question, sport],
  );

  useEffect(() => {
    if (phase !== 'playing' || locked || !question) return;
    if (timeLeft <= 0) {
      resolve(null, true);
      return;
    }
    const id = window.setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, phase, locked, question, resolve]);

  function answer(choiceId: string) {
    resolve(choiceId, false);
  }

  function abandonRun() {
    finish('abandoned');
  }

  return {
    question,
    index,
    total,
    score,
    correct,
    wrong,
    skipped,
    streak,
    maxStreak,
    timeLeft,
    locked,
    pickedId,
    feedback,
    phase,
    countdownLabel: COUNTDOWN_STEPS[countdownIndex] ?? 'GO!',
    result,
    answer,
    abandonRun,
    questionTime: QUICK_QUESTION_TIME,
  };
}
