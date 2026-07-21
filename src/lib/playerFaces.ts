/**
 * Resolve professional player portrait images for cards / board faces.
 * Preference order (clean cutouts first, then always fill a portrait):
 *   1) Manual portrait overrides
 *   2) TheSportsDB cutouts (transparent / no-bg portraits)
 *   3) ESPN official headshots (studio portraits)
 *   4) TheSportsDB thumbs / renders
 *   5) Wikipedia page image (last resort so every card still has a face)
 */

import type { Sport } from '../types';

const CACHE_KEY = 'sportivia.playerFaces.v3';
const BIO_CACHE_KEY = 'sportivia.playerCardBios.v1';
/** Bump to force a full face-cache refresh after portrait pipeline changes. */
const REFETCH_MARK = 'sportivia.playerFaces.refetch.v17';
const LEGACY_SOCCER_KEY = 'sportivia.soccerFaces.v1';
const SPORTSDB = 'https://www.thesportsdb.com/api/v1/json/123/searchplayers.php';
const WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const ESPN_SEARCH = 'https://site.web.api.espn.com/apis/common/v3/search';

/** Direct portrait URLs when auto lookup is wrong / missing. Prefer cutouts / headshots. */
const FACE_URL_BY_ID: Partial<Record<Sport, Record<string, string>>> = {
  baseball: {
    smithwill: 'https://a.espncdn.com/i/headshots/mlb/players/full/38309.png',
  },
  basketball: {
    rodman: 'https://cdn.nba.com/headshots/nba/latest/1040x760/23.png',
    isiah: 'https://cdn.nba.com/headshots/nba/latest/1040x760/78318.png',
    bigben: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1112.png',
    ktown: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1626157.png',
    jalengreen: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630224.png',
    ray: 'https://cdn.nba.com/headshots/nba/latest/1040x760/951.png',
    johnwall: 'https://cdn.nba.com/headshots/nba/latest/1040x760/202322.png',
    mj: 'https://cdn.nba.com/headshots/nba/latest/1040x760/893.png',
    // Was wrongly resolving to a women's college player named Nene
    nene: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2403.png',
    lou: 'https://cdn.nba.com/headshots/nba/latest/1040x760/101150.png',
  },
  soccer: {
    // Permanent local portraits (see public/faces/soccer + localizeSoccerFaces.mts)
    pele: '/faces/soccer/pele.png',
    kaka: '/faces/soccer/kaka.png',
    lewandowski: '/faces/soccer/lewandowski.png',
    eusebio: '/faces/soccer/eusebio.webp',
    cruyff: '/faces/soccer/cruyff.png',
    r9: '/faces/soccer/r9.png',
    nedved: '/faces/soccer/nedved.jpg',
    figo: '/faces/soccer/figo.png',
    rodri: '/faces/soccer/rodri.png',
    pique: '/faces/soccer/pique.webp',
  },
  football: {
    watt: 'https://static.www.nfl.com/image/private/t_headshot_desktop/league/pooulgm7mdcx5x9gza7l',
  },
};

/** SportsDB search names when roster name / id won't hit the right record. */
const SPORTSDB_QUERY_BY_ID: Partial<Record<Sport, Record<string, string>>> = {
  soccer: {
    pele: 'Edson Arantes',
    r9: 'Ronaldo',
    cr7: 'Cristiano Ronaldo',
    kaka: 'Kaka',
    ronaldinho: 'Ronaldinho',
    maradona: 'Diego Maradona',
    vinicius: 'Vinicius Junior',
    pedri: 'Pedri',
    rodri: 'Rodri Hernandez',
    nunez: 'Darwin Nunez',
    soyuncu: 'Caglar Soyuncu',
    kimminjae: 'Kim Min-Jae',
  },
  basketball: {
    mj: 'Michael Jordan',
    kd: 'Kevin Durant',
    ai: 'Allen Iverson',
    cp3: 'Chris Paul',
    ktown: 'Karl-Anthony Towns',
    jalengreen: 'Jalen Green',
    ray: 'Ray Allen',
    johnwall: 'John Wall',
    nene: 'Nene Hilario',
    lou: 'Lou Williams',
  },
  baseball: {
    babe: 'Babe Ruth',
    ruth: 'Babe Ruth',
    jackie: 'Jackie Robinson',
    smithwill: 'Will Smith',
  },
  football: {
    lt: 'Lawrence Taylor',
    sweetnes: 'Jim Brown',
    sweetness: 'Jim Brown',
    megatron: 'Calvin Johnson',
    sandy: 'Deion Sanders',
    deion: 'Deion Sanders',
    ap: 'Adrian Peterson',
  },
  hockey: {
    'wayne-gretzky': 'Wayne Gretzky',
    'mario-lemieux': 'Mario Lemieux',
    'alex-ovechkin': 'Alex Ovechkin',
  },
};

const SPORTSDB_SPORT: Record<Sport, string> = {
  soccer: 'Soccer',
  basketball: 'Basketball',
  baseball: 'Baseball',
  football: 'American Football',
  hockey: 'Ice Hockey',
};

/** ESPN search `sport` field values. */
const ESPN_SPORT: Record<Sport, string> = {
  soccer: 'soccer',
  basketball: 'basketball',
  baseball: 'baseball',
  football: 'football',
  hockey: 'hockey',
};

const WIKI_SUFFIXES: Record<Sport, string[]> = {
  soccer: ['(footballer)', '(soccer)'],
  basketball: ['(basketball)', '(basketball player)'],
  baseball: ['(baseball)', '(baseball player)'],
  football: ['(American football)', '(football)'],
  hockey: ['(ice hockey)', '(ice hockey player)'],
};

/** Wikipedia titles for short / ambiguous names SportsDB often misses. */
const WIKI_TITLE_BY_ID: Record<Sport, Record<string, string>> = {
  soccer: {
    xavi: 'Xavi_(footballer,_born_1980)',
    pedri: 'Pedri',
    r9: 'Ronaldo_(Brazilian_footballer)',
    kaka: 'Kaká',
    pele: 'Pelé',
    guti: 'Guti_(footballer,_born_1976)',
    pepe: 'Pepe_(footballer,_born_1983)',
    dani: 'Dani_Alves',
    alex: 'Alex_(footballer,_born_1982)',
    saviola: 'Javier_Saviola',
    cr7: 'Cristiano_Ronaldo',
    messi: 'Lionel_Messi',
    keita: 'Seydou_Keita_(footballer)',
    despodov: 'Kiril_Despodov',
    aouar: 'Houssem_Aouar',
    verratti: 'Marco_Verratti',
    fabinho: 'Fabinho_(footballer,_born_1993)',
    joaopedro: 'João_Pedro_(footballer,_born_2001)',
    maradona: 'Diego_Maradona',
    eusebio: 'Eusébio',
    zidane: 'Zinedine_Zidane',
    beckenbauer: 'Franz_Beckenbauer',
    cruyff: 'Johan_Cruyff',
    maldini: 'Paolo_Maldini',
    buffon: 'Gianluigi_Buffon',
    maignan: 'Mike_Maignan',
    rodri: 'Rodri_(footballer,_born_1996)',
    vinicius: 'Vinícius_Júnior',
    'amadou-onana': 'Amadou_Onana',
  },
  basketball: {
    mj: 'Michael_Jordan',
    magic: 'Magic_Johnson',
    bird: 'Larry_Bird',
    shaq: 'Shaquille_O%27Neal',
    kd: 'Kevin_Durant',
    ai: 'Allen_Iverson',
    kg: 'Kevin_Garnett',
    garnett: 'Kevin_Garnett',
    cp3: 'Chris_Paul',
    dame: 'Damian_Lillard',
    giannis: 'Giannis_Antetokounmpo',
    jokic: 'Nikola_Jokić',
    luka: 'Luka_Dončić',
    ktown: 'Karl-Anthony_Towns',
    jalengreen: 'Jalen_Green',
    ray: 'Ray_Allen',
    johnwall: 'John_Wall',
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
    ruth: 'Babe_Ruth',
    jackie: 'Jackie_Robinson',
    robinson: 'Jackie_Robinson',
    smithwill: 'Will_Smith_(catcher)',
  },
  football: {
    mahomes: 'Patrick_Mahomes',
    brady: 'Tom_Brady',
    rice: 'Jerry_Rice',
    lt: 'Lawrence_Taylor',
    barry: 'Barry_Sanders',
    sweetnes: 'Jim_Brown',
    sweetness: 'Jim_Brown',
    megatron: 'Calvin_Johnson',
    moss: 'Randy_Moss',
    gronk: 'Rob_Gronkowski',
    kelce: 'Travis_Kelce',
    lamar: 'Lamar_Jackson',
    ap: 'Adrian_Peterson',
    sandy: 'Deion_Sanders',
    deion: 'Deion_Sanders',
  },
  hockey: {
    'wayne-gretzky': 'Wayne_Gretzky',
    'mario-lemieux': 'Mario_Lemieux',
    'alex-ovechkin': 'Alexander_Ovechkin',
    'connor-mcdavid': 'Connor_McDavid',
    'sidney-crosby': 'Sidney_Crosby',
    'jaromir-jagr': 'Jaromír_Jágr',
    'dominik-hasek': 'Dominik_Hašek',
  },
};

type CacheMap = Record<string, string | null>;
export interface PlayerCardBio {
  age?: number;
  team?: string;
  retired?: boolean;
}

type BioCacheMap = Record<string, PlayerCardBio | null>;

const memory = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();
const faceManifests: Partial<Record<Sport, Record<string, string>>> = {};
const faceManifestPromises: Partial<Record<Sport, Promise<Record<string, string>>>> = {};

const API_GAP_MS = 320;
let apiQueue = Promise.resolve();

function enqueueApi<T>(task: () => Promise<T>): Promise<T> {
  const next = apiQueue.then(task, task);
  apiQueue = next.then(
    () => sleep(API_GAP_MS),
    () => sleep(API_GAP_MS),
  );
  return next;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadFaceManifest(sport: Sport): Promise<Record<string, string>> {
  if (faceManifests[sport]) return faceManifests[sport]!;
  if (!faceManifestPromises[sport]) {
    faceManifestPromises[sport] = fetch(`/data/${sport}-faces.json`)
      .then(res => (res.ok ? res.json() : {}))
      .then(data => (data && typeof data === 'object' ? (data as Record<string, string>) : {}))
      .catch(() => ({}));
  }
  faceManifests[sport] = await faceManifestPromises[sport]!;
  return faceManifests[sport]!;
}

function sportsDbQueries(sport: Sport, playerId: string, name: string): string[] {
  const out = new Set<string>();
  const override = SPORTSDB_QUERY_BY_ID[sport]?.[playerId];
  if (override) out.add(override);
  out.add(name);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    out.add(parts[parts.length - 1]!);
    out.add(`${parts[parts.length - 1]} ${parts[0]}`);
    if (/^jr\.?$/i.test(parts[parts.length - 1]!) && parts.length >= 2) {
      out.add(`${parts[parts.length - 2]} Junior`);
      out.add(`${parts.slice(0, -1).join(' ')} Junior`);
    }
  }
  return [...out];
}

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
    // Drop older face cache versions so portraits re-resolve with the new pipeline.
    for (const legacy of ['sportivia.playerFaces.v1', 'sportivia.playerFaces.v2']) {
      localStorage.removeItem(legacy);
    }

    const raw = localStorage.getItem(CACHE_KEY);
    let parsed: CacheMap = {};
    if (raw) {
      const data = JSON.parse(raw) as CacheMap;
      if (data && typeof data === 'object') parsed = data;
    }
    parsed = migrateLegacySoccerCache(parsed);
    if (!localStorage.getItem(REFETCH_MARK)) {
      // Full wipe once — old entries often cached random action photos.
      parsed = {};
      memory.clear();
      localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      localStorage.setItem(REFETCH_MARK, '1');
    }
    return parsed;
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

function tokenMatch(qToken: string, resultTokens: string[]): boolean {
  if (resultTokens.includes(qToken)) return true;
  if ((qToken === 'jr' || qToken === 'jr.') && resultTokens.includes('junior')) return true;
  if (qToken === 'junior' && (resultTokens.includes('jr') || resultTokens.includes('jr.'))) return true;
  return false;
}

/** True when SportsDB / ESPN result is plausibly the same person as our roster name. */
export function namesLikelyMatch(query: string, result: string): boolean {
  const q = norm(query);
  const r = norm(result);
  if (!q || !r) return false;
  if (q === r) return true;
  if (r.startsWith(`${q} `) || q.startsWith(`${r} `)) return true;

  const qt = q.split(' ');
  const rt = r.split(' ');
  if (qt.length === 1) return rt[0] === q || rt.at(-1) === q;
  return qt.every(t => tokenMatch(t, rt));
}

function pickCutout(player: {
  strCutout?: string | null;
  strThumb?: string | null;
  strRender?: string | null;
}): string | null {
  return player.strCutout || null;
}

function pickAnySportsDbImage(player: {
  strCutout?: string | null;
  strThumb?: string | null;
  strRender?: string | null;
}): string | null {
  return player.strCutout || player.strThumb || player.strRender || null;
}

async function fetchEspnHeadshot(
  sport: Sport,
  playerId: string,
  name: string,
): Promise<string | null> {
  return enqueueApi(async () => {
    const query = SPORTSDB_QUERY_BY_ID[sport]?.[playerId] || name;
    const wantSport = ESPN_SPORT[sport];
    try {
      const res = await fetch(
        `${ESPN_SEARCH}?query=${encodeURIComponent(query)}&limit=12&type=player`,
        { headers: { Accept: 'application/json' } },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        items?: Array<{
          id?: string;
          displayName?: string;
          sport?: string;
          headshot?: { href?: string } | null;
        }>;
      };
      const items = data.items ?? [];
      const match = items.find(
        item =>
          item.sport === wantSport &&
          item.displayName &&
          namesLikelyMatch(query, item.displayName),
      );
      return match?.headshot?.href || null;
    } catch {
      return null;
    }
  });
}

async function fetchSportsDbOnce(query: string, wantSport: string, name: string) {
  const q = query.trim().replace(/\s+/g, '_');
  if (!q) return null;
  const res = await fetch(`${SPORTSDB}?p=${encodeURIComponent(q)}`);
  const text = await res.text();
  if (!res.ok || /error code/i.test(text)) return null;
  const data = JSON.parse(text) as {
    player?: Array<{
      strPlayer?: string;
      strSport?: string;
      strCutout?: string | null;
      strThumb?: string | null;
      strRender?: string | null;
      dateBorn?: string | null;
      dateDied?: string | null;
      strTeam?: string | null;
      strStatus?: string | null;
    }> | null;
  };
  const all = data.player ?? [];
  const sportPool = all.filter(p => (p.strSport || '').toLowerCase() === wantSport);
  const match = sportPool.find(p => p.strPlayer && namesLikelyMatch(name, p.strPlayer));
  return match ?? null;
}

async function fetchSportsDb(
  sport: Sport,
  playerId: string,
  name: string,
  cutoutOnly: boolean,
): Promise<string | null> {
  return enqueueApi(async () => {
    const want = SPORTSDB_SPORT[sport].toLowerCase();
    for (const query of sportsDbQueries(sport, playerId, name)) {
      try {
        const match = await fetchSportsDbOnce(query, want, name);
        if (!match) continue;
        const statusText = match.strStatus ?? '';
        const teamName = cleanTeamName(match.strTeam);
        saveBio(sport, name, {
          age: ageFromDates(match.dateBorn, match.dateDied),
          team: teamName,
          retired: match.dateDied
            ? true
            : /retired|deceased/i.test(statusText)
              ? true
              : /active/i.test(statusText)
                ? false
                : !teamName && /^_?retired/i.test((match.strTeam ?? '').trim())
                  ? true
                  : undefined,
        });
        const url = cutoutOnly ? pickCutout(match) : pickAnySportsDbImage(match);
        if (url) return url;
      } catch {
        /* try next query */
      }
    }
    return null;
  });
}

/** SportsDB often returns placeholders like "_Retired Soccer" for retired players. */
export function cleanTeamName(team?: string | null): string | undefined {
  if (!team) return undefined;
  const trimmed = team.trim().replace(/^_+/, '');
  if (!trimmed) return undefined;
  if (/^retired(?:\s+\w+)?$/i.test(trimmed)) return undefined;
  if (/^free\s*agent$/i.test(trimmed)) return undefined;
  if (/^n\/?a$/i.test(trimmed)) return undefined;
  return trimmed;
}

function ageFromDates(born?: string | null, died?: string | null): number | undefined {
  if (!born) return undefined;
  const birthDate = new Date(born);
  const endDate = died ? new Date(died) : new Date();
  if (Number.isNaN(birthDate.getTime()) || Number.isNaN(endDate.getTime())) return undefined;
  let age = endDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDelta = endDate.getUTCMonth() - birthDate.getUTCMonth();
  if (monthDelta < 0 || (monthDelta === 0 && endDate.getUTCDate() < birthDate.getUTCDate())) age--;
  return age >= 15 && age <= 110 ? age : undefined;
}

function loadBioCache(): BioCacheMap {
  try {
    const raw = localStorage.getItem(BIO_CACHE_KEY);
    return raw ? (JSON.parse(raw) as BioCacheMap) : {};
  } catch {
    return {};
  }
}

function saveBio(sport: Sport, playerName: string, bio: PlayerCardBio | null) {
  try {
    const disk = loadBioCache();
    disk[`${sport}:${norm(playerName)}`] = bio;
    localStorage.setItem(BIO_CACHE_KEY, JSON.stringify(disk));
  } catch {
    /* quota / private mode */
  }
}

export async function resolvePlayerCardBio(
  sport: Sport,
  playerName: string,
): Promise<PlayerCardBio | null> {
  const key = `${sport}:${norm(playerName)}`;
  const cached = loadBioCache();
  if (key in cached) return cached[key] ?? null;
  await fetchSportsDb(sport, '', playerName, false);
  const updated = loadBioCache();
  if (key in updated) return updated[key] ?? null;
  saveBio(sport, playerName, null);
  return null;
}

/** Prefer a larger Wikipedia / Commons derivative for card portraits. */
function enlargeWikiImage(url: string): string {
  return url
    .replace(/\/\d+px-/i, '/800px-')
    .replace(/([?&])width=\d+/i, '$1width=800');
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
    const source = data.originalimage?.source || data.thumbnail?.source;
    return source ? enlargeWikiImage(source) : null;
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
  return enqueueApi(async () => {
    const override = WIKI_TITLE_BY_ID[sport][playerId];
    const tries = [
      override,
      ...WIKI_SUFFIXES[sport].map(s => `${name} ${s}`),
      name,
    ].filter(Boolean) as string[];

    for (const title of tries) {
      const url = await fetchWikiTitle(wikiPath(title));
      if (url) return url;
    }
    return null;
  });
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
  if (!url) {
    memory.delete(key);
    try {
      const disk = loadDisk();
      if (key in disk) {
        delete disk[key];
        localStorage.setItem(CACHE_KEY, JSON.stringify(disk));
      }
    } catch {
      /* ignore */
    }
    return;
  }
  memory.set(key, url);
  saveDisk(key, url);
}

/** Drop a cached portrait so the next resolve can hit alternate sources. */
export function invalidatePlayerFace(sport: Sport, playerId: string): void {
  const key = cacheId(sport, playerId);
  memory.delete(key);
  inflight.delete(key);
  try {
    const disk = loadDisk();
    if (key in disk) {
      delete disk[key];
      localStorage.setItem(CACHE_KEY, JSON.stringify(disk));
    }
  } catch {
    /* ignore */
  }
}

export interface ResolvePlayerFaceOptions {
  /** Skip disk/memory cache and hit sources again (e.g. after img onError). */
  force?: boolean;
}

async function resolvePlayerFaceInternal(
  sport: Sport,
  playerId: string,
  playerName: string,
): Promise<string | null> {
  const manifest = await loadFaceManifest(sport);
  const fromManifest = manifest[playerId];
  if (fromManifest) return fromManifest;

  const url =
    (await fetchEspnHeadshot(sport, playerId, playerName)) ||
    (await fetchSportsDb(sport, playerId, playerName, false)) ||
    (await fetchWikipedia(sport, playerId, playerName));

  if (url) setCached(sport, playerId, url);
  return url;
}

/**
 * Resolve a professional portrait URL for a player.
 * Successful lookups are cached; misses are not persisted so they can retry later.
 */
export async function resolvePlayerFace(
  sport: Sport,
  playerId: string,
  playerName: string,
  options?: ResolvePlayerFaceOptions,
): Promise<string | null> {
  const direct = FACE_URL_BY_ID[sport]?.[playerId];
  if (direct) {
    const cached = getCached(sport, playerId);
    if (cached !== direct) setCached(sport, playerId, direct);
    return direct;
  }

  if (!options?.force) {
    const manifest = await loadFaceManifest(sport);
    const fromManifest = manifest[playerId];
    if (fromManifest) {
      setCached(sport, playerId, fromManifest);
      return fromManifest;
    }
  }

  if (!options?.force) {
    const cached = getCached(sport, playerId);
    if (cached !== undefined) return cached;
  }

  const key = cacheId(sport, playerId);
  const existing = inflight.get(key);
  if (existing) return existing;

  const promise = resolvePlayerFaceInternal(sport, playerId, playerName)
    .catch(() => null)
    .finally(() => {
      inflight.delete(key);
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
  const direct = FACE_URL_BY_ID[sport]?.[playerId];
  if (direct) return direct;
  const fromManifest = faceManifests[sport]?.[playerId];
  if (fromManifest) return fromManifest;
  return getCached(sport, playerId);
}

/** Warm face manifests early on collection screens. */
export function prefetchFaceManifests(sports: Sport[] = ['soccer', 'basketball', 'baseball', 'football', 'hockey']): void {
  for (const sport of sports) void loadFaceManifest(sport);
}

/** @deprecated use prefetchFaceManifests */
export function prefetchSoccerFaceManifest(): void {
  void loadFaceManifest('soccer');
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
