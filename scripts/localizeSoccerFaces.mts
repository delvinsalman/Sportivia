/**
 * Download soccer portrait URLs into public/faces/soccer/ and rewrite the
 * manifest to local /faces/soccer/{id}.ext paths (permanent until replaced).
 *
 * Run: npx tsx scripts/localizeSoccerFaces.mts
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MANIFEST = join(ROOT, 'public/data/soccer-faces.json');
const OUT_DIR = join(ROOT, 'public/faces/soccer');
const CONCURRENCY = 6;
const UA =
  'Mozilla/5.0 (compatible; SportiviaFaceLocalizer/1.0; +https://github.com/sportivia)';

/** Prefer stable SportsDB / ESPN / Wikimedia over signed CDN portraits. */
const STABLE_OVERRIDES: Record<string, string> = {
  eusebio:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Eusebio_1966.jpg/800px-Eusebio_1966.jpg',
  nedved:
    'https://r2.thesportsdb.com/images/media/player/cutout/nedved.jpg',
  r9: 'https://r2.thesportsdb.com/images/media/player/cutout/xtvtxy1546170072.png',
  rodri:
    'https://r2.thesportsdb.com/images/media/player/cutout/rodri.png',
  figo: 'https://r2.thesportsdb.com/images/media/player/cutout/figo.png',
};

type Manifest = Record<string, string>;

function isRemote(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function isLikelyExpiring(url: string): boolean {
  return /futbin\.com|pulse\.ea\.com|hs-data\.com|[?&](s|Signature|X-Amz-Expires|token)=/i.test(
    url,
  );
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
  if (!res.ok || !res.body) {
    console.warn(`  fail ${res.status} ${url.slice(0, 90)}`);
    return null;
  }
  const ext = extFromContentType(res.headers.get('content-type'), url);
  const dest = `${destWithoutExt}${ext}`;
  mkdirSync(dirname(dest), { recursive: true });
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(dest));
  return `/faces/soccer/${dest.slice(OUT_DIR.length + 1)}`;
}

async function resolveSportsDbCutout(nameHint: string): Promise<string | null> {
  const endpoint = `https://www.thesportsdb.com/api/v1/json/123/searchplayers.php?p=${encodeURIComponent(nameHint)}`;
  try {
    const res = await fetch(endpoint, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      player?: Array<{ strSport?: string; strCutout?: string | null; strThumb?: string | null }>;
    };
    const soccer = (data.player ?? []).filter(p => (p.strSport ?? '') === 'Soccer');
    for (const p of soccer) {
      if (p.strCutout && p.strCutout.startsWith('http')) return p.strCutout;
    }
    for (const p of soccer) {
      if (p.strThumb && p.strThumb.startsWith('http')) return p.strThumb;
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function localizeOne(
  id: string,
  sourceUrl: string,
  nameHints: Record<string, string>,
): Promise<string | null> {
  let url = STABLE_OVERRIDES[id] ?? sourceUrl;

  if (!isRemote(url)) {
    // Already local
    return url.startsWith('/') ? url : `/${url}`;
  }

  if (isLikelyExpiring(url) && !STABLE_OVERRIDES[id]) {
    const hint = nameHints[id] ?? id;
    const stable = await resolveSportsDbCutout(hint);
    if (stable) url = stable;
  }

  const destBase = join(OUT_DIR, id);
  // Skip re-download if any extension already exists
  for (const ext of ['.png', '.jpg', '.webp', '.gif']) {
    if (existsSync(`${destBase}${ext}`)) {
      return `/faces/soccer/${id}${ext}`;
    }
  }

  let local = await download(url, destBase);
  if (local) return local;

  // Fallback: SportsDB by id / hint
  const hint = nameHints[id] ?? id;
  const alt = await resolveSportsDbCutout(hint);
  if (alt && alt !== url) {
    local = await download(alt, destBase);
    if (local) return local;
  }
  return null;
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const i = next++;
      results[i] = await worker(items[i]!, i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

mkdirSync(OUT_DIR, { recursive: true });

const manifest: Manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const nameHints: Record<string, string> = {
  eusebio: 'Eusebio',
  nedved: 'Pavel Nedved',
  r9: 'Ronaldo',
  rodri: 'Rodri',
  figo: 'Luis Figo',
  cruyff: 'Johan Cruyff',
  kaka: 'Kaka',
  pele: 'Pele',
};

const entries = Object.entries(manifest);
console.log(`Localizing ${entries.length} soccer faces → ${OUT_DIR}`);

let ok = 0;
let fail = 0;
const nextManifest: Manifest = {};
const failures: string[] = [];

await mapPool(entries, CONCURRENCY, async ([id, url], index) => {
  process.stdout.write(`[${index + 1}/${entries.length}] ${id} ... `);
  try {
    const local = await localizeOne(id, url, nameHints);
    if (local) {
      nextManifest[id] = local;
      ok++;
      console.log(local);
    } else {
      // Keep previous remote as last resort so we don't blank the card
      nextManifest[id] = url;
      fail++;
      failures.push(id);
      console.log('KEEP REMOTE');
    }
  } catch (err) {
    nextManifest[id] = url;
    fail++;
    failures.push(id);
    console.log('ERR', err instanceof Error ? err.message : err);
  }
});

writeFileSync(MANIFEST, `${JSON.stringify(nextManifest, null, 2)}\n`);
console.log(`\nDone. ${ok} local, ${fail} kept remote, ${Object.keys(nextManifest).length} total.`);
if (failures.length) {
  console.log('Failed ids:', failures.join(', '));
}
