import type { Sport } from '../types';

/** Primary UI accent per sport */
export const SPORT_ACCENT: Record<Sport, string> = {
  soccer: '#23a559',
  basketball: '#f97316',
  baseball: '#f4f4f5',
  football: '#8b5a2b',
  hockey: '#38bdf8',
};

/** Secondary stitch / outline accent */
export const SPORT_STITCH: Record<Sport, string> = {
  soccer: '#23a559',
  basketball: '#f97316',
  baseball: '#c41e3a',
  football: '#5c3d2e',
  hockey: '#e2e8f0',
};

export const SPORT_LABEL: Record<Sport, string> = {
  soccer: 'Soccer',
  basketball: 'NBA',
  baseball: 'MLB',
  football: 'NFL',
  hockey: 'NHL',
};

export const SPORT_PICKER_BG: Record<Sport, string> = {
  soccer: 'rgba(35,165,89,0.25)',
  basketball: 'rgba(249,115,22,0.25)',
  baseball: 'rgba(255,255,255,0.14)',
  football: 'rgba(139,90,43,0.28)',
  hockey: 'rgba(56,189,248,0.22)',
};

/** Podium rim + glow */
export const SPORT_PODIUM_ACCENT: Record<Sport, string> = {
  soccer: SPORT_ACCENT.soccer,
  basketball: SPORT_ACCENT.basketball,
  baseball: SPORT_ACCENT.baseball,
  football: SPORT_ACCENT.football,
  hockey: SPORT_ACCENT.hockey,
};

export const SPORTS: Sport[] = ['soccer', 'basketball', 'baseball', 'football', 'hockey'];
