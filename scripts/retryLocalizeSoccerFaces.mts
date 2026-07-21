/**
 * Finish localizing soccer faces still pointing at remote URLs.
 * Prefers SportsDB / ESPN (stable) over Wikimedia (rate-limited).
 *
 * Run: npx tsx scripts/retryLocalizeSoccerFaces.mts
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { SOCCER_PLAYERS } from '../src/data/soccerPlayers.ts';
import { SPORTSDB_QUERY_BY_ID } from './lib/soccerFaceResolve.mts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MANIFEST = join(ROOT, 'public/data/soccer-faces.json');
const OUT_DIR = join(ROOT, 'public/faces/soccer');
const UA =
  'Mozilla/5.0 (compatible; SportiviaFaceLocalizer/1.1; +https://github.com/sportivia)';

type Manifest = Record<string, string>;

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

function isRemote(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function extFromContentType(ct: string | null, url: string): string {
  const lower = (ct ?? '').toLowerCase();
  if (lower.includes('png')) return '.png';
  if (lower.includes('webp')) return '.webp';
  if (lower.includes('gif')) return '.gif';
  if (lower.includes('jpeg') || lower.includes('jpg')) return '.jpg';
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(fromUrl)) {
    return fromUrl === '.jpeg' ? '.jpg' : fromUrl;
  }
  return '.png';
}

async function download(url: string, destWithoutExt: string): Promise<string | null> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      Referer: 'https://www.thesportsdb.com/',
    },
    redirect: 'follow',
  });
  if (!res.ok || !res.body) return null;
  const ext = extFromContentType(res.headers.get('content-type'), url);
  const dest = `${destWithoutExt}${ext}`;
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest));
  return `/faces/soccer/${dest.slice(OUT_DIR.length + 1)}`;
}

async function sportsDbImages(query: string): Promise<string[]> {
  const endpoint = `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(query)}`;
  const res = await fetch(endpoint, { headers: { 'User-Agent': UA } });
  if (!res.ok) return [];
  const data = (await res.json()) as {
    player?: Array<{
      strSport?: string;
      strPlayer?: string;
      strCutout?: string | null;
      strThumb?: string | null;
      strRender?: string | null;
    }>;
  };
  const out: string[] = [];
  for (const p of data.player ?? []) {
    if ((p.strSport ?? '') !== 'Soccer') continue;
    for (const u of [p.strCutout, p.strThumb, p.strRender]) {
      if (u && u.startsWith('http')) out.push(u);
    }
  }
  return out;
}

async function espnHeadshot(name: string): Promise<string | null> {
  const url = new URL('https://site.web.api.espn.com/apis/common/v3/search');
  url.searchParams.set('query', name);
  url.searchParams.set('limit', '8');
  url.searchParams.set('type', 'player');
  url.searchParams.set('sport', 'soccer');
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: Array<{ displayName?: string; imageUrl?: string; images?: Array<{ href?: string }> }>;
  };
  for (const item of data.items ?? []) {
    const href = item.imageUrl || item.images?.[0]?.href;
    if (href && /espncdn\.com.*headshots/i.test(href)) return href;
    if (href && href.includes('espncdn.com') && href.includes('players')) return href;
  }
  return null;
}

const nameById = new Map(SOCCER_PLAYERS.map(p => [p.id, p.name]));

/** Hand-picked permanent fallbacks when auto lookup fails. */
const MANUAL: Record<string, string> = {
  eusebio:
    'https://upload.wikimedia.org/wikipedia/commons/9/9b/Eusebio_1966.jpg',
  r9: 'https://r2.thesportsdb.com/images/media/player/cutout/xtvtxy1546170072.png',
  best: 'https://r2.thesportsdb.com/images/media/player/thumb/best.jpg',
  delpiero:
    'https://r2.thesportsdb.com/images/media/player/cutout/delpiero.png',
};

mkdirSync(OUT_DIR, { recursive: true });
const manifest: Manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const pending = Object.entries(manifest).filter(([, u]) => isRemote(u));
console.log(`Retrying ${pending.length} remote soccer faces…`);

let ok = 0;
let fail = 0;

for (let i = 0; i < pending.length; i++) {
  const [id, remoteUrl] = pending[i]!;
  const destBase = join(OUT_DIR, id);
  const name = nameById.get(id) ?? id;
  const query = SPORTSDB_QUERY_BY_ID[id] ?? name;

  process.stdout.write(`[${i + 1}/${pending.length}] ${id} (${name}) ... `);

  // Already on disk from a prior partial run?
  let found: string | null = null;
  for (const ext of ['.png', '.jpg', '.webp', '.gif']) {
    if (existsSync(`${destBase}${ext}`)) {
      found = `/faces/soccer/${id}${ext}`;
      break;
    }
  }

  const candidates: string[] = [];
  if (MANUAL[id]) candidates.push(MANUAL[id]!);
  try {
    candidates.push(...(await sportsDbImages(query)));
    if (query !== name) candidates.push(...(await sportsDbImages(name)));
  } catch {
    /* ignore */
  }
  try {
    const espn = await espnHeadshot(name);
    if (espn) candidates.push(espn);
  } catch {
    /* ignore */
  }
  // Original last (often wiki — slow / rate limited)
  candidates.push(remoteUrl);

  if (!found) {
    const tried = new Set<string>();
    for (const url of candidates) {
      if (!url || tried.has(url)) continue;
      tried.add(url);
      found = await download(url, destBase);
      if (found) break;
      await sleep(250);
    }
  }

  if (found) {
    manifest[id] = found;
    ok++;
    console.log(found);
  } else {
    fail++;
    console.log('STILL REMOTE');
  }

  // Be gentle on Wikimedia / APIs
  await sleep(900);
}

writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
const still = Object.entries(manifest).filter(([, u]) => isRemote(u)).map(([id]) => id);
console.log(`\nDone. ${ok} localized this pass, ${fail} unresolved.`);
console.log(`Remote remaining: ${still.length}`, still.join(', ') || '(none)');
