export type Sport = 'soccer' | 'basketball' | 'baseball' | 'football' | 'hockey';

export type GameMode = 'training' | 'daily' | 'timed' | 'bot' | 'duel';

export type BotDifficulty = 'beginner' | 'pro' | 'expert';

export type CategoryTag =
  | 'NATIONALITY'
  | 'PLAYED IN'
  | 'LEAGUE'
  | 'WINNER'
  | 'POSITION'
  | 'ERA'
  | 'REGION'
  | 'TEAM'
  | 'AWARD'
  | 'DRAFT'
  | 'COLLEGE';

export interface Category {
  id: string;
  tag: CategoryTag;
  label: string;
  icon: string;
  difficulty: 1 | 2 | 3;
}

export interface BoardCell {
  category: Category;
  filled: boolean;
  playerName: string | null;
  /** Set when filled — used for soccer face lookup (and later other sports). */
  playerId: string | null;
}

export interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  totalCorrect: number;
  dailyStreak: number;
  lastDailyDate: string | null;
  dailyCompleted: string[];
  perfectBoards: number;
}

export type GameEndReason = 'timer' | 'training_complete' | 'pool_empty' | 'abandoned';

export interface GameResult {
  score: number;
  correct: number;
  skipped: number;
  wrong: number;
  boardFilled: number;
  perfectBoard: boolean;
  sport: Sport;
  mode: GameMode;
  date: string;
  timeUsed: number;
  maxStreak: number;
  completed: boolean;
  endReason: GameEndReason;
  rewards?: {
    coinsEarned: number;
    xpEarned: number;
    leveledUp: boolean;
    previousLevel: number;
    newLevel: number;
    milestoneBonus: number;
  };
  duel?: {
    opponentName: string;
    opponentScore: number;
    outcome: 'win' | 'loss' | 'draw' | 'pending';
  };
}

export interface PlayerStats {
  soccer: GameStats;
  basketball: GameStats;
  baseball: GameStats;
  football: GameStats;
  hockey: GameStats;
}

export const GRID_SIZE = 3;
export const ROUND_TIME = 10;
export const TRAINING_TIME = 60;
export const GAME_TIME = 120;
