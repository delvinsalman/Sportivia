/**
 * Build static soccer portrait manifest for the collection screen.
 * Run: npx tsx scripts/generateSoccerFaces.mts
 * Then: npx tsx scripts/localizeSoccerFaces.mts  (downloads into public/faces/soccer)
 *
 * Prefer already-localized /faces/soccer/* paths so regenerating never
 * reintroduces expiring CDN links.
 */
import { writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOCCER_PLAYERS } from '../src/data/soccerPlayers.ts';
import { FACE_URL_BY_ID, resolveSoccerFace } from './lib/soccerFaceResolve.mts';

const ROOT = dirname(fileURLToPath(new URL('.', import.meta.url)));
const OUT = new URL('../public/data/soccer-faces.json', import.meta.url);
const FACES_DIR = join(ROOT, '../public/faces/soccer');
const CHECKPOINT = '/tmp/soccer-faces-checkpoint.json';
const CHECKPOINT_EVERY = 20;
const DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function localFacePath(playerId: string): string | null {
  if (!existsSync(FACES_DIR)) return null;
  const match = readdirSync(FACES_DIR).find(name => {
    const base = name.replace(/\.[^.]+$/, '');
    return base === playerId;
  });
  return match ? `/faces/soccer/${match}` : null;
}

const existing: Record<string, string> = existsSync(OUT)
  ? JSON.parse(readFileSync(OUT, 'utf8'))
  : {};

// Prefer permanent local files over any remote / override URL.
for (const player of SOCCER_PLAYERS) {
  const local = localFacePath(player.id);
  if (local) existing[player.id] = local;
}

// Seed manual overrides only when no local file exists yet.
for (const [id, url] of Object.entries(FACE_URL_BY_ID)) {
  if (!existing[id]) existing[id] = url;
}

let added = 0;
let skipped = 0;
let missed = 0;
const stillMissing: string[] = [];

for (let i = 0; i < SOCCER_PLAYERS.length; i++) {
  const player = SOCCER_PLAYERS[i]!;
  if (existing[player.id]) {
    skipped++;
    continue;
  }

  process.stdout.write(`[${i + 1}/${SOCCER_PLAYERS.length}] ${player.name} ... `);
  const url = await resolveSoccerFace(player.id, player.name);
  if (url) {
    existing[player.id] = url;
    added++;
    console.log('ok');
  } else {
    missed++;
    stillMissing.push(`${player.id}: ${player.name}`);
    console.log('miss');
  }

  if ((added + missed) % CHECKPOINT_EVERY === 0) {
    writeFileSync(CHECKPOINT, JSON.stringify(existing, null, 2));
  }

  await sleep(DELAY_MS);
}

writeFileSync(OUT, JSON.stringify(existing, null, 2));
if (existsSync(CHECKPOINT)) {
  try {
    writeFileSync(CHECKPOINT, '{}');
  } catch {
    /* ignore */
  }
}

console.log(`Done. ${added} added, ${skipped} cached, ${missed} missed, ${Object.keys(existing).length}/${SOCCER_PLAYERS.length} total.`);
console.log('Tip: run `npx tsx scripts/localizeSoccerFaces.mts` so new remote URLs become permanent local files.');
if (stillMissing.length > 0) {
  console.log('\nStill missing:');
  for (const line of stillMissing) console.log(`  - ${line}`);
  process.exitCode = 1;
}
