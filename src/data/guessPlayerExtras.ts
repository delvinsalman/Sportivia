import type { Sport } from '../types';
import type { PlayerUnion } from './categories';
import type { SoccerPlayer } from './soccerPlayers';
import type { BasketballPlayer } from './basketballPlayers';
import type { BaseballPlayer } from './baseballPlayers';
import type { FootballPlayer } from './footballPlayers';
import type { HockeyPlayer } from './hockeyPlayers';

const soccer: SoccerPlayer[] = [
  { id: 'guess-gibbs-white', name: 'Morgan Gibbs-White', nationality: 'England', continent: 'Europe', positions: ['Midfielder'], clubs: ['Wolverhampton Wanderers', 'Sheffield United', 'Nottingham Forest'], leagues: ['Premier League', 'Championship'], trophies: [], decades: ['2010s', '2020s'] },
  { id: 'guess-oyarzabal', name: 'Mikel Oyarzabal', nationality: 'Spain', continent: 'Europe', positions: ['Forward'], clubs: ['Real Sociedad'], leagues: ['La Liga'], trophies: ['Copa del Rey', 'Euro Winner'], decades: ['2010s', '2020s'] },
  { id: 'guess-grimaldo', name: 'Alejandro Grimaldo', nationality: 'Spain', continent: 'Europe', positions: ['Defender', 'Midfielder'], clubs: ['Benfica', 'Bayer Leverkusen'], leagues: ['Primeira Liga', 'Bundesliga'], trophies: ['Primeira Liga', 'Bundesliga'], decades: ['2010s', '2020s'] },
  { id: 'guess-openda', name: 'Loïs Openda', nationality: 'Belgium', continent: 'Europe', positions: ['Forward'], clubs: ['Club Brugge', 'Vitesse', 'Lens', 'RB Leipzig'], leagues: ['Pro League', 'Eredivisie', 'Ligue 1', 'Bundesliga'], trophies: [], decades: ['2010s', '2020s'] },
  { id: 'guess-guirassy', name: 'Serhou Guirassy', nationality: 'Guinea', continent: 'Africa', positions: ['Forward'], clubs: ['Rennes', 'Stuttgart', 'Borussia Dortmund'], leagues: ['Ligue 1', 'Bundesliga'], trophies: [], decades: ['2010s', '2020s'] },
  { id: 'guess-lookman', name: 'Ademola Lookman', nationality: 'Nigeria', continent: 'Africa', positions: ['Forward'], clubs: ['Everton', 'RB Leipzig', 'Leicester City', 'Atalanta'], leagues: ['Premier League', 'Bundesliga', 'Serie A'], trophies: ['Europa League'], decades: ['2010s', '2020s'] },
  { id: 'guess-kean', name: 'Moise Kean', nationality: 'Italy', continent: 'Europe', positions: ['Forward'], clubs: ['Juventus', 'Everton', 'Paris Saint-Germain', 'Fiorentina'], leagues: ['Serie A', 'Premier League', 'Ligue 1'], trophies: ['Serie A'], decades: ['2010s', '2020s'] },
  { id: 'guess-gimenez', name: 'Santiago Giménez', nationality: 'Mexico', continent: 'North America', positions: ['Forward'], clubs: ['Cruz Azul', 'Feyenoord', 'AC Milan'], leagues: ['Liga MX', 'Eredivisie', 'Serie A'], trophies: ['Eredivisie'], decades: ['2010s', '2020s'] },
];

const basketball: BasketballPlayer[] = [
  { id: 'guess-coby-white', name: 'Coby White', nationality: 'USA', positions: ['Guard'], nbaTeams: ['Chicago Bulls'], championships: 0, mvp: false, allStar: false, olympicGold: false, college: 'North Carolina', draftDecade: '2010s', scoringTitle: false },
  { id: 'guess-jalen-johnson', name: 'Jalen Johnson', nationality: 'USA', positions: ['Forward'], nbaTeams: ['Atlanta Hawks'], championships: 0, mvp: false, allStar: false, olympicGold: false, college: 'Duke', draftDecade: '2020s', scoringTitle: false },
  { id: 'guess-trey-murphy', name: 'Trey Murphy III', nationality: 'USA', positions: ['Forward'], nbaTeams: ['New Orleans Pelicans'], championships: 0, mvp: false, allStar: false, olympicGold: false, college: 'Virginia', draftDecade: '2020s', scoringTitle: false },
  { id: 'guess-jalen-suggs', name: 'Jalen Suggs', nationality: 'USA', positions: ['Guard'], nbaTeams: ['Orlando Magic'], championships: 0, mvp: false, allStar: false, olympicGold: false, college: 'Gonzaga', draftDecade: '2020s', scoringTitle: false },
  { id: 'guess-norman-powell', name: 'Norman Powell', nationality: 'USA', positions: ['Guard'], nbaTeams: ['Toronto Raptors', 'Portland Trail Blazers', 'Los Angeles Clippers'], championships: 1, mvp: false, allStar: false, olympicGold: false, college: 'UCLA', draftDecade: '2010s', scoringTitle: false },
  { id: 'guess-zubac', name: 'Ivica Zubac', nationality: 'Croatia', positions: ['Center'], nbaTeams: ['Los Angeles Lakers', 'Los Angeles Clippers'], championships: 0, mvp: false, allStar: false, olympicGold: false, draftDecade: '2010s', scoringTitle: false },
  { id: 'guess-pritchard', name: 'Payton Pritchard', nationality: 'USA', positions: ['Guard'], nbaTeams: ['Boston Celtics'], championships: 1, mvp: false, allStar: false, olympicGold: false, college: 'Oregon', draftDecade: '2020s', scoringTitle: false },
  { id: 'guess-naz-reid', name: 'Naz Reid', nationality: 'USA', positions: ['Center', 'Forward'], nbaTeams: ['Minnesota Timberwolves'], championships: 0, mvp: false, allStar: false, olympicGold: false, college: 'LSU', draftDecade: '2010s', scoringTitle: false },
];

const baseball: BaseballPlayer[] = [
  { id: 'guess-roman-anthony', name: 'Roman Anthony', nationality: 'USA', positions: ['Outfield'], mlbTeams: ['Boston Red Sox'], leagues: ['American League'], awards: [], decades: ['2020s'], battingTitle: false },
  { id: 'guess-pca', name: 'Pete Crow-Armstrong', nationality: 'USA', positions: ['Outfield'], mlbTeams: ['Chicago Cubs'], leagues: ['National League'], awards: ['Gold Glove'], decades: ['2020s'], battingTitle: false },
  { id: 'guess-hunter-greene', name: 'Hunter Greene', nationality: 'USA', positions: ['Pitcher'], mlbTeams: ['Cincinnati Reds'], leagues: ['National League'], awards: ['All-Star'], decades: ['2020s'], battingTitle: false },
  { id: 'guess-rooker', name: 'Brent Rooker', nationality: 'USA', positions: ['Outfield', 'Designated Hitter'], mlbTeams: ['Minnesota Twins', 'Oakland Athletics'], leagues: ['American League'], awards: ['All-Star'], decades: ['2020s'], battingTitle: false },
  { id: 'guess-kwan', name: 'Steven Kwan', nationality: 'USA', positions: ['Outfield'], mlbTeams: ['Cleveland Guardians'], leagues: ['American League'], awards: ['All-Star', 'Gold Glove'], decades: ['2020s'], battingTitle: false },
  { id: 'guess-william-contreras', name: 'William Contreras', nationality: 'Venezuela', positions: ['Catcher'], mlbTeams: ['Atlanta Braves', 'Milwaukee Brewers'], leagues: ['National League'], awards: ['All-Star', 'World Series'], decades: ['2020s'], battingTitle: false },
  { id: 'guess-langford', name: 'Wyatt Langford', nationality: 'USA', positions: ['Outfield'], mlbTeams: ['Texas Rangers'], leagues: ['American League'], awards: [], decades: ['2020s'], battingTitle: false },
  { id: 'guess-colt-keith', name: 'Colt Keith', nationality: 'USA', positions: ['Infield'], mlbTeams: ['Detroit Tigers'], leagues: ['American League'], awards: [], decades: ['2020s'], battingTitle: false },
];

const football: FootballPlayer[] = [
  { id: 'guess-maye', name: 'Drake Maye', nationality: 'USA', positions: ['QB'], nflTeams: ['New England Patriots'], superBowls: 0, mvp: false, proBowl: false, college: 'North Carolina', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-daniels', name: 'Jayden Daniels', nationality: 'USA', positions: ['QB'], nflTeams: ['Washington Commanders'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-bo-nix', name: 'Bo Nix', nationality: 'USA', positions: ['QB'], nflTeams: ['Denver Broncos'], superBowls: 0, mvp: false, proBowl: true, college: 'Oregon', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-nabers', name: 'Malik Nabers', nationality: 'USA', positions: ['WR'], nflTeams: ['New York Giants'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-btj', name: 'Brian Thomas Jr.', nationality: 'USA', positions: ['WR'], nflTeams: ['Jacksonville Jaguars'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-mcconkey', name: 'Ladd McConkey', nationality: 'USA', positions: ['WR'], nflTeams: ['Los Angeles Chargers'], superBowls: 0, mvp: false, proBowl: true, college: 'Georgia', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-q-mitchell', name: 'Quinyon Mitchell', nationality: 'USA', positions: ['CB'], nflTeams: ['Philadelphia Eagles'], superBowls: 1, mvp: false, proBowl: true, college: 'Toledo', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-verse', name: 'Jared Verse', nationality: 'USA', positions: ['LB'], nflTeams: ['Los Angeles Rams'], superBowls: 0, mvp: false, proBowl: true, college: 'Florida State', draftDecade: '2020s', decades: ['2020s'] },
];

const hockey: HockeyPlayer[] = [
  { id: 'guess-hutson', name: 'Lane Hutson', nationality: 'USA', positions: ['D'], nhlTeams: ['Montreal Canadiens'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-cutter', name: 'Cutter Gauthier', nationality: 'USA', positions: ['LW'], nhlTeams: ['Anaheim Ducks'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-faber', name: 'Brock Faber', nationality: 'USA', positions: ['D'], nhlTeams: ['Minnesota Wild'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-wolf', name: 'Dustin Wolf', nationality: 'USA', positions: ['G'], nhlTeams: ['Calgary Flames'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2010s', decades: ['2020s'] },
  { id: 'guess-daccord', name: 'Joey Daccord', nationality: 'USA', positions: ['G'], nhlTeams: ['Ottawa Senators', 'Seattle Kraken'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'guess-harley', name: 'Thomas Harley', nationality: 'Canada', positions: ['D'], nhlTeams: ['Dallas Stars'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2010s', decades: ['2020s'] },
  { id: 'guess-owen-power', name: 'Owen Power', nationality: 'Canada', positions: ['D'], nhlTeams: ['Buffalo Sabres'], stanleyCups: 0, hart: false, allStar: false, hallOfFame: false, draftDecade: '2020s', decades: ['2020s'] },
  { id: 'guess-swayman', name: 'Jeremy Swayman', nationality: 'USA', positions: ['G'], nhlTeams: ['Boston Bruins'], stanleyCups: 0, hart: false, allStar: true, hallOfFame: false, draftDecade: '2010s', decades: ['2020s'] },
];

const MODE_ONLY_PLAYERS: Record<Sport, PlayerUnion[]> = {
  soccer,
  basketball,
  baseball,
  football,
  hockey,
};

export function guessPlayerExtras(sport: Sport): PlayerUnion[] {
  return MODE_ONLY_PLAYERS[sport];
}
