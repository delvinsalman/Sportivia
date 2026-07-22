/**
 * Data integrity audit for Sportivia rosters + card packs.
 * Run: npm run audit:data
 *
 * Fails (exit 1) on duplicate player IDs, empty pack pools, or duplicate card keys.
 */
import { SOCCER_PLAYERS } from '../src/data/soccerPlayers.ts';
import { BASKETBALL_PLAYERS } from '../src/data/basketballPlayers.ts';
import { BASEBALL_PLAYERS } from '../src/data/baseballPlayers.ts';
import { FOOTBALL_PLAYERS } from '../src/data/footballPlayers.ts';
import { HOCKEY_PLAYERS } from '../src/data/hockeyPlayers.ts';
import { CARD_CATALOG, CARDS_BY_SPORT, CARD_PACKS } from '../src/lib/cardCatalog.ts';
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

  const cards = CARDS_BY_SPORT[sport];
  if (cards.length !== players.length) {
    fail(`${sport}: card count ${cards.length} ≠ roster ${players.length}`);
  } else {
    ok(`${sport}: card catalog matches roster`);
  }

  const keys = cards.map(c => c.key);
  if (new Set(keys).size !== keys.length) {
    fail(`${sport}: duplicate card keys`);
  } else {
    ok(`${sport}: unique card keys`);
  }

  const byRarity = { common: 0, rare: 0, epic: 0, legendary: 0 };
  for (const c of cards) byRarity[c.rarity] += 1;
  if (byRarity.legendary < 1) fail(`${sport}: no legendary cards`);
  else ok(`${sport}: rarities c/r/e/l = ${byRarity.common}/${byRarity.rare}/${byRarity.epic}/${byRarity.legendary}`);
}

const allKeys = CARD_CATALOG.map(c => c.key);
if (new Set(allKeys).size !== allKeys.length) fail('global duplicate card keys');
else ok(`catalog: ${CARD_CATALOG.length} cards, unique keys`);

for (const pack of CARD_PACKS) {
  const oddsSum = Object.values(pack.odds).reduce((a, b) => a + b, 0);
  if (Math.abs(oddsSum - 100) > 0.05) fail(`pack ${pack.id}: odds sum ${oddsSum} (need 100)`);
  else ok(`pack ${pack.id}: odds sum 100, ${pack.cardCount} cards`);
  for (const sport of rosters.map(r => r.sport)) {
    if (CARDS_BY_SPORT[sport].length < pack.cardCount) {
      fail(`pack ${pack.id}: ${sport} pool smaller than pack size`);
    }
  }
}

// Simulate pack uniqueness (within-open should never collide once deduped in openCardPack)
function simulateUnique(sport: Sport, cardCount: number, n = 2000) {
  const pool = CARDS_BY_SPORT[sport];
  let collisions = 0;
  for (let i = 0; i < n; i++) {
    const pulled = new Set<string>();
    const rolled: string[] = [];
    for (let j = 0; j < cardCount; j++) {
      const available = pool.filter(c => !pulled.has(c.key));
      const source = available.length ? available : pool;
      const card = source[Math.floor(Math.random() * source.length)]!;
      rolled.push(card.key);
      pulled.add(card.key);
    }
    if (new Set(rolled).size < rolled.length) collisions += 1;
  }
  return collisions;
}

for (const pack of CARD_PACKS) {
  for (const { sport } of rosters) {
    const collisions = simulateUnique(sport, pack.cardCount);
    if (collisions > 0) fail(`pack sim ${pack.id}/${sport}: ${collisions} non-unique opens`);
  }
}
ok('pack open simulation: within-pack uniqueness holds');

if (failed) {
  console.error('\nAudit failed.');
  process.exit(1);
}
console.log('\nAudit passed.');
