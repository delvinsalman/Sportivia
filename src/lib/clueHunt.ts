import type { Sport } from '../types';
import { getPlayers, type PlayerUnion } from '../data/categories';
import { shuffleWithSeed, hashString } from './seed';
import { SPORTS } from './sportTheme';
import { guessPlayerExtras } from '../data/guessPlayerExtras';

export const CLUE_ROUND_SECONDS = 90;
export const CLUE_HINT_INTERVAL_MS = 5_000;
export const CLUE_MAX_HINTS = 5;
export const CLUE_BASE_POINTS = 140;
export const CLUE_MIN_POINTS = 18;

export interface ClueHint {
  id: string;
  label: string;
}

export interface CluePrompt {
  id: string;
  sport: Sport;
  targetId: string;
  targetName: string;
  /** Progressive facts — index 0 is always shown first. */
  hints: ClueHint[];
  /** Difficulty band for mix. */
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ClueSuggestion {
  id: string;
  name: string;
}

export function getGuessPlayerRoster(sport: Sport): PlayerUnion[] {
  const seen = new Set<string>();
  return [...getPlayers(sport), ...guessPlayerExtras(sport)].filter(player => {
    const key = normalizePlayerName(player.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAllGuessPlayers(): PlayerUnion[] {
  const seen = new Set<string>();
  return SPORTS.flatMap(getGuessPlayerRoster).filter(player => {
    const key = normalizePlayerName(player.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function trophiesOf(player: PlayerUnion): string[] {
  if ('trophies' in player && Array.isArray(player.trophies)) return player.trophies;
  return [];
}

export function normalizePlayerName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesFilters(
  player: PlayerUnion,
  filters: {
    nationality?: string;
    team?: string;
    league?: string;
    position?: string;
    decade?: string;
    trophy?: string;
  },
): boolean {
  if (filters.nationality && nationalityOf(player) !== filters.nationality) return false;
  if (filters.team && !teamsOf(player).includes(filters.team)) return false;
  if (filters.league && !leaguesOf(player).includes(filters.league)) return false;
  if (filters.position && !positionsOf(player).includes(filters.position)) return false;
  if (filters.decade && !decadesOf(player).includes(filters.decade)) return false;
  if (filters.trophy && !trophiesOf(player).includes(filters.trophy)) return false;
  return true;
}

function pickTeam(player: PlayerUnion, seed: number): string | null {
  const teams = teamsOf(player);
  if (teams.length === 0) return null;
  // Prefer better-known later career clubs when available.
  const idx = Math.min(teams.length - 1, 1 + (seed % Math.max(1, teams.length - 1)));
  return teams[idx] ?? teams[0]!;
}

function buildHintLadder(
  player: PlayerUnion,
  roster: PlayerUnion[],
  seed: number,
): { hints: ClueHint[]; filters: Array<Record<string, string>> } | null {
  const nationality = nationalityOf(player);
  const team = pickTeam(player, seed);
  const positions = positionsOf(player);
  const decades = decadesOf(player);
  const trophies = trophiesOf(player);

  if (!nationality || !team) return null;

  const position = positions[0] ?? null;
  const decade = decades.length > 0 ? decades[seed % decades.length]! : null;
  const trophy = trophies.length > 0 ? trophies[seed % trophies.length]! : null;

  type Step = { key: string; filter: Record<string, string>; label: string };
  const steps: Step[] = [];

  // The opener always combines enough facts to point toward one intended player.
  const openerFilter: Record<string, string> = position
    ? { nationality, position, team }
    : { nationality, team };
  const openerLabels = position
    ? [
        `A ${nationality} ${position} who has played for ${team}`,
        `From ${nationality}, this ${position} has represented ${team}`,
        `This ${team} ${position} is from ${nationality}`,
      ]
    : [
        `A ${nationality} player who has represented ${team}`,
        `From ${nationality}, this player has appeared for ${team}`,
        `This ${team} player is from ${nationality}`,
      ];
  steps.push({
    key: 'detailed-opener',
    filter: openerFilter,
    label: openerLabels[seed % openerLabels.length]!,
  });

  if (decade) {
    steps.push({
      key: 'decade',
      filter: { ...steps[steps.length - 1]!.filter, decade },
      label: `Featured in the ${decade}`,
    });
  }

  if (trophy) {
    steps.push({
      key: 'trophy',
      filter: { ...steps[steps.length - 1]!.filter, trophy },
      label: `Won: ${trophy}`,
    });
  }

  // Ensure every prefix still matches the seed player and keeps a sensible pool.
  const validSteps = steps.filter(step => {
    const pool = roster.filter(p => matchesFilters(p, step.filter));
    return pool.some(p => p.id === player.id) && pool.length >= 1 && pool.length <= 48;
  });

  if (validSteps.length < 2) return null;

  const initials = player.name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase())
    .filter(Boolean)
    .join('.');
  const nameParts = player.name.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] ?? player.name;
  const surname = nameParts[nameParts.length - 1] ?? player.name;
  const sliced = validSteps.slice(0, CLUE_MAX_HINTS - 2);
  const lastFilter = sliced[sliced.length - 1]?.filter ?? validSteps[validSteps.length - 1]!.filter;
  while (sliced.length < CLUE_MAX_HINTS - 1) {
    const useFirstName = sliced.length % 2 === 0;
    sliced.push({
      key: useFirstName ? 'first-letter' : 'surname-letter',
      filter: lastFilter,
      label: useFirstName
        ? `First name starts with ${firstName[0]?.toUpperCase()}`
        : `Surname starts with ${surname[0]?.toUpperCase()}`,
    });
  }
  sliced.push({
    key: 'initials',
    filter: lastFilter,
    label: `Initials: ${initials}`,
  });
  const hints = sliced.map((step, index) => ({
    id: `${player.id}-h${index}`,
    label: step.label,
  }));
  const filters = sliced.map(s => s.filter);

  return {
    hints,
    filters,
  };
}

function difficultyForPoolSize(size: number): CluePrompt['difficulty'] {
  if (size <= 2) return 'easy';
  if (size <= 6) return 'medium';
  return 'hard';
}

export function generateCluePrompts(
  sport: Sport,
  count = 24,
  seedKey = `clue-${Date.now()}`,
): CluePrompt[] {
  const seed = hashString(`${sport}-clue-${seedKey}`);
  const roster = getGuessPlayerRoster(sport);
  const extraNames = new Set(guessPlayerExtras(sport).map(player => normalizePlayerName(player.name)));
  const extras = shuffleWithSeed(
    roster.filter(player => extraNames.has(normalizePlayerName(player.name))),
    seed + 1,
  );
  const core = shuffleWithSeed(
    roster.filter(player => !extraNames.has(normalizePlayerName(player.name))),
    seed + 2,
  );
  const players: PlayerUnion[] = [];
  while (extras.length > 0 || core.length > 0) {
    const extra = extras.shift();
    if (extra) players.push(extra);
    for (let i = 0; i < 2; i++) {
      const player = core.shift();
      if (player) players.push(player);
    }
  }
  const prompts: CluePrompt[] = [];
  const used = new Set<string>();

  let cursor = 0;
  let attempts = 0;
  while (prompts.length < count && attempts < roster.length * 6) {
    attempts += 1;
    const player = players[cursor % players.length]!;
    cursor += 1;
    if (used.has(player.id)) continue;

    const ladder = buildHintLadder(player, roster, seed + attempts * 17);
    if (!ladder) continue;

    const openingPool = roster.filter(p => matchesFilters(p, ladder.filters[0]!));

    used.add(player.id);
    prompts.push({
      id: `${player.id}-clue-${seed + attempts}`,
      sport,
      targetId: player.id,
      targetName: player.name,
      hints: ladder.hints,
      difficulty: difficultyForPoolSize(openingPool.length),
    });
  }

  // Mix difficulty bands so the minute doesn't feel one-note.
  const easy = prompts.filter(p => p.difficulty === 'easy');
  const medium = prompts.filter(p => p.difficulty === 'medium');
  const hard = prompts.filter(p => p.difficulty === 'hard');
  const mixed: CluePrompt[] = [];
  const bags = [easy, medium, hard, medium, easy, hard];
  let bi = 0;
  while (mixed.length < prompts.length) {
    const bag = bags[bi % bags.length]!;
    bi += 1;
    const next = bag.shift();
    if (next) mixed.push(next);
    else if (easy.length + medium.length + hard.length === 0) break;
  }
  return mixed.length > 0 ? mixed : prompts;
}

export function generateMixedGuessPrompts(
  count = 30,
  seedKey = `guess-${Date.now()}`,
): CluePrompt[] {
  const seed = hashString(seedKey);
  const perSport = Math.max(6, Math.ceil(count / SPORTS.length) + 2);
  const pool = SPORTS.flatMap((sport, index) =>
    generateCluePrompts(sport, perSport, `${seedKey}-${sport}-${index}`),
  );
  return shuffleWithSeed(pool, seed).slice(0, count);
}

export function scoreClueAnswer(hintsUsed: number): number {
  const used = Math.max(0, Math.min(CLUE_MAX_HINTS - 1, hintsUsed));
  const multipliers = [1, 0.78, 0.58, 0.38, 0.22];
  const mult = multipliers[used] ?? 0.22;
  return Math.max(CLUE_MIN_POINTS, Math.round(CLUE_BASE_POINTS * mult));
}

export function matchTypedAnswer(
  input: string,
  candidates: Array<{ id: string; name: string }>,
): { id: string; name: string } | null {
  const q = normalizePlayerName(input);
  if (q.length < 2) return null;

  for (const c of candidates) {
    if (normalizePlayerName(c.name) === q) return c;
  }

  // Allow last-name-only when unique among candidates.
  const lastHits = candidates.filter(c => {
    const parts = normalizePlayerName(c.name).split(' ');
    return parts[parts.length - 1] === q;
  });
  if (lastHits.length === 1) return lastHits[0]!;

  return null;
}

export function suggestPlayers(
  query: string,
  roster: PlayerUnion[],
  limit = 8,
): ClueSuggestion[] {
  const q = normalizePlayerName(query);
  if (q.length < 1) return [];

  const scored = roster
    .map(p => {
      const n = normalizePlayerName(p.name);
      let score = 0;
      if (n === q) score = 100;
      else if (n.startsWith(q)) score = 80;
      else if (n.split(' ').some(part => part.startsWith(q))) score = 70;
      else if (n.includes(q)) score = 40;
      else return null;
      return { id: p.id, name: p.name, score };
    })
    .filter((x): x is { id: string; name: string; score: number } => Boolean(x))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  const seen = new Set<string>();
  const out: ClueSuggestion[] = [];
  for (const row of scored) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push({ id: row.id, name: row.name });
    if (out.length >= limit) break;
  }
  return out;
}
