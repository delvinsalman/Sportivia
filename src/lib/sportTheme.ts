import type { Sport } from '../types';

/** Primary UI accent per sport */
export const SPORT_ACCENT: Record<Sport, string> = {
  soccer: '#23a559',
  basketball: '#f97316',
  baseball: '#f4f4f5',
  football: '#8b5a2b',
};

/** Secondary stitch / outline accent */
export const SPORT_STITCH: Record<Sport, string> = {
  soccer: '#23a559',
  basketball: '#f97316',
  baseball: '#c41e3a',
  football: '#5c3d2e',
};

export const SPORT_LABEL: Record<Sport, string> = {
  soccer: 'Soccer',
  basketball: 'NBA',
  baseball: 'MLB',
  football: 'NFL',
};

export const SPORT_PICKER_BG: Record<Sport, string> = {
  soccer: 'rgba(35,165,89,0.25)',
  basketball: 'rgba(249,115,22,0.25)',
  baseball: 'rgba(255,255,255,0.14)',
  football: 'rgba(139,90,43,0.28)',
};

/** Podium rim + glow */
export const SPORT_PODIUM_ACCENT: Record<Sport, string> = {
  soccer: SPORT_ACCENT.soccer,
  basketball: SPORT_ACCENT.basketball,
  baseball: SPORT_ACCENT.baseball,
  football: SPORT_ACCENT.football,
};

export const SPORTS: Sport[] = ['soccer', 'basketball', 'baseball', 'football'];

export type ComingSoonSport = 'hockey';

export const COMING_SOON_SPORTS: ComingSoonSport[] = ['hockey'];

export const COMING_SOON_LABEL: Record<ComingSoonSport, string> = {
  hockey: 'NHL',
};

export const COMING_SOON_ACCENT: Record<ComingSoonSport, string> = {
  hockey: '#64748b',
};
