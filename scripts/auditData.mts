/**
 * Data integrity audit for Sportivia rosters.
 * Run: npm run audit:data
 *
 * Fails (exit 1) on duplicate player IDs or undersized rosters.
 */
import { SOCCER_PLAYERS } from '../src/data/soccerPlayers.ts';
import { BASKETBALL_PLAYERS } from '../src/data/basketballPlayers.ts';
import { BASEBALL_PLAYERS } from '../src/data/baseballPlayers.ts';
import { FOOTBALL_PLAYERS } from '../src/data/footballPlayers.ts';
import { HOCKEY_PLAYERS } from '../src/data/hockeyPlayers.ts';
import type { Sport } from '../src/types.ts';

type Named = { id: string; name: string };

const rosters: { sport: Sport; players: Named[] }[] = [
  { sport: 'soccer', players: SOCCER_PLAYERS },
  { sport: 'basketball', players: BASKETBALL_PLAYERS },
  { sport: 'baseball', players: BASEBALL_PLAYERS },
  { sport: 'football', players: FOOTBALL_PLAYERS },
  { sport: 'hockey', players: HOCKEY_PLAYERS },
];

let failed = false;

function fail(msg: string) {
  failed = true;
  console.error(`FAIL  ${msg}`);
}

function ok(msg: string) {
  console.log(`OK    ${msg}`);
}

function findIdCollisions(players: Named[]) {
  const byId = new Map<string, string[]>();
  for (const p of players) {
    const list = byId.get(p.id) ?? [];
    list.push(p.name);
    byId.set(p.id, list);
  }
  return [...byId.entries()].filter(([, names]) => names.length > 1);
}

console.log('Sportivia data audit\n');

for (const { sport, players } of rosters) {
  if (players.length < 40) fail(`${sport}: roster too small (${players.length})`);
  else ok(`${sport}: ${players.length} players`);

  const collisions = findIdCollisions(players);
  if (collisions.length) {
    for (const [id, names] of collisions) {
      fail(`${sport}: duplicate id "${id}" → ${names.join(' | ')}`);
    }
  } else {
    ok(`${sport}: unique ids`);
  }
}

if (failed) {
  console.error('\nAudit failed.');
  process.exit(1);
}
console.log('\nAudit passed.');
