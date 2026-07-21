/**
 * Node-side portrait resolver for basketball / baseball / football / hockey.
 * Preference: manual override → ESPN official headshot → Wikipedia → SportsDB.
 */

export type FaceSport = 'basketball' | 'baseball' | 'football' | 'hockey';

const SPORTSDB = 'https://www.thesportsdb.com/api/v1/json/123/searchplayers.php';
const WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';
const ESPN_SEARCH = 'https://site.web.api.espn.com/apis/common/v3/search';

const ESPN_SPORT: Record<FaceSport, string> = {
  basketball: 'basketball',
  baseball: 'baseball',
  football: 'football',
  hockey: 'hockey',
};

const SPORTSDB_SPORT: Record<FaceSport, string> = {
  basketball: 'Basketball',
  baseball: 'Baseball',
  football: 'American Football',
  hockey: 'Ice Hockey',
};

const WIKI_SUFFIXES: Record<FaceSport, string[]> = {
  basketball: ['(basketball)', '(basketball player)'],
  baseball: ['(baseball)', '(baseball player)'],
  football: ['(American football)', '(football)'],
  hockey: ['(ice hockey)', '(ice hockey player)'],
};

export const FACE_URL_BY_ID: Record<FaceSport, Record<string, string>> = {
  basketball: {
    rodman: 'https://cdn.nba.com/headshots/nba/latest/1040x760/23.png',
    isiah: 'https://cdn.nba.com/headshots/nba/latest/1040x760/78318.png',
    bigben: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1112.png',
    ktown: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1626157.png',
    jalengreen: 'https://cdn.nba.com/headshots/nba/latest/1040x760/1630224.png',
    ray: 'https://cdn.nba.com/headshots/nba/latest/1040x760/951.png',
    johnwall: 'https://cdn.nba.com/headshots/nba/latest/1040x760/202322.png',
    mj: 'https://cdn.nba.com/headshots/nba/latest/1040x760/893.png',
    nene: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2403.png',
    lou: 'https://cdn.nba.com/headshots/nba/latest/1040x760/101150.png',
  },
  baseball: {
    smithwill: 'https://a.espncdn.com/i/headshots/mlb/players/full/38309.png',
  },
  football: {
    watt: 'https://static.www.nfl.com/image/private/t_headshot_desktop/league/pooulgm7mdcx5x9gza7l',
  },
  hockey: {},
};

export const QUERY_BY_ID: Record<FaceSport, Record<string, string>> = {
  basketball: {
    mj: 'Michael Jordan',
    kd: 'Kevin Durant',
    ai: 'Allen Iverson',
    cp3: 'Chris Paul',
    ktown: 'Karl-Anthony Towns',
    jalengreen: 'Jalen Green',
    ray: 'Ray Allen',
    johnwall: 'John Wall',
    amare: 'Amare Stoudemire',
    barea: 'Jose Juan Barea',
    nene: 'Nene Hilario',
    lou: 'Lou Williams',
  },
  baseball: {
    babe: 'Babe Ruth',
    ruth: 'Babe Ruth',
    jackie: 'Jackie Robinson',
    smithwill: 'Will Smith',
    pudge: 'Ivan Rodriguez',
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

export const WIKI_TITLE_BY_ID: Record<FaceSport, Record<string, string>> = {
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

const API_GAP_MS = 280;
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

function namesLikelyMatch(query: string, result: string): boolean {
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

function wikiPath(title: string): string {
  if (/%[0-9A-Fa-f]{2}/.test(title)) return title.replace(/ /g, '_');
  return encodeURIComponent(title.replace(/ /g, '_'));
}

function enlargeWikiImage(url: string): string {
  return url
    .replace(/\/\d+px-/i, '/800px-')
    .replace(/([?&])width=\d+/i, '$1width=800');
}

function searchQueries(sport: FaceSport, playerId: string, name: string): string[] {
  const out = new Set<string>();
  const override = QUERY_BY_ID[sport]?.[playerId];
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

async function fetchEspnHeadshot(
  sport: FaceSport,
  playerId: string,
  name: string,
): Promise<string | null> {
  return enqueueApi(async () => {
    const query = QUERY_BY_ID[sport]?.[playerId] || name;
    const wantSport = ESPN_SPORT[sport];
    try {
      const res = await fetch(
        `${ESPN_SEARCH}?query=${encodeURIComponent(query)}&limit=12&type=player`,
        { headers: { Accept: 'application/json', 'User-Agent': 'SportiviaFaceBot/1.0' } },
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        items?: Array<{
          displayName?: string;
          sport?: string;
          headshot?: { href?: string } | null;
        }>;
      };
      const match = (data.items ?? []).find(
        item =>
          item.sport === wantSport &&
          item.displayName &&
          namesLikelyMatch(query, item.displayName) &&
          item.headshot?.href,
      );
      return match?.headshot?.href || null;
    } catch {
      return null;
    }
  });
}

async function fetchWikiTitle(title: string, attempt = 0): Promise<string | null> {
  try {
    const res = await fetch(`${WIKI}/${wikiPath(title)}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'SportiviaFaceBot/1.0' },
    });
    const text = await res.text();
    if (!res.ok) {
      if (/too many requests/i.test(text) && attempt < 4) {
        await sleep(2000 * (attempt + 1));
        return fetchWikiTitle(title, attempt + 1);
      }
      return null;
    }
    const data = JSON.parse(text) as {
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

async function fetchWikiSearch(sport: FaceSport, name: string): Promise<string | null> {
  const sportWord =
    sport === 'football'
      ? 'American football'
      : sport === 'hockey'
        ? 'ice hockey'
        : sport;
  try {
    const res = await fetch(
      `${WIKI_SEARCH}?action=query&list=search&srsearch=${encodeURIComponent(`${name} ${sportWord}`)}&format=json&origin=*`,
      { headers: { 'User-Agent': 'SportiviaFaceBot/1.0' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { search?: Array<{ title?: string }> };
    };
    for (const hit of data.query?.search ?? []) {
      const title = hit.title;
      if (!title) continue;
      const bare = title.replace(/\s*\([^)]*\)/g, '').trim();
      if (!namesLikelyMatch(name, bare)) continue;
      const url = await fetchWikiTitle(title);
      if (url) return url;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWikipedia(
  sport: FaceSport,
  playerId: string,
  name: string,
): Promise<string | null> {
  return enqueueApi(async () => {
    const override = WIKI_TITLE_BY_ID[sport]?.[playerId];
    const tries = [
      override,
      ...WIKI_SUFFIXES[sport].map(s => `${name} ${s}`),
      name,
    ].filter(Boolean) as string[];

    for (const title of tries) {
      const url = await fetchWikiTitle(title);
      if (url) return url;
    }
    return fetchWikiSearch(sport, name);
  });
}

async function fetchSportsDbOnce(
  sport: FaceSport,
  query: string,
  name: string,
): Promise<string | null> {
  const q = query.trim().replace(/\s+/g, '_');
  if (!q) return null;
  const want = SPORTSDB_SPORT[sport].toLowerCase();
  const res = await fetch(`${SPORTSDB}?p=${encodeURIComponent(q)}`, {
    headers: { 'User-Agent': 'SportiviaFaceBot/1.0' },
  });
  const text = await res.text();
  if (!res.ok || /error code|<!doctype html>/i.test(text)) return null;
  const data = JSON.parse(text) as {
    player?: Array<{
      strPlayer?: string;
      strSport?: string;
      strCutout?: string | null;
      strThumb?: string | null;
      strRender?: string | null;
    }> | null;
  };
  const pool = (data.player ?? []).filter(p => (p.strSport ?? '').toLowerCase() === want);
  const match = pool.find(p => p.strPlayer && namesLikelyMatch(name, p.strPlayer));
  if (!match) return null;
  return match.strCutout || match.strThumb || match.strRender || null;
}

async function fetchSportsDb(
  sport: FaceSport,
  playerId: string,
  name: string,
): Promise<string | null> {
  return enqueueApi(async () => {
    for (const query of searchQueries(sport, playerId, name)) {
      try {
        const url = await fetchSportsDbOnce(sport, query, name);
        if (url) return url;
      } catch {
        /* next */
      }
    }
    return null;
  });
}

export async function resolveSportFace(
  sport: FaceSport,
  playerId: string,
  name: string,
): Promise<string | null> {
  const manual = FACE_URL_BY_ID[sport]?.[playerId];
  if (manual) return manual;

  return (
    (await fetchEspnHeadshot(sport, playerId, name)) ||
    (await fetchWikipedia(sport, playerId, name)) ||
    (await fetchSportsDb(sport, playerId, name))
  );
}
