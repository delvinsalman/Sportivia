/**
 * Resolve professional player portrait images for cards / board faces.
 * Preference order (TV / broadcast style first):
 *   1) Manual portrait overrides
 *   2) ESPN official headshots
 *   3) TheSportsDB cutouts (clean portrait cutouts)
 *   4) TheSportsDB thumbs
 *   5) Wikipedia (enlarged page image) for older / obscure players
 */

import type { Sport } from '../types';

const CACHE_KEY = 'sportivia.playerFaces.v3';
const BIO_CACHE_KEY = 'sportivia.playerCardBios.v1';
/** Bump to force a full face-cache refresh after portrait pipeline changes. */
const REFETCH_MARK = 'sportivia.playerFaces.refetch.v9';
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
  },
  soccer: {
    // SportsDB cutouts / clean portraits for ambiguous or hard-to-match names
    pele: 'https://r2.thesportsdb.com/images/media/player/cutout/s4apzi1615723073.png',
    kaka: 'https://r2.thesportsdb.com/images/media/player/cutout/6uj1nl1665653279.png',
    eusebio:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Eusebio_en_1973.jpg/500px-Eusebio_en_1973.jpg',
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
  },
  basketball: {
    mj: 'Michael Jordan',
    kd: 'Kevin Durant',
    ai: 'Allen Iverson',
    cp3: 'Chris Paul',
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
    rodri: 'Rodri_(footballer,_born_1996)',
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

/** True when SportsDB / ESPN result is plausibly the same person as our roster name. */
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
    // Only trust ESPN when they provide an official headshot URL (TV / media portrait).
    return match?.headshot?.href || null;
  } catch {
    return null;
  }
}

async function fetchSportsDb(
  sport: Sport,
  playerId: string,
  name: string,
  cutoutOnly: boolean,
): Promise<string | null> {
  const query = SPORTSDB_QUERY_BY_ID[sport]?.[playerId] || name;
  const q = query.trim().replace(/\s+/g, '_');
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
        dateBorn?: string | null;
        dateDied?: string | null;
        strTeam?: string | null;
        strStatus?: string | null;
      }> | null;
    };
    const all = data.player ?? [];
    const sportPool = all.filter(p => (p.strSport || '').toLowerCase() === want);
    // Never fall back to other sports — ambiguous names (Will Smith) pull actors / boxers.
    const match = sportPool.find(p => p.strPlayer && namesLikelyMatch(query, p.strPlayer));
    if (!match) return null;
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
    return cutoutOnly ? pickCutout(match) : pickAnySportsDbImage(match);
  } catch {
    return null;
  }
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
  const override = WIKI_TITLE_BY_ID[sport][playerId];
  // Prefer sport-disambiguated titles before the bare name (blocks actor Will Smith, etc.).
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
 * Resolve a professional portrait URL for a player.
 * Cached once resolved (including null = not found).
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
    const direct = FACE_URL_BY_ID[sport]?.[playerId];
    if (direct) {
      setCached(sport, playerId, direct);
      inflight.delete(key);
      return direct;
    }

    // 1) ESPN broadcast / media headshot
    // 2) SportsDB cutout (clean portrait)
    // 3) SportsDB thumb
    // 4) Wikipedia enlarged page image (best-effort for older athletes)
    const url =
      (await fetchEspnHeadshot(sport, playerId, playerName)) ||
      (await fetchSportsDb(sport, playerId, playerName, true)) ||
      (await fetchSportsDb(sport, playerId, playerName, false)) ||
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
