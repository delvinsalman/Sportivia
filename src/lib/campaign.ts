import type { Sport } from '../types';

export const CAMPAIGN_LEVEL_COUNT = 40;

const SPORTS: Sport[] = ['soccer', 'basketball', 'baseball', 'football', 'hockey'];

/** Chapter end gates — fast, high star bars, unlock the next page. */
export const GATE_LEVELS = new Set([10, 20, 30, 40]);

export interface CampaignLevelDef {
  id: number;
  /** One or more sports — pick one when the stage starts if mixed. */
  sports: Sport[];
  title: string;
  tagline: string;
  timeSec: number;
  starScores: [number, number, number];
  kind: 'stage' | 'gate';
}

function isGate(id: number) {
  return GATE_LEVELS.has(id);
}

function stageTime(level: number): number {
  if (isGate(level)) {
    // Faster the later the gate
    if (level === 10) return 60;
    if (level === 20) return 55;
    if (level === 30) return 50;
    return 45;
  }
  // Standard stages: 90s (1½ min), tightening later
  if (level <= 10) return 90;
  if (level <= 20) return 80;
  if (level <= 30) return 70;
  return 60;
}

function starScoresFor(level: number): [number, number, number] {
  // Championship trivia ≈ 5–7 pts/correct. Later chapters ask more of you.
  if (isGate(level)) {
    const one = 22 + Math.floor(level * 0.5);
    const two = Math.round(one * 1.55);
    const three = Math.round(one * 2.15);
    return [one, two, three];
  }
  const chapterBump = level <= 10 ? 0 : level <= 20 ? 2 : level <= 30 ? 5 : 8;
  const one = 12 + Math.floor((level - 1) * 0.75) + chapterBump;
  const two = Math.round(one * 1.55);
  const three = Math.round(one * 2.25);
  return [one, two, three];
}

const STAGE_TITLES = [
  'First Whistle',
  'Warmup Lap',
  'Box Score',
  'Sideline Quiz',
  'Home Opener',
  'Road Trip',
  'Midfield Press',
  'Fast Break',
  'Diamond Dust',
  'Chapter Gate', // 10
  'Blue Line',
  'Corner Kick',
  'Paint Touch',
  'Extra Innings',
  'Red Zone',
  'Power Play',
  'Derby Day',
  'Clutch Free',
  'Walk-Off',
  'Chapter Gate', // 20
  'Sudden Death',
  'Away Crowd',
  'Buzzer Watch',
  'Perfect Game',
  'Hail Mary',
  'Empty Net',
  'Final Third',
  'And-One',
  'Full Count',
  'Chapter Gate', // 30
  'Two-Minute',
  'Overtime',
  'Captain Run',
  'All-Star Heat',
  'Legacy Lane',
  'Pressure Cooker',
  'Title Fight',
  'Dynasty Gate',
  'Hall Climb',
  'Chapter Gate', // 40
];

const GATE_TITLES: Record<number, string> = {
  10: 'Rush Gate',
  20: 'Blitz Gate',
  30: 'Fury Gate',
  40: 'Crown Gate',
};

/** Levels that use a mix of sports (not a single sport). */
const MIXED_LEVELS: Record<number, Sport[]> = {
  3: ['soccer', 'basketball'],
  6: ['football', 'baseball'],
  8: ['hockey', 'soccer', 'basketball'],
  12: ['basketball', 'football'],
  15: ['soccer', 'hockey', 'baseball'],
  18: ['football', 'hockey'],
  22: ['soccer', 'basketball', 'football'],
  25: ['baseball', 'hockey', 'soccer'],
  28: ['basketball', 'baseball'],
  33: ['football', 'soccer', 'hockey'],
  36: ['basketball', 'football', 'baseball'],
  38: ['soccer', 'hockey'],
};

function sportsForId(id: number): Sport[] {
  if (MIXED_LEVELS[id]) return MIXED_LEVELS[id]!;
  if (isGate(id)) {
    // Gates: all five — random draw at start, max pressure
    return [...SPORTS];
  }
  return [SPORTS[(id - 1) % SPORTS.length]!];
}

function buildLevels(): CampaignLevelDef[] {
  const levels: CampaignLevelDef[] = [];
  for (let id = 1; id <= CAMPAIGN_LEVEL_COUNT; id++) {
    const sports = sportsForId(id);
    const gate = isGate(id);
    const mixed = sports.length > 1;
    const title = gate
      ? GATE_TITLES[id] ?? 'Chapter Gate'
      : STAGE_TITLES[id - 1] ?? `Stage ${id}`;
    const sportLabel = mixed
      ? sports.map(s => s[0]!.toUpperCase() + s.slice(1)).join(' · ')
      : sports[0]!;
    levels.push({
      id,
      sports,
      title,
      tagline: gate
        ? `Fast clock · championship trivia · clears next chapter`
        : mixed
          ? `Mixed sports · who won it? · ${stageTime(id)}s`
          : `Championship trivia · ${sportLabel} · ${stageTime(id)}s`,
      timeSec: stageTime(id),
      starScores: starScoresFor(id),
      kind: gate ? 'gate' : 'stage',
    });
  }
  return levels;
}

export const CAMPAIGN_LEVELS: CampaignLevelDef[] = buildLevels();

export function getCampaignLevel(id: number): CampaignLevelDef {
  return CAMPAIGN_LEVELS.find(l => l.id === id) ?? CAMPAIGN_LEVELS[0]!;
}

export function isMixedLevel(level: CampaignLevelDef): boolean {
  return level.sports.length > 1;
}

/** Sport used for backdrop / default — first in the list. */
export function primarySport(level: CampaignLevelDef): Sport {
  return level.sports[0] ?? 'soccer';
}

/** Pick which sport a mixed (or gate) stage plays this run. */
export function pickLevelSport(level: CampaignLevelDef, seedKey: string): Sport {
  if (level.sports.length === 1) return level.sports[0]!;
  let h = 0;
  for (let i = 0; i < seedKey.length; i++) h = (h * 31 + seedKey.charCodeAt(i)) >>> 0;
  return level.sports[h % level.sports.length]!;
}

export function starsForScore(level: CampaignLevelDef, score: number): 0 | 1 | 2 | 3 {
  const [s1, s2, s3] = level.starScores;
  if (score >= s3) return 3;
  if (score >= s2) return 2;
  if (score >= s1) return 1;
  return 0;
}

export interface CampaignProgress {
  stars: Record<number, 0 | 1 | 2 | 3>;
  bestScore: Record<number, number>;
  unlockedThrough: number;
  /** First-visit map intro shown */
  seenIntro?: boolean;
  /** Gate / finale bonuses already paid out (level ids 10,20,30,40). */
  claimedGateBonuses?: number[];
  /**
   * Consecutive campaign clears with 3★.
   * Second+ consecutive 3★ run pays 2× base campaign coins.
   */
  threeStarStreak?: number;
}

export function emptyCampaignProgress(): CampaignProgress {
  return {
    stars: {},
    bestScore: {},
    unlockedThrough: 1,
    seenIntro: false,
    claimedGateBonuses: [],
    threeStarStreak: 0,
  };
}

export function starsOnLevel(progress: CampaignProgress, levelId: number): 0 | 1 | 2 | 3 {
  return progress.stars[levelId] ?? 0;
}

export function totalStars(progress: CampaignProgress): number {
  let sum = 0;
  for (let i = 1; i <= CAMPAIGN_LEVEL_COUNT; i++) sum += starsOnLevel(progress, i);
  return sum;
}

export function maxStarsPossible(): number {
  return CAMPAIGN_LEVEL_COUNT * 3;
}

export function isLevelUnlocked(progress: CampaignProgress, levelId: number): boolean {
  if (levelId <= 1) return true;
  return levelId <= progress.unlockedThrough;
}

/**
 * ≥2★ unlocks the next stage (including chapter gates → next page).
 */
export function applyCampaignResult(
  progress: CampaignProgress,
  levelId: number,
  score: number,
): CampaignProgress {
  const level = getCampaignLevel(levelId);
  const earned = starsForScore(level, score);
  const prevStars = starsOnLevel(progress, levelId);
  const nextStars = Math.max(prevStars, earned) as 0 | 1 | 2 | 3;
  const prevBest = progress.bestScore[levelId] ?? 0;

  const next: CampaignProgress = {
    stars: { ...progress.stars, [levelId]: nextStars },
    bestScore: {
      ...progress.bestScore,
      [levelId]: Math.max(prevBest, score),
    },
    unlockedThrough: progress.unlockedThrough,
    seenIntro: progress.seenIntro,
    claimedGateBonuses: progress.claimedGateBonuses ?? [],
    threeStarStreak:
      earned === 3 ? (progress.threeStarStreak ?? 0) + 1 : 0,
  };

  if (nextStars >= 2 && levelId < CAMPAIGN_LEVEL_COUNT) {
    next.unlockedThrough = Math.max(next.unlockedThrough, levelId + 1);
  }

  return next;
}

export interface CampaignGateBonus {
  levelId: number;
  title: string;
  tagline: string;
  coins: number;
  xp: number;
}

/** One-time clear bonuses for chapter gates (need ≥2★). Level 40 is the crown. */
export const CAMPAIGN_GATE_BONUSES: Record<number, CampaignGateBonus> = {
  10: {
    levelId: 10,
    title: 'Rush Gate Clear',
    tagline: 'Chapter 1 secured',
    coins: 5000,
    xp: 2500,
  },
  20: {
    levelId: 20,
    title: 'Blitz Gate Clear',
    tagline: 'Chapter 2 secured',
    coins: 12000,
    xp: 6000,
  },
  30: {
    levelId: 30,
    title: 'Fury Gate Clear',
    tagline: 'Chapter 3 secured',
    coins: 25000,
    xp: 12000,
  },
  40: {
    levelId: 40,
    title: 'Crown Finale',
    tagline: 'Campaign conquered',
    coins: 100000,
    xp: 50000,
  },
};

export function getGateBonus(levelId: number): CampaignGateBonus | null {
  return CAMPAIGN_GATE_BONUSES[levelId] ?? null;
}

export function hasClaimedGateBonus(progress: CampaignProgress, levelId: number): boolean {
  return (progress.claimedGateBonuses ?? []).includes(levelId);
}

/** Map chapter metadata for clear screens / UI. */
export const CAMPAIGN_CHAPTERS = [
  { id: 0, from: 1, to: 10, title: 'Rookie Road', gateId: 10 },
  { id: 1, from: 11, to: 20, title: 'Rising Heat', gateId: 20 },
  { id: 2, from: 21, to: 30, title: 'Pressure Pack', gateId: 30 },
  { id: 3, from: 31, to: 40, title: 'Final Stretch', gateId: 40 },
] as const;

export function campaignChapterForLevel(levelId: number) {
  return (
    CAMPAIGN_CHAPTERS.find(c => levelId >= c.from && levelId <= c.to) ?? CAMPAIGN_CHAPTERS[0]
  );
}

/** True when the next 3★ clear would pay streak 2× coins. */
export function campaignStreakArmed(progress: CampaignProgress): boolean {
  return (progress.threeStarStreak ?? 0) >= 1;
}
