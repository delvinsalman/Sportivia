import { useCallback, useEffect, useRef, useState } from 'react';
import type { GameResult, Sport } from '../types';
import { getTodayKey } from '../lib/seed';
import { isRunComplete } from '../lib/progression';
import { recordGameWithRewards } from '../lib/profileStorage';
import { recordCampaignLevelResult, tryClaimCampaignGateBonus } from '../lib/campaignStorage';
import { getCampaignLevel, starsForScore, CAMPAIGN_LEVEL_COUNT } from '../lib/campaign';
import {
  generateCampaignTriviaQueue,
  scoreCampaignAnswer,
  CAMPAIGN_QUESTION_TIME,
  type CampaignTriviaQuestion,
} from '../lib/campaignTrivia';
import { COUNTDOWN_STEPS, STEP_MS, READY_MS } from '../lib/scoring';
import {
  playCorrect,
  playWrong,
  playSkip,
  playCountdownTick,
  playGo,
  playTimesUp,
  playClockTick,
} from '../lib/sounds';

export type CampaignTriviaPhase = 'countdown' | 'playing' | 'over';

export function useCampaignTriviaGame(
  sport: Sport,
  campaignLevelId: number,
  seedKey?: string,
) {
  const level = getCampaignLevel(campaignLevelId);
  const totalGameTime = level.timeSec;
  const seed = seedKey ?? `campaign-${campaignLevelId}-${Date.now()}`;

  const [questions] = useState(() =>
    generateCampaignTriviaQueue(level.sports, seed, campaignLevelId),
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [gameTimeLeft, setGameTimeLeft] = useState(totalGameTime);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(CAMPAIGN_QUESTION_TIME);
  const [locked, setLocked] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [phase, setPhase] = useState<CampaignTriviaPhase>('countdown');
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
  const campaignRecorded = useRef(false);
  const qTimeRef = useRef(CAMPAIGN_QUESTION_TIME);
  const gameTimeRef = useRef(totalGameTime);

  const question: CampaignTriviaQuestion | null = questions[index] ?? null;

  useEffect(() => {
    qTimeRef.current = questionTimeLeft;
  }, [questionTimeLeft]);

  useEffect(() => {
    gameTimeRef.current = gameTimeLeft;
  }, [gameTimeLeft]);

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
        setPhase('playing');
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
      const timeUsed = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      const completed = isRunComplete('campaign', reason);
      const earnedStars = starsForScore(level, scoreRef.current);
      const advanced =
        completed && earnedStars >= 2 && campaignLevelId < CAMPAIGN_LEVEL_COUNT;
      const campaignBonus =
        completed
          ? tryClaimCampaignGateBonus(campaignLevelId, scoreRef.current)
          : null;
      const base: GameResult = {
        score: scoreRef.current,
        correct: correctRef.current,
        skipped: skippedRef.current,
        wrong: wrongRef.current,
        boardFilled: 0,
        perfectBoard: false,
        sport,
        mode: 'campaign',
        date: getTodayKey(),
        timeUsed,
        maxStreak: maxStreakRef.current,
        completed,
        endReason: reason,
        campaignLevelId,
        campaignStars: earnedStars,
        ...(advanced ? { campaignNextLevelId: campaignLevelId + 1 } : {}),
        ...(campaignBonus
          ? {
              campaignBonus: {
                levelId: campaignBonus.levelId,
                title: campaignBonus.title,
                coins: campaignBonus.coins,
                xp: campaignBonus.xp,
              },
            }
          : {}),
      };
      if (completed && !campaignRecorded.current) {
        campaignRecorded.current = true;
        recordCampaignLevelResult(campaignLevelId, scoreRef.current);
      }
      const { rewards } = recordGameWithRewards(sport, base);
      setResult(rewards ? { ...base, rewards } : base);
      setPhase('over');
    },
    [campaignLevelId, sport, level],
  );

  const advance = useCallback(
    (delayMs: number) => {
      if (advancing.current || ended.current) return;
      advancing.current = true;
      window.setTimeout(() => {
        advancing.current = false;
        if (ended.current) return;
        if (gameTimeRef.current <= 0) {
          finish('timer');
          return;
        }
        setLocked(false);
        setPickedId(null);
        setFeedback(null);
        setQuestionTimeLeft(CAMPAIGN_QUESTION_TIME);
        setIndex(i => (i + 1) % questions.length);
      }, delayMs);
    },
    [finish, questions.length],
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
        advance(650);
        return;
      }

      if (isCorrect) {
        const gained = scoreCampaignAnswer(true, qTimeRef.current);
        scoreRef.current += gained;
        correctRef.current += 1;
        streakRef.current += 1;
        maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
        setScore(scoreRef.current);
        setCorrect(correctRef.current);
        setStreak(streakRef.current);
        setMaxStreak(maxStreakRef.current);
        setFeedback('correct');
        playCorrect(question.sport, streakRef.current);
      } else {
        wrongRef.current += 1;
        streakRef.current = 0;
        setWrong(wrongRef.current);
        setStreak(0);
        setFeedback('wrong');
        playWrong(question.sport);
      }
      advance(800);
    },
    [advance, locked, phase, question],
  );

  // Match clock
  useEffect(() => {
    if (phase !== 'playing' || ended.current) return;
    if (gameTimeLeft <= 0) {
      playTimesUp();
      finish('timer');
      return;
    }
    if (gameTimeLeft <= 10) playClockTick();
    const id = window.setTimeout(() => setGameTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [gameTimeLeft, phase, finish]);

  // Per-question clock
  useEffect(() => {
    if (phase !== 'playing' || locked || !question || ended.current) return;
    if (questionTimeLeft <= 0) {
      resolve(null, true);
      return;
    }
    const id = window.setTimeout(() => setQuestionTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [questionTimeLeft, phase, locked, question, resolve]);

  function answer(choiceId: string) {
    resolve(choiceId, false);
  }

  function abandonRun() {
    finish('abandoned');
  }

  return {
    level,
    question,
    index,
    score,
    correct,
    wrong,
    skipped,
    streak,
    maxStreak,
    gameTimeLeft,
    questionTimeLeft,
    questionTime: CAMPAIGN_QUESTION_TIME,
    locked,
    pickedId,
    feedback,
    phase,
    countdownLabel: COUNTDOWN_STEPS[countdownIndex] ?? 'GO!',
    result,
    answer,
    abandonRun,
  };
}
