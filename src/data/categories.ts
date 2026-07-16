import type { Category, CategoryTag, Sport } from '../types';
import type { SoccerPlayer } from './soccerPlayers';
import type { BasketballPlayer } from './basketballPlayers';
import type { BaseballPlayer } from './baseballPlayers';
import type { FootballPlayer } from './footballPlayers';
import { SOCCER_PLAYERS } from './soccerPlayers';
import { BASKETBALL_PLAYERS } from './basketballPlayers';
import { BASEBALL_PLAYERS } from './baseballPlayers';
import { FOOTBALL_PLAYERS } from './footballPlayers';

export type PlayerUnion = SoccerPlayer | BasketballPlayer | BaseballPlayer | FootballPlayer;

export interface CategoryDef extends Category {
  sport: Sport;
  validate: (player: PlayerUnion) => boolean;
  poolSize: number;
}

function tagFromId(id: string): CategoryTag {
  if (id.startsWith('nat-')) return 'NATIONALITY';
  if (id.startsWith('club-') || id.startsWith('team-')) return 'PLAYED IN';
  if (id.startsWith('league-')) return 'LEAGUE';
  if (id.startsWith('trophy-') || id.startsWith('champ-')) return 'WINNER';
  if (id.startsWith('pos-')) return 'POSITION';
  if (id.startsWith('decade-') || id.startsWith('draft-')) return 'ERA';
  if (id.startsWith('cont-') || id === 'intl') return 'REGION';
  if (id.startsWith('college-')) return 'COLLEGE';
  if (id === 'mvp' || id === 'allstar' || id === 'olympic' || id === 'scoring' || id.startsWith('award-') || id === 'probowl') return 'AWARD';
  return 'TEAM';
}

function iconFromTag(tag: CategoryTag): string {
  const map: Record<CategoryTag, string> = {
    NATIONALITY: '🏳️',
    'PLAYED IN': '👕',
    LEAGUE: '📍',
    WINNER: '🏆',
    POSITION: '⚡',
    ERA: '📅',
    REGION: '🌍',
    TEAM: '🏟️',
    AWARD: '⭐',
    DRAFT: '📋',
    COLLEGE: '🎓',
  };
  return map[tag];
}

function enrich(cat: Omit<CategoryDef, 'tag' | 'icon'> & { label: string }): CategoryDef {
  const tag = tagFromId(cat.id);
  return { ...cat, tag, icon: iconFromTag(tag) };
}

function countSoccer(predicate: (p: SoccerPlayer) => boolean) {
  return SOCCER_PLAYERS.filter(predicate).length;
}

function countBasketball(predicate: (p: BasketballPlayer) => boolean) {
  return BASKETBALL_PLAYERS.filter(predicate).length;
}

function countBaseball(predicate: (p: BaseballPlayer) => boolean) {
  return BASEBALL_PLAYERS.filter(predicate).length;
}

function countFootball(predicate: (p: FootballPlayer) => boolean) {
  return FOOTBALL_PLAYERS.filter(predicate).length;
}

function isBaseball(p: PlayerUnion): p is BaseballPlayer {
  return 'mlbTeams' in p;
}

function isFootball(p: PlayerUnion): p is FootballPlayer {
  return 'nflTeams' in p;
}

const rawSoccer: Omit<CategoryDef, 'tag' | 'icon'>[] = [
  { id: 'nat-brazil', sport: 'soccer', label: 'BRAZIL', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'Brazil', poolSize: countSoccer(p => p.nationality === 'Brazil') },
  { id: 'nat-france', sport: 'soccer', label: 'FRANCE', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'France', poolSize: countSoccer(p => p.nationality === 'France') },
  { id: 'nat-argentina', sport: 'soccer', label: 'ARGENTINA', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'Argentina', poolSize: countSoccer(p => p.nationality === 'Argentina') },
  { id: 'nat-england', sport: 'soccer', label: 'ENGLAND', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'England', poolSize: countSoccer(p => p.nationality === 'England') },
  { id: 'nat-spain', sport: 'soccer', label: 'SPAIN', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'Spain', poolSize: countSoccer(p => p.nationality === 'Spain') },
  { id: 'nat-germany', sport: 'soccer', label: 'GERMANY', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'Germany', poolSize: countSoccer(p => p.nationality === 'Germany') },
  { id: 'nat-portugal', sport: 'soccer', label: 'PORTUGAL', difficulty: 1, validate: (p) => 'nationality' in p && p.nationality === 'Portugal', poolSize: countSoccer(p => p.nationality === 'Portugal') },
  { id: 'nat-italy', sport: 'soccer', label: 'ITALY', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Italy', poolSize: countSoccer(p => p.nationality === 'Italy') },
  { id: 'nat-croatia', sport: 'soccer', label: 'CROATIA', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Croatia', poolSize: countSoccer(p => p.nationality === 'Croatia') },
  { id: 'club-rm', sport: 'soccer', label: 'REAL MADRID', difficulty: 1, validate: (p) => 'clubs' in p && p.clubs.includes('Real Madrid'), poolSize: countSoccer(p => p.clubs.includes('Real Madrid')) },
  { id: 'club-barca', sport: 'soccer', label: 'BARCELONA', difficulty: 1, validate: (p) => 'clubs' in p && p.clubs.includes('Barcelona'), poolSize: countSoccer(p => p.clubs.includes('Barcelona')) },
  { id: 'club-mufc', sport: 'soccer', label: 'MAN UNITED', difficulty: 1, validate: (p) => 'clubs' in p && p.clubs.includes('Manchester United'), poolSize: countSoccer(p => p.clubs.includes('Manchester United')) },
  { id: 'club-mcfc', sport: 'soccer', label: 'MAN CITY', difficulty: 1, validate: (p) => 'clubs' in p && p.clubs.includes('Manchester City'), poolSize: countSoccer(p => p.clubs.includes('Manchester City')) },
  { id: 'club-lfc', sport: 'soccer', label: 'LIVERPOOL', difficulty: 1, validate: (p) => 'clubs' in p && p.clubs.includes('Liverpool'), poolSize: countSoccer(p => p.clubs.includes('Liverpool')) },
  { id: 'club-cfc', sport: 'soccer', label: 'CHELSEA', difficulty: 1, validate: (p) => 'clubs' in p && p.clubs.includes('Chelsea'), poolSize: countSoccer(p => p.clubs.includes('Chelsea')) },
  { id: 'club-juve', sport: 'soccer', label: 'JUVENTUS', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Juventus'), poolSize: countSoccer(p => p.clubs.includes('Juventus')) },
  { id: 'club-bayern', sport: 'soccer', label: 'BAYERN', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Bayern Munich'), poolSize: countSoccer(p => p.clubs.includes('Bayern Munich')) },
  { id: 'club-psg', sport: 'soccer', label: 'PSG', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Paris Saint-Germain'), poolSize: countSoccer(p => p.clubs.includes('Paris Saint-Germain')) },
  { id: 'club-arsenal', sport: 'soccer', label: 'ARSENAL', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Arsenal'), poolSize: countSoccer(p => p.clubs.includes('Arsenal')) },
  { id: 'league-pl', sport: 'soccer', label: 'ENGLISH LEAGUE', difficulty: 1, validate: (p) => 'leagues' in p && p.leagues.includes('Premier League'), poolSize: countSoccer(p => p.leagues.includes('Premier League')) },
  { id: 'league-laliga', sport: 'soccer', label: 'SPANISH LEAGUE', difficulty: 1, validate: (p) => 'leagues' in p && p.leagues.includes('La Liga'), poolSize: countSoccer(p => p.leagues.includes('La Liga')) },
  { id: 'league-seriea', sport: 'soccer', label: 'ITALIAN LEAGUE', difficulty: 2, validate: (p) => 'leagues' in p && p.leagues.includes('Serie A'), poolSize: countSoccer(p => p.leagues.includes('Serie A')) },
  { id: 'league-bundesliga', sport: 'soccer', label: 'BUNDESLIGA', difficulty: 2, validate: (p) => 'leagues' in p && p.leagues.includes('Bundesliga'), poolSize: countSoccer(p => p.leagues.includes('Bundesliga')) },
  { id: 'league-ligue1', sport: 'soccer', label: 'LIGUE 1', difficulty: 2, validate: (p) => 'leagues' in p && p.leagues.includes('Ligue 1'), poolSize: countSoccer(p => p.leagues.includes('Ligue 1')) },
  { id: 'pos-fwd', sport: 'soccer', label: 'FORWARD', difficulty: 1, validate: (p) => 'positions' in p && p.positions.includes('Forward'), poolSize: countSoccer(p => p.positions.includes('Forward')) },
  { id: 'pos-mid', sport: 'soccer', label: 'MIDFIELDER', difficulty: 1, validate: (p) => 'positions' in p && p.positions.includes('Midfielder'), poolSize: countSoccer(p => p.positions.includes('Midfielder')) },
  { id: 'pos-def', sport: 'soccer', label: 'DEFENDER', difficulty: 2, validate: (p) => 'positions' in p && p.positions.includes('Defender'), poolSize: countSoccer(p => p.positions.includes('Defender')) },
  { id: 'trophy-wc', sport: 'soccer', label: 'WORLD CUP', difficulty: 2, validate: (p) => 'trophies' in p && p.trophies.includes('World Cup Winner'), poolSize: countSoccer(p => p.trophies.includes('World Cup Winner')) },
  { id: 'trophy-bdo', sport: 'soccer', label: "BALLON D'OR", difficulty: 3, validate: (p) => 'trophies' in p && p.trophies.includes("Ballon d'Or"), poolSize: countSoccer(p => p.trophies.includes("Ballon d'Or")) },
  { id: 'trophy-ucl', sport: 'soccer', label: 'CHAMPIONS LEAGUE', difficulty: 2, validate: (p) => 'trophies' in p && p.trophies.includes('Champions League'), poolSize: countSoccer(p => p.trophies.includes('Champions League')) },
  { id: 'trophy-euro', sport: 'soccer', label: 'EURO WINNER', difficulty: 3, validate: (p) => 'trophies' in p && p.trophies.includes('Euro Winner'), poolSize: countSoccer(p => p.trophies.includes('Euro Winner')) },
  { id: 'cont-europe', sport: 'soccer', label: 'EUROPE', difficulty: 1, validate: (p) => 'continent' in p && p.continent === 'Europe', poolSize: countSoccer(p => p.continent === 'Europe') },
  { id: 'cont-sa', sport: 'soccer', label: 'SOUTH AMERICA', difficulty: 2, validate: (p) => 'continent' in p && p.continent === 'South America', poolSize: countSoccer(p => p.continent === 'South America') },
  { id: 'decade-00s', sport: 'soccer', label: '2000s ERA', difficulty: 2, validate: (p) => 'decades' in p && p.decades.includes('2000s'), poolSize: countSoccer(p => p.decades.includes('2000s')) },
  { id: 'decade-10s', sport: 'soccer', label: '2010s ERA', difficulty: 1, validate: (p) => 'decades' in p && p.decades.includes('2010s'), poolSize: countSoccer(p => p.decades.includes('2010s')) },
  { id: 'nat-netherlands', sport: 'soccer', label: 'NETHERLANDS', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Netherlands', poolSize: countSoccer(p => p.nationality === 'Netherlands') },
  { id: 'nat-belgium', sport: 'soccer', label: 'BELGIUM', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Belgium', poolSize: countSoccer(p => p.nationality === 'Belgium') },
  { id: 'nat-colombia', sport: 'soccer', label: 'COLOMBIA', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Colombia', poolSize: countSoccer(p => p.nationality === 'Colombia') },
  { id: 'nat-mexico', sport: 'soccer', label: 'MEXICO', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Mexico', poolSize: countSoccer(p => p.nationality === 'Mexico') },
  { id: 'nat-nigeria', sport: 'soccer', label: 'NIGERIA', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Nigeria', poolSize: countSoccer(p => p.nationality === 'Nigeria') },
  { id: 'club-inter', sport: 'soccer', label: 'INTER MILAN', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Inter Milan'), poolSize: countSoccer(p => p.clubs.includes('Inter Milan')) },
  { id: 'club-acmilan', sport: 'soccer', label: 'AC MILAN', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('AC Milan'), poolSize: countSoccer(p => p.clubs.includes('AC Milan')) },
  { id: 'club-atletico', sport: 'soccer', label: 'ATLÉTICO', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Atlético Madrid'), poolSize: countSoccer(p => p.clubs.includes('Atlético Madrid')) },
  { id: 'club-tottenham', sport: 'soccer', label: 'TOTTENHAM', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Tottenham'), poolSize: countSoccer(p => p.clubs.includes('Tottenham')) },
  { id: 'pos-gk', sport: 'soccer', label: 'GOALKEEPER', difficulty: 2, validate: (p) => 'positions' in p && p.positions.includes('Goalkeeper'), poolSize: countSoccer(p => p.positions.includes('Goalkeeper')) },
  { id: 'decade-90s', sport: 'soccer', label: '1990s ERA', difficulty: 3, validate: (p) => 'decades' in p && p.decades.includes('1990s'), poolSize: countSoccer(p => p.decades.includes('1990s')) },
  { id: 'cont-africa', sport: 'soccer', label: 'AFRICA', difficulty: 2, validate: (p) => 'continent' in p && p.continent === 'Africa', poolSize: countSoccer(p => p.continent === 'Africa') },
  { id: 'cont-asia', sport: 'soccer', label: 'ASIA', difficulty: 3, validate: (p) => 'continent' in p && p.continent === 'Asia', poolSize: countSoccer(p => p.continent === 'Asia') },
  { id: 'nat-uruguay', sport: 'soccer', label: 'URUGUAY', difficulty: 2, validate: (p) => 'nationality' in p && p.nationality === 'Uruguay', poolSize: countSoccer(p => p.nationality === 'Uruguay') },
  { id: 'nat-ivory-coast', sport: 'soccer', label: 'IVORY COAST', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Ivory Coast', poolSize: countSoccer(p => p.nationality === 'Ivory Coast') },
  { id: 'nat-morocco', sport: 'soccer', label: 'MOROCCO', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Morocco', poolSize: countSoccer(p => p.nationality === 'Morocco') },
  { id: 'nat-senegal', sport: 'soccer', label: 'SENEGAL', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Senegal', poolSize: countSoccer(p => p.nationality === 'Senegal') },
  { id: 'nat-japan', sport: 'soccer', label: 'JAPAN', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Japan', poolSize: countSoccer(p => p.nationality === 'Japan') },
  { id: 'nat-egypt', sport: 'soccer', label: 'EGYPT', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Egypt', poolSize: countSoccer(p => p.nationality === 'Egypt') },
  { id: 'nat-ghana', sport: 'soccer', label: 'GHANA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Ghana', poolSize: countSoccer(p => p.nationality === 'Ghana') },
  { id: 'nat-serbia', sport: 'soccer', label: 'SERBIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Serbia', poolSize: countSoccer(p => p.nationality === 'Serbia') },
  { id: 'nat-ukraine', sport: 'soccer', label: 'UKRAINE', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Ukraine', poolSize: countSoccer(p => p.nationality === 'Ukraine') },
  { id: 'nat-scotland', sport: 'soccer', label: 'SCOTLAND', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Scotland', poolSize: countSoccer(p => p.nationality === 'Scotland') },
  { id: 'nat-wales', sport: 'soccer', label: 'WALES', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Wales', poolSize: countSoccer(p => p.nationality === 'Wales') },
  { id: 'nat-poland', sport: 'soccer', label: 'POLAND', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Poland', poolSize: countSoccer(p => p.nationality === 'Poland') },
  { id: 'nat-denmark', sport: 'soccer', label: 'DENMARK', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Denmark', poolSize: countSoccer(p => p.nationality === 'Denmark') },
  { id: 'nat-austria', sport: 'soccer', label: 'AUSTRIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Austria', poolSize: countSoccer(p => p.nationality === 'Austria') },
  { id: 'nat-switzerland', sport: 'soccer', label: 'SWITZERLAND', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Switzerland', poolSize: countSoccer(p => p.nationality === 'Switzerland') },
  { id: 'nat-turkey', sport: 'soccer', label: 'TURKEY', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Turkey', poolSize: countSoccer(p => p.nationality === 'Turkey') },
  { id: 'nat-cameroon', sport: 'soccer', label: 'CAMEROON', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Cameroon', poolSize: countSoccer(p => p.nationality === 'Cameroon') },
  { id: 'nat-algeria', sport: 'soccer', label: 'ALGERIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Algeria', poolSize: countSoccer(p => p.nationality === 'Algeria') },
  { id: 'nat-ecuador', sport: 'soccer', label: 'ECUADOR', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Ecuador', poolSize: countSoccer(p => p.nationality === 'Ecuador') },
  { id: 'nat-chile', sport: 'soccer', label: 'CHILE', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Chile', poolSize: countSoccer(p => p.nationality === 'Chile') },
  { id: 'nat-usa-soccer', sport: 'soccer', label: 'USA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'USA', poolSize: countSoccer(p => p.nationality === 'USA') },
  { id: 'nat-south-korea', sport: 'soccer', label: 'SOUTH KOREA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'South Korea', poolSize: countSoccer(p => p.nationality === 'South Korea') },
  { id: 'nat-norway', sport: 'soccer', label: 'NORWAY', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Norway', poolSize: countSoccer(p => p.nationality === 'Norway') },
  { id: 'nat-sweden', sport: 'soccer', label: 'SWEDEN', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Sweden', poolSize: countSoccer(p => p.nationality === 'Sweden') },
  { id: 'nat-czech', sport: 'soccer', label: 'CZECHIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Czech Republic', poolSize: countSoccer(p => p.nationality === 'Czech Republic') },
  { id: 'nat-georgia', sport: 'soccer', label: 'GEORGIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Georgia', poolSize: countSoccer(p => p.nationality === 'Georgia') },
  { id: 'nat-canada-soccer', sport: 'soccer', label: 'CANADA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Canada', poolSize: countSoccer(p => p.nationality === 'Canada') },
  { id: 'nat-slovenia', sport: 'soccer', label: 'SLOVENIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Slovenia', poolSize: countSoccer(p => p.nationality === 'Slovenia') },
  { id: 'nat-mali', sport: 'soccer', label: 'MALI', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Mali', poolSize: countSoccer(p => p.nationality === 'Mali') },
  { id: 'nat-gabon', sport: 'soccer', label: 'GABON', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Gabon', poolSize: countSoccer(p => p.nationality === 'Gabon') },
  { id: 'nat-bulgaria', sport: 'soccer', label: 'BULGARIA', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Bulgaria', poolSize: countSoccer(p => p.nationality === 'Bulgaria') },
  { id: 'nat-northern-ireland', sport: 'soccer', label: 'N. IRELAND', difficulty: 3, validate: (p) => 'nationality' in p && p.nationality === 'Northern Ireland', poolSize: countSoccer(p => p.nationality === 'Northern Ireland') },
  { id: 'club-newcastle', sport: 'soccer', label: 'NEWCASTLE', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Newcastle United'), poolSize: countSoccer(p => p.clubs.includes('Newcastle United')) },
  { id: 'club-dortmund', sport: 'soccer', label: 'DORTMUND', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Borussia Dortmund'), poolSize: countSoccer(p => p.clubs.includes('Borussia Dortmund')) },
  { id: 'club-napoli', sport: 'soccer', label: 'NAPOLI', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Napoli'), poolSize: countSoccer(p => p.clubs.includes('Napoli')) },
  { id: 'club-benfica', sport: 'soccer', label: 'BENFICA', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Benfica'), poolSize: countSoccer(p => p.clubs.includes('Benfica')) },
  { id: 'club-porto', sport: 'soccer', label: 'PORTO', difficulty: 3, validate: (p) => 'clubs' in p && p.clubs.includes('Porto'), poolSize: countSoccer(p => p.clubs.includes('Porto')) },
  { id: 'club-ajax', sport: 'soccer', label: 'AJAX', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Ajax'), poolSize: countSoccer(p => p.clubs.includes('Ajax')) },
  { id: 'club-marseille', sport: 'soccer', label: 'MARSEILLE', difficulty: 3, validate: (p) => 'clubs' in p && p.clubs.includes('Marseille'), poolSize: countSoccer(p => p.clubs.includes('Marseille')) },
  { id: 'club-aston-villa', sport: 'soccer', label: 'ASTON VILLA', difficulty: 2, validate: (p) => 'clubs' in p && p.clubs.includes('Aston Villa'), poolSize: countSoccer(p => p.clubs.includes('Aston Villa')) },
  { id: 'league-mls', sport: 'soccer', label: 'MLS', difficulty: 2, validate: (p) => 'leagues' in p && p.leagues.includes('MLS'), poolSize: countSoccer(p => p.leagues.includes('MLS')) },
  { id: 'league-saudi', sport: 'soccer', label: 'SAUDI LEAGUE', difficulty: 2, validate: (p) => 'leagues' in p && p.leagues.includes('Saudi Pro League'), poolSize: countSoccer(p => p.leagues.includes('Saudi Pro League')) },
  { id: 'trophy-europa', sport: 'soccer', label: 'EUROPA LEAGUE', difficulty: 2, validate: (p) => 'trophies' in p && p.trophies.includes('Europa League'), poolSize: countSoccer(p => p.trophies.includes('Europa League')) },
  { id: 'trophy-fa-cup', sport: 'soccer', label: 'FA CUP', difficulty: 2, validate: (p) => 'trophies' in p && p.trophies.includes('FA Cup'), poolSize: countSoccer(p => p.trophies.includes('FA Cup')) },
  { id: 'trophy-copa-america', sport: 'soccer', label: 'COPA AMÉRICA', difficulty: 2, validate: (p) => 'trophies' in p && p.trophies.includes('Copa America Winner'), poolSize: countSoccer(p => p.trophies.includes('Copa America Winner')) },
  { id: 'trophy-afcon', sport: 'soccer', label: 'AFCON WINNER', difficulty: 3, validate: (p) => 'trophies' in p && p.trophies.includes('AFCON Winner'), poolSize: countSoccer(p => p.trophies.includes('AFCON Winner')) },
  { id: 'cont-north-america', sport: 'soccer', label: 'NORTH AMERICA', difficulty: 3, validate: (p) => 'continent' in p && p.continent === 'North America', poolSize: countSoccer(p => p.continent === 'North America') },
  { id: 'decade-2020s', sport: 'soccer', label: '2020s ERA', difficulty: 1, validate: (p) => 'decades' in p && p.decades.includes('2020s'), poolSize: countSoccer(p => p.decades.includes('2020s')) },
];

const rawBasketball: Omit<CategoryDef, 'tag' | 'icon'>[] = [
  { id: 'nat-usa', sport: 'basketball', label: 'USA', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.nationality === 'USA', poolSize: countBasketball(p => p.nationality === 'USA') },
  { id: 'nat-canada', sport: 'basketball', label: 'CANADA', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nationality === 'Canada', poolSize: countBasketball(p => p.nationality === 'Canada') },
  { id: 'nat-france', sport: 'basketball', label: 'FRANCE', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nationality === 'France', poolSize: countBasketball(p => p.nationality === 'France') },
  { id: 'nat-greece', sport: 'basketball', label: 'GREECE', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.nationality === 'Greece', poolSize: countBasketball(p => p.nationality === 'Greece') },
  { id: 'nat-serbia', sport: 'basketball', label: 'SERBIA', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.nationality === 'Serbia', poolSize: countBasketball(p => p.nationality === 'Serbia') },
  { id: 'team-lakers', sport: 'basketball', label: 'LAKERS', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Los Angeles Lakers'), poolSize: countBasketball(p => p.nbaTeams.includes('Los Angeles Lakers')) },
  { id: 'team-celtics', sport: 'basketball', label: 'CELTICS', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Boston Celtics'), poolSize: countBasketball(p => p.nbaTeams.includes('Boston Celtics')) },
  { id: 'team-bulls', sport: 'basketball', label: 'BULLS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Chicago Bulls'), poolSize: countBasketball(p => p.nbaTeams.includes('Chicago Bulls')) },
  { id: 'team-warriors', sport: 'basketball', label: 'WARRIORS', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Golden State Warriors'), poolSize: countBasketball(p => p.nbaTeams.includes('Golden State Warriors')) },
  { id: 'team-heat', sport: 'basketball', label: 'HEAT', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Miami Heat'), poolSize: countBasketball(p => p.nbaTeams.includes('Miami Heat')) },
  { id: 'team-spurs', sport: 'basketball', label: 'SPURS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('San Antonio Spurs'), poolSize: countBasketball(p => p.nbaTeams.includes('San Antonio Spurs')) },
  { id: 'team-knicks', sport: 'basketball', label: 'KNICKS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('New York Knicks'), poolSize: countBasketball(p => p.nbaTeams.includes('New York Knicks')) },
  { id: 'team-nuggets', sport: 'basketball', label: 'NUGGETS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Denver Nuggets'), poolSize: countBasketball(p => p.nbaTeams.includes('Denver Nuggets')) },
  { id: 'pos-guard', sport: 'basketball', label: 'GUARD', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.positions.includes('Guard'), poolSize: countBasketball(p => p.positions.includes('Guard')) },
  { id: 'pos-forward', sport: 'basketball', label: 'FORWARD', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.positions.includes('Forward'), poolSize: countBasketball(p => p.positions.includes('Forward')) },
  { id: 'pos-center', sport: 'basketball', label: 'CENTER', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.positions.includes('Center'), poolSize: countBasketball(p => p.positions.includes('Center')) },
  { id: 'champ-3plus', sport: 'basketball', label: '3+ RINGS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.championships >= 3, poolSize: countBasketball(p => p.championships >= 3) },
  { id: 'champ-1plus', sport: 'basketball', label: 'NBA CHAMPION', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.championships >= 1, poolSize: countBasketball(p => p.championships >= 1) },
  { id: 'mvp', sport: 'basketball', label: 'MVP', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.mvp, poolSize: countBasketball(p => p.mvp) },
  { id: 'allstar', sport: 'basketball', label: 'ALL-STAR', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.allStar, poolSize: countBasketball(p => p.allStar) },
  { id: 'olympic', sport: 'basketball', label: 'OLYMPIC GOLD', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.olympicGold, poolSize: countBasketball(p => p.olympicGold) },
  { id: 'scoring', sport: 'basketball', label: 'SCORING TITLE', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.scoringTitle, poolSize: countBasketball(p => p.scoringTitle) },
  { id: 'college-duke', sport: 'basketball', label: 'DUKE', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.college === 'Duke', poolSize: countBasketball(p => p.college === 'Duke') },
  { id: 'college-kentucky', sport: 'basketball', label: 'KENTUCKY', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.college === 'Kentucky', poolSize: countBasketball(p => p.college === 'Kentucky') },
  { id: 'draft-10s', sport: 'basketball', label: '2010s DRAFT', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.draftDecade === '2010s', poolSize: countBasketball(p => p.draftDecade === '2010s') },
  { id: 'draft-00s', sport: 'basketball', label: '2000s DRAFT', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.draftDecade === '2000s', poolSize: countBasketball(p => p.draftDecade === '2000s') },
  { id: 'intl', sport: 'basketball', label: 'INTERNATIONAL', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nationality !== 'USA', poolSize: countBasketball(p => p.nationality !== 'USA') },
  { id: 'team-cavs', sport: 'basketball', label: 'CAVALIERS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Cleveland Cavaliers'), poolSize: countBasketball(p => p.nbaTeams.includes('Cleveland Cavaliers')) },
  { id: 'team-thunder', sport: 'basketball', label: 'THUNDER', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Oklahoma City Thunder'), poolSize: countBasketball(p => p.nbaTeams.includes('Oklahoma City Thunder')) },
  { id: 'team-mavericks', sport: 'basketball', label: 'MAVERICKS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Dallas Mavericks'), poolSize: countBasketball(p => p.nbaTeams.includes('Dallas Mavericks')) },
  { id: 'team-pistons', sport: 'basketball', label: 'PISTONS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Detroit Pistons'), poolSize: countBasketball(p => p.nbaTeams.includes('Detroit Pistons')) },
  { id: 'team-raptors', sport: 'basketball', label: 'RAPTORS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Toronto Raptors'), poolSize: countBasketball(p => p.nbaTeams.includes('Toronto Raptors')) },
  { id: 'nat-germany', sport: 'basketball', label: 'GERMANY', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.nationality === 'Germany', poolSize: countBasketball(p => p.nationality === 'Germany') },
  { id: 'nat-spain', sport: 'basketball', label: 'SPAIN', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.nationality === 'Spain', poolSize: countBasketball(p => p.nationality === 'Spain') },
  { id: 'nat-lithuania', sport: 'basketball', label: 'LITHUANIA', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.nationality === 'Lithuania', poolSize: countBasketball(p => p.nationality === 'Lithuania') },
  { id: 'draft-90s', sport: 'basketball', label: '1990s DRAFT', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.draftDecade === '1990s', poolSize: countBasketball(p => p.draftDecade === '1990s') },
  { id: 'college-ucla', sport: 'basketball', label: 'UCLA', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.college === 'UCLA', poolSize: countBasketball(p => p.college === 'UCLA') },
  { id: 'college-georgetown', sport: 'basketball', label: 'GEORGETOWN', difficulty: 3, validate: (p) => 'nbaTeams' in p && p.college === 'Georgetown', poolSize: countBasketball(p => p.college === 'Georgetown') },
  { id: 'team-sixers', sport: 'basketball', label: '76ERS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Philadelphia 76ers'), poolSize: countBasketball(p => p.nbaTeams.includes('Philadelphia 76ers')) },
  { id: 'team-suns', sport: 'basketball', label: 'SUNS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Phoenix Suns'), poolSize: countBasketball(p => p.nbaTeams.includes('Phoenix Suns')) },
  { id: 'team-bucks', sport: 'basketball', label: 'BUCKS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Milwaukee Bucks'), poolSize: countBasketball(p => p.nbaTeams.includes('Milwaukee Bucks')) },
  { id: 'team-clippers', sport: 'basketball', label: 'CLIPPERS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Los Angeles Clippers'), poolSize: countBasketball(p => p.nbaTeams.includes('Los Angeles Clippers')) },
  { id: 'team-rockets', sport: 'basketball', label: 'ROCKETS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Houston Rockets'), poolSize: countBasketball(p => p.nbaTeams.includes('Houston Rockets')) },
  { id: 'team-magic', sport: 'basketball', label: 'MAGIC', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Orlando Magic'), poolSize: countBasketball(p => p.nbaTeams.includes('Orlando Magic')) },
  { id: 'team-pacers', sport: 'basketball', label: 'PACERS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.nbaTeams.includes('Indiana Pacers'), poolSize: countBasketball(p => p.nbaTeams.includes('Indiana Pacers')) },
  { id: 'draft-2020s', sport: 'basketball', label: '2020s DRAFT', difficulty: 1, validate: (p) => 'nbaTeams' in p && p.draftDecade === '2020s', poolSize: countBasketball(p => p.draftDecade === '2020s') },
  { id: 'college-kansas', sport: 'basketball', label: 'KANSAS', difficulty: 2, validate: (p) => 'nbaTeams' in p && p.college === 'Kansas', poolSize: countBasketball(p => p.college === 'Kansas') },
];

const rawBaseball: Omit<CategoryDef, 'tag' | 'icon'>[] = [
  { id: 'nat-usa', sport: 'baseball', label: 'USA', difficulty: 1, validate: (p) => isBaseball(p) && p.nationality === 'USA', poolSize: countBaseball(p => p.nationality === 'USA') },
  { id: 'nat-dominican', sport: 'baseball', label: 'DOMINICAN REP.', difficulty: 1, validate: (p) => isBaseball(p) && p.nationality === 'Dominican Republic', poolSize: countBaseball(p => p.nationality === 'Dominican Republic') },
  { id: 'nat-venezuela', sport: 'baseball', label: 'VENEZUELA', difficulty: 2, validate: (p) => isBaseball(p) && p.nationality === 'Venezuela', poolSize: countBaseball(p => p.nationality === 'Venezuela') },
  { id: 'nat-japan', sport: 'baseball', label: 'JAPAN', difficulty: 2, validate: (p) => isBaseball(p) && p.nationality === 'Japan', poolSize: countBaseball(p => p.nationality === 'Japan') },
  { id: 'nat-canada', sport: 'baseball', label: 'CANADA', difficulty: 2, validate: (p) => isBaseball(p) && p.nationality === 'Canada', poolSize: countBaseball(p => p.nationality === 'Canada') },
  { id: 'nat-puerto-rico', sport: 'baseball', label: 'PUERTO RICO', difficulty: 2, validate: (p) => isBaseball(p) && p.nationality === 'Puerto Rico', poolSize: countBaseball(p => p.nationality === 'Puerto Rico') },
  { id: 'nat-cuba', sport: 'baseball', label: 'CUBA', difficulty: 3, validate: (p) => isBaseball(p) && p.nationality === 'Cuba', poolSize: countBaseball(p => p.nationality === 'Cuba') },
  { id: 'nat-mexico', sport: 'baseball', label: 'MEXICO', difficulty: 3, validate: (p) => isBaseball(p) && p.nationality === 'Mexico', poolSize: countBaseball(p => p.nationality === 'Mexico') },
  { id: 'team-yankees', sport: 'baseball', label: 'YANKEES', difficulty: 1, validate: (p) => isBaseball(p) && p.mlbTeams.includes('New York Yankees'), poolSize: countBaseball(p => p.mlbTeams.includes('New York Yankees')) },
  { id: 'team-redsox', sport: 'baseball', label: 'RED SOX', difficulty: 1, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Boston Red Sox'), poolSize: countBaseball(p => p.mlbTeams.includes('Boston Red Sox')) },
  { id: 'team-dodgers', sport: 'baseball', label: 'DODGERS', difficulty: 1, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Los Angeles Dodgers'), poolSize: countBaseball(p => p.mlbTeams.includes('Los Angeles Dodgers')) },
  { id: 'team-cubs', sport: 'baseball', label: 'CUBS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Chicago Cubs'), poolSize: countBaseball(p => p.mlbTeams.includes('Chicago Cubs')) },
  { id: 'team-cardinals', sport: 'baseball', label: 'CARDINALS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('St. Louis Cardinals'), poolSize: countBaseball(p => p.mlbTeams.includes('St. Louis Cardinals')) },
  { id: 'team-braves', sport: 'baseball', label: 'BRAVES', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Atlanta Braves'), poolSize: countBaseball(p => p.mlbTeams.includes('Atlanta Braves')) },
  { id: 'team-giants', sport: 'baseball', label: 'GIANTS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('San Francisco Giants'), poolSize: countBaseball(p => p.mlbTeams.includes('San Francisco Giants')) },
  { id: 'team-mets', sport: 'baseball', label: 'METS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('New York Mets'), poolSize: countBaseball(p => p.mlbTeams.includes('New York Mets')) },
  { id: 'team-astros', sport: 'baseball', label: 'ASTROS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Houston Astros'), poolSize: countBaseball(p => p.mlbTeams.includes('Houston Astros')) },
  { id: 'team-phillies', sport: 'baseball', label: 'PHILLIES', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Philadelphia Phillies'), poolSize: countBaseball(p => p.mlbTeams.includes('Philadelphia Phillies')) },
  { id: 'team-angels', sport: 'baseball', label: 'ANGELS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Los Angeles Angels'), poolSize: countBaseball(p => p.mlbTeams.includes('Los Angeles Angels')) },
  { id: 'pos-pitcher', sport: 'baseball', label: 'PITCHER', difficulty: 1, validate: (p) => isBaseball(p) && p.positions.includes('Pitcher'), poolSize: countBaseball(p => p.positions.includes('Pitcher')) },
  { id: 'pos-outfield', sport: 'baseball', label: 'OUTFIELD', difficulty: 1, validate: (p) => isBaseball(p) && p.positions.includes('Outfield'), poolSize: countBaseball(p => p.positions.includes('Outfield')) },
  { id: 'pos-infield', sport: 'baseball', label: 'INFIELD', difficulty: 1, validate: (p) => isBaseball(p) && p.positions.includes('Infield'), poolSize: countBaseball(p => p.positions.includes('Infield')) },
  { id: 'pos-catcher', sport: 'baseball', label: 'CATCHER', difficulty: 2, validate: (p) => isBaseball(p) && p.positions.includes('Catcher'), poolSize: countBaseball(p => p.positions.includes('Catcher')) },
  { id: 'pos-dh', sport: 'baseball', label: 'DESIGNATED HITTER', difficulty: 2, validate: (p) => isBaseball(p) && p.positions.includes('Designated Hitter'), poolSize: countBaseball(p => p.positions.includes('Designated Hitter')) },
  { id: 'league-al', sport: 'baseball', label: 'AMERICAN LEAGUE', difficulty: 1, validate: (p) => isBaseball(p) && p.leagues.includes('American League'), poolSize: countBaseball(p => p.leagues.includes('American League')) },
  { id: 'league-nl', sport: 'baseball', label: 'NATIONAL LEAGUE', difficulty: 1, validate: (p) => isBaseball(p) && p.leagues.includes('National League'), poolSize: countBaseball(p => p.leagues.includes('National League')) },
  { id: 'award-mvp', sport: 'baseball', label: 'MVP', difficulty: 2, validate: (p) => isBaseball(p) && p.awards.includes('MVP'), poolSize: countBaseball(p => p.awards.includes('MVP')) },
  { id: 'award-cy-young', sport: 'baseball', label: 'CY YOUNG', difficulty: 3, validate: (p) => isBaseball(p) && p.awards.includes('Cy Young'), poolSize: countBaseball(p => p.awards.includes('Cy Young')) },
  { id: 'award-world-series', sport: 'baseball', label: 'WORLD SERIES', difficulty: 2, validate: (p) => isBaseball(p) && p.awards.includes('World Series'), poolSize: countBaseball(p => p.awards.includes('World Series')) },
  { id: 'award-allstar', sport: 'baseball', label: 'ALL-STAR', difficulty: 1, validate: (p) => isBaseball(p) && p.awards.includes('All-Star'), poolSize: countBaseball(p => p.awards.includes('All-Star')) },
  { id: 'award-hof', sport: 'baseball', label: 'HALL OF FAME', difficulty: 3, validate: (p) => isBaseball(p) && p.awards.includes('Hall of Fame'), poolSize: countBaseball(p => p.awards.includes('Hall of Fame')) },
  { id: 'award-gold-glove', sport: 'baseball', label: 'GOLD GLOVE', difficulty: 2, validate: (p) => isBaseball(p) && p.awards.includes('Gold Glove'), poolSize: countBaseball(p => p.awards.includes('Gold Glove')) },
  { id: 'batting-title', sport: 'baseball', label: 'BATTING TITLE', difficulty: 3, validate: (p) => isBaseball(p) && p.battingTitle, poolSize: countBaseball(p => p.battingTitle) },
  { id: 'decade-10s', sport: 'baseball', label: '2010s ERA', difficulty: 1, validate: (p) => isBaseball(p) && p.decades.includes('2010s'), poolSize: countBaseball(p => p.decades.includes('2010s')) },
  { id: 'decade-00s', sport: 'baseball', label: '2000s ERA', difficulty: 2, validate: (p) => isBaseball(p) && p.decades.includes('2000s'), poolSize: countBaseball(p => p.decades.includes('2000s')) },
  { id: 'decade-90s', sport: 'baseball', label: '1990s ERA', difficulty: 2, validate: (p) => isBaseball(p) && p.decades.includes('1990s'), poolSize: countBaseball(p => p.decades.includes('1990s')) },
  { id: 'decade-80s', sport: 'baseball', label: '1980s ERA', difficulty: 3, validate: (p) => isBaseball(p) && p.decades.includes('1980s'), poolSize: countBaseball(p => p.decades.includes('1980s')) },
  { id: 'intl', sport: 'baseball', label: 'INTERNATIONAL', difficulty: 2, validate: (p) => isBaseball(p) && p.nationality !== 'USA', poolSize: countBaseball(p => p.nationality !== 'USA') },
  { id: 'team-mariners', sport: 'baseball', label: 'MARINERS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Seattle Mariners'), poolSize: countBaseball(p => p.mlbTeams.includes('Seattle Mariners')) },
  { id: 'team-padres', sport: 'baseball', label: 'PADRES', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('San Diego Padres'), poolSize: countBaseball(p => p.mlbTeams.includes('San Diego Padres')) },
  { id: 'team-orioles', sport: 'baseball', label: 'ORIOLES', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Baltimore Orioles'), poolSize: countBaseball(p => p.mlbTeams.includes('Baltimore Orioles')) },
  { id: 'team-tigers', sport: 'baseball', label: 'TIGERS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Detroit Tigers'), poolSize: countBaseball(p => p.mlbTeams.includes('Detroit Tigers')) },
  { id: 'team-blue-jays', sport: 'baseball', label: 'BLUE JAYS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Toronto Blue Jays'), poolSize: countBaseball(p => p.mlbTeams.includes('Toronto Blue Jays')) },
  { id: 'team-nationals', sport: 'baseball', label: 'NATIONALS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Washington Nationals'), poolSize: countBaseball(p => p.mlbTeams.includes('Washington Nationals')) },
  { id: 'team-marlins', sport: 'baseball', label: 'MARLINS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Miami Marlins'), poolSize: countBaseball(p => p.mlbTeams.includes('Miami Marlins')) },
  { id: 'team-rangers', sport: 'baseball', label: 'RANGERS', difficulty: 2, validate: (p) => isBaseball(p) && p.mlbTeams.includes('Texas Rangers'), poolSize: countBaseball(p => p.mlbTeams.includes('Texas Rangers')) },
  { id: 'decade-2020s', sport: 'baseball', label: '2020s ERA', difficulty: 1, validate: (p) => isBaseball(p) && p.decades.includes('2020s'), poolSize: countBaseball(p => p.decades.includes('2020s')) },
];

const rawFootball: Omit<CategoryDef, 'tag' | 'icon'>[] = [
  { id: 'nat-usa', sport: 'football', label: 'USA', difficulty: 1, validate: (p) => isFootball(p) && p.nationality === 'USA', poolSize: countFootball(p => p.nationality === 'USA') },
  { id: 'team-chiefs', sport: 'football', label: 'CHIEFS', difficulty: 1, validate: (p) => isFootball(p) && p.nflTeams.includes('Kansas City Chiefs'), poolSize: countFootball(p => p.nflTeams.includes('Kansas City Chiefs')) },
  { id: 'team-patriots', sport: 'football', label: 'PATRIOTS', difficulty: 1, validate: (p) => isFootball(p) && p.nflTeams.includes('New England Patriots'), poolSize: countFootball(p => p.nflTeams.includes('New England Patriots')) },
  { id: 'team-49ers', sport: 'football', label: '49ERS', difficulty: 1, validate: (p) => isFootball(p) && p.nflTeams.includes('San Francisco 49ers'), poolSize: countFootball(p => p.nflTeams.includes('San Francisco 49ers')) },
  { id: 'team-cowboys', sport: 'football', label: 'COWBOYS', difficulty: 1, validate: (p) => isFootball(p) && p.nflTeams.includes('Dallas Cowboys'), poolSize: countFootball(p => p.nflTeams.includes('Dallas Cowboys')) },
  { id: 'team-packers', sport: 'football', label: 'PACKERS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Green Bay Packers'), poolSize: countFootball(p => p.nflTeams.includes('Green Bay Packers')) },
  { id: 'team-eagles', sport: 'football', label: 'EAGLES', difficulty: 1, validate: (p) => isFootball(p) && p.nflTeams.includes('Philadelphia Eagles'), poolSize: countFootball(p => p.nflTeams.includes('Philadelphia Eagles')) },
  { id: 'team-ravens', sport: 'football', label: 'RAVENS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Baltimore Ravens'), poolSize: countFootball(p => p.nflTeams.includes('Baltimore Ravens')) },
  { id: 'team-bills', sport: 'football', label: 'BILLS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Buffalo Bills'), poolSize: countFootball(p => p.nflTeams.includes('Buffalo Bills')) },
  { id: 'team-seahawks', sport: 'football', label: 'SEAHAWKS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Seattle Seahawks'), poolSize: countFootball(p => p.nflTeams.includes('Seattle Seahawks')) },
  { id: 'team-rams', sport: 'football', label: 'RAMS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Los Angeles Rams'), poolSize: countFootball(p => p.nflTeams.includes('Los Angeles Rams')) },
  { id: 'team-broncos', sport: 'football', label: 'BRONCOS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Denver Broncos'), poolSize: countFootball(p => p.nflTeams.includes('Denver Broncos')) },
  { id: 'team-steelers', sport: 'football', label: 'STEELERS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Pittsburgh Steelers'), poolSize: countFootball(p => p.nflTeams.includes('Pittsburgh Steelers')) },
  { id: 'team-giants', sport: 'football', label: 'GIANTS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('New York Giants'), poolSize: countFootball(p => p.nflTeams.includes('New York Giants')) },
  { id: 'team-bears', sport: 'football', label: 'BEARS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Chicago Bears'), poolSize: countFootball(p => p.nflTeams.includes('Chicago Bears')) },
  { id: 'team-dolphins', sport: 'football', label: 'DOLPHINS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Miami Dolphins'), poolSize: countFootball(p => p.nflTeams.includes('Miami Dolphins')) },
  { id: 'team-vikings', sport: 'football', label: 'VIKINGS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Minnesota Vikings'), poolSize: countFootball(p => p.nflTeams.includes('Minnesota Vikings')) },
  { id: 'team-lions', sport: 'football', label: 'LIONS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Detroit Lions'), poolSize: countFootball(p => p.nflTeams.includes('Detroit Lions')) },
  { id: 'team-bengals', sport: 'football', label: 'BENGALS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Cincinnati Bengals'), poolSize: countFootball(p => p.nflTeams.includes('Cincinnati Bengals')) },
  { id: 'team-jets', sport: 'football', label: 'JETS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('New York Jets'), poolSize: countFootball(p => p.nflTeams.includes('New York Jets')) },
  { id: 'team-buccaneers', sport: 'football', label: 'BUCCANEERS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Tampa Bay Buccaneers'), poolSize: countFootball(p => p.nflTeams.includes('Tampa Bay Buccaneers')) },
  { id: 'team-colts', sport: 'football', label: 'COLTS', difficulty: 2, validate: (p) => isFootball(p) && p.nflTeams.includes('Indianapolis Colts'), poolSize: countFootball(p => p.nflTeams.includes('Indianapolis Colts')) },
  { id: 'pos-qb', sport: 'football', label: 'QUARTERBACK', difficulty: 1, validate: (p) => isFootball(p) && p.positions.includes('QB'), poolSize: countFootball(p => p.positions.includes('QB')) },
  { id: 'pos-rb', sport: 'football', label: 'RUNNING BACK', difficulty: 1, validate: (p) => isFootball(p) && p.positions.includes('RB'), poolSize: countFootball(p => p.positions.includes('RB')) },
  { id: 'pos-wr', sport: 'football', label: 'WIDE RECEIVER', difficulty: 1, validate: (p) => isFootball(p) && p.positions.includes('WR'), poolSize: countFootball(p => p.positions.includes('WR')) },
  { id: 'pos-te', sport: 'football', label: 'TIGHT END', difficulty: 2, validate: (p) => isFootball(p) && p.positions.includes('TE'), poolSize: countFootball(p => p.positions.includes('TE')) },
  { id: 'pos-dl', sport: 'football', label: 'DEFENSIVE LINE', difficulty: 2, validate: (p) => isFootball(p) && p.positions.includes('DL'), poolSize: countFootball(p => p.positions.includes('DL')) },
  { id: 'pos-lb', sport: 'football', label: 'LINEBACKER', difficulty: 2, validate: (p) => isFootball(p) && p.positions.includes('LB'), poolSize: countFootball(p => p.positions.includes('LB')) },
  { id: 'pos-db', sport: 'football', label: 'DEFENSIVE BACK', difficulty: 2, validate: (p) => isFootball(p) && p.positions.includes('DB'), poolSize: countFootball(p => p.positions.includes('DB')) },
  { id: 'pos-k', sport: 'football', label: 'KICKER', difficulty: 3, validate: (p) => isFootball(p) && p.positions.includes('K'), poolSize: countFootball(p => p.positions.includes('K')) },
  { id: 'champ-sb', sport: 'football', label: 'SUPER BOWL', difficulty: 2, validate: (p) => isFootball(p) && p.superBowls >= 1, poolSize: countFootball(p => p.superBowls >= 1) },
  { id: 'champ-sb3', sport: 'football', label: '3+ RINGS', difficulty: 3, validate: (p) => isFootball(p) && p.superBowls >= 3, poolSize: countFootball(p => p.superBowls >= 3) },
  { id: 'award-mvp', sport: 'football', label: 'MVP', difficulty: 2, validate: (p) => isFootball(p) && p.mvp, poolSize: countFootball(p => p.mvp) },
  { id: 'award-probowl', sport: 'football', label: 'PRO BOWL', difficulty: 1, validate: (p) => isFootball(p) && p.proBowl, poolSize: countFootball(p => p.proBowl) },
  { id: 'draft-10s', sport: 'football', label: '2010s DRAFT', difficulty: 1, validate: (p) => isFootball(p) && p.draftDecade === '2010s', poolSize: countFootball(p => p.draftDecade === '2010s') },
  { id: 'draft-00s', sport: 'football', label: '2000s DRAFT', difficulty: 2, validate: (p) => isFootball(p) && p.draftDecade === '2000s', poolSize: countFootball(p => p.draftDecade === '2000s') },
  { id: 'draft-2020s', sport: 'football', label: '2020s DRAFT', difficulty: 1, validate: (p) => isFootball(p) && p.draftDecade === '2020s', poolSize: countFootball(p => p.draftDecade === '2020s') },
  { id: 'draft-90s', sport: 'football', label: '1990s DRAFT', difficulty: 2, validate: (p) => isFootball(p) && p.draftDecade === '1990s', poolSize: countFootball(p => p.draftDecade === '1990s') },
  { id: 'decade-10s', sport: 'football', label: '2010s ERA', difficulty: 1, validate: (p) => isFootball(p) && p.decades.includes('2010s'), poolSize: countFootball(p => p.decades.includes('2010s')) },
  { id: 'decade-00s', sport: 'football', label: '2000s ERA', difficulty: 2, validate: (p) => isFootball(p) && p.decades.includes('2000s'), poolSize: countFootball(p => p.decades.includes('2000s')) },
  { id: 'decade-2020s', sport: 'football', label: '2020s ERA', difficulty: 1, validate: (p) => isFootball(p) && p.decades.includes('2020s'), poolSize: countFootball(p => p.decades.includes('2020s')) },
  { id: 'college-alabama', sport: 'football', label: 'ALABAMA', difficulty: 2, validate: (p) => isFootball(p) && p.college === 'Alabama', poolSize: countFootball(p => p.college === 'Alabama') },
  { id: 'college-ohio-state', sport: 'football', label: 'OHIO STATE', difficulty: 2, validate: (p) => isFootball(p) && p.college === 'Ohio State', poolSize: countFootball(p => p.college === 'Ohio State') },
  { id: 'college-michigan', sport: 'football', label: 'MICHIGAN', difficulty: 2, validate: (p) => isFootball(p) && p.college === 'Michigan', poolSize: countFootball(p => p.college === 'Michigan') },
  { id: 'college-lsu', sport: 'football', label: 'LSU', difficulty: 2, validate: (p) => isFootball(p) && p.college === 'LSU', poolSize: countFootball(p => p.college === 'LSU') },
  { id: 'college-oklahoma', sport: 'football', label: 'OKLAHOMA', difficulty: 2, validate: (p) => isFootball(p) && p.college === 'Oklahoma', poolSize: countFootball(p => p.college === 'Oklahoma') },
];

export const SOCCER_CATEGORIES: CategoryDef[] = rawSoccer.map(c => enrich(c));
export const BASKETBALL_CATEGORIES: CategoryDef[] = rawBasketball.map(c => enrich(c));
export const BASEBALL_CATEGORIES: CategoryDef[] = rawBaseball.map(c => enrich(c));
export const FOOTBALL_CATEGORIES: CategoryDef[] = rawFootball.map(c => enrich(c));

export function getCategories(sport: Sport): CategoryDef[] {
  if (sport === 'soccer') return SOCCER_CATEGORIES;
  if (sport === 'basketball') return BASKETBALL_CATEGORIES;
  if (sport === 'football') return FOOTBALL_CATEGORIES;
  return BASEBALL_CATEGORIES;
}

export function getPlayers(sport: Sport): PlayerUnion[] {
  if (sport === 'soccer') return SOCCER_PLAYERS;
  if (sport === 'basketball') return BASKETBALL_PLAYERS;
  if (sport === 'football') return FOOTBALL_PLAYERS;
  return BASEBALL_PLAYERS;
}

export function getMatchingCategories(player: PlayerUnion, categories: CategoryDef[]): CategoryDef[] {
  return categories.filter(c => c.validate(player));
}

export function toBoardCategory(def: CategoryDef): Category {
  return { id: def.id, tag: def.tag, label: def.label, icon: def.icon, difficulty: def.difficulty };
}
