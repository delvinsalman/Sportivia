/**
 * Build static portrait manifests for basketball / baseball / football / hockey.
 * Run all:  npx tsx scripts/generateSportFaces.mts
 * One sport: npx tsx scripts/generateSportFaces.mts basketball
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASKETBALL_PLAYERS } from '../src/data/basketballPlayers.ts';
import { BASEBALL_PLAYERS } from '../src/data/baseballPlayers.ts';
import { FOOTBALL_PLAYERS } from '../src/data/footballPlayers.ts';
import { HOCKEY_PLAYERS } from '../src/data/hockeyPlayers.ts';
import {
  FACE_URL_BY_ID,
  resolveSportFace,
  type FaceSport,
} from './lib/sportFaceResolve.mts';

const DELAY_MS = 450;
const CHECKPOINT_EVERY = 25;

const SPORT_PLAYERS: Record<FaceSport, Array<{ id: string; name: string }>> = {
  basketball: BASKETBALL_PLAYERS,
  baseball: BASEBALL_PLAYERS,
  football: FOOTBALL_PLAYERS,
  hockey: HOCKEY_PLAYERS,
};

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function outPath(sport: FaceSport) {
  return new URL(`../public/data/${sport}-faces.json`, import.meta.url);
}

async function generateSport(sport: FaceSport) {
  const players = SPORT_PLAYERS[sport];
  const OUT = outPath(sport);
  const outFile = fileURLToPath(OUT);
  mkdirSync(dirname(outFile), { recursive: true });

  const existing: Record<string, string> = existsSync(OUT)
    ? JSON.parse(readFileSync(OUT, 'utf8'))
    : {};

  for (const [id, url] of Object.entries(FACE_URL_BY_ID[sport] ?? {})) {
    existing[id] = url;
  }

  let added = 0;
  let skipped = 0;
  let missed = 0;
  const stillMissing: string[] = [];
  const checkpoint = `/tmp/${sport}-faces-checkpoint.json`;

  console.log(`\n=== ${sport.toUpperCase()} (${players.length} players) ===`);

  for (let i = 0; i < players.length; i++) {
    const player = players[i]!;
    if (existing[player.id]) {
      skipped++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${players.length}] ${player.name} ... `);
    const url = await resolveSportFace(sport, player.id, player.name);
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
      writeFileSync(checkpoint, JSON.stringify(existing, null, 2));
    }

    await sleep(DELAY_MS);
  }

  writeFileSync(OUT, JSON.stringify(existing, null, 2));
  console.log(
    `${sport}: ${added} added, ${skipped} cached, ${missed} missed, ${Object.keys(existing).length}/${players.length} total.`,
  );
  if (stillMissing.length > 0) {
    console.log(`Still missing (${sport}):`);
    for (const line of stillMissing) console.log(`  - ${line}`);
  }
  return { sport, added, skipped, missed, total: Object.keys(existing).length, players: players.length, stillMissing };
}

const arg = process.argv[2]?.toLowerCase();
const sports: FaceSport[] =
  arg && arg in SPORT_PLAYERS
    ? [arg as FaceSport]
    : (['basketball', 'baseball', 'football', 'hockey'] as FaceSport[]);

const results = [];
for (const sport of sports) {
  results.push(await generateSport(sport));
}

console.log('\n=== SUMMARY ===');
for (const r of results) {
  console.log(
    `${r.sport}: ${r.total}/${r.players} (${r.missed} missed)`,
  );
}
if (results.some(r => r.missed > 0)) process.exitCode = 1;
