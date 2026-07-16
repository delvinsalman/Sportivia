import type { GameMode, Sport } from '../types';

export type AchievementId =
  | 'rookie'
  | 'sharpshooter'
  | 'on_fire'
  | 'perfect'
  | 'daily_grind'
  | 'collector'
  | 'vault'
  | 'veteran'
  | 'duelist'
  | 'globetrotter';

export interface AchievementDef {
  id: AchievementId;
  title: string;
  detail: string;
  icon: 'zap' | 'target' | 'fire' | 'crown' | 'calendar' | 'book' | 'coins' | 'star' | 'swords' | 'globe';
  coinBonus: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'rookie', title: 'First Whistle', detail: 'Finish any Daily, Ranked, or Duel run', icon: 'zap', coinBonus: 50 },
  { id: 'sharpshooter', title: 'Sharpshooter', detail: 'Land 25 career correct answers', icon: 'target', coinBonus: 100 },
  { id: 'on_fire', title: 'On Fire', detail: 'Hit a 5+ streak in one run', icon: 'fire', coinBonus: 120 },
  { id: 'perfect', title: 'Clean Sheet', detail: 'Fill a full board without misses on that board', icon: 'crown', coinBonus: 200 },
  { id: 'daily_grind', title: 'Daily Grind', detail: 'Reach a 3-day daily streak', icon: 'calendar', coinBonus: 150 },
  { id: 'collector', title: 'Scout Network', detail: 'Collect 20 unique players', icon: 'book', coinBonus: 175 },
  { id: 'vault', title: 'Loaded', detail: 'Hold 5,000 coins at once', icon: 'coins', coinBonus: 100 },
  { id: 'veteran', title: 'Seasoned', detail: 'Reach level 5', icon: 'star', coinBonus: 200 },
  { id: 'duelist', title: 'Duelist', detail: 'Win a 1v1 duel', icon: 'swords', coinBonus: 150 },
  { id: 'globetrotter', title: 'Globetrotter', detail: 'Play all four sports', icon: 'globe', coinBonus: 125 },
];

export type QuestId =
  | 'play_daily'
  | 'correct_pack'
  | 'score_climb'
  | 'collect_fresh'
  | 'ranked_finish'
  | 'duel_finish';

export interface QuestDef {
  id: QuestId;
  title: string;
  detail: string;
  target: number;
  coinReward: number;
  xpReward: number;
}

export const QUEST_POOL: QuestDef[] = [
  { id: 'play_daily', title: 'Show Up', detail: 'Finish today’s Daily', target: 1, coinReward: 60, xpReward: 40 },
  { id: 'correct_pack', title: 'Board Control', detail: 'Get 10 correct answers', target: 10, coinReward: 80, xpReward: 50 },
  { id: 'score_climb', title: 'Big Score', detail: 'Score 150+ in one Ranked run', target: 1, coinReward: 90, xpReward: 55 },
  { id: 'collect_fresh', title: 'New Faces', detail: 'Add 4 new players to your collection', target: 4, coinReward: 70, xpReward: 45 },
  { id: 'ranked_finish', title: 'Climb Time', detail: 'Finish 2 Ranked games', target: 2, coinReward: 85, xpReward: 50 },
  { id: 'duel_finish', title: 'Face-Off', detail: 'Finish a 1v1 Duel', target: 1, coinReward: 100, xpReward: 60 },
];

export interface QuestProgress {
  id: QuestId;
  progress: number;
  claimed: boolean;
}

export interface CollectedPlayer {
  sport: Sport;
  id: string;
  name: string;
  at: string;
}

export interface RecentRun {
  sport: Sport;
  mode: GameMode;
  score: number;
  correct: number;
  date: string;
  perfectBoard?: boolean;
}

export interface SeasonMeta {
  version: 1;
  unlockedAchievements: AchievementId[];
  claimedAchievementBonuses: AchievementId[];
  collection: CollectedPlayer[];
  questDate: string;
  quests: QuestProgress[];
  questCollectSession: number;
  recentRuns: RecentRun[];
  dailyRewardDate: string | null;
  sportsPlayed: Sport[];
  careerCorrect: number;
  bestStreakSeen: number;
}

export function getAchievement(id: AchievementId): AchievementDef {
  return ACHIEVEMENTS.find(a => a.id === id)!;
}

export function getQuest(id: QuestId): QuestDef {
  return QUEST_POOL.find(q => q.id === id)!;
}
