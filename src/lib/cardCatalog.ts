import type { Sport } from '../types';
import type {
  CardPackDefinition,
  CardPackTier,
  CardRarity,
  CollectibleCard,
} from '../types/cards';
import { SOCCER_PLAYERS } from '../data/soccerPlayers';
import { BASKETBALL_PLAYERS } from '../data/basketballPlayers';
import { BASEBALL_PLAYERS } from '../data/baseballPlayers';
import { FOOTBALL_PLAYERS } from '../data/footballPlayers';
import { HOCKEY_PLAYERS } from '../data/hockeyPlayers';

export const CARD_PACKS: CardPackDefinition[] = [
  {
    id: 'prospect',
    name: 'Prospect Pack',
    tagline: 'Build your collection',
    cost: 250,
    cardCount: 3,
    odds: { common: 72, rare: 24, epic: 3.5, legendary: 0.5 },
    duplicateRefund: { common: 12, rare: 30, epic: 90, legendary: 350 },
    colors: ['#94a3b8', '#e2e8f0', '#334155'],
  },
  {
    id: 'elite',
    name: 'Elite Pack',
    tagline: 'One rare or better guaranteed',
    cost: 800,
    cardCount: 6,
    guaranteedRarity: 'rare',
    odds: { common: 44, rare: 44, epic: 11.5, legendary: 0.5 },
    duplicateRefund: { common: 15, rare: 38, epic: 110, legendary: 425 },
    colors: ['#f0b232', '#fde68a', '#1a1008'],
  },
  {
    id: 'icon',
    name: 'Icon Pack',
    tagline: 'One epic or better guaranteed',
    cost: 2_000,
    cardCount: 9,
    guaranteedRarity: 'epic',
    odds: { common: 37, rare: 47, epic: 13.5, legendary: 2.5 },
    duplicateRefund: { common: 20, rare: 50, epic: 140, legendary: 500 },
    colors: ['#c084fc', '#f5d0fe', '#12061f'],
  },
];

const LEGENDARY_IDS: Record<Sport, Set<string>> = {
  soccer: new Set([
    'messi', 'cr7', 'pele', 'maradona', 'zidane', 'r9', 'ronaldinho',
    'neymar', 'cruyff', 'beckenbauer', 'maldini', 'buffon', 'xavi', 'iniesta',
    'cantona', 'bale',
  ]),
  basketball: new Set([
    'mj', 'lebron', 'kobe', 'curry', 'magic', 'bird', 'shaq', 'duncan',
    'kareem', 'wilt', 'russell', 'kd', 'hakeem', 'oscar',
  ]),
  baseball: new Set([
    'babe', 'ruth', 'aaron', 'mays', 'mantle', 'jackie', 'robinson', 'cobb', 'williams', 'musial',
    'ohtani', 'trout', 'judge', 'jeter', 'griffey', 'pedro',
  ]),
  football: new Set([
    'brady', 'mahomes', 'montana', 'rice', 'lt', 'barry', 'payton', 'sweetness', 'sweetnes',
    'manning', 'moss', 'reggie', 'deion', 'sandy', 'gronk',
  ]),
  hockey: new Set([
    'wayne-gretzky', 'mario-lemieux', 'gordie-howe', 'bobby-orr', 'sidney-crosby',
    'alex-ovechkin', 'connor-mcdavid', 'jaromir-jagr', 'dominik-hasek',
    'martin-brodeur', 'patrick-roy', 'nicklas-lidstrom', 'joe-sakic', 'steve-yzerman',
  ]),
};

const KNOWN_RETIRED: Record<Sport, Set<string>> = {
  soccer: new Set([
    'pele', 'maradona', 'zidane', 'r9', 'ronaldinho', 'cruyff',
    'beckenbauer', 'maldini', 'buffon', 'xavi', 'iniesta', 'henry', 'drogba',
    'pirlo', 'kaka', 'aguero', 'gerrard', 'lampard', 'hazard', 'cantona', 'bale',
  ]),
  basketball: new Set([
    'mj', 'kobe', 'magic', 'bird', 'shaq', 'duncan', 'kareem', 'wilt', 'russell',
    'hakeem', 'oscar', 'dirk', 'nash', 'garnett', 'pierce', 'ai',
  ]),
  baseball: new Set([
    'babe', 'ruth', 'aaron', 'mays', 'mantle', 'jackie', 'robinson', 'cobb', 'williams', 'musial',
    'jeter', 'griffey', 'pedro',
  ]),
  football: new Set([
    'brady', 'montana', 'rice', 'lt', 'barry', 'payton', 'sweetness', 'sweetnes', 'manning',
    'moss', 'reggie', 'deion', 'sandy', 'gronk', 'elway', 'favre', 'brees',
  ]),
  hockey: new Set([
    'wayne-gretzky', 'mario-lemieux', 'gordie-howe', 'bobby-orr', 'jaromir-jagr',
    'dominik-hasek', 'martin-brodeur', 'patrick-roy', 'nicklas-lidstrom',
    'joe-sakic', 'steve-yzerman', 'mark-messier', 'ray-bourque', 'guy-lafleur',
    'maurice-richard', 'jean-beliveau', 'mike-bossy', 'bryan-trottier',
    'phil-esposito', 'bobby-hull', 'brett-hull',
  ]),
};

const KNOWN_AGES: Partial<Record<Sport, Record<string, number>>> = {
  soccer: {
    messi: 39, cr7: 41, neymar: 34, mbappe: 27, haaland: 26, modric: 40,
    salah: 34, yamal: 19, bellingham: 23, zidane: 54,
    ronaldinho: 46, buffon: 48, maignan: 30,
  },
  basketball: {
    lebron: 41, curry: 38, kd: 37, mj: 63, kobe: 47, giannis: 31, jokic: 31,
    luka: 27, wemby: 22, tatum: 28, magic: 66, bird: 69, shaq: 54,
    simmons: 29, ktown: 31, jalengreen: 24, johnwall: 35,
  },
  baseball: {
    judge: 34, ohtani: 32, trout: 34, betts: 33, soto: 27, acuna: 28,
    harper: 33, jeter: 52, griffey: 56,
  },
  football: {
    mahomes: 30, brady: 48, allen: 30, burrow: 29, lamar: 29, hurts: 27,
    rodgers: 42, montana: 70, manning: 50, rice: 63,
  },
  hockey: {
    'connor-mcdavid': 29, 'sidney-crosby': 38, 'alex-ovechkin': 40,
    'nathan-mackinnon': 30, 'auston-matthews': 28, 'cale-makar': 27,
    'leon-draisaitl': 30, 'nikita-kucherov': 33, 'connor-bedard': 21,
    'macklin-celebrini': 20, 'wayne-gretzky': 65, 'mario-lemieux': 60,
    'jaromir-jagr': 54, 'martin-brodeur': 54, 'patrick-roy': 60,
  },
};

/**
 * Hand-balanced ratings for recognizable stars and all-time greats.
 * These follow the general tiering used by major sports games without trying
 * to mirror a particular year's licensed ratings exactly.
 */
const STAR_RATINGS: Record<Sport, Record<string, number>> = {
  soccer: {
    pele: 99, maradona: 99, messi: 98, cr7: 98, cruyff: 98,
    zidane: 97, beckenbauer: 97, r9: 97,
    ronaldinho: 96, maldini: 96, buffon: 96, xavi: 96, iniesta: 96,
    eusebio: 98, kaka: 95, shevchenko: 94, weah: 94, cantona: 94, bale: 94,
    neymar: 94, mbappe: 94, haaland: 93, lewandowski: 92, salah: 92,
    modric: 92, vinicius: 92, rodri: 92, bellingham: 91, debruyne: 91,
    kane: 91, virgil: 90, neuer: 90, benzema: 90, yamal: 89,
    pedri: 88, griezmann: 88, suarez: 91,
    batistuta: 93, drogba: 92, aguero: 92, gerrard: 92, lampard: 92,
    beckham: 92, etoo: 92, rooney: 92, ibra: 92, robben: 92,
    ribery: 92, totti: 92, terry: 92, cech: 92, marcelo: 92,
    alves: 92, bergkamp: 92, nedved: 92, shearer: 92,
    yaya: 91, giggs: 91, hazard: 91, sneijder: 91, rvp: 91,
    chiellini: 91, riquelme: 91, carlos: 93, henry: 94,
    son: 89, mane: 89, foden: 88, saka: 89, rice: 88, palmer: 88,
    courtois: 90, alisson: 90, valverde: 89, osimhen: 88, kvara: 89,
    cavani: 89, silva: 88, dias: 88, bruno: 88, odegaard: 89,
    isak: 88, wirtz: 90, musiala: 90, mahrez: 88, reus: 89,
    donnarumma: 89, maignan: 89, oblak: 89, casemiro: 89, pepe: 89, falcao: 89,
    sanchez: 89, mascherano: 89, essien: 90, okocha: 90, veron: 89,
    rashford: 84, pogba: 86, camavinga: 85, gvardiol: 85, sane: 86,
    olise: 87, dembele: 88, rodrygo: 88, ardaguler: 86, endo: 82,
    eze: 87, caicedo: 88, saliba: 89, macca: 88, forlan: 91, morganrogers: 86, leao: 88,
    kenanyildiz: 85, seedorf: 90, berbatov: 88,
    gavi: 84, auba: 87, verratti: 87, lukaku: 86, eriksen: 86,
    dybala: 88, higuain: 89, tevez: 89, chiesa: 85, vlahovic: 84,
    firmino: 87, gabriel: 84, joaofelix: 82, cancelo: 87, grealish: 83,
    jorginho: 86, james: 87, vidal: 88, park: 86, carvajal: 88,
    theo: 87, hakimi: 87, dimarco: 87, reina: 78,
    // Owner review bumps (Jul 2026)
    bastoni: 86, gakpo: 86, szobo: 87, frimpong: 86,
    jboateng: 82, calhanoglu: 87, bono: 86, koulibaly: 84,
    ekitike: 82, depay: 84, cubarsi: 82, semenyo: 81,
    joaopedro: 81, marmoush: 82,
  },
  basketball: {
    mj: 99, lebron: 98, kareem: 98, kobe: 98, magic: 98, wilt: 98,
    bird: 97, shaq: 97, duncan: 97, russell: 98, curry: 97,
    hakeem: 97, kd: 96, oscar: 96, jokic: 96, giannis: 96,
    luka: 95, sga: 95, tatum: 94, embiid: 94, wemby: 92,
    ant: 92, booker: 91, ja: 90, kawhi: 92, harden: 92,
    ad: 91, kyrie: 91, dame: 91, westbrook: 92, cp3: 91,
    pierce: 92, nash: 95, melo: 92, bosh: 89, pau: 91, yao: 90,
    butler: 91, bam: 88, zion: 84, trae: 88, haliburton: 89,
    brunson: 91, donovan: 89, fox: 88, stockton: 95, isiah: 95,
    ewing: 94, reggie: 92, ray: 92, vince: 92, mcgrady: 94,
    kidd: 93, payton: 93, howard: 91, mutombo: 91, mourning: 91,
    jaylen: 91, derozan: 89, kawhi4: 89, pg13: 90, siakam: 88,
    lowry: 87, jrue: 88, middleton: 86, jokic2: 88, cade: 88,
    mobley: 87,     scottie: 86, banchero: 88, chet: 88, wagner: 87,
    sabonis: 89, markkanen: 87, rudy: 88, bigben: 91,
    ktown: 91, jalengreen: 88, johnwall: 90,
    billups: 90, rip: 88, rondo: 89, blake: 89, hill: 91,
    webber: 91, gasol2: 91, petrovic: 91, peja: 89, kukoc: 87,
    simmons: 88,
    tobias: 84, ayton: 86,
    jerrywest: 95, olajuwon2: 92, penny: 88, barkley: 94, drj: 96, robinson: 94,
  },
  baseball: {
    ruth: 99, babe: 99, aaron: 98, mays: 98, williams: 98,
    mantle: 97, musial: 97, robinson: 97, jackie: 97, cobb: 98,
    ohtani: 98, judge: 96, trout: 96, griffey: 97, jeter: 96,
    pedro: 97, betts: 95, soto: 94, acuna: 94, harper: 93,
    freeman: 93, kershaw: 95, kershaw2: 95, verlander: 94,
    scherzer: 94, cole: 92, degrom: 94, degrom2: 94, altuve: 92,
    bonds: 98, randy: 97, maddux: 97, ichiro: 97, pujols: 97,
    miggy: 96, rivera: 98, ryan: 97, papi: 95, posey: 93,
    ripken: 96, gwynn: 96, molina: 92, beltre: 94, bagwell: 93,
    halladay: 95, smoltz: 94, glavine: 94, ramirez: 94,
    devers: 90, machado: 91, lindor: 92, seager: 92, turner: 90,
    guerrero: 91, tatis: 90, yeli: 90, burnes: 91, witt: 93,
    jrod: 90, henderson: 92, perdomo: 89, skenes: 91, skubal: 92,
    alvarez: 92, tucker: 91, jramirez: 92, raleigh: 89,
    arenado: 91, correa: 88, bregman: 88, stanton: 90,
    goldy: 91, darvish: 88, chapman: 88, sale: 92, kersh3: 92,
    perez: 90, smithwill: 88, yamamoto: 89,
  },
  football: {
    brady: 99, rice: 99, montana: 98, lt: 98, barry: 98,
    payton: 98, sweetness: 98, sweetnes: 98, manning: 98,
    reggie: 97, deion: 97, sandy: 97, moss: 97, gronk: 96,
    mahomes: 97, allen: 95, lamar: 95, burrow: 94, rodgers: 95,
    jefferson: 95, chase: 93, mccaffrey: 94, henry: 93,
    kelce: 94, hill: 93, barkley: 93, hurts: 91, stroud: 90,
    watt: 95, donald: 96, parsons: 93,
    elway: 96, brees: 96, ap: 96, 'cmc-lt': 96, megatron: 97,
    fitz: 95, ray: 97, reed: 96, revis: 95, urlacher: 95,
    gonzalez: 96, newton: 92, bigben: 94, eli: 93,
    herbert: 91, dak: 89, stafford: 91, purdy: 88, murray: 87,
    mayfield: 87, wilson: 90, barber: 93, 'rice-rb': 91,
    adams: 91, kupp: 92, diggs: 89, metcalf: 88, ajb: 91,
    kittle: 92, andrews: 89, bosa: 93, hutchinson: 90,
    garrett: 94, mack: 92, miller: 94, 'warner-lb': 93,
    sherman: 94, ramsey: 92, sauce: 90, suggs: 93, tucker: 91,
    tua: 87, lawrence: 84, bijan: 90, cdlamb: 93, amico: 92,
    smith: 88, waddle: 88, puka: 91, cmc2: 90,
    'kelce-jason': 95, wheeler: 94, 'peterson-patrick': 93,
    chapman: 93, 'thomas-earl': 95, luck: 91, romo: 90,
    rivers: 92,
  },
  hockey: {
    'wayne-gretzky': 99, 'mario-lemieux': 99, 'gordie-howe': 98, 'bobby-orr': 98,
    'jaromir-jagr': 97, 'sidney-crosby': 97, 'alex-ovechkin': 97,
    'connor-mcdavid': 98, 'dominik-hasek': 98, 'martin-brodeur': 97,
    'patrick-roy': 97, 'nicklas-lidstrom': 97, 'joe-sakic': 96,
    'steve-yzerman': 96, 'mark-messier': 96, 'ray-bourque': 96,
    'guy-lafleur': 96, 'maurice-richard': 97, 'jean-beliveau': 96,
    'mike-bossy': 96, 'bryan-trottier': 95, 'phil-esposito': 95,
    'bobby-hull': 96, 'brett-hull': 95, 'nathan-mackinnon': 96,
    'auston-matthews': 95, 'cale-makar': 95, 'leon-draisaitl': 95,
    'nikita-kucherov': 95, 'connor-hellebuyck': 94, 'igor-shesterkin': 93,
    'andrei-vasilevskiy': 94, 'aleksander-barkov': 94, 'david-pastrnak': 94,
    'mikko-rantanen': 94, 'kirill-kaprizov': 93, 'quinn-hughes': 94,
    'adam-fox': 92, 'victor-hedman': 94, 'brayden-point': 92,
    'matthew-tkachuk': 93, 'connor-bedard': 90, 'macklin-celebrini': 89,
    'matvei-michkov': 87, 'adam-fantilli': 87,
  },
};

function rarityFromScore(
  sport: Sport,
  id: string,
  score: number,
  starRating?: number,
): CardRarity {
  if (LEGENDARY_IDS[sport].has(id)) return 'legendary';
  if (starRating !== undefined) {
    if (starRating >= 88) return 'epic';
    if (starRating >= 80) return 'rare';
    return 'common';
  }
  if (score >= 8) return 'epic';
  if (score >= 4) return 'rare';
  return 'common';
}

function ratingFor(
  _sport: Sport,
  rarity: CardRarity,
  score: number,
  id: string,
): number {
  const ranges: Record<CardRarity, [number, number]> = {
    common: [68, 78],
    rare: [79, 86],
    epic: [87, 93],
    legendary: [94, 99],
  };
  const [min, max] = ranges[rarity];
  const hash = [...id].reduce((total, char) => total + char.charCodeAt(0), 0);
  return Math.min(max, min + Math.floor(score / 2) + (hash % 3));
}

function basketballRatingFloor(player: {
  mvp: boolean;
  allStar: boolean;
  championships: number;
  scoringTitle: boolean;
  olympicGold: boolean;
}): number {
  let floor = 68;
  if (player.mvp) floor = Math.max(floor, 94);
  if (player.championships >= 4) floor = Math.max(floor, 93);
  else if (player.championships >= 2) floor = Math.max(floor, 89);
  else if (player.championships >= 1) floor = Math.max(floor, 84);
  if (player.scoringTitle) floor = Math.max(floor, 88);
  if (player.allStar) floor = Math.max(floor, 85);
  if (player.olympicGold && player.allStar) floor = Math.max(floor, 86);
  return floor;
}

function footballRatingFloor(player: {
  mvp: boolean;
  proBowl: boolean;
  superBowls: number;
}): number {
  let floor = 68;
  if (player.mvp) floor = Math.max(floor, 94);
  if (player.superBowls >= 3) floor = Math.max(floor, 93);
  else if (player.superBowls >= 2) floor = Math.max(floor, 90);
  else if (player.superBowls >= 1) floor = Math.max(floor, 86);
  if (player.proBowl) floor = Math.max(floor, 85);
  return floor;
}

function hockeyRatingFloor(player: {
  hart: boolean;
  allStar: boolean;
  hallOfFame: boolean;
  stanleyCups: number;
}): number {
  let floor = 68;
  if (player.hart) floor = Math.max(floor, 94);
  if (player.hallOfFame) floor = Math.max(floor, 92);
  if (player.stanleyCups >= 2) floor = Math.max(floor, 90);
  else if (player.stanleyCups >= 1) floor = Math.max(floor, 86);
  if (player.allStar) floor = Math.max(floor, 85);
  return floor;
}

function soccerRatingFloor(player: { trophies: string[]; decades: string[] }): number {
  const joined = player.trophies.join(' ');
  let floor = 68;
  if (/Ballon/i.test(joined)) floor = Math.max(floor, 94);
  if (/World Cup Winner/i.test(joined)) floor = Math.max(floor, 90);
  if (/Euro Winner|Copa America Winner/i.test(joined)) floor = Math.max(floor, 88);
  if (/Champions League/i.test(joined)) floor = Math.max(floor, 86);
  const majorCount = player.trophies.filter(t =>
    /Ballon|World Cup|Champions League|Euro Winner|Copa America/i.test(t),
  ).length;
  if (majorCount >= 2) floor = Math.max(floor, 88);
  else if (majorCount >= 1) floor = Math.max(floor, 84);
  if (player.decades.length >= 3 && majorCount >= 1) floor = Math.max(floor, 86);
  return floor;
}

function baseballRatingFloor(player: { awards: string[]; battingTitle: boolean }): number {
  const joined = player.awards.join(' ');
  let floor = 68;
  if (/MVP/i.test(joined)) floor = Math.max(floor, 92);
  if (/Cy Young/i.test(joined)) floor = Math.max(floor, 92);
  if (/World Series/i.test(joined) && /MVP|Cy Young/i.test(joined)) floor = Math.max(floor, 94);
  else if (/World Series/i.test(joined)) floor = Math.max(floor, 84);
  if (/All-Star/i.test(joined)) floor = Math.max(floor, 82);
  if (player.battingTitle) floor = Math.max(floor, 86);
  return floor;
}

function rarityFromRating(sport: Sport, id: string, rating: number): CardRarity {
  if (LEGENDARY_IDS[sport].has(id)) return 'legendary';
  if (rating >= 88) return 'epic';
  if (rating >= 80) return 'rare';
  return 'common';
}

function resolveCardRating(
  sport: Sport,
  id: string,
  score: number,
  ratingFloor: number,
): { rating: number; rarity: CardRarity } {
  const manual = STAR_RATINGS[sport][id];
  const seedRarity = rarityFromScore(sport, id, score, manual);
  const hashRating = ratingFor(sport, seedRarity, score, id);
  let rating = Math.max(manual ?? hashRating, ratingFloor);

  if (LEGENDARY_IDS[sport].has(id)) {
    rating = manual ?? Math.max(rating, 94);
    return { rating, rarity: 'legendary' };
  }

  return { rating, rarity: rarityFromRating(sport, id, rating) };
}

function latestEra(decades: string[]): string {
  return decades.at(-1) ?? 'Modern era';
}

function status(sport: Sport, id: string, decades: string[]): boolean {
  return KNOWN_RETIRED[sport].has(id) || !decades.includes('2020s');
}

function makeCard(
  sport: Sport,
  player: {
    id: string;
    name: string;
    nationality: string;
    positions: string[];
  },
  teams: string[],
  decades: string[],
  score: number,
  ratingFloor = 68,
): CollectibleCard {
  const { rating, rarity } = resolveCardRating(sport, player.id, score, ratingFloor);
  const playerId =
    sport === 'soccer' && player.id === 'onana' && player.name === 'Amadou Onana'
      ? 'amadou-onana'
      : player.id;
  return {
    key: `${sport}:${playerId}`,
    sport,
    playerId,
    name: player.name,
    country: player.nationality,
    positions: player.positions,
    team: teams.at(-1) ?? 'Free agent',
    retired: status(sport, player.id, decades),
    era: latestEra(decades),
    rarity,
    rating,
    age: KNOWN_AGES[sport]?.[player.id],
  };
}

const soccerCards = SOCCER_PLAYERS.map(player => {
  const trophyScore = player.trophies.reduce((score, trophy) => {
    if (/Ballon|World Cup/i.test(trophy)) return score + 4;
    if (/Champions League|Euro Winner|Copa America/i.test(trophy)) return score + 2;
    return score + 1;
  }, 0);
  return makeCard(
    'soccer',
    player,
    player.clubs,
    player.decades,
    trophyScore + Math.max(0, player.decades.length - 1),
    soccerRatingFloor(player),
  );
});

const basketballCards = BASKETBALL_PLAYERS.map(player => {
  const score =
    player.championships * 2 +
    (player.mvp ? 5 : 0) +
    (player.allStar ? 2 : 0) +
    (player.scoringTitle ? 2 : 0) +
    (player.olympicGold ? 1 : 0);
  const decades = [player.draftDecade, ...(player.draftDecade === '2020s' ? ['2020s'] : [])];
  if (!KNOWN_RETIRED.basketball.has(player.id)) decades.push('2020s');
  return makeCard(
    'basketball',
    player,
    player.nbaTeams,
    [...new Set(decades)],
    score,
    basketballRatingFloor(player),
  );
});

const baseballCards = BASEBALL_PLAYERS.map(player => {
  const score = player.awards.reduce((total, award) => {
    if (/MVP|Cy Young/i.test(award)) return total + 4;
    if (/World Series/i.test(award)) return total + 2;
    if (/All-Star|Gold Glove/i.test(award)) return total + 1;
    return total;
  }, player.battingTitle ? 2 : 0);
  return makeCard(
    'baseball',
    player,
    player.mlbTeams,
    player.decades,
    score,
    baseballRatingFloor(player),
  );
});

const footballCards = FOOTBALL_PLAYERS.map(player => {
  const score = player.superBowls * 2 + (player.mvp ? 5 : 0) + (player.proBowl ? 2 : 0);
  return makeCard(
    'football',
    player,
    player.nflTeams,
    player.decades,
    score,
    footballRatingFloor(player),
  );
});

const hockeyCards = HOCKEY_PLAYERS.map(player => {
  const score =
    player.stanleyCups * 2 +
    (player.hart ? 5 : 0) +
    (player.allStar ? 2 : 0) +
    (player.hallOfFame ? 4 : 0);
  return makeCard(
    'hockey',
    player,
    player.nhlTeams,
    player.decades,
    score,
    hockeyRatingFloor(player),
  );
});

export const CARD_CATALOG: CollectibleCard[] = [
  ...soccerCards,
  ...basketballCards,
  ...baseballCards,
  ...footballCards,
  ...hockeyCards,
];

export const CARDS_BY_SPORT: Record<Sport, CollectibleCard[]> = {
  soccer: soccerCards,
  basketball: basketballCards,
  baseball: baseballCards,
  football: footballCards,
  hockey: hockeyCards,
};

export const CARD_BY_KEY = new Map(CARD_CATALOG.map(card => [card.key, card]));

export function getPackDefinition(id: CardPackTier): CardPackDefinition {
  return CARD_PACKS.find(pack => pack.id === id) ?? CARD_PACKS[0];
}

/** True when the player has a hand-tuned star rating (recognizable names). */
export function isCatalogStar(sport: Sport, playerId: string): boolean {
  return STAR_RATINGS[sport][playerId] != null;
}

/** Short card labels for names that blow out pack UI (SGA, Giannis, etc.). */
const CARD_SHORT_NAMES: Partial<Record<Sport, Record<string, string>>> = {
  basketball: {
    sga: 'SGA',
    giannis: 'Giannis',
    wemby: 'Wemby',
    ant: 'ANT',
    luka: 'Luka',
  },
  soccer: {
    lewandowski: 'Lewandowski',
    bellingham: 'Bellingham',
  },
  football: {
    mccaffrey: 'CMC',
  },
  hockey: {
    'wayne-gretzky': 'Gretzky',
    'alex-ovechkin': 'Ovechkin',
  },
};

/** Name shown on pack/collection cards — short aliases + full name for search/aria. */
export function cardDisplayName(
  card: Pick<CollectibleCard, 'sport' | 'playerId' | 'name'>,
): string {
  return CARD_SHORT_NAMES[card.sport]?.[card.playerId] ?? card.name;
}

/** Players remembered with a heart on their card (in memoriam). */
const MEMORIAL_PLAYER_IDS: Partial<Record<Sport, ReadonlySet<string>>> = {
  soccer: new Set(['jota']),
};

export function isMemorialCard(
  card: Pick<CollectibleCard, 'sport' | 'playerId'>,
): boolean {
  return MEMORIAL_PLAYER_IDS[card.sport]?.has(card.playerId) ?? false;
}

