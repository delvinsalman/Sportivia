import type { Sport } from '../types';
import { getPlayers, type PlayerUnion } from '../data/categories';
import { shuffleWithSeed, hashString } from './seed';

export const QUICK_QUESTION_COUNT = 10;
export const QUICK_QUESTION_TIME = 8;
/** Soft points — keep Quick Play below Daily / Ranked coin value. */
export const QUICK_BASE_POINTS = 6;
export const QUICK_SPEED_POINTS = 1.25;

export type QuickPromptKind = 'nationality' | 'club' | 'position' | 'league' | 'decade';

export interface QuickChoice {
  id: string;
  label: string;
  correct: boolean;
}

export interface QuickQuestion {
  id: string;
  kind: QuickPromptKind;
  prompt: string;
  playerId: string;
  playerName: string;
  choices: QuickChoice[];
}

const PROMPT_COPY: Record<QuickPromptKind, string> = {
  nationality: 'What is their nationality?',
  club: 'Which team have they played for?',
  position: 'What position do they play?',
  league: 'Which league have they played in?',
  decade: 'Which decade did they feature in?',
};

const KAHOOT_TONES = ['#e21b3c', '#1368ce', '#d89e00', '#26890c'] as const;

export function quickChoiceTone(index: number): string {
  return KAHOOT_TONES[index % KAHOOT_TONES.length]!;
}

function teamsOf(player: PlayerUnion): string[] {
  if ('clubs' in player) return player.clubs;
  if ('nbaTeams' in player) return player.nbaTeams;
  if ('mlbTeams' in player) return player.mlbTeams;
  if ('nflTeams' in player) return player.nflTeams;
  if ('nhlTeams' in player) return player.nhlTeams;
  return [];
}

function leaguesOf(player: PlayerUnion): string[] {
  if ('leagues' in player) return player.leagues;
  return [];
}

function positionsOf(player: PlayerUnion): string[] {
  if ('positions' in player) return player.positions;
  return [];
}

function decadesOf(player: PlayerUnion): string[] {
  if ('decades' in player && Array.isArray(player.decades)) return player.decades;
  if ('draftDecade' in player && typeof player.draftDecade === 'string' && player.draftDecade) {
    return [player.draftDecade];
  }
  return [];
}

function nationalityOf(player: PlayerUnion): string | null {
  if ('nationality' in player && typeof player.nationality === 'string') return player.nationality;
  return null;
}

function uniquePool(values: string[]): string[] {
  return [...new Set(values.map(v => v.trim()).filter(Boolean))];
}

function normalizeLeagueKey(name: string): string {
  return name.toLowerCase().replace(/^\d+\.\s*/, '').trim();
}

/** Reject distractors that read like the same league (Bundesliga vs 2. Bundesliga, etc.). */
export function isSimilarLeagueChoice(correct: string, candidate: string): boolean {
  if (correct.toLowerCase() === candidate.toLowerCase()) return true;
  const a = normalizeLeagueKey(correct);
  const b = normalizeLeagueKey(candidate);
  if (a === b) return true;
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  return shorter.length >= 4 && longer.includes(shorter);
}

function pickDistractors(
  correct: string,
  pool: string[],
  count: number,
  seed: number,
  isTooSimilar: (correct: string, candidate: string) => boolean = (a, b) =>
    a.toLowerCase() === b.toLowerCase(),
): string[] {
  const others = uniquePool(pool).filter(v => !isTooSimilar(correct, v));
  return shuffleWithSeed(others, seed).slice(0, count);
}

function buildChoices(correct: string, distractors: string[], seed: number): QuickChoice[] {
  const raw = shuffleWithSeed(
    [
      { id: `c-${correct}`, label: correct, correct: true },
      ...distractors.map((label, i) => ({
        id: `d-${i}-${label}`,
        label,
        correct: false,
      })),
    ],
    seed,
  );
  return raw.slice(0, 4);
}

function tryBuildQuestion(
  player: PlayerUnion,
  kind: QuickPromptKind,
  roster: PlayerUnion[],
  seed: number,
): QuickQuestion | null {
  const prompt = PROMPT_COPY[kind];

  if (kind === 'nationality') {
    const correct = nationalityOf(player);
    if (!correct) return null;
    const pool = roster.map(nationalityOf).filter((v): v is string => Boolean(v));
    const distractors = pickDistractors(correct, pool, 3, seed);
    if (distractors.length < 3) return null;
    return {
      id: `${player.id}-nat-${seed}`,
      kind,
      prompt,
      playerId: player.id,
      playerName: player.name,
      choices: buildChoices(correct, distractors, seed + 11),
    };
  }

  if (kind === 'club') {
    const mine = teamsOf(player);
    if (mine.length === 0) return null;
    const correct = shuffleWithSeed(mine, seed)[0]!;
    const pool = roster.flatMap(teamsOf);
    const distractors = pickDistractors(correct, pool, 3, seed + 3);
    if (distractors.length < 3) return null;
    return {
      id: `${player.id}-club-${seed}`,
      kind,
      prompt,
      playerId: player.id,
      playerName: player.name,
      choices: buildChoices(correct, distractors, seed + 17),
    };
  }

  if (kind === 'position') {
    const mine = positionsOf(player);
    if (mine.length === 0) return null;
    const correct = mine[0]!;
    const pool = roster.flatMap(positionsOf);
    const distractors = pickDistractors(correct, pool, 3, seed + 5);
    if (distractors.length < 3) return null;
    return {
      id: `${player.id}-pos-${seed}`,
      kind,
      prompt,
      playerId: player.id,
      playerName: player.name,
      choices: buildChoices(correct, distractors, seed + 23),
    };
  }

  if (kind === 'league') {
    const mine = leaguesOf(player);
    if (mine.length === 0) return null;
    const correct = shuffleWithSeed(mine, seed)[0]!;
    const pool = roster.flatMap(leaguesOf);
    const distractors = pickDistractors(correct, pool, 3, seed + 7, isSimilarLeagueChoice);
    if (distractors.length < 3) return null;
    return {
      id: `${player.id}-lg-${seed}`,
      kind,
      prompt,
      playerId: player.id,
      playerName: player.name,
      choices: buildChoices(correct, distractors, seed + 29),
    };
  }

  const mine = decadesOf(player);
  if (mine.length === 0) return null;
  const correct = shuffleWithSeed(mine, seed)[0]!;
  const pool = roster.flatMap(decadesOf);
  const distractors = pickDistractors(correct, pool, 3, seed + 9);
  if (distractors.length < 3) return null;
  return {
    id: `${player.id}-dec-${seed}`,
    kind,
    prompt,
    playerId: player.id,
    playerName: player.name,
    choices: buildChoices(correct, distractors, seed + 31),
  };
}

const KIND_ORDER: QuickPromptKind[] = [
  'nationality',
  'club',
  'position',
  'league',
  'decade',
];

export function generateQuickQuestions(
  sport: Sport,
  count = QUICK_QUESTION_COUNT,
  seedKey = `quick-${Date.now()}`,
): QuickQuestion[] {
  const seed = hashString(`${sport}-quick-${seedKey}`);
  const roster = getPlayers(sport);
  const players = shuffleWithSeed(roster, seed);
  const questions: QuickQuestion[] = [];
  const usedPlayers = new Set<string>();

  let cursor = 0;
  let attempts = 0;
  while (questions.length < count && attempts < roster.length * 8) {
    attempts += 1;
    const player = players[cursor % players.length]!;
    cursor += 1;
    if (usedPlayers.has(player.id) && usedPlayers.size < Math.min(roster.length, count)) {
      continue;
    }

    const kinds = shuffleWithSeed(KIND_ORDER, seed + attempts * 13);
    let built: QuickQuestion | null = null;
    for (const kind of kinds) {
      built = tryBuildQuestion(player, kind, roster, seed + attempts * 97);
      if (built) break;
    }
    if (!built) continue;
    usedPlayers.add(player.id);
    questions.push(built);
  }

  return questions;
}

export function scoreQuickAnswer(correct: boolean, timeLeft: number): number {
  if (!correct) return 0;
  return QUICK_BASE_POINTS + Math.floor(Math.max(0, timeLeft) * QUICK_SPEED_POINTS);
}
