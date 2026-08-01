/** Build-time flags for platform packages (Poki, Y8, itch). Never set on the live site. */

export function isPokiBuild(): boolean {
  return import.meta.env.VITE_POKI === '1';
}

export const LIVE_SITE_URL = 'https://sportivia.xyz';
