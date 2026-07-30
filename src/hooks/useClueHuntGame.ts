import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GameResult, Sport } from '../types';
import { getTodayKey } from '../lib/seed';
import { isRunComplete } from '../lib/progression';
import { recordGameWithRewards } from '../lib/profileStorage';
import {
  CLUE_HINT_INTERVAL_MS,
  CLUE_MAX_HINTS,
  CLUE_ROUND_SECONDS,
  generateCluePrompts,
  getGuessPlayerRoster,
  matchTypedAnswer,
  scoreClueAnswer,
  suggestPlayers,
  type CluePrompt,
  type ClueSuggestion,
} from '../lib/clueHunt';
import { COUNTDOWN_STEPS, STEP_MS, READY_MS } from '../lib/scoring';
import {
  playCorrect,
  playWrong,
  playSkip,
  playCountdownTick,
  playGo,
  playTimesUp,
} from '../lib/sounds';

export type CluePhase = 'countdown' | 'playing' | 'over';

export function useClueHuntGame(sport: Sport) {
  const roster = useMemo(() => getGuessPlayerRoster(sport), [sport]);
  const [prompts] = useState(() =>
    generateCluePrompts(sport, 30, `run-${Date.now()}`),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [roundLeft, setRoundLeft] = useState(CLUE_ROUND_SECONDS);
  const [hintsRevealed, setHintsRevealed] = useState(1);
  const [draft, setDraft] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [lastGain, setLastGain] = useState(0);
  const [locked, setLocked] = useState(false);
  const [phase, setPhase] = useState<CluePhase>('countdown');
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
  const hintsRef = useRef(1);

  const prompt: CluePrompt | null = prompts[index] ?? null;

  useEffect(() => {
    hintsRef.current = hintsRevealed;
  }, [hintsRevealed]);

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
        setRoundLeft(CLUE_ROUND_SECONDS);
        setHintsRevealed(1);
        setPhase('playing');
      } else {
        setCountdownIndex(i => i + 1);
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [phase, countdownIndex]);

  const finish = useCallback(
    (reason: GameResult['endReason']) => {
      if (ended.current) return;
      ended.current = true;
      const timeUsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      const completed = isRunComplete('clue', reason);
      if (reason === 'timer') playTimesUp();
      const base: GameResult = {
        score: scoreRef.current,
        correct: correctRef.current,
        skipped: skippedRef.current,
        wrong: wrongRef.current,
        boardFilled: 0,
        perfectBoard: false,
        sport,
        mode: 'clue',
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
    [sport],
  );

  const advance = useCallback(
    (delayMs: number) => {
      if (advancing.current || ended.current) return;
      advancing.current = true;
      window.setTimeout(() => {
        advancing.current = false;
        if (ended.current) return;
        setLocked(false);
        setFeedback(null);
        setRevealedAnswer(null);
        setLastGain(0);
        setDraft('');
        setHintsRevealed(1);
        setIndex(i => {
          const next = i + 1;
          if (next >= prompts.length) {
            finish('timer');
            return i;
          }
          return next;
        });
      }, delayMs);
    },
    [finish, prompts.length],
  );

  // Round clock
  useEffect(() => {
    if (phase !== 'playing') return;
    if (roundLeft <= 0) {
      finish('timer');
      return;
    }
    const id = window.setTimeout(() => setRoundLeft(t => t - 1), 1000);
    return () => window.clearTimeout(id);
  }, [roundLeft, phase, finish]);

  // Progressive hints
  useEffect(() => {
    if (phase !== 'playing' || locked || !prompt) return;
    if (hintsRevealed >= Math.min(CLUE_MAX_HINTS, prompt.hints.length)) return;
    const id = window.setTimeout(() => {
      setHintsRevealed(h => Math.min(CLUE_MAX_HINTS, prompt.hints.length, h + 1));
    }, CLUE_HINT_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [phase, locked, prompt, hintsRevealed, index]);

  const suggestions: ClueSuggestion[] = useMemo(
    () => (phase === 'playing' ? suggestPlayers(draft, roster, 8) : []),
    [draft, phase, roster],
  );

  const skipUnlocked = phase === 'playing';
  const skipRecommended =
    hintsRevealed >= Math.min(CLUE_MAX_HINTS, prompt?.hints.length ?? CLUE_MAX_HINTS);

  const submitName = useCallback(
    (raw: string) => {
      if (phase !== 'playing' || locked || ended.current || !prompt) return;
      const candidates = [{ id: prompt.targetId, name: prompt.targetName }];
      const hit = matchTypedAnswer(raw, candidates);
      if (!hit) {
        wrongRef.current += 1;
        streakRef.current = 0;
        setWrong(wrongRef.current);
        setStreak(0);
        setFeedback('wrong');
        playWrong(sport);
        setDraft('');
        window.setTimeout(() => setFeedback(null), 550);
        return;
      }

      setLocked(true);
      setRevealedAnswer(null);
      const gained = scoreClueAnswer(hintsRef.current - 1);
      scoreRef.current += gained;
      correctRef.current += 1;
      streakRef.current += 1;
      maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
      setScore(scoreRef.current);
      setCorrect(correctRef.current);
      setStreak(streakRef.current);
      setMaxStreak(maxStreakRef.current);
      setLastGain(gained);
      setFeedback('correct');
      setDraft(hit.name);
      playCorrect(prompt.sport, streakRef.current);
      advance(900);
    },
    [advance, locked, phase, prompt],
  );

  function skipPrompt() {
    if (phase !== 'playing' || locked || ended.current || !prompt) return;
    if (!skipUnlocked) return;
    setLocked(true);
    skippedRef.current += 1;
    streakRef.current = 0;
    setSkipped(skippedRef.current);
    setStreak(0);
    setFeedback('skip');
    setRevealedAnswer(prompt.targetName);
    playSkip();
    advance(1_800);
  }

  function abandonRun() {
    finish('abandoned');
  }

  return {
    prompt,
    index,
    total: prompts.length,
    score,
    correct,
    wrong,
    skipped,
    streak,
    maxStreak,
    roundLeft,
    roundSeconds: CLUE_ROUND_SECONDS,
    hintsRevealed,
    draft,
    setDraft,
    suggestions,
    feedback,
    revealedAnswer,
    lastGain,
    locked,
    phase,
    countdownLabel: COUNTDOWN_STEPS[countdownIndex] ?? 'GO!',
    result,
    skipUnlocked,
    skipRecommended,
    submitName,
    skipPrompt,
    abandonRun,
  };
}
