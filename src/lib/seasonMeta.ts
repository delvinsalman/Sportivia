import type { GameMode, GameResult, Sport } from '../types';
import { getTodayKey } from './seed';
import {
  ACHIEVEMENTS,
  QUEST_POOL,
  type AchievementId,
  type CollectedPlayer,
  type QuestId,
  type QuestProgress,
  type SeasonMeta,
  getQuest,
} from './seasonTypes';

const META_KEY = 'sportivia-season-v1';
const MAX_COLLECTION = 240;
const MAX_RECENT = 12;

function hashDay(day: string): number {
  let h = 2166136261;
  for (let i = 0; i < day.length; i++) {
    h ^= day.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDailyQuests(day: string): QuestProgress[] {
  const seed = hashDay(day);
  const pool = [...QUEST_POOL];
  const picked: QuestProgress[] = [];
  let s = seed;
  while (picked.length < 3 && pool.length) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    const idx = s % pool.length;
    const [q] = pool.splice(idx, 1);
    picked.push({ id: q.id, progress: 0, claimed: false });
  }
  return picked;
}

function defaultMeta(): SeasonMeta {
  const day = getTodayKey();
  return {
    version: 1,
    unlockedAchievements: [],
    claimedAchievementBonuses: [],
    collection: [],
    questDate: day,
    quests: pickDailyQuests(day),
    questCollectSession: 0,
    recentRuns: [],
    dailyRewardDate: null,
    sportsPlayed: [],
    careerCorrect: 0,
    bestStreakSeen: 0,
  };
}

function refreshQuests(meta: SeasonMeta): SeasonMeta {
  const day = getTodayKey();
  if (meta.questDate === day) return meta;
  return {
    ...meta,
    questDate: day,
    quests: pickDailyQuests(day),
    questCollectSession: 0,
  };
}

export function loadSeasonMeta(): SeasonMeta {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta();
    const parsed = JSON.parse(raw) as Partial<SeasonMeta>;
    const base = defaultMeta();
    const merged: SeasonMeta = {
      ...base,
      ...parsed,
      version: 1,
      unlockedAchievements: parsed.unlockedAchievements ?? [],
      claimedAchievementBonuses: parsed.claimedAchievementBonuses ?? [],
      collection: parsed.collection ?? [],
      quests: parsed.quests ?? base.quests,
      questDate: parsed.questDate ?? base.questDate,
      questCollectSession: parsed.questCollectSession ?? 0,
      recentRuns: parsed.recentRuns ?? [],
      dailyRewardDate: parsed.dailyRewardDate ?? null,
      sportsPlayed: parsed.sportsPlayed ?? [],
      careerCorrect: parsed.careerCorrect ?? 0,
      bestStreakSeen: parsed.bestStreakSeen ?? 0,
    };
    return refreshQuests(merged);
  } catch {
    return defaultMeta();
  }
}

export function saveSeasonMeta(meta: SeasonMeta): void {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
}

function bumpQuest(meta: SeasonMeta, id: QuestId, amount = 1): SeasonMeta {
  const quests = meta.quests.map(q => {
    if (q.id !== id || q.claimed) return q;
    const def = getQuest(id);
    return { ...q, progress: Math.min(def.target, q.progress + amount) };
  });
  return { ...meta, quests };
}

export function collectPlayerFace(
  sport: Sport,
  id: string,
  name: string,
): { meta: SeasonMeta; isNew: boolean } {
  let meta = refreshQuests(loadSeasonMeta());
  const exists = meta.collection.some(c => c.sport === sport && c.id === id);
  if (exists) return { meta, isNew: false };

  const entry: CollectedPlayer = {
    sport,
    id,
    name,
    at: new Date().toISOString(),
  };
  meta = {
    ...meta,
    collection: [entry, ...meta.collection].slice(0, MAX_COLLECTION),
    questCollectSession: meta.questCollectSession + 1,
  };
  meta = bumpQuest(meta, 'collect_fresh', 1);
  saveSeasonMeta(meta);
  return { meta, isNew: true };
}

export function isDailyRewardAvailable(meta = loadSeasonMeta()): boolean {
  return meta.dailyRewardDate !== getTodayKey();
}

/** Apply season progress after a completed scoring run. Returns coin/xp bonuses from quests/achievements. */
export function applySeasonFromResult(
  sport: Sport,
  result: GameResult,
  opts: {
    profileLevel: number;
    profileCoins: number;
    dailyStreak: number;
    duelWon?: boolean;
  },
): {
  meta: SeasonMeta;
  bonusCoins: number;
  bonusXp: number;
  newlyUnlocked: AchievementId[];
  dailyAlreadyClaimed: boolean;
} {
  let meta = refreshQuests(loadSeasonMeta());
  let bonusCoins = 0;
  let bonusXp = 0;
  const newlyUnlocked: AchievementId[] = [];

  const dailyAlreadyClaimed =
    result.mode === 'daily' && meta.dailyRewardDate === getTodayKey();

  // Track sports + career corrects + streak
  if (!meta.sportsPlayed.includes(sport)) {
    meta = { ...meta, sportsPlayed: [...meta.sportsPlayed, sport] };
  }
  meta = {
    ...meta,
    careerCorrect: meta.careerCorrect + result.correct,
    bestStreakSeen: Math.max(meta.bestStreakSeen, result.maxStreak),
    recentRuns: [
      {
        sport,
        mode: result.mode,
        score: result.score,
        correct: result.correct,
        date: result.date,
        perfectBoard: result.perfectBoard,
      },
      ...meta.recentRuns,
    ].slice(0, MAX_RECENT),
  };

  // Quests
  if (result.mode === 'daily') meta = bumpQuest(meta, 'play_daily');
  if (result.mode === 'timed') meta = bumpQuest(meta, 'ranked_finish');
  if (result.mode === 'duel') meta = bumpQuest(meta, 'duel_finish');
  if (result.correct > 0) meta = bumpQuest(meta, 'correct_pack', result.correct);
  if (result.mode === 'timed' && result.score >= 150) meta = bumpQuest(meta, 'score_climb');

  // Auto-claim finished quests once
  meta = {
    ...meta,
    quests: meta.quests.map(q => {
      if (q.claimed) return q;
      const def = getQuest(q.id);
      if (q.progress < def.target) return q;
      bonusCoins += def.coinReward;
      bonusXp += def.xpReward;
      return { ...q, claimed: true };
    }),
  };

  // Achievements
  const unlock = (id: AchievementId) => {
    if (meta.unlockedAchievements.includes(id)) return;
    meta = {
      ...meta,
      unlockedAchievements: [...meta.unlockedAchievements, id],
    };
    newlyUnlocked.push(id);
    if (!meta.claimedAchievementBonuses.includes(id)) {
      const def = ACHIEVEMENTS.find(a => a.id === id)!;
      bonusCoins += def.coinBonus;
      meta = {
        ...meta,
        claimedAchievementBonuses: [...meta.claimedAchievementBonuses, id],
      };
    }
  };

  unlock('rookie');
  if (meta.careerCorrect >= 25) unlock('sharpshooter');
  if (result.maxStreak >= 5 || meta.bestStreakSeen >= 5) unlock('on_fire');
  if (result.perfectBoard) unlock('perfect');
  if (opts.dailyStreak >= 3) unlock('daily_grind');
  if (meta.collection.length >= 20) unlock('collector');
  if (opts.profileCoins + bonusCoins >= 5000) unlock('vault');
  if (opts.profileLevel >= 5) unlock('veteran');
  if (opts.duelWon) unlock('duelist');
  if (meta.sportsPlayed.length >= 4) unlock('globetrotter');

  if (result.mode === 'daily' && !dailyAlreadyClaimed) {
    meta = { ...meta, dailyRewardDate: getTodayKey() };
  }

  saveSeasonMeta(meta);
  return { meta, bonusCoins, bonusXp, newlyUnlocked, dailyAlreadyClaimed };
}

export function collectionForSport(sport: Sport, meta = loadSeasonMeta()): CollectedPlayer[] {
  return meta.collection.filter(c => c.sport === sport);
}

export function questSummary(meta = loadSeasonMeta()) {
  const m = refreshQuests(meta);
  if (m !== meta) saveSeasonMeta(m);
  const done = m.quests.filter(q => q.claimed || q.progress >= getQuest(q.id).target).length;
  return { done, total: m.quests.length, quests: m.quests, date: m.questDate };
}
