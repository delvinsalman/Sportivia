export interface FootballPlayer {
  id: string;
  name: string;
  nationality: string;
  positions: string[];
  nflTeams: string[];
  superBowls: number;
  mvp: boolean;
  proBowl: boolean;
  college?: string;
  draftDecade: string;
  decades: string[];
}

export const FOOTBALL_PLAYERS: FootballPlayer[] = [
  { id: 'mahomes', name: 'Patrick Mahomes', nationality: 'USA', positions: ['QB'], nflTeams: ['Kansas City Chiefs'], superBowls: 3, mvp: true, proBowl: true, college: 'Texas Tech', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'brady', name: 'Tom Brady', nationality: 'USA', positions: ['QB'], nflTeams: ['New England Patriots', 'Tampa Bay Buccaneers'], superBowls: 7, mvp: true, proBowl: true, college: 'Michigan', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'allen', name: 'Josh Allen', nationality: 'USA', positions: ['QB'], nflTeams: ['Buffalo Bills'], superBowls: 0, mvp: false, proBowl: true, college: 'Wyoming', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'burrow', name: 'Joe Burrow', nationality: 'USA', positions: ['QB'], nflTeams: ['Cincinnati Bengals'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'herbert', name: 'Justin Herbert', nationality: 'USA', positions: ['QB'], nflTeams: ['Los Angeles Chargers'], superBowls: 0, mvp: false, proBowl: true, college: 'Oregon', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'lamar', name: 'Lamar Jackson', nationality: 'USA', positions: ['QB'], nflTeams: ['Baltimore Ravens'], superBowls: 0, mvp: true, proBowl: true, college: 'Louisville', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'hurts', name: 'Jalen Hurts', nationality: 'USA', positions: ['QB'], nflTeams: ['Philadelphia Eagles'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'dak', name: 'Dak Prescott', nationality: 'USA', positions: ['QB'], nflTeams: ['Dallas Cowboys'], superBowls: 0, mvp: false, proBowl: true, college: 'Mississippi State', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'rodgers', name: 'Aaron Rodgers', nationality: 'USA', positions: ['QB'], nflTeams: ['Green Bay Packers', 'New York Jets'], superBowls: 1, mvp: true, proBowl: true, college: 'California', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'stafford', name: 'Matthew Stafford', nationality: 'USA', positions: ['QB'], nflTeams: ['Detroit Lions', 'Los Angeles Rams'], superBowls: 1, mvp: false, proBowl: true, college: 'Georgia', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'purdy', name: 'Brock Purdy', nationality: 'USA', positions: ['QB'], nflTeams: ['San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'Iowa State', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'stroud', name: 'C.J. Stroud', nationality: 'USA', positions: ['QB'], nflTeams: ['Houston Texans'], superBowls: 0, mvp: false, proBowl: true, college: 'Ohio State', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'murray', name: 'Kyler Murray', nationality: 'USA', positions: ['QB'], nflTeams: ['Arizona Cardinals'], superBowls: 0, mvp: false, proBowl: true, college: 'Oklahoma', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'mayfield', name: 'Baker Mayfield', nationality: 'USA', positions: ['QB'], nflTeams: ['Cleveland Browns', 'Carolina Panthers', 'Los Angeles Rams', 'Tampa Bay Buccaneers'], superBowls: 0, mvp: false, proBowl: true, college: 'Oklahoma', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'manning', name: 'Peyton Manning', nationality: 'USA', positions: ['QB'], nflTeams: ['Indianapolis Colts', 'Denver Broncos'], superBowls: 2, mvp: true, proBowl: true, college: 'Tennessee', draftDecade: '1990s', decades: ['1990s', '2000s', '2010s'] },
  { id: 'elway', name: 'John Elway', nationality: 'USA', positions: ['QB'], nflTeams: ['Denver Broncos'], superBowls: 2, mvp: false, proBowl: true, college: 'Stanford', draftDecade: '1980s', decades: ['1980s', '1990s'] },
  { id: 'montana', name: 'Joe Montana', nationality: 'USA', positions: ['QB'], nflTeams: ['San Francisco 49ers', 'Kansas City Chiefs'], superBowls: 4, mvp: true, proBowl: true, college: 'Notre Dame', draftDecade: '1970s', decades: ['1980s', '1990s'] },
  { id: 'favre', name: 'Brett Favre', nationality: 'USA', positions: ['QB'], nflTeams: ['Atlanta Falcons', 'Green Bay Packers', 'New York Jets', 'Minnesota Vikings'], superBowls: 1, mvp: true, proBowl: true, college: 'Southern Miss', draftDecade: '1990s', decades: ['1990s', '2000s'] },
  { id: 'brees', name: 'Drew Brees', nationality: 'USA', positions: ['QB'], nflTeams: ['San Diego Chargers', 'New Orleans Saints'], superBowls: 1, mvp: false, proBowl: true, college: 'Purdue', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'wilson', name: 'Russell Wilson', nationality: 'USA', positions: ['QB'], nflTeams: ['Seattle Seahawks', 'Denver Broncos', 'New York Giants', 'Pittsburgh Steelers'], superBowls: 1, mvp: false, proBowl: true, college: 'Wisconsin', draftDecade: '2010s', decades: ['2010s', '2020s'] },

  { id: 'mccaffrey', name: 'Christian McCaffrey', nationality: 'USA', positions: ['RB'], nflTeams: ['Carolina Panthers', 'San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'Stanford', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'henry', name: 'Derrick Henry', nationality: 'USA', positions: ['RB'], nflTeams: ['Tennessee Titans', 'Baltimore Ravens'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'barkley', name: 'Saquon Barkley', nationality: 'USA', positions: ['RB'], nflTeams: ['New York Giants', 'Philadelphia Eagles'], superBowls: 0, mvp: false, proBowl: true, college: 'Penn State', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'cmc-lt', name: 'LaDainian Tomlinson', nationality: 'USA', positions: ['RB'], nflTeams: ['San Diego Chargers', 'New York Jets'], superBowls: 0, mvp: true, proBowl: true, college: 'TCU', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'ap', name: 'Adrian Peterson', nationality: 'USA', positions: ['RB'], nflTeams: ['Minnesota Vikings', 'New Orleans Saints', 'Arizona Cardinals', 'Washington Commanders', 'Tennessee Titans', 'Seattle Seahawks'], superBowls: 0, mvp: true, proBowl: true, college: 'Oklahoma', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'emmitt', name: 'Emmitt Smith', nationality: 'USA', positions: ['RB'], nflTeams: ['Dallas Cowboys', 'Arizona Cardinals'], superBowls: 3, mvp: true, proBowl: true, college: 'Florida', draftDecade: '1990s', decades: ['1990s', '2000s'] },
  { id: 'barber', name: 'Marshawn Lynch', nationality: 'USA', positions: ['RB'], nflTeams: ['Buffalo Bills', 'Seattle Seahawks', 'Oakland Raiders'], superBowls: 1, mvp: false, proBowl: true, college: 'California', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'rice-rb', name: 'Frank Gore', nationality: 'USA', positions: ['RB'], nflTeams: ['San Francisco 49ers', 'Indianapolis Colts', 'Miami Dolphins', 'Buffalo Bills', 'New York Jets'], superBowls: 0, mvp: false, proBowl: true, college: 'Miami', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },

  { id: 'jefferson', name: 'Justin Jefferson', nationality: 'USA', positions: ['WR'], nflTeams: ['Minnesota Vikings'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'chase', name: 'Ja\'Marr Chase', nationality: 'USA', positions: ['WR'], nflTeams: ['Cincinnati Bengals'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'hill', name: 'Tyreek Hill', nationality: 'USA', positions: ['WR'], nflTeams: ['Kansas City Chiefs', 'Miami Dolphins'], superBowls: 1, mvp: false, proBowl: true, college: 'West Alabama', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'adams', name: 'Davante Adams', nationality: 'USA', positions: ['WR'], nflTeams: ['Green Bay Packers', 'Las Vegas Raiders', 'New York Jets'], superBowls: 0, mvp: false, proBowl: true, college: 'Fresno State', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'kupp', name: 'Cooper Kupp', nationality: 'USA', positions: ['WR'], nflTeams: ['Los Angeles Rams'], superBowls: 1, mvp: false, proBowl: true, college: 'Eastern Washington', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'diggs', name: 'Stefon Diggs', nationality: 'USA', positions: ['WR'], nflTeams: ['Minnesota Vikings', 'Buffalo Bills', 'Houston Texans'], superBowls: 0, mvp: false, proBowl: true, college: 'Maryland', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'metcalf', name: 'DK Metcalf', nationality: 'USA', positions: ['WR'], nflTeams: ['Seattle Seahawks'], superBowls: 0, mvp: false, proBowl: true, college: 'Ole Miss', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'rice', name: 'Jerry Rice', nationality: 'USA', positions: ['WR'], nflTeams: ['San Francisco 49ers', 'Oakland Raiders', 'Seattle Seahawks'], superBowls: 3, mvp: false, proBowl: true, college: 'Mississippi Valley State', draftDecade: '1980s', decades: ['1980s', '1990s', '2000s'] },
  { id: 'moss', name: 'Randy Moss', nationality: 'USA', positions: ['WR'], nflTeams: ['Minnesota Vikings', 'Oakland Raiders', 'New England Patriots', 'Tennessee Titans', 'San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'Marshall', draftDecade: '1990s', decades: ['1990s', '2000s', '2010s'] },
  { id: 'megatron', name: 'Calvin Johnson', nationality: 'USA', positions: ['WR'], nflTeams: ['Detroit Lions'], superBowls: 0, mvp: false, proBowl: true, college: 'Georgia Tech', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'fitz', name: 'Larry Fitzgerald', nationality: 'USA', positions: ['WR'], nflTeams: ['Arizona Cardinals'], superBowls: 0, mvp: false, proBowl: true, college: 'Pittsburgh', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'ajb', name: 'A.J. Brown', nationality: 'USA', positions: ['WR'], nflTeams: ['Tennessee Titans', 'Philadelphia Eagles'], superBowls: 0, mvp: false, proBowl: true, college: 'Ole Miss', draftDecade: '2010s', decades: ['2010s', '2020s'] },

  { id: 'kelce', name: 'Travis Kelce', nationality: 'USA', positions: ['TE'], nflTeams: ['Kansas City Chiefs'], superBowls: 3, mvp: false, proBowl: true, college: 'Cincinnati', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'gronk', name: 'Rob Gronkowski', nationality: 'USA', positions: ['TE'], nflTeams: ['New England Patriots', 'Tampa Bay Buccaneers'], superBowls: 4, mvp: false, proBowl: true, college: 'Arizona', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'kittle', name: 'George Kittle', nationality: 'USA', positions: ['TE'], nflTeams: ['San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'Iowa', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'andrews', name: 'Mark Andrews', nationality: 'USA', positions: ['TE'], nflTeams: ['Baltimore Ravens'], superBowls: 0, mvp: false, proBowl: true, college: 'Oklahoma', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'gonzalez', name: 'Tony Gonzalez', nationality: 'USA', positions: ['TE'], nflTeams: ['Kansas City Chiefs', 'Atlanta Falcons'], superBowls: 0, mvp: false, proBowl: true, college: 'California', draftDecade: '1990s', decades: ['1990s', '2000s', '2010s'] },

  { id: 'watt', name: 'J.J. Watt', nationality: 'USA', positions: ['DL'], nflTeams: ['Houston Texans', 'Arizona Cardinals'], superBowls: 0, mvp: false, proBowl: true, college: 'Wisconsin', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'donald', name: 'Aaron Donald', nationality: 'USA', positions: ['DL'], nflTeams: ['Los Angeles Rams'], superBowls: 1, mvp: false, proBowl: true, college: 'Pittsburgh', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'bosa', name: 'Nick Bosa', nationality: 'USA', positions: ['DL'], nflTeams: ['San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'Ohio State', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'hutchinson', name: 'Aidan Hutchinson', nationality: 'USA', positions: ['DL'], nflTeams: ['Detroit Lions'], superBowls: 0, mvp: false, proBowl: true, college: 'Michigan', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'garrett', name: 'Myles Garrett', nationality: 'USA', positions: ['DL'], nflTeams: ['Cleveland Browns'], superBowls: 0, mvp: false, proBowl: true, college: 'Texas A&M', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'mack', name: 'Khalil Mack', nationality: 'USA', positions: ['DL', 'LB'], nflTeams: ['Oakland Raiders', 'Chicago Bears', 'Los Angeles Chargers'], superBowls: 0, mvp: false, proBowl: true, college: 'Buffalo', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'miller', name: 'Von Miller', nationality: 'USA', positions: ['LB'], nflTeams: ['Denver Broncos', 'Los Angeles Rams', 'Buffalo Bills'], superBowls: 2, mvp: false, proBowl: true, college: 'Texas A&M', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'ray', name: 'Ray Lewis', nationality: 'USA', positions: ['LB'], nflTeams: ['Baltimore Ravens'], superBowls: 2, mvp: false, proBowl: true, college: 'Miami', draftDecade: '1990s', decades: ['1990s', '2000s', '2010s'] },
  { id: 'urlacher', name: 'Brian Urlacher', nationality: 'USA', positions: ['LB'], nflTeams: ['Chicago Bears'], superBowls: 0, mvp: false, proBowl: true, college: 'New Mexico', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'warner-lb', name: 'Fred Warner', nationality: 'USA', positions: ['LB'], nflTeams: ['San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'BYU', draftDecade: '2010s', decades: ['2010s', '2020s'] },

  { id: 'reed', name: 'Ed Reed', nationality: 'USA', positions: ['DB'], nflTeams: ['Baltimore Ravens', 'Houston Texans', 'New York Jets'], superBowls: 1, mvp: false, proBowl: true, college: 'Miami', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'revis', name: 'Darrelle Revis', nationality: 'USA', positions: ['DB'], nflTeams: ['New York Jets', 'Tampa Bay Buccaneers', 'New England Patriots', 'Kansas City Chiefs'], superBowls: 1, mvp: false, proBowl: true, college: 'Pittsburgh', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'sherman', name: 'Richard Sherman', nationality: 'USA', positions: ['DB'], nflTeams: ['Seattle Seahawks', 'San Francisco 49ers', 'Tampa Bay Buccaneers'], superBowls: 1, mvp: false, proBowl: true, college: 'Stanford', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'ramsey', name: 'Jalen Ramsey', nationality: 'USA', positions: ['DB'], nflTeams: ['Jacksonville Jaguars', 'Los Angeles Rams', 'Miami Dolphins'], superBowls: 1, mvp: false, proBowl: true, college: 'Florida State', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'sauce', name: 'Sauce Gardner', nationality: 'USA', positions: ['DB'], nflTeams: ['New York Jets'], superBowls: 0, mvp: false, proBowl: true, college: 'Cincinnati', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'suggs', name: 'Terrell Suggs', nationality: 'USA', positions: ['LB'], nflTeams: ['Baltimore Ravens', 'Arizona Cardinals', 'Kansas City Chiefs'], superBowls: 2, mvp: false, proBowl: true, college: 'Arizona State', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },

  { id: 'tucker', name: 'Justin Tucker', nationality: 'USA', positions: ['K'], nflTeams: ['Baltimore Ravens'], superBowls: 0, mvp: false, proBowl: true, college: 'Texas', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'vinatieri', name: 'Adam Vinatieri', nationality: 'USA', positions: ['K'], nflTeams: ['New England Patriots', 'Indianapolis Colts'], superBowls: 4, mvp: false, proBowl: true, college: 'South Dakota State', draftDecade: '1990s', decades: ['1990s', '2000s', '2010s', '2020s'] },

  { id: 'becki', name: "Ka'imi Fairbairn", nationality: 'USA', positions: ['K'], nflTeams: ['Houston Texans'], superBowls: 0, mvp: false, proBowl: true, college: 'UCLA', draftDecade: '2010s', decades: ['2010s', '2020s'] },

  { id: 'beckison-nfl', name: 'Harrison Butker', nationality: 'USA', positions: ['K'], nflTeams: ['Kansas City Chiefs', 'Carolina Panthers'], superBowls: 3, mvp: false, proBowl: true, college: 'Georgia Tech', draftDecade: '2010s', decades: ['2010s', '2020s'] },

  { id: 'lawrence', name: 'Trevor Lawrence', nationality: 'USA', positions: ['QB'], nflTeams: ['Jacksonville Jaguars'], superBowls: 0, mvp: false, proBowl: true, college: 'Clemson', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'fields', name: 'Justin Fields', nationality: 'USA', positions: ['QB'], nflTeams: ['Chicago Bears', 'Pittsburgh Steelers', 'New York Jets'], superBowls: 0, mvp: false, proBowl: false, college: 'Ohio State', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'tua', name: 'Tua Tagovailoa', nationality: 'USA', positions: ['QB'], nflTeams: ['Miami Dolphins'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'jones', name: 'Mac Jones', nationality: 'USA', positions: ['QB'], nflTeams: ['New England Patriots', 'Jacksonville Jaguars', 'San Francisco 49ers'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'najee', name: 'Najee Harris', nationality: 'USA', positions: ['RB'], nflTeams: ['Pittsburgh Steelers', 'Los Angeles Chargers'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'bijan', name: 'Bijan Robinson', nationality: 'USA', positions: ['RB'], nflTeams: ['Atlanta Falcons'], superBowls: 0, mvp: false, proBowl: true, college: 'Texas', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'cdlamb', name: 'CeeDee Lamb', nationality: 'USA', positions: ['WR'], nflTeams: ['Dallas Cowboys'], superBowls: 0, mvp: false, proBowl: true, college: 'Oklahoma', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'amico', name: 'Amon-Ra St. Brown', nationality: 'USA', positions: ['WR'], nflTeams: ['Detroit Lions'], superBowls: 0, mvp: false, proBowl: true, college: 'USC', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'smith', name: 'DeVonta Smith', nationality: 'USA', positions: ['WR'], nflTeams: ['Philadelphia Eagles'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'waddle', name: 'Jaylen Waddle', nationality: 'USA', positions: ['WR'], nflTeams: ['Miami Dolphins'], superBowls: 0, mvp: false, proBowl: true, college: 'Alabama', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'puka', name: 'Puka Nacua', nationality: 'USA', positions: ['WR'], nflTeams: ['Los Angeles Rams'], superBowls: 0, mvp: false, proBowl: true, college: 'BYU', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'cmc2', name: 'Jonathan Taylor', nationality: 'USA', positions: ['RB'], nflTeams: ['Indianapolis Colts'], superBowls: 0, mvp: false, proBowl: true, college: 'Wisconsin', draftDecade: '2020s', decades: ['2020s'] },
  { id: 'kelce-jason', name: 'Jason Kelce', nationality: 'USA', positions: ['OL'], nflTeams: ['Philadelphia Eagles'], superBowls: 1, mvp: false, proBowl: true, college: 'Cincinnati', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'wheeler', name: 'Lane Johnson', nationality: 'USA', positions: ['OL'], nflTeams: ['Philadelphia Eagles'], superBowls: 1, mvp: false, proBowl: true, college: 'Oklahoma', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'peterson-patrick', name: 'Patrick Peterson', nationality: 'USA', positions: ['DB'], nflTeams: ['Arizona Cardinals', 'Minnesota Vikings', 'Pittsburgh Steelers'], superBowls: 0, mvp: false, proBowl: true, college: 'LSU', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'chapman', name: 'Kam Chancellor', nationality: 'USA', positions: ['DB'], nflTeams: ['Seattle Seahawks'], superBowls: 1, mvp: false, proBowl: true, college: 'Virginia Tech', draftDecade: '2010s', decades: ['2010s'] },
  { id: 'thomas-earl', name: 'Earl Thomas', nationality: 'USA', positions: ['DB'], nflTeams: ['Seattle Seahawks', 'Baltimore Ravens'], superBowls: 1, mvp: false, proBowl: true, college: 'Texas', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'luck', name: 'Andrew Luck', nationality: 'USA', positions: ['QB'], nflTeams: ['Indianapolis Colts'], superBowls: 0, mvp: false, proBowl: true, college: 'Stanford', draftDecade: '2010s', decades: ['2010s'] },
  { id: 'newton', name: 'Cam Newton', nationality: 'USA', positions: ['QB'], nflTeams: ['Carolina Panthers', 'New England Patriots'], superBowls: 0, mvp: true, proBowl: true, college: 'Auburn', draftDecade: '2010s', decades: ['2010s', '2020s'] },
  { id: 'rg3', name: 'Robert Griffin III', nationality: 'USA', positions: ['QB'], nflTeams: ['Washington Commanders', 'Cleveland Browns', 'Baltimore Ravens'], superBowls: 0, mvp: false, proBowl: true, college: 'Baylor', draftDecade: '2010s', decades: ['2010s'] },
  { id: 'romo', name: 'Tony Romo', nationality: 'USA', positions: ['QB'], nflTeams: ['Dallas Cowboys'], superBowls: 0, mvp: false, proBowl: true, college: 'Eastern Illinois', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'bigben', name: 'Ben Roethlisberger', nationality: 'USA', positions: ['QB'], nflTeams: ['Pittsburgh Steelers'], superBowls: 2, mvp: false, proBowl: true, college: 'Miami (OH)', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'eli', name: 'Eli Manning', nationality: 'USA', positions: ['QB'], nflTeams: ['New York Giants'], superBowls: 2, mvp: false, proBowl: true, college: 'Ole Miss', draftDecade: '2000s', decades: ['2000s', '2010s'] },
  { id: 'rivers', name: 'Philip Rivers', nationality: 'USA', positions: ['QB'], nflTeams: ['San Diego Chargers', 'Los Angeles Chargers', 'Indianapolis Colts'], superBowls: 0, mvp: false, proBowl: true, college: 'NC State', draftDecade: '2000s', decades: ['2000s', '2010s', '2020s'] },
  { id: 'warner', name: 'Kurt Warner', nationality: 'USA', positions: ['QB'], nflTeams: ['St. Louis Rams', 'New York Giants', 'Arizona Cardinals'], superBowls: 1, mvp: true, proBowl: true, college: 'Northern Iowa', draftDecade: '1990s', decades: ['1990s', '2000s'] },
  { id: 'sandy', name: 'Deion Sanders', nationality: 'USA', positions: ['DB'], nflTeams: ['Atlanta Falcons', 'San Francisco 49ers', 'Dallas Cowboys', 'Washington Commanders', 'Baltimore Ravens'], superBowls: 2, mvp: false, proBowl: true, college: 'Florida State', draftDecade: '1980s', decades: ['1980s', '1990s', '2000s'] },
  { id: 'lt', name: 'Lawrence Taylor', nationality: 'USA', positions: ['LB'], nflTeams: ['New York Giants'], superBowls: 2, mvp: true, proBowl: true, college: 'North Carolina', draftDecade: '1980s', decades: ['1980s', '1990s'] },
  { id: 'payton', name: 'Walter Payton', nationality: 'USA', positions: ['RB'], nflTeams: ['Chicago Bears'], superBowls: 1, mvp: true, proBowl: true, college: 'Jackson State', draftDecade: '1970s', decades: ['1970s', '1980s'] },
  { id: 'barry', name: 'Barry Sanders', nationality: 'USA', positions: ['RB'], nflTeams: ['Detroit Lions'], superBowls: 0, mvp: true, proBowl: true, college: 'Oklahoma State', draftDecade: '1980s', decades: ['1980s', '1990s'] },
  { id: 'sweetness', name: 'Jim Brown', nationality: 'USA', positions: ['RB'], nflTeams: ['Cleveland Browns'], superBowls: 1, mvp: true, proBowl: true, college: 'Syracuse', draftDecade: '1950s', decades: ['1950s', '1960s'] },
];
