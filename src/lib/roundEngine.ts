import type { BoardCell, Sport } from '../types';
import { GRID_SIZE } from '../types';
import { getCategories, getPlayers, getMatchingCategories, toBoardCategory, type CategoryDef, type PlayerUnion } from '../data/categories';
import { hashString, shuffleWithSeed } from './seed';

export function generateBoard(sport: Sport, seedKey: string): BoardCell[] {
  const seed = hashString(`${sport}-board-${seedKey}`);
  const all = getCategories(sport).filter(c => c.poolSize >= 4);
  const shuffled = shuffleWithSeed(all, seed);

  const picked: CategoryDef[] = [];
  const usedTags = new Set<string>();

  for (const cat of shuffled) {
    if (picked.length >= GRID_SIZE * GRID_SIZE) break;
    if (usedTags.has(cat.tag) && picked.filter(p => p.tag === cat.tag).length >= 2) continue;
    picked.push(cat);
    usedTags.add(cat.tag);
  }

  for (const cat of shuffled) {
    if (picked.length >= GRID_SIZE * GRID_SIZE) break;
    if (!picked.find(p => p.id === cat.id)) picked.push(cat);
  }

  return picked.slice(0, GRID_SIZE * GRID_SIZE).map(cat => ({
    category: toBoardCategory(cat),
    filled: false,
    playerName: null,
    playerId: null,
  }));
}

export function pickNextPlayer(
  sport: Sport,
  board: BoardCell[],
  usedIds: Set<string>,
  seed: number,
): PlayerUnion | null {
  const players = getPlayers(sport);
  const categoryDefs = getCategories(sport);
  const openCats = board.filter(c => !c.filled).map(c => categoryDefs.find(d => d.id === c.category.id)!);

  const valid = players.filter(p => {
    if (usedIds.has(p.id)) return false;
    return getMatchingCategories(p, openCats).length > 0;
  });

  if (valid.length === 0) return null;

  const shuffled = shuffleWithSeed(valid, seed + usedIds.size);
  return shuffled[0];
}

export function validateAnswer(
  sport: Sport,
  board: BoardCell[],
  cellIndex: number,
  player: PlayerUnion,
): boolean {
  const cell = board[cellIndex];
  if (!cell || cell.filled) return false;
  const cat = getCategories(sport).find(c => c.id === cell.category.id);
  return cat ? cat.validate(player) : false;
}

export function getValidCellIndices(
  sport: Sport,
  board: BoardCell[],
  player: PlayerUnion,
): number[] {
  const categoryDefs = getCategories(sport);
  return board
    .map((cell, i) => ({ cell, i }))
    .filter(({ cell }) => !cell.filled)
    .filter(({ cell }) => {
      const cat = categoryDefs.find(c => c.id === cell.category.id);
      return cat?.validate(player);
    })
    .map(({ i }) => i);
}

export function streakMultiplier(streak: number): number {
  if (streak >= 10) return 5;
  if (streak >= 7) return 4;
  if (streak >= 5) return 3;
  if (streak >= 3) return 2;
  if (streak >= 2) return 1.5;
  return 1;
}

export function pointsForDifficulty(d: 1 | 2 | 3): number {
  return d === 3 ? 3 : d === 2 ? 2 : 2;
}

export function generateShareText(
  sport: Sport,
  mode: string,
  score: number,
  correct: number,
  boardFilled: number,
  date: string,
): string {
  const emoji =
    sport === 'soccer' ? '⚽' : sport === 'basketball' ? '🏀' : sport === 'football' ? '🏈' : '⚾';
  return `${emoji} Sportivia ${score} pts · ${correct} correct · ${boardFilled}/9 filled\n${mode === 'daily' ? `Daily ${date}` : 'Training'} — beat my score!`;
}
