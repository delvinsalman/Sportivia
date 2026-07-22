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
  basketball: 'Basketball',
  baseball: 'Baseball',
  football: 'Football',
  hockey: 'Hockey',
};

export const SPORT_PICKER_BG: Record<Sport, string> = {
  soccer: 'rgba(35,165,89,0.25)',
  basketball: 'rgba(249,115,22,0.25)',
  baseball: 'rgba(255,255,255,0.14)',
  football: 'rgba(139,90,43,0.28)',
  hockey: 'rgba(56,189,248,0.22)',
};

/**
 * Home sports-rail tab fills — same vibe as SportBackground, a notch lighter
 * so they read as tinted glass over the page instead of flat charcoal.
 */
export const SPORT_RAIL_BG: Record<
  Sport,
  { base: string; hover: string; active: string }
> = {
  soccer: {
    base: 'linear-gradient(165deg, rgba(45,185,105,0.48) 0%, rgba(18,55,38,0.62) 55%, rgba(12,32,24,0.55) 100%)',
    hover:
      'linear-gradient(165deg, rgba(55,200,120,0.58) 0%, rgba(22,70,48,0.7) 55%, rgba(14,40,28,0.6) 100%)',
    active:
      'linear-gradient(165deg, rgba(60,210,125,0.55) 0%, rgba(24,72,48,0.72) 50%, rgba(16,42,30,0.65) 100%)',
  },
  basketball: {
    base: 'linear-gradient(165deg, rgba(255,140,50,0.48) 0%, rgba(70,38,16,0.62) 55%, rgba(36,22,12,0.55) 100%)',
    hover:
      'linear-gradient(165deg, rgba(255,155,70,0.58) 0%, rgba(85,45,18,0.7) 55%, rgba(42,26,14,0.6) 100%)',
    active:
      'linear-gradient(165deg, rgba(255,160,75,0.55) 0%, rgba(88,48,20,0.72) 50%, rgba(44,28,14,0.65) 100%)',
  },
  baseball: {
    base: 'linear-gradient(165deg, rgba(255,255,255,0.28) 0%, rgba(48,50,58,0.55) 55%, rgba(28,30,36,0.5) 100%)',
    hover:
      'linear-gradient(165deg, rgba(255,255,255,0.36) 0%, rgba(58,60,70,0.62) 55%, rgba(34,36,42,0.55) 100%)',
    active:
      'linear-gradient(165deg, rgba(255,255,255,0.34) 0%, rgba(56,58,68,0.65) 50%, rgba(32,34,40,0.58) 100%)',
  },
  football: {
    base: 'linear-gradient(165deg, rgba(180,135,90,0.48) 0%, rgba(70,45,28,0.62) 55%, rgba(36,24,16,0.55) 100%)',
    hover:
      'linear-gradient(165deg, rgba(195,150,100,0.58) 0%, rgba(85,55,32,0.7) 55%, rgba(42,28,18,0.6) 100%)',
    active:
      'linear-gradient(165deg, rgba(200,155,105,0.55) 0%, rgba(88,58,34,0.72) 50%, rgba(44,30,18,0.65) 100%)',
  },
  hockey: {
    base: 'linear-gradient(165deg, rgba(80,200,255,0.42) 0%, rgba(28,55,75,0.62) 55%, rgba(16,28,40,0.55) 100%)',
    hover:
      'linear-gradient(165deg, rgba(100,215,255,0.52) 0%, rgba(34,68,90,0.7) 55%, rgba(18,34,48,0.6) 100%)',
    active:
      'linear-gradient(165deg, rgba(105,220,255,0.5) 0%, rgba(36,72,95,0.72) 50%, rgba(20,36,50,0.65) 100%)',
  },
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
