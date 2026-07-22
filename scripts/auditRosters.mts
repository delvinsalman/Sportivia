/**
 * Lightweight roster freshness check — flags active players whose listed
 * "current" club/team may be stale vs ESPN search snippets.
 *
 * Does NOT auto-edit data. Review the report and update player files by hand.
 * Run occasionally (e.g. monthly): npm run audit:rosters
 *
 * Network required. Soft-fails (exit 0) if ESPN is unreachable so CI stays green
 * unless --strict is passed.
 */
import { SOCCER_PLAYERS } from '../src/data/soccerPlayers.ts';
import { BASKETBALL_PLAYERS } from '../src/data/basketballPlayers.ts';
import { FOOTBALL_PLAYERS } from '../src/data/footballPlayers.ts';
import { HOCKEY_PLAYERS } from '../src/data/hockeyPlayers.ts';
import { BASEBALL_PLAYERS } from '../src/data/baseballPlayers.ts';

const STRICT = process.argv.includes('--strict');
const SAMPLE = Number(process.env.ROSTER_SAMPLE ?? 24);

type Check = {
  sport: string;
  id: string;
  name: string;
  listedTeam: string;
};

function sampleSoccer(): Check[] {
  return SOCCER_PLAYERS.filter(p => p.decades.includes('2020s'))
    .slice(0, SAMPLE)
    .map(p => ({
      sport: 'soccer',
      id: p.id,
      name: p.name,
      listedTeam: p.clubs.at(-1) ?? '',
    }));
}

function sampleNba(): Check[] {
  return BASKETBALL_PLAYERS.filter(p => p.decades.includes('2020s'))
    .slice(0, SAMPLE)
    .map(p => ({
      sport: 'basketball',
      id: p.id,
      name: p.name,
      listedTeam: p.nbaTeams.at(-1) ?? '',
    }));
}

function sampleNfl(): Check[] {
  return FOOTBALL_PLAYERS.filter(p => p.decades.includes('2020s'))
    .slice(0, Math.min(SAMPLE, 16))
    .map(p => ({
      sport: 'football',
      id: p.id,
      name: p.name,
      listedTeam: p.nflTeams.at(-1) ?? '',
    }));
}

function sampleNhl(): Check[] {
  return HOCKEY_PLAYERS.filter(p => p.decades.includes('2020s'))
    .slice(0, Math.min(SAMPLE, 16))
    .map(p => ({
      sport: 'hockey',
      id: p.id,
      name: p.name,
      listedTeam: p.nhlTeams.at(-1) ?? '',
    }));
}

function sampleMlb(): Check[] {
  return BASEBALL_PLAYERS.filter(p => p.decades.includes('2020s'))
    .slice(0, Math.min(SAMPLE, 16))
    .map(p => ({
      sport: 'baseball',
      id: p.id,
      name: p.name,
      listedTeam: p.mlbTeams.at(-1) ?? '',
    }));
}

async function espnSnippet(name: string): Promise<string | null> {
  const url = new URL('https://site.web.api.espn.com/apis/common/v3/search');
  url.searchParams.set('query', name);
  url.searchParams.set('limit', '5');
  url.searchParams.set('type', 'player');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'SportiviaRosterAudit/1.0' },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    items?: { displayName?: string; subtitle?: string; description?: string }[];
  };
  const hit = data.items?.find(item =>
    (item.displayName ?? '').toLowerCase().includes(name.split(' ').at(-1)!.toLowerCase()),
  );
  if (!hit) return null;
  return [hit.subtitle, hit.description].filter(Boolean).join(' · ');
}

function teamLooksStale(listed: string, snippet: string): boolean {
  if (!listed || !snippet) return false;
  const listedNorm = listed.toLowerCase();
  const snip = snippet.toLowerCase();
  // If listed club words appear in ESPN snippet, treat as fresh enough
  const tokens = listedNorm
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 3 && !['united', 'city', 'real', 'club', 'town'].includes(t));
  if (tokens.some(t => snip.includes(t))) return false;
  // ESPN often shows current team — if snippet has a team-ish phrase and none of our tokens, flag
  return /fc|united|city|lakers|yankees|patriots|maple|sox|nba|nfl|nhl|mlb|premier|serie|liga/i.test(
    snippet,
  );
}

async function main() {
  console.log('Sportivia roster freshness sample\n');
  const checks = [
    ...sampleSoccer(),
    ...sampleNba(),
    ...sampleNfl(),
    ...sampleNhl(),
    ...sampleMlb(),
  ];

  const flags: { check: Check; snippet: string }[] = [];
  let networkOk = false;

  for (const check of checks) {
    try {
      const snippet = await espnSnippet(check.name);
      if (snippet == null) continue;
      networkOk = true;
      if (teamLooksStale(check.listedTeam, snippet)) {
        flags.push({ check, snippet });
      }
      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      console.warn('Network error:', err instanceof Error ? err.message : err);
      break;
    }
  }

  if (!networkOk) {
    console.warn('Could not reach ESPN — skipped freshness checks.');
    if (STRICT) process.exit(1);
    process.exit(0);
  }

  if (!flags.length) {
    console.log(`Checked ${checks.length} active players — no obvious club mismatches.`);
    process.exit(0);
  }

  console.log(`Possible stale clubs (${flags.length}):\n`);
  for (const { check, snippet } of flags) {
    console.log(
      `- [${check.sport}] ${check.name} (${check.id})\n  listed: ${check.listedTeam}\n  espn:   ${snippet}\n`,
    );
  }
  console.log('Review and update the matching file under src/data/ if needed.');
  process.exit(STRICT ? 1 : 0);
}

main();
