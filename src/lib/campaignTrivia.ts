import type { Sport } from '../types';
import { shuffleWithSeed, hashString } from './seed';
import { generateQuickQuestions } from './quickPlay';
import { CAMPAIGN_AWARDS } from './campaignAwards';

/** Points tuned to campaign star bars (not bingo). */
export const CAMPAIGN_Q_POINTS = 5;
export const CAMPAIGN_SPEED_BONUS = 2;
export const CAMPAIGN_QUESTION_TIME = 10;

export interface CampaignTriviaChoice {
  id: string;
  label: string;
  correct: boolean;
}

export type CampaignTriviaQuestion =
  | {
      id: string;
      kind: 'championship';
      sport: Sport;
      prompt: string;
      /** Trophy / award art — never a real team logo. */
      trophyIcon: string;
      trophyLabel: string;
      choices: CampaignTriviaChoice[];
    }
  | {
      id: string;
      kind: 'player';
      sport: Sport;
      prompt: string;
      playerId: string;
      playerName: string;
      choices: CampaignTriviaChoice[];
    };

interface RawChampQ {
  id: string;
  sport: Sport;
  prompt: string;
  trophyIcon: string;
  trophyLabel: string;
  answer: string;
  distractors: string[];
  /** Unlocks into the pool once campaign level ≥ this (default 1). */
  minLevel?: number;
}

const T = {
  worldCup: '/icons/trophies/world-cup.png',
  euro: '/icons/trophies/euro-trophy.png',
  ucl: '/icons/trophies/ucl.png',
  europa: '/icons/trophies/europa.png',
  faCup: '/icons/trophies/fa-cup.png',
  copa: '/icons/trophies/copa-america.png',
  ballon: '/icons/trophies/ballon-dor.png',
  nba: '/icons/trophies/nba-ring.png',
  nbaMvp: '/icons/trophies/nba-mvp.png',
  nbaScoring: '/icons/trophies/nba-scoring.png',
  mlb: '/icons/trophies/mlb-world-series.png',
  mlbMvp: '/icons/trophies/mlb-mvp.png',
  cyYoung: '/icons/trophies/mlb-cy-young.png',
  goldGlove: '/icons/trophies/mlb-gold-glove.png',
  batting: '/icons/trophies/mlb-batting-title.png',
  nfl: '/icons/trophies/nfl-super-bowl.png',
  nhl: '/icons/trophies/nhl-hof.png',
  generic: '/icons/trophy-record.png',
} as const;

/**
 * Championship / team-title trivia for Campaign only.
 * Answers are team names as text; visuals use trophies (no real logos).
 */
const BANK: RawChampQ[] = [
  // ── Soccer / World Cup ──
  {
    id: 'wc-2002',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 2002?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'Brazil',
    distractors: ['Germany', 'Turkey', 'South Korea'],
  },
  {
    id: 'wc-2010',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 2010?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'Spain',
    distractors: ['Netherlands', 'Germany', 'Uruguay'],
  },
  {
    id: 'wc-2014',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 2014?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'Germany',
    distractors: ['Argentina', 'Brazil', 'Netherlands'],
  },
  {
    id: 'wc-2018',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 2018?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'France',
    distractors: ['Croatia', 'Belgium', 'England'],
  },
  {
    id: 'wc-2022',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 2022?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'Argentina',
    distractors: ['France', 'Croatia', 'Morocco'],
  },
  {
    id: 'wc-1998',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 1998?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'France',
    distractors: ['Brazil', 'Netherlands', 'Croatia'],
  },
  {
    id: 'wc-1986',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 1986?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'Argentina',
    distractors: ['West Germany', 'France', 'Belgium'],
  },
  {
    id: 'wc-1966',
    sport: 'soccer',
    prompt: 'Which nation won the FIFA World Cup in 1966?',
    trophyIcon: T.worldCup,
    trophyLabel: 'World Cup',
    answer: 'England',
    distractors: ['West Germany', 'Portugal', 'Soviet Union'],
  },
  {
    id: 'euro-2016',
    sport: 'soccer',
    prompt: 'Which nation won UEFA Euro 2016?',
    trophyIcon: T.euro,
    trophyLabel: 'Euro',
    answer: 'Portugal',
    distractors: ['France', 'Wales', 'Germany'],
  },
  {
    id: 'euro-2020',
    sport: 'soccer',
    prompt: 'Which nation won UEFA Euro 2020 (played in 2021)?',
    trophyIcon: T.euro,
    trophyLabel: 'Euro',
    answer: 'Italy',
    distractors: ['England', 'Spain', 'Denmark'],
  },
  {
    id: 'euro-2024',
    sport: 'soccer',
    prompt: 'Which nation won UEFA Euro 2024?',
    trophyIcon: T.euro,
    trophyLabel: 'Euro',
    answer: 'Spain',
    distractors: ['England', 'France', 'Netherlands'],
  },
  {
    id: 'ucl-2019',
    sport: 'soccer',
    prompt: 'Which club won the UEFA Champions League in 2019?',
    trophyIcon: T.ucl,
    trophyLabel: 'Champions League',
    answer: 'Liverpool',
    distractors: ['Tottenham', 'Ajax', 'Barcelona'],
  },
  {
    id: 'ucl-2020',
    sport: 'soccer',
    prompt: 'Which club won the UEFA Champions League in 2020?',
    trophyIcon: T.ucl,
    trophyLabel: 'Champions League',
    answer: 'Bayern Munich',
    distractors: ['Paris Saint-Germain', 'Lyon', 'RB Leipzig'],
  },
  {
    id: 'ucl-2023',
    sport: 'soccer',
    prompt: 'Which club won the UEFA Champions League in 2023?',
    trophyIcon: T.ucl,
    trophyLabel: 'Champions League',
    answer: 'Manchester City',
    distractors: ['Inter Milan', 'Real Madrid', 'Bayern Munich'],
  },
  {
    id: 'ucl-2024',
    sport: 'soccer',
    prompt: 'Which club won the UEFA Champions League in 2024?',
    trophyIcon: T.ucl,
    trophyLabel: 'Champions League',
    answer: 'Real Madrid',
    distractors: ['Borussia Dortmund', 'Bayern Munich', 'Paris Saint-Germain'],
  },
  {
    id: 'pl-2016',
    sport: 'soccer',
    prompt: 'Which club won the Premier League in 2015–16?',
    trophyIcon: T.generic,
    trophyLabel: 'Premier League',
    answer: 'Leicester City',
    distractors: ['Arsenal', 'Tottenham', 'Manchester City'],
  },
  {
    id: 'pl-2020',
    sport: 'soccer',
    prompt: 'Which club won the Premier League in 2019–20?',
    trophyIcon: T.generic,
    trophyLabel: 'Premier League',
    answer: 'Liverpool',
    distractors: ['Manchester City', 'Chelsea', 'Manchester United'],
  },
  {
    id: 'pl-2024',
    sport: 'soccer',
    prompt: 'Which club won the Premier League in 2023–24?',
    trophyIcon: T.generic,
    trophyLabel: 'Premier League',
    answer: 'Manchester City',
    distractors: ['Arsenal', 'Liverpool', 'Aston Villa'],
  },
  {
    id: 'pl-2008',
    sport: 'soccer',
    prompt: 'Which club won the Premier League in 2007–08?',
    trophyIcon: T.generic,
    trophyLabel: 'Premier League',
    answer: 'Manchester United',
    distractors: ['Chelsea', 'Arsenal', 'Liverpool'],
  },
  {
    id: 'fa-2021',
    sport: 'soccer',
    prompt: 'Which club won the FA Cup in 2021?',
    trophyIcon: T.faCup,
    trophyLabel: 'FA Cup',
    answer: 'Leicester City',
    distractors: ['Chelsea', 'Manchester United', 'Southampton'],
  },
  {
    id: 'copa-2021',
    sport: 'soccer',
    prompt: 'Which nation won the Copa América in 2021?',
    trophyIcon: T.copa,
    trophyLabel: 'Copa América',
    answer: 'Argentina',
    distractors: ['Brazil', 'Colombia', 'Peru'],
  },
  {
    id: 'copa-2024',
    sport: 'soccer',
    prompt: 'Which nation won the Copa América in 2024?',
    trophyIcon: T.copa,
    trophyLabel: 'Copa América',
    answer: 'Argentina',
    distractors: ['Colombia', 'Uruguay', 'Canada'],
  },
  {
    id: 'uel-2023',
    sport: 'soccer',
    prompt: 'Which club won the UEFA Europa League in 2023?',
    trophyIcon: T.europa,
    trophyLabel: 'Europa League',
    answer: 'Sevilla',
    distractors: ['Roma', 'Juventus', 'Manchester United'],
  },

  // ── Basketball / NBA ──
  {
    id: 'nba-2016',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2016?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Cleveland Cavaliers',
    distractors: ['Golden State Warriors', 'Oklahoma City Thunder', 'San Antonio Spurs'],
  },
  {
    id: 'nba-2017',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2017?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Golden State Warriors',
    distractors: ['Cleveland Cavaliers', 'Houston Rockets', 'Boston Celtics'],
  },
  {
    id: 'nba-2019',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2019?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Toronto Raptors',
    distractors: ['Golden State Warriors', 'Milwaukee Bucks', 'Philadelphia 76ers'],
  },
  {
    id: 'nba-2020',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2020?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Los Angeles Lakers',
    distractors: ['Miami Heat', 'Denver Nuggets', 'Boston Celtics'],
  },
  {
    id: 'nba-2021',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2021?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Milwaukee Bucks',
    distractors: ['Phoenix Suns', 'Atlanta Hawks', 'Brooklyn Nets'],
  },
  {
    id: 'nba-2022',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2022?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Golden State Warriors',
    distractors: ['Boston Celtics', 'Miami Heat', 'Dallas Mavericks'],
  },
  {
    id: 'nba-2023',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2023?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Denver Nuggets',
    distractors: ['Miami Heat', 'Boston Celtics', 'Los Angeles Lakers'],
  },
  {
    id: 'nba-2024',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2024?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Boston Celtics',
    distractors: ['Dallas Mavericks', 'Minnesota Timberwolves', 'Indiana Pacers'],
  },
  {
    id: 'nba-2010',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2010?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Los Angeles Lakers',
    distractors: ['Boston Celtics', 'Orlando Magic', 'Phoenix Suns'],
  },
  {
    id: 'nba-1996',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 1996?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Chicago Bulls',
    distractors: ['Seattle SuperSonics', 'Utah Jazz', 'Houston Rockets'],
  },
  {
    id: 'nba-2008',
    sport: 'basketball',
    prompt: 'Which team won the NBA Finals in 2008?',
    trophyIcon: T.nba,
    trophyLabel: 'NBA Finals',
    answer: 'Boston Celtics',
    distractors: ['Los Angeles Lakers', 'Detroit Pistons', 'San Antonio Spurs'],
  },

  // ── Baseball / MLB ──
  {
    id: 'ws-2004',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2004?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Boston Red Sox',
    distractors: ['St. Louis Cardinals', 'New York Yankees', 'Houston Astros'],
  },
  {
    id: 'ws-2016',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2016?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Chicago Cubs',
    distractors: ['Cleveland Indians', 'Los Angeles Dodgers', 'New York Mets'],
  },
  {
    id: 'ws-2017',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2017?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Houston Astros',
    distractors: ['Los Angeles Dodgers', 'New York Yankees', 'Boston Red Sox'],
  },
  {
    id: 'ws-2019',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2019?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Washington Nationals',
    distractors: ['Houston Astros', 'New York Yankees', 'Atlanta Braves'],
  },
  {
    id: 'ws-2020',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2020?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Los Angeles Dodgers',
    distractors: ['Tampa Bay Rays', 'Atlanta Braves', 'Houston Astros'],
  },
  {
    id: 'ws-2021',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2021?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Atlanta Braves',
    distractors: ['Houston Astros', 'Los Angeles Dodgers', 'Boston Red Sox'],
  },
  {
    id: 'ws-2022',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2022?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Houston Astros',
    distractors: ['Philadelphia Phillies', 'New York Yankees', 'San Diego Padres'],
  },
  {
    id: 'ws-2023',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2023?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Texas Rangers',
    distractors: ['Arizona Diamondbacks', 'Houston Astros', 'Philadelphia Phillies'],
  },
  {
    id: 'ws-2024',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2024?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'Los Angeles Dodgers',
    distractors: ['New York Yankees', 'San Diego Padres', 'Philadelphia Phillies'],
  },
  {
    id: 'ws-2009',
    sport: 'baseball',
    prompt: 'Which team won the World Series in 2009?',
    trophyIcon: T.mlb,
    trophyLabel: 'World Series',
    answer: 'New York Yankees',
    distractors: ['Philadelphia Phillies', 'Los Angeles Angels', 'Boston Red Sox'],
  },

  // ── Football / NFL ──
  {
    id: 'sb-1986',
    sport: 'football',
    prompt: 'Which team won Super Bowl XX (January 1986)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Chicago Bears',
    distractors: ['New England Patriots', 'Miami Dolphins', 'Los Angeles Raiders'],
  },
  {
    id: 'sb-2008',
    sport: 'football',
    prompt: 'Which team won Super Bowl XLII (February 2008)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'New York Giants',
    distractors: ['New England Patriots', 'Green Bay Packers', 'Pittsburgh Steelers'],
  },
  {
    id: 'sb-2015',
    sport: 'football',
    prompt: 'Which team won Super Bowl XLIX (February 2015)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'New England Patriots',
    distractors: ['Seattle Seahawks', 'Denver Broncos', 'Green Bay Packers'],
  },
  {
    id: 'sb-2016',
    sport: 'football',
    prompt: 'Which team won Super Bowl 50 (February 2016)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Denver Broncos',
    distractors: ['Carolina Panthers', 'New England Patriots', 'Arizona Cardinals'],
  },
  {
    id: 'sb-2018',
    sport: 'football',
    prompt: 'Which team won Super Bowl LII (February 2018)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Philadelphia Eagles',
    distractors: ['New England Patriots', 'Minnesota Vikings', 'Atlanta Falcons'],
  },
  {
    id: 'sb-2020',
    sport: 'football',
    prompt: 'Which team won Super Bowl LIV (February 2020)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Kansas City Chiefs',
    distractors: ['San Francisco 49ers', 'Green Bay Packers', 'Tennessee Titans'],
  },
  {
    id: 'sb-2021',
    sport: 'football',
    prompt: 'Which team won Super Bowl LV (February 2021)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Tampa Bay Buccaneers',
    distractors: ['Kansas City Chiefs', 'Green Bay Packers', 'Buffalo Bills'],
  },
  {
    id: 'sb-2023',
    sport: 'football',
    prompt: 'Which team won Super Bowl LVII (February 2023)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Kansas City Chiefs',
    distractors: ['Philadelphia Eagles', 'San Francisco 49ers', 'Cincinnati Bengals'],
  },
  {
    id: 'sb-2024',
    sport: 'football',
    prompt: 'Which team won Super Bowl LVIII (February 2024)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Kansas City Chiefs',
    distractors: ['San Francisco 49ers', 'Baltimore Ravens', 'Detroit Lions'],
  },
  {
    id: 'sb-2025',
    sport: 'football',
    prompt: 'Which team won Super Bowl LIX (February 2025)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Philadelphia Eagles',
    distractors: ['Kansas City Chiefs', 'Buffalo Bills', 'Detroit Lions'],
  },
  {
    id: 'sb-1999',
    sport: 'football',
    prompt: 'Which team won Super Bowl XXXIII (January 1999)?',
    trophyIcon: T.nfl,
    trophyLabel: 'Super Bowl',
    answer: 'Denver Broncos',
    distractors: ['Atlanta Falcons', 'Minnesota Vikings', 'New York Jets'],
  },

  // ── Hockey / NHL ──
  {
    id: 'sc-2011',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2011?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Boston Bruins',
    distractors: ['Vancouver Canucks', 'Pittsburgh Penguins', 'Chicago Blackhawks'],
  },
  {
    id: 'sc-2015',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2015?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Chicago Blackhawks',
    distractors: ['Tampa Bay Lightning', 'New York Rangers', 'Anaheim Ducks'],
  },
  {
    id: 'sc-2017',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2017?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Pittsburgh Penguins',
    distractors: ['Nashville Predators', 'Ottawa Senators', 'Washington Capitals'],
  },
  {
    id: 'sc-2018',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2018?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Washington Capitals',
    distractors: ['Vegas Golden Knights', 'Tampa Bay Lightning', 'Pittsburgh Penguins'],
  },
  {
    id: 'sc-2019',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2019?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'St. Louis Blues',
    distractors: ['Boston Bruins', 'San Jose Sharks', 'Dallas Stars'],
  },
  {
    id: 'sc-2020',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2020?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Tampa Bay Lightning',
    distractors: ['Dallas Stars', 'New York Islanders', 'Vegas Golden Knights'],
  },
  {
    id: 'sc-2021',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2021?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Tampa Bay Lightning',
    distractors: ['Montreal Canadiens', 'Vegas Golden Knights', 'Colorado Avalanche'],
  },
  {
    id: 'sc-2022',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2022?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Colorado Avalanche',
    distractors: ['Tampa Bay Lightning', 'Edmonton Oilers', 'New York Rangers'],
  },
  {
    id: 'sc-2023',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2023?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Vegas Golden Knights',
    distractors: ['Florida Panthers', 'Dallas Stars', 'Carolina Hurricanes'],
  },
  {
    id: 'sc-2024',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2024?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Florida Panthers',
    distractors: ['Edmonton Oilers', 'New York Rangers', 'Dallas Stars'],
  },
  {
    id: 'sc-2002',
    sport: 'hockey',
    prompt: 'Which team won the Stanley Cup in 2002?',
    trophyIcon: T.nhl,
    trophyLabel: 'Stanley Cup',
    answer: 'Detroit Red Wings',
    distractors: ['Carolina Hurricanes', 'Colorado Avalanche', 'New Jersey Devils'],
  },
];

function buildChoices(answer: string, distractors: string[], seed: number): CampaignTriviaChoice[] {
  return shuffleWithSeed(
    [
      { id: `c-${answer}`, label: answer, correct: true },
      ...distractors.map((label, i) => ({
        id: `d-${i}-${label}`,
        label,
        correct: false,
      })),
    ],
    seed,
  ).slice(0, 4);
}

export function questionsForSports(sports: Sport[], levelId = 1): RawChampQ[] {
  const set = new Set(sports);
  const titles = BANK.filter(q => set.has(q.sport)).map(q => ({
    ...q,
    minLevel: q.minLevel ?? 1,
  }));
  const awards = CAMPAIGN_AWARDS.filter(
    q => set.has(q.sport) && q.minLevel <= levelId,
  );
  return [...titles, ...awards];
}

function championshipQueue(
  sports: Sport[],
  seedKey: string,
  count: number,
  levelId: number,
): CampaignTriviaQuestion[] {
  const pool = questionsForSports(sports, levelId);
  if (pool.length === 0) return [];
  const seed = hashString(`champ-${seedKey}`);
  // Freshly unlocked awards show up more often
  const weighted = pool.flatMap(q => {
    const min = q.minLevel ?? 1;
    const fresh = min > 1 && min >= levelId - 4;
    return fresh ? [q, q, q] : [q];
  });
  const shuffled = shuffleWithSeed(weighted, seed);
  const out: CampaignTriviaQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const raw = shuffled[i % shuffled.length]!;
    out.push({
      id: `${raw.id}-c-${i}`,
      kind: 'championship',
      sport: raw.sport,
      prompt: raw.prompt,
      trophyIcon: raw.trophyIcon,
      trophyLabel: raw.trophyLabel,
      choices: buildChoices(raw.answer, raw.distractors, seed + i * 97),
    });
  }
  return out;
}

function playerQueue(sports: Sport[], seedKey: string, count: number): CampaignTriviaQuestion[] {
  if (sports.length === 0 || count <= 0) return [];
  const seed = hashString(`player-${seedKey}`);
  const perSport = Math.max(8, Math.ceil(count / sports.length) + 4);
  const pooled: CampaignTriviaQuestion[] = [];

  sports.forEach((sport, sIdx) => {
    const qs = generateQuickQuestions(sport, perSport, `${seedKey}-p-${sport}-${sIdx}`);
    for (const q of qs) {
      pooled.push({
        id: `player-${q.id}-${sIdx}`,
        kind: 'player',
        sport,
        prompt: q.prompt,
        playerId: q.playerId,
        playerName: q.playerName,
        choices: q.choices,
      });
    }
  });

  return shuffleWithSeed(pooled, seed).slice(0, count);
}

/**
 * Mixed queue: player trivia + titles/awards.
 * Higher campaign levels unlock Ballon d’Or, rookies, MVPs, etc. and lean harder into them.
 */
export function generateCampaignTriviaQueue(
  sports: Sport[],
  seedKey: string,
  levelId = 1,
): CampaignTriviaQuestion[] {
  const seed = hashString(seedKey);
  const target = 36;
  // As levels climb, award/title share grows
  const champShare =
    levelId >= 30 ? 0.62 : levelId >= 20 ? 0.56 : levelId >= 10 ? 0.5 : levelId >= 5 ? 0.48 : 0.42;
  const champCount = Math.round(target * champShare);
  const playerCount = target - champCount;

  const players = playerQueue(sports, seedKey, playerCount);
  const champs = championshipQueue(sports, seedKey, champCount, levelId);

  const mixed: CampaignTriviaQuestion[] = [];
  const a = shuffleWithSeed(players, seed + 3);
  const b = shuffleWithSeed(champs, seed + 7);
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i++) {
    if (a[i]) mixed.push(a[i]!);
    if (b[i]) mixed.push(b[i]!);
  }

  const queue: CampaignTriviaQuestion[] = [];
  const want = Math.max(48, mixed.length * 2);
  for (let i = 0; i < want; i++) {
    const q = mixed[i % mixed.length];
    if (!q) break;
    queue.push({ ...q, id: `${q.id}-r${i}` });
  }
  return queue;
}

export function scoreCampaignAnswer(correct: boolean, questionTimeLeft: number): number {
  if (!correct) return 0;
  const speedy = questionTimeLeft >= Math.ceil(CAMPAIGN_QUESTION_TIME / 2);
  return CAMPAIGN_Q_POINTS + (speedy ? CAMPAIGN_SPEED_BONUS : 0);
}

export { BANK as CAMPAIGN_TRIVIA_BANK };
