/**
 * Resolve player face images for filled board cells (soccer / NBA / MLB).
 * Prefers TheSportsDB cutouts; falls back to Wikipedia thumbnails.
 * Results are cached in memory + localStorage by sport + player id.
 */

import type { Sport } from '../types';

const CACHE_KEY = 'sportivia.playerFaces.v2';
const LEGACY_SOCCER_KEY = 'sportivia.soccerFaces.v1';
const SPORTSDB = 'https://www.thesportsdb.com/api/v1/json/123/searchplayers.php';
const WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary';

const SPORTSDB_SPORT: Record<Sport, string> = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  baseball: 'Baseball',
};

const WIKI_SUFFIXES: Record<Sport, string[]> = {
  soccer: ['(footballer)', '(soccer)'],
  basketball: ['(basketball)', '(basketball player)'],
  baseball: ['(baseball)', '(baseball player)'],
};

/** Wikipedia titles for short / ambiguous names SportsDB often misses. */
const WIKI_TITLE_BY_ID: Record<Sport, Record<string, string>> = {
  soccer: {
    xavi: 'Xavi_(footballer,_born_1980)',
    pedri: 'Pedri',
    r9: 'Ronaldo_(Brazilian_footballer)',
    ronaldo9: 'Ronaldo_(Brazilian_footballer)',
    kaka: 'Kaká',
    guti: 'Guti_(footballer,_born_1976)',
    pepe: 'Pepe_(footballer,_born_1983)',
    dani: 'Dani_Alves',
    alex: 'Alex_(footballer,_born_1982)',
    saviola: 'Javier_Saviola',
    cr7: 'Cristiano_Ronaldo',
    messi: 'Lionel_Messi',
  },
  basketball: {
    mj: 'Michael_Jordan',
    magic: 'Magic_Johnson',
    bird: 'Larry_Bird',
    shaq: 'Shaquille_O%27Neal',
    kd: 'Kevin_Durant',
    ai: 'Allen_Iverson',
    kg: 'Kevin_Garnett',
    cp3: 'Chris_Paul',
    dame: 'Damian_Lillard',
    giannis: 'Giannis_Antetokounmpo',
    jokic: 'Nikola_Jokić',
    luka: 'Luka_Dončić',
  },
  baseball: {
    judge: 'Aaron_Judge',
    ohtani: 'Shohei_Ohtani',
    acuna: 'Ronald_Acuña_Jr.',
    guerrero: 'Vladimir_Guerrero_Jr.',
    tatis: 'Fernando_Tatís_Jr.',
    jrod: 'Julio_Rodríguez',
    perdomo: 'Elly_De_La_Cruz',
    witt: 'Bobby_Witt_Jr.',
    goldy: 'Paul_Goldschmidt',
    yeli: 'Christian_Yelich',
    babe: 'Babe_Ruth',
    jackie: 'Jackie_Robinson',
  },
};

type CacheMap = Record<string, string | null>;

const memory = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

function cacheId(sport: Sport, playerId: string): string {
  return `${sport}:${playerId}`;
}

function migrateLegacySoccerCache(disk: CacheMap): CacheMap {
  try {
    const raw = localStorage.getItem(LEGACY_SOCCER_KEY);
    if (!raw) return disk;
    const legacy = JSON.parse(raw) as CacheMap;
    if (!legacy || typeof legacy !== 'object') return disk;
    let changed = false;
    for (const [id, url] of Object.entries(legacy)) {
      const key = cacheId('soccer', id);
      if (!(key in disk)) {
        disk[key] = url;
        changed = true;
      }
    }
    if (changed) localStorage.setItem(CACHE_KEY, JSON.stringify(disk));
    localStorage.removeItem(LEGACY_SOCCER_KEY);
  } catch {
    /* ignore */
  }
  return disk;
}

function loadDisk(): CacheMap {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    let parsed: CacheMap = {};
    if (raw) {
      const data = JSON.parse(raw) as CacheMap;
      if (data && typeof data === 'object') parsed = data;
    }
    return migrateLegacySoccerCache(parsed);
  } catch {
    return {};
  }
}

function saveDisk(key: string, url: string | null) {
  try {
    const disk = loadDisk();
    disk[key] = url;
    localStorage.setItem(CACHE_KEY, JSON.stringify(disk));
  } catch {
    /* quota / private mode */
  }
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when SportsDB result is plausibly the same person as our roster name. */
export function namesLikelyMatch(query: string, result: string): boolean {
  const q = norm(query);
  const r = norm(result);
  if (!q || !r) return false;
  if (q === r) return true;
  if (r.startsWith(`${q} `) || q.startsWith(`${r} `)) return true;

  const qt = q.split(' ');
  const rt = r.split(' ');
  // Single-token query must equal the first token (blocks Pedri → Pedrinho)
  if (qt.length === 1) return rt[0] === q;
  // Multi-token: every query token appears in the result
  return qt.every(t => rt.includes(t));
}

function pickImage(player: {
  strCutout?: string | null;
  strThumb?: string | null;
  strRender?: string | null;
}): string | null {
  return player.strCutout || player.strThumb || player.strRender || null;
}

async function fetchSportsDb(sport: Sport, name: string): Promise<string | null> {
  const q = name.trim().replace(/\s+/g, '_');
  if (!q) return null;
  const want = SPORTSDB_SPORT[sport].toLowerCase();
  try {
    const res = await fetch(`${SPORTSDB}?p=${encodeURIComponent(q)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      player?: Array<{
        strPlayer?: string;
        strSport?: string;
        strCutout?: string | null;
        strThumb?: string | null;
        strRender?: string | null;
      }> | null;
    };
    const all = data.player ?? [];
    const sportPool = all.filter(p => (p.strSport || '').toLowerCase() === want);
    const pool = sportPool.length ? sportPool : all;
    const match = pool.find(p => p.strPlayer && namesLikelyMatch(name, p.strPlayer));
    if (!match) return null;
    // Prefer correct-sport match; reject cross-sport if we had to fall back to `all`
    if (sportPool.length === 0 && (match.strSport || '').toLowerCase() !== want) {
      return null;
    }
    return pickImage(match);
  } catch {
    return null;
  }
}

async function fetchWikiTitle(title: string): Promise<string | null> {
  try {
    const res = await fetch(`${WIKI}/${title}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      type?: string;
      thumbnail?: { source?: string };
      originalimage?: { source?: string };
    };
    if (data.type === 'disambiguation') return null;
    return data.thumbnail?.source || data.originalimage?.source || null;
  } catch {
    return null;
  }
}

function wikiPath(title: string): string {
  // Allow pre-encoded overrides (e.g. O%27Neal) while encoding plain titles.
  if (/%[0-9A-Fa-f]{2}/.test(title)) return title.replace(/ /g, '_');
  return encodeURIComponent(title.replace(/ /g, '_'));
}

async function fetchWikipedia(
  sport: Sport,
  playerId: string,
  name: string,
): Promise<string | null> {
  const override = WIKI_TITLE_BY_ID[sport][playerId];
  const tries = [
    override,
    name,
    ...WIKI_SUFFIXES[sport].map(s => `${name} ${s}`),
  ].filter(Boolean) as string[];

  for (const title of tries) {
    const url = await fetchWikiTitle(wikiPath(title));
    if (url) return url;
  }
  return null;
}

function getCached(sport: Sport, playerId: string): string | null | undefined {
  const key = cacheId(sport, playerId);
  if (memory.has(key)) return memory.get(key);
  const disk = loadDisk();
  if (key in disk) {
    memory.set(key, disk[key]!);
    return disk[key]!;
  }
  return undefined;
}

function setCached(sport: Sport, playerId: string, url: string | null) {
  const key = cacheId(sport, playerId);
  memory.set(key, url);
  saveDisk(key, url);
}

/**
 * Resolve a face URL for a player. Cached once resolved
 * (including null = not found, so we don't hammer APIs).
 */
export async function resolvePlayerFace(
  sport: Sport,
  playerId: string,
  playerName: string,
): Promise<string | null> {
  const cached = getCached(sport, playerId);
  if (cached !== undefined) return cached;

  const key = cacheId(sport, playerId);
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = (async () => {
    const url =
      (await fetchSportsDb(sport, playerName)) ||
      (await fetchWikipedia(sport, playerId, playerName));

    setCached(sport, playerId, url);
    inflight.delete(key);
    return url;
  })().catch(() => {
    inflight.delete(key);
    return null;
  });

  inflight.set(key, promise);
  return promise;
}

/** Warm the cache when a player appears (so the cell face is ready on correct). */
export function prefetchPlayerFace(sport: Sport, playerId: string, playerName: string): void {
  void resolvePlayerFace(sport, playerId, playerName);
}

export function getCachedPlayerFace(
  sport: Sport,
  playerId: string,
): string | null | undefined {
  return getCached(sport, playerId);
}

/** @deprecated use resolvePlayerFace('soccer', ...) */
export async function resolveSoccerFace(playerId: string, playerName: string) {
  return resolvePlayerFace('soccer', playerId, playerName);
}

/** @deprecated use prefetchPlayerFace('soccer', ...) */
export function prefetchSoccerFace(playerId: string, playerName: string): void {
  prefetchPlayerFace('soccer', playerId, playerName);
}

/** @deprecated use getCachedPlayerFace('soccer', ...) */
export function getCachedSoccerFace(playerId: string): string | null | undefined {
  return getCachedPlayerFace('soccer', playerId);
}
