/**
 * Node-side soccer portrait resolver (mirrors src/lib/playerFaces.ts sources).
 */

const SPORTSDB = 'https://www.thesportsdb.com/api/v1/json/123/searchplayers.php';
const WIKI = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';
const ESPN_SEARCH = 'https://site.web.api.espn.com/apis/common/v3/search';

export const FACE_URL_BY_ID: Record<string, string> = {
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
};

export const SPORTSDB_QUERY_BY_ID: Record<string, string> = {
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
};

export const WIKI_TITLE_BY_ID: Record<string, string> = {
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
  pedro: 'Pedro_(footballer,_born_1987)',
  raul: 'Raúl_(footballer)',
  jorginho: 'Jorginho_(footballer,_born_1991)',
  trezeguet: 'Trézéguet',
  bremer: 'Bremer_(footballer)',
  gavi: 'Gavi_(footballer)',
  casemiro: 'Casemiro',
  marcelo: 'Marcelo_(footballer,_born_1988)',
  neymar: 'Neymar',
  son: 'Son_Heung-min',
  grealish: 'Jack_Grealish',
  chaka: 'Giorgi_Chakvetadze',
  sane: 'Leroy_Sané',
  hummels: 'Mats_Hummels',
  fabregas: 'Cesc_Fàbregas',
  silva: 'Bernardo_Silva',
  dias: 'Rúben_Dias',
  casemiro: 'Casemiro',
  marcelo: 'Marcelo_(footballer,_born_1988)',
  alves: 'Dani_Alves',
  rivaldo: 'Rivaldo',
  cancelo: 'João_Cancelo',
  owen: 'Michael_Owen',
  mascherano: 'Javier_Mascherano',
  park: 'Park_Ji-sung',
  kubo: 'Takefusa_Kubo',
  lozano: 'Hirving_Lozano',
  donnarumma: 'Gianluigi_Donnarumma',
  milinkovic: 'Sergej_Milinković-Savić',
  walker: 'Kyle_Walker',
  okocha: 'Jay-Jay_Okocha',
  veron: 'Juan_Sebastián_Verón',
  forlan: 'Diego_Forlán',
  godin: 'Diego_Godín',
  luisalberto: 'Luis_Alberto_(footballer,_born_1992)',
  kimmich: 'Joshua_Kimmich',
  reina: 'Pepe_Reina',
  militao: 'Éder_Militão',
  zaha: 'Wilfried_Zaha',
  calhanoglu: 'Hakan_Çalhanoğlu',
  dia: 'Boulaye_Dia',
  endo: 'Wataru_Endo',
  minamino: 'Takumi_Minamino',
  kamada: 'Daichi_Kamada',
  trezeguet: 'David_Trézéguet',
  hojbjerg: 'Pierre-Emile_Højbjerg',
  bacca: 'Carlos_Bacca',
  otero: 'Juan_Fernando_Quintero',
  dosantos: 'Giovani_dos_Santos',
  mckennie: 'Weston_McKennie',
  hwang: 'Hwang_Hee-chan',
  leekangin: 'Lee_Kang-in',
  hwanguijo: 'Hwang_Ui-jo',
  kulusevski: 'Dejan_Kulusevski',
  forsberg: 'Emil_Forsberg',
  lindelof: 'Victor_Lindelöf',
  schick: 'Patrik_Schick',
  coufal: 'Vladimír_Coufal',
  iwobi: 'Alex_Iwobi',
  iheanacho: 'Kelechi_Iheanacho',
  vieira: 'Patrick_Vieira',
  makelele: 'Claude_Makélélé',
  seedorf: 'Clarence_Seedorf',
  best: 'George_Best',
  stoichkov: 'Hristo_Stoichkov',
  mamardashvili: 'Giorgi_Mamardashvili',
  davitashvili: 'Zuriko_Davitashvili',
  mikautadze: 'Georges_Mikautadze',
  larin: 'Cyle_Larin',
  popov: 'Ivelin_Popov',
  cbradley: 'Conor_Bradley_(footballer)',
  timweah: 'Timothy_Weah',
  chogue: 'Cho_Gue-sung',
  tchouameni: 'Aurélien_Tchouaméni',
  rodrygo: 'Rodrygo',
  garnacho: 'Alejandro_Garnacho',
  mainoo: 'Kobbie_Mainoo',
  darwin: 'Darwin_Núñez',
  szobo: 'Dominik_Szoboszlai',
  havertz: 'Kai_Havertz',
  calafiori: 'Riccardo_Calafiori',
  daniolmo: 'Dani_Olmo',
  theo: 'Theo_Hernández',
  bastoni: 'Alessandro_Bastoni',
  cunha: 'Matheus_Cunha',
  pedroneto: 'Pedro_Neto',
  mateta: 'Jean-Philippe_Mateta',
  mbeumo: 'Bryan_Mbeumo',
  frimpong: 'Jeremie_Frimpong',
  ugarte: 'Manuel_Ugarte_(footballer)',
  'amadou-onana': 'Amadou_Onana',
};

const WIKI_SUFFIXES = ['(footballer)', '(soccer)'];

const API_GAP_MS = 350;
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

export function norm(s: string): string {
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

function sportsDbQueries(playerId: string, name: string): string[] {
  const out = new Set<string>();
  const override = SPORTSDB_QUERY_BY_ID[playerId];
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

function wikiPath(title: string): string {
  if (/%[0-9A-Fa-f]{2}/.test(title)) return title.replace(/ /g, '_');
  return encodeURIComponent(title.replace(/ /g, '_'));
}

function enlargeWikiImage(url: string): string {
  return url
    .replace(/\/\d+px-/i, '/800px-')
    .replace(/([?&])width=\d+/i, '$1width=800');
}

async function fetchSportsDbOnce(query: string, name: string) {
  const q = query.trim().replace(/\s+/g, '_');
  if (!q) return null;
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
  const pool = (data.player ?? []).filter(p => (p.strSport ?? '').toLowerCase() === 'soccer');
  const match = pool.find(p => p.strPlayer && namesLikelyMatch(name, p.strPlayer));
  if (!match) return null;
  return match.strCutout || match.strThumb || match.strRender || null;
}

async function fetchSportsDb(playerId: string, name: string): Promise<string | null> {
  return enqueueApi(async () => {
    for (const query of sportsDbQueries(playerId, name)) {
      try {
        const url = await fetchSportsDbOnce(query, name);
        if (url) return url;
      } catch {
        /* next query */
      }
    }
    return null;
  });
}

async function fetchEspnHeadshot(playerId: string, name: string): Promise<string | null> {
  return enqueueApi(async () => {
    const query = SPORTSDB_QUERY_BY_ID[playerId] || name;
    try {
      const res = await fetch(
        `${ESPN_SEARCH}?query=${encodeURIComponent(query)}&limit=12&type=player`,
        { headers: { Accept: 'application/json' } },
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
          item.sport === 'soccer' &&
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

async function fetchWikiSearch(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${WIKI_SEARCH}?action=query&list=search&srsearch=${encodeURIComponent(`${name} footballer`)}&format=json&origin=*`,
      { headers: { 'User-Agent': 'SportiviaFaceBot/1.0' } },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { search?: Array<{ title?: string }> };
    };
    for (const hit of data.query?.search ?? []) {
      const title = hit.title;
      if (!title) continue;
      const bare = title.replace(/\s*\(footballer[^)]*\)/i, '').trim();
      if (!namesLikelyMatch(name, bare)) continue;
      const url = await fetchWikiTitle(title);
      if (url) return url;
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchWikipedia(playerId: string, name: string): Promise<string | null> {
  return enqueueApi(async () => {
    const override = WIKI_TITLE_BY_ID[playerId];
    const tries = [
      override,
      ...WIKI_SUFFIXES.map(s => `${name} ${s}`),
      name,
    ].filter(Boolean) as string[];

    for (const title of tries) {
      const url = await fetchWikiTitle(title);
      if (url) return url;
    }
    return fetchWikiSearch(name);
  });
}

export async function resolveSoccerFace(playerId: string, name: string): Promise<string | null> {
  const manual = FACE_URL_BY_ID[playerId];
  if (manual) return manual;

  return (
    (await fetchSportsDb(playerId, name)) ||
    (await fetchEspnHeadshot(playerId, name)) ||
    (await fetchWikipedia(playerId, name))
  );
}
