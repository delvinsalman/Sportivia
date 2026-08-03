import { assetUrl } from './assetUrl';

export type DailySpinPrizeKind = 'coins' | 'upgrades' | 'spins';

export interface DailySpinSegment {
  id: string;
  kind: DailySpinPrizeKind;
  amount: number;
  label: string;
  /** Short hub label on the wheel face */
  face: string;
  weight: number;
  color: string;
  text: string;
}

export const DAILY_SPIN_COOLDOWN_MS = 24 * 60 * 60 * 1000;
export const DAILY_SPIN_ICON = assetUrl('/icons/daily-spin.png');

/**
 * Weighted prizes. Higher weight = more common.
 * 100k is intentionally tiny (~0.35% / about 1 in 285).
 */
export const DAILY_SPIN_SEGMENTS: readonly DailySpinSegment[] = [
  { id: 'c1k', kind: 'coins', amount: 1_000, label: '1,000 coins', face: '1K', weight: 26, color: '#1a3a5c', text: '#e8eaef' },
  { id: 'u1', kind: 'upgrades', amount: 1, label: '1 free upgrade', face: '+1', weight: 12, color: '#1a6b3c', text: '#bbf7d0' },
  { id: 'c2k', kind: 'coins', amount: 2_000, label: '2,000 coins', face: '2K', weight: 19, color: '#2f4fd0', text: '#dbe4ff' },
  { id: 'spin1', kind: 'spins', amount: 1, label: '1 free spin', face: '+SPIN', weight: 9, color: '#7c3aed', text: '#e9d5ff' },
  { id: 'u2', kind: 'upgrades', amount: 2, label: '2 free upgrades', face: '+2', weight: 5, color: '#c45a16', text: '#ffedd5' },
  { id: 'c5k', kind: 'coins', amount: 5_000, label: '5,000 coins', face: '5K', weight: 14, color: '#0e7490', text: '#cffafe' },
  { id: 'c10k', kind: 'coins', amount: 10_000, label: '10,000 coins', face: '10K', weight: 7, color: '#b8860b', text: '#fef9c3' },
  { id: 'u5', kind: 'upgrades', amount: 5, label: '5 free upgrades', face: '+5', weight: 3, color: '#b91c1c', text: '#fecaca' },
  { id: 'c30k', kind: 'coins', amount: 30_000, label: '30,000 coins', face: '30K', weight: 2.65, color: '#f0b232', text: '#1a1200' },
  { id: 'c100k', kind: 'coins', amount: 100_000, label: '100,000 coins', face: '100K', weight: 0.35, color: '#fbbf24', text: '#1a1200' },
];

/** Lighter rim/highlight tint for each segment (wheel face detail). */
export const DAILY_SPIN_SEGMENT_LIGHT: Record<string, string> = {
  c1k: '#2a5a8a',
  u1: '#23a559',
  c2k: '#5865f2',
  spin1: '#a855f7',
  u2: '#ea7a2e',
  c5k: '#22d3ee',
  c10k: '#f0b232',
  u5: '#ed4245',
  c30k: '#ffe08a',
  c100k: '#fff7c2',
};

export type DailySpinPrize = DailySpinSegment;

export function dailySpinTotalWeight(segments: readonly DailySpinSegment[] = DAILY_SPIN_SEGMENTS): number {
  return segments.reduce((sum, s) => sum + s.weight, 0);
}

export function rollDailySpinPrize(
  segments: readonly DailySpinSegment[] = DAILY_SPIN_SEGMENTS,
  rng: () => number = Math.random,
): DailySpinPrize {
  const total = dailySpinTotalWeight(segments);
  let roll = rng() * total;
  for (const segment of segments) {
    roll -= segment.weight;
    if (roll < 0) return segment;
  }
  return segments[segments.length - 1];
}

export function segmentIndex(
  prizeId: string,
  segments: readonly DailySpinSegment[] = DAILY_SPIN_SEGMENTS,
): number {
  const i = segments.findIndex(s => s.id === prizeId);
  return i >= 0 ? i : 0;
}

/** Degrees to rotate the wheel so segment `index` lands under the top pointer.
 *  Segments are laid out clockwise from 12 o'clock (CSS conic from 0deg).
 *  Pass currentRotation so successive spins still land correctly. */
export function spinDegreesForIndex(
  index: number,
  segmentCount: number,
  fullSpins = 6,
  currentRotation = 0,
): number {
  const slice = 360 / segmentCount;
  const centerFromTop = index * slice + slice / 2;
  const target = (360 - centerFromTop) % 360;
  const current = ((currentRotation % 360) + 360) % 360;
  const delta = (target - current + 360) % 360;
  return fullSpins * 360 + delta;
}

/** True while still within 24h of the last spin timestamp. */
export function isDailySpinOnCooldown(
  spunAt: number | null | undefined,
  now = Date.now(),
): boolean {
  if (typeof spunAt !== 'number' || !Number.isFinite(spunAt)) return false;
  return now - spunAt < DAILY_SPIN_COOLDOWN_MS;
}

export function dailySpinMsRemaining(
  spunAt: number | null | undefined,
  now = Date.now(),
): number {
  if (typeof spunAt !== 'number' || !Number.isFinite(spunAt)) return 0;
  return Math.max(0, DAILY_SPIN_COOLDOWN_MS - (now - spunAt));
}

export function formatSpinCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}
