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
  "dimarco": "https://b.fssta.com/uploads/application/soccer/headshots/30415.png",
  "james":
    "https://b.fssta.com/uploads/application/soccer/headshots/8370.vresize.350.350.medium.2.png",
  "ardaguler":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p264309.png?padding=0.7",
  "makelele":
    "https://cdn-img.staticzz.com/img/jogadores/new/13/49/1349_claude_makelele_20260424135525.png",
  "jota": "https://b.fssta.com/uploads/application/soccer/headshots/25790.png",
  "camavinga":
    "https://publish.realmadrid.com/content/dam/portals/realmadrid-com/es-es/sports/football/3kq9cckrnlogidldtdie2fkbl/players/eduardo-camavinga/assets/CAMAVINGA_EQUIPO_CARITA_550X650_26-27.png",
  "ziyech": "https://b.fssta.com/uploads/application/soccer/headshots/8978.png",
  "grealish": "https://b.fssta.com/uploads/application/soccer/headshots/5858.png",
  "jevans":
    "https://cdn-img.zerozero.pt/img/jogadores/new/37/13/43713_jonny_evans_20240815220507.png",
  "gvardiol":
    "https://static.wikia.nocookie.net/the-football-database/images/5/5c/Jo%C5%A1ko_Gvardiol.2.png/revision/latest?cb=20251205135401",
  "morganrogers":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p260247.png?padding=0.7",
  "crouch": "https://as01.epimg.net/img/comunes/fotos/fichas/deportistas/c/cro/large/6937.png",
  "shevchenko":
    "https://game-assets.fut.gg/cdn-cgi/image/quality=85,width=300,format=auto/2026/player-item/26-13128.03bd152db44f39f42b6e040ad3c7888e425fc3f89df4ec92602bc6b12b9cc171.webp",
  "cannavaro":
    "https://cdn3.futbin.com/content/fifa25/img/players/1183.png?fm=png&ixlib=java-2.1.0&verzion=1&w=512&s=1205be0747f38acd442267e1d85d69af",
  "best": "https://www.fifarosters.com/assets/players/fifa23/faces/238438.png",
  "batistuta":
    "https://static.wikia.nocookie.net/dlls/images/9/9e/Gabriel_Batistuta.webp/revision/latest?cb=20250411201220",
  "mata":
    "https://melbournevictory.com.au/wp-content/uploads/sites/7/2025/10/2526ALM-Headshot_0000s_0003_Juan-Mata_0520.png",
  "shearer": "https://officialpsds.com/imageview/7z/08/7z0831_large.png?1521316464",
  "dimaria": "https://b.fssta.com/uploads/application/soccer/headshots/871.png",
  "lautaro": "https://cdn.futwiz.com/assets/img/fc25/faces/231478.png?25",
  "cech":
    "https://static.wikia.nocookie.net/fifa/images/5/54/Petr_Cech.png/revision/latest?cb=20161215183124",
  "vinicius":
    "https://publish.realmadrid.com/content/dam/portals/realmadrid-com/es-es/sports/football/3kq9cckrnlogidldtdie2fkbl/players/vinicius-paixao-de-oliveira-junior-/assets/VINI_EQUIPO_CARITA_550X650_26-27.png",
  "forlan": "https://static.wefut.com/assets/images/fut25/playeravatars/266691.png?252",
  "macca": "https://b.fssta.com/uploads/application/soccer/headshots/63273.png",
  "essien":
    "https://static.wikia.nocookie.net/the-football-database/images/9/93/Chelsea_Essien_001.png/revision/latest?cb=20131125215804",
  "sanchez":
    "https://static.wikia.nocookie.net/fightclubchampfanom/images/c/c4/Alexis_S%C3%A1nchez.png/revision/latest?cb=20200127203451",
  "cavani":
    "https://b.fssta.com/uploads/application/soccer/headshots/4041.vresize.350.350.medium.1.png",
  "valverde":
    "https://b.fssta.com/uploads/application/soccer/headshots/42653.vresize.350.350.medium.2.png",
  "kvara": "https://b.fssta.com/uploads/application/soccer/headshots/70204.png",
  "vidal": "https://b.fssta.com/uploads/application/soccer/headshots/1396.png",
  "carvajal":
    "https://b.fssta.com/uploads/application/soccer/headshots/865.vresize.350.350.medium.1.png",
  "stones":
    "https://www.thefa.com/-/media/www-thefa-com/images/england/men-senior/mens-snr-updated-headshots/723-x-755/john-stones723x755.ashx",
  "merino":
    "https://cdn-img.staticzz.com/img/planteis/new/86/06/11688606_mikel_merino_20240916093836.png",
  "nicowilliams":
    "https://cdn-headshots.theathletic.com/soccer/3ww4cGhbJ5lTcHqH_400x400.png",
  "pedri": "https://b.fssta.com/uploads/application/soccer/headshots/72375.png",
  "osimhen":
    "https://i.namu.wiki/i/lQTUfyqkT53_YJBUZS3-bCqBABmLlkDeXmm_Lm92pvxNTgFxeNMhIBdyHuR6MWlGJ03t1PMiPpZNp4FHOtkOFg.webp",
  "kenanyildiz":
    "https://cdn-img.staticzz.com/img/planteis/new/51/98/11535198_kenan_yildiz_20240918191043.png",
  "gavi":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p264240.png?padding=0.7",
  "pedroneto":
    "https://b.fssta.com/uploads/application/soccer/headshots/53064.vresize.350.350.medium.2.png",
  "lindelof":
    "https://b.fssta.com/uploads/application/soccer/headshots/23350.vresize.350.350.medium.1.png",
  "joaofelix": "https://b.fssta.com/uploads/application/soccer/headshots/66151.png",
  "endo":
    "https://b.fssta.com/uploads/application/soccer/headshots/38419.vresize.350.350.medium.2.png",
  "eusebio":
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Eusebio_1966.jpg/800px-Eusebio_1966.jpg",
  "nedved": "https://r2.thesportsdb.com/images/media/player/cutout/nedved.jpg",
  "r9":
    "https://s.hs-data.com/gfx/person/cropped/250x250/846.png?fallback=male",
  "rodri": "https://www.fifarosters.com/assets/players/fifa24/faces/231866.png",
  "figo": "https://r2.thesportsdb.com/images/media/player/cutout/figo.png",
  "bastoni": "https://b.fssta.com/uploads/application/soccer/headshots/48753.png",
  "guardado": "https://b.fssta.com/uploads/application/soccer/headshots/2221.png",
  "dosantos":
    "https://img.a.transfermarkt.technology/portrait/big/44674-1565165236.png?lm=1",
  "frimpong": "https://b.fssta.com/uploads/application/soccer/headshots/72041.png",
  "jdavid":
    "https://b.fssta.com/uploads/application/soccer/headshots/52420.vresize.350.350.medium.2.png",
  "jboateng":
    "https://assets.sorare.com/player/46179c17-db84-441d-a75f-00e0a9802568/picture/avatar-5b4dadf4ad4db34ce5c29a56f6268453.png",
  "brozovic":
    "https://static-files.saudi-pro-league.pulselive.com/players/headshot/p94425.png",
  "icardi":
    "https://img.a.transfermarkt.technology/portrait/big/68863-1671105169.png?lm=1",
  "mcginn-ni": "https://cdn.soccerwiki.org/images/player/33856.png",
  "schick":
    "https://assets.bundesliga.com/player/dfl-obj-002g6u-dfl-clu-00000b-dfl-sea-0001ka.png",
  "mckennie": "https://b.fssta.com/uploads/application/soccer/headshots/53192.png",
  "hegazi":
    "https://static-files.saudi-pro-league.pulselive.com/players/headshot/p77777.png",
  "iwobi":
    "https://static.wikia.nocookie.net/the-football-database/images/3/3d/Alex_Iwobi.3.png/revision/latest?cb=20241208143647",
  "dia":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p246242.png?padding=0.7",
  "brennan": "https://b.fssta.com/uploads/application/soccer/headshots/71279.png",
  "bacca":
    "https://s.hs-data.com/gfx/person/cropped/250x250/152503.png?fallback=male",
  "kamada":
    "https://i.namu.wiki/i/tpS3tf6XT1sDhdCRrmj86j_zsP7LjkgAh9QdCl0UmG9KaY5SHzf4giOjUCxqSUVEIePHkYv6xBfRmM8xa6L4Tg.webp",
  "costa":
    "https://assets.sorare.com/player/bbed4f33-9ed1-4abb-9f14-46de6896b77c/picture/squared-3cfe95c51cc36e73a7228705c8bb5dce.png",
  "calhanoglu":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p208128.png?padding=0.7",
  "hwang":
    "https://www.wolves.co.uk/media/12kllcqy/hee-chan-hwang.png?width=800&quality=80&v=1dc0ad603b64bf0",
  "otero":
    "https://assets.bundesliga.com/player/dfl-obj-j012wc-dfl-clu-j000ga-dfl-sea-0001ka.png?fit=256,256",
  "iheanacho":
    "https://assets.sorare.com/playerpicture/a894648f-3304-4781-b001-ad302aa00654/picture/avatar-df4a8a4e11cff1e3b9c51ec5c1253842.png",
  "cunha":
    "https://cdn-img.staticzz.com/img/jogadores/new/96/37/549637_matheus_cunha_20251025173306.png",
  "minamino":
    "https://b.fssta.com/uploads/application/soccer/headshots/30803.vresize.350.350.medium.1.png",
  "coufal":
    "https://b.fssta.com/uploads/application/soccer/headshots/4216.vresize.350.350.medium.2.png",
  "ndidi":
    "https://cdn-img.staticzz.com/img/jogadores/new/71/41/357141_wilfred_ndidi_20260702202050.png",
  "bono":
    "https://static-files.saudi-pro-league.pulselive.com/players/headshot/p120026.png",
  "ennesyri": "https://b.fssta.com/uploads/application/soccer/headshots/47135.png",
  "amad":
    "https://assets.sorare.com/playerpicture/f4d5e901-476f-463f-be76-1073a0a2174c/picture/squared-af5b075ad34ca78f5ba0b0b1242a32f1.png",
  "bremer":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p239580.png?padding=0.7",
  "endrick":
    "https://assets.sorare.com/playerpicture/5fe713b9-332a-4f0f-864a-d341657f41ab/picture/avatar-8161a166c21c7a814e7e5186997018af.png",
  "ekitike":
    "https://cdn-img.staticzz.com/img/jogadores/new/00/07/820007_hugo_ekitike_20250920114821.png",
  "gueye":
    "https://b.fssta.com/uploads/application/soccer/headshots/18905.vresize.350.350.medium.2.png",
  "ismailasarr":
    "https://cdn-img.staticzz.com/img/jogadores/new/29/04/522904_ismaila_sarr_20251218223621.png",
  "popov":
    "https://img.a.transfermarkt.technology/portrait/big/38340-1664805887.png?lm=1",
  "mateta":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p236461.png?padding=0.7",
  "koulibaly":
    "https://img.a.transfermarkt.technology/portrait/big/93128-1697050549.png?lm=1",
  "despodov":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p245977.png?padding=0.7",
  "leekangin":
    "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits/p243780.png?padding=0.7",
  "ugarte":
    "https://i.namu.wiki/i/luXiaxWnjNjDKIACKyERQemwoz01YGXH_bYeKmcanS0TZ5xk0xooIQFcBnTPWscur-iwYtgUV8N9JI44qoNTcw.webp",
  "depay":
    "https://assets.bundesliga.com/player/dfl-obj-j00y8q-dfl-clu-j00004-dfl-sea-0001ka.png",
  "elneny": "https://www.fifarosters.com/assets/players/fifa24/faces/213051.png",
  "cubarsi":
    "https://b.fssta.com/uploads/application/soccer/headshots/118300.vresize.350.350.medium.3.png",
  "hojbjerg": "https://b.fssta.com/uploads/application/soccer/headshots/2251.png",
  "jimenez": "https://www.wolves.co.uk/media/b2jnucgz/jimenez.png",
  "tomiyasu": "https://b.fssta.com/uploads/application/soccer/headshots/53442.png",
  "trezeguet":
    "https://assets.bundesliga.com/player/dfl-obj-j016if-dfl-clu-j000g2-dfl-sea-0001ka.png?fit=256,256",
  "poko": "https://cdn.soccerwiki.org/images/player/54247.png",
  "mbeumo":
    "https://cdn-img.staticzz.com/img/jogadores/new/77/35/627735_bryan_mbeumo_20251025173113.png",
  "kulusevski":
    "https://cdn-img.zerozero.pt/img/jogadores/new/34/01/633401_dejan_kulusevski_20250817105739.png",
  "forsberg": "https://b.fssta.com/uploads/application/soccer/headshots/8838.png",
  "hwanguijo": "https://b.fssta.com/uploads/application/soccer/headshots/38425.png",
  "joaopedro":
    "https://img.chelseafc.com/image/upload/f_auto,h_390,dpr_2.0,q_90/editorial/people/first-team/2025-26/With%20IFS/3333x3333_Headshot_Image_Sponsored_IFSai_Men_Pedro_SF_Home_25_26_RGB.png",
  "zaha":
    "https://cdn-img.staticzz.com/img/jogadores/new/28/25/152825_wilfried_zaha_20260222173130.png",
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
