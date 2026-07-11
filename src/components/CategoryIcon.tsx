import type { CategoryTag, Sport } from '../types';
import { TeamJerseyIcon } from './TeamJerseyIcon';
import type { JerseyPattern } from './TeamJerseyIcon';
import { AnimatedGlobeIcon } from './AnimatedGlobeIcon';
import { AllStarIcon } from './AllStarIcon';
import { BasketballAwardIcon } from './BasketballAwardIcon';

export type VisualType = 'flag' | 'jersey' | 'league' | 'trophy' | 'position' | 'era' | 'region' | 'award' | 'college' | 'basketball' | 'mlb' | 'allstar';

interface VisualMeta {
  type: VisualType;
  colors?: string[];
  stripes?: string[];
  accent?: string;
  flagCode?: string;
  initials?: string;
  logoUrl?: string;
  logoBackground?: string;
  jerseyPattern?: JerseyPattern;
  allStarVariant?: 'nba' | 'mlb';
  awardVariant?: 'mvp' | 'scoring' | 'championship' | 'olympic';
}

export const CATEGORY_VISUALS: Record<string, VisualMeta> = {
  // Soccer nationalities
  'nat-brazil': { type: 'flag', flagCode: 'br', colors: ['#009b3a', '#fedf00', '#002776'] },
  'nat-france': { type: 'flag', flagCode: 'fr', colors: ['#002395', '#fff', '#ed2939'] },
  'nat-argentina': { type: 'flag', flagCode: 'ar', colors: ['#74acdf', '#fff', '#74acdf'] },
  'nat-england': { type: 'flag', flagCode: 'gb-eng', colors: ['#fff', '#ce1124'] },
  'nat-spain': { type: 'flag', flagCode: 'es', colors: ['#c60b1e', '#ffc400', '#c60b1e'] },
  'nat-germany': { type: 'flag', flagCode: 'de', colors: ['#000', '#dd0000', '#ffce00'] },
  'nat-portugal': { type: 'flag', flagCode: 'pt', colors: ['#006600', '#ff0000'] },
  'nat-italy': { type: 'flag', flagCode: 'it', colors: ['#009246', '#fff', '#ce2b37'] },
  'nat-croatia': { type: 'flag', flagCode: 'hr', colors: ['#ff0000', '#fff', '#171796'] },
  // Soccer clubs
  'club-rm': { type: 'jersey', jerseyPattern: 'solid', colors: ['#ffffff'], accent: '#fdb913', logoUrl: '/icons/teams/soccer/real-madrid.svg' },
  'club-barca': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#a50044', '#004d98', '#a50044', '#004d98', '#a50044', '#004d98'], logoUrl: '/icons/teams/soccer/barcelona.svg' },
  'club-mufc': { type: 'jersey', jerseyPattern: 'solid', colors: ['#da291c'], accent: '#fef200', logoUrl: '/icons/teams/soccer/man-united.svg' },
  'club-mcfc': { type: 'jersey', jerseyPattern: 'solid', colors: ['#6cabdd'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/man-city.svg' },
  'club-lfc': { type: 'jersey', jerseyPattern: 'solid', colors: ['#c8102e'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/liverpool.svg' },
  'club-cfc': { type: 'jersey', jerseyPattern: 'solid', colors: ['#034694'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/chelsea.svg' },
  'club-juve': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#000000', '#ffffff', '#000000', '#ffffff'], logoUrl: '/icons/teams/soccer/juventus.svg' },
  'club-bayern': { type: 'jersey', jerseyPattern: 'split', colors: ['#dc052d', '#0066b2'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/bayern.svg' },
  'club-psg': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#004170', '#da291c', '#004170'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/psg.svg' },
  'club-arsenal': { type: 'jersey', jerseyPattern: 'solid', colors: ['#ef0107'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/arsenal.svg' },
  // Soccer leagues
  'league-pl': { type: 'league', logoUrl: '/icons/leagues/premier-league.svg', logoBackground: '#ffffff' },
  'league-laliga': { type: 'league', logoUrl: '/icons/leagues/la-liga.svg' },
  'league-seriea': { type: 'league', logoUrl: '/icons/leagues/serie-a.svg' },
  'league-bundesliga': { type: 'league', logoUrl: '/icons/leagues/bundesliga.svg' },
  'league-ligue1': { type: 'league', logoUrl: '/icons/leagues/ligue-1.svg' },
  // Soccer other
  'pos-fwd': { type: 'position', colors: ['#f0b232'], initials: 'FW' },
  'pos-mid': { type: 'position', colors: ['#23a559'], initials: 'MF' },
  'pos-def': { type: 'position', colors: ['#5865f2'], initials: 'DF' },
  'trophy-wc': { type: 'trophy', colors: ['#f0b232'] },
  'trophy-bdo': { type: 'trophy', colors: ['#ffd700'] },
  'trophy-ucl': { type: 'trophy', logoUrl: '/icons/trophies/ucl.png' },
  'trophy-euro': { type: 'trophy', logoUrl: '/icons/trophies/euro.png' },
  'cont-europe': { type: 'region' },
  'cont-sa': { type: 'region' },
  'decade-00s': { type: 'era', initials: '00' },
  'decade-10s': { type: 'era', initials: '10' },
  'nat-netherlands': { type: 'flag', flagCode: 'nl', colors: ['#ae1c28', '#fff', '#21468b'] },
  'nat-belgium': { type: 'flag', flagCode: 'be', colors: ['#000', '#fdda24', '#ef3340'] },
  'nat-colombia': { type: 'flag', flagCode: 'co', colors: ['#fcd116', '#003893', '#ce1126'] },
  'nat-mexico': { type: 'flag', flagCode: 'mx', colors: ['#006847', '#fff', '#ce1126'] },
  'nat-nigeria': { type: 'flag', flagCode: 'ng', colors: ['#008751', '#fff', '#008751'] },
  'club-inter': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#010e80', '#000000', '#010e80'], logoUrl: '/icons/teams/soccer/inter.svg' },
  'club-acmilan': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#fb090b', '#000000', '#fb090b'], logoUrl: '/icons/teams/soccer/ac-milan.svg' },
  'club-atletico': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#cb3524', '#ffffff', '#cb3524', '#ffffff', '#cb3524'], logoUrl: '/icons/teams/soccer/atletico.png' },
  'club-tottenham': { type: 'jersey', jerseyPattern: 'solid', colors: ['#ffffff'], accent: '#132257', logoUrl: '/icons/teams/soccer/tottenham.svg' },
  'club-newcastle': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#000000', '#ffffff', '#000000', '#ffffff', '#000000'], logoUrl: '/icons/teams/soccer/newcastle.svg' },
  'club-dortmund': { type: 'jersey', jerseyPattern: 'solid', colors: ['#fde100'], accent: '#000000', logoUrl: '/icons/teams/soccer/dortmund.svg' },
  'club-napoli': { type: 'jersey', jerseyPattern: 'solid', colors: ['#12a0d7'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/napoli.svg' },
  'club-benfica': { type: 'jersey', jerseyPattern: 'solid', colors: ['#e03c31'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/benfica.png' },
  'club-porto': { type: 'jersey', jerseyPattern: 'vertical', stripes: ['#003893', '#ffffff', '#003893'], logoUrl: '/icons/teams/soccer/porto.svg' },
  'club-ajax': { type: 'jersey', jerseyPattern: 'solid', colors: ['#ffffff'], accent: '#d2122e', logoUrl: '/icons/teams/soccer/ajax.svg' },
  'club-marseille': { type: 'jersey', jerseyPattern: 'solid', colors: ['#2fa3e0'], accent: '#ffffff', logoUrl: '/icons/teams/soccer/marseille.svg' },
  'club-aston-villa': { type: 'jersey', jerseyPattern: 'solid', colors: ['#670e36'], accent: '#95bfe5', logoUrl: '/icons/teams/soccer/aston-villa.png' },
  'league-mls': { type: 'league', logoUrl: '/icons/leagues/mls.svg' },
  'league-saudi': { type: 'league', logoUrl: '/icons/leagues/saudi-pro-league.svg' },
  'nat-uruguay': { type: 'flag', flagCode: 'uy', colors: ['#0038a8', '#fff', '#0038a8'] },
  'nat-ivory-coast': { type: 'flag', flagCode: 'ci', colors: ['#f77f00', '#fff', '#009e60'] },
  'nat-morocco': { type: 'flag', flagCode: 'ma', colors: ['#c1272d', '#006233'] },
  'nat-senegal': { type: 'flag', flagCode: 'sn', colors: ['#00853f', '#fdef42', '#e31b23'] },
  'nat-egypt': { type: 'flag', flagCode: 'eg', colors: ['#ce1126', '#fff', '#000'] },
  'nat-ghana': { type: 'flag', flagCode: 'gh', colors: ['#ce1126', '#fcd116', '#006b3f'] },
  'nat-ukraine': { type: 'flag', flagCode: 'ua', colors: ['#0057b7', '#ffd700'] },
  'nat-scotland': { type: 'flag', flagCode: 'gb-sct', colors: ['#0065bf', '#fff'] },
  'nat-wales': { type: 'flag', flagCode: 'gb-wls', colors: ['#00b140', '#fff', '#c8102e'] },
  'nat-poland': { type: 'flag', flagCode: 'pl', colors: ['#fff', '#dc143c'] },
  'nat-denmark': { type: 'flag', flagCode: 'dk', colors: ['#c8102e', '#fff'] },
  'nat-austria': { type: 'flag', flagCode: 'at', colors: ['#ed2939', '#fff', '#ed2939'] },
  'nat-switzerland': { type: 'flag', flagCode: 'ch', colors: ['#ff0000', '#fff'] },
  'nat-turkey': { type: 'flag', flagCode: 'tr', colors: ['#e30a17', '#fff'] },
  'nat-cameroon': { type: 'flag', flagCode: 'cm', colors: ['#007a5e', '#ce1126', '#fcd116'] },
  'nat-algeria': { type: 'flag', flagCode: 'dz', colors: ['#006233', '#fff', '#d21034'] },
  'nat-ecuador': { type: 'flag', flagCode: 'ec', colors: ['#ffdd00', '#034ea2', '#ed1c24'] },
  'nat-chile': { type: 'flag', flagCode: 'cl', colors: ['#0039a6', '#fff', '#d52b1e'] },
  'nat-usa-soccer': { type: 'flag', flagCode: 'us', colors: ['#b22234', '#fff', '#3c3b6e'] },
  'nat-south-korea': { type: 'flag', flagCode: 'kr', colors: ['#fff', '#cd2e3a', '#0047a0'] },
  'nat-norway': { type: 'flag', flagCode: 'no', colors: ['#ba0c2f', '#fff', '#00205b'] },
  'nat-sweden': { type: 'flag', flagCode: 'se', colors: ['#006aa7', '#fecc00'] },
  'nat-czech': { type: 'flag', flagCode: 'cz', colors: ['#11457e', '#fff', '#d7141a'] },
  'nat-georgia': { type: 'flag', flagCode: 'ge', colors: ['#fff', '#ff0000'] },
  'nat-canada-soccer': { type: 'flag', flagCode: 'ca', colors: ['#ff0000', '#fff'] },
  'nat-slovenia': { type: 'flag', flagCode: 'si', colors: ['#fff', '#003da5', '#ed1c24'] },
  'nat-mali': { type: 'flag', flagCode: 'ml', colors: ['#14b53a', '#fcd116', '#ce1126'] },
  'nat-gabon': { type: 'flag', flagCode: 'ga', colors: ['#009e60', '#fcd116', '#3a75c4'] },
  'nat-bulgaria': { type: 'flag', flagCode: 'bg', colors: ['#fff', '#00966e', '#d62612'] },
  'nat-northern-ireland': { type: 'flag', flagCode: 'gb-nir', colors: ['#fff', '#c8102e', '#00247d'] },
  'trophy-europa': { type: 'trophy', logoUrl: '/icons/trophies/europa.png' },
  'trophy-fa-cup': { type: 'trophy', logoUrl: '/icons/trophies/fa-cup.svg' },
  'trophy-copa-america': { type: 'trophy', logoUrl: '/icons/trophies/copa-america.svg' },
  'trophy-afcon': { type: 'trophy', logoUrl: '/icons/trophies/afcon.svg' },
  'cont-north-america': { type: 'region' },
  'decade-2020s': { type: 'era', initials: '20' },
  'pos-gk': { type: 'position', colors: ['#f59e0b'], initials: 'GK', logoUrl: '/icons/positions/goalkeeper.png' },
  'decade-90s': { type: 'era', initials: '90' },
  'cont-africa': { type: 'region' },
  'cont-asia': { type: 'region' },
  // Basketball nationalities
  'nat-usa': { type: 'flag', flagCode: 'us', colors: ['#b22234', '#fff', '#3c3b6e'] },
  'nat-canada': { type: 'flag', flagCode: 'ca', colors: ['#ff0000', '#fff'] },
  'nat-greece': { type: 'flag', flagCode: 'gr', colors: ['#0d5eaf', '#fff'] },
  'nat-serbia': { type: 'flag', flagCode: 'rs', colors: ['#c6363c', '#0c4076', '#fff'] },
  // Basketball teams
  'team-lakers': { type: 'basketball', jerseyPattern: 'solid', colors: ['#552583'], accent: '#fdb927', logoUrl: '/icons/teams/nba/lal.png' },
  'team-celtics': { type: 'basketball', jerseyPattern: 'solid', colors: ['#007a33'], accent: '#ffffff', logoUrl: '/icons/teams/nba/bos.png' },
  'team-bulls': { type: 'basketball', jerseyPattern: 'solid', colors: ['#ce1141'], accent: '#000000', logoUrl: '/icons/teams/nba/chi.png' },
  'team-warriors': { type: 'basketball', jerseyPattern: 'solid', colors: ['#1d428a'], accent: '#ffc72c', logoUrl: '/icons/teams/nba/gs.png' },
  'team-heat': { type: 'basketball', jerseyPattern: 'solid', colors: ['#98002e'], accent: '#f9a01b', logoUrl: '/icons/teams/nba/mia.png' },
  'team-spurs': { type: 'basketball', jerseyPattern: 'split', colors: ['#c4ced4', '#000000'], accent: '#ffffff', logoUrl: '/icons/teams/nba/sa.png' },
  'team-knicks': { type: 'basketball', jerseyPattern: 'solid', colors: ['#006bb6'], accent: '#f58426', logoUrl: '/icons/teams/nba/ny.png' },
  'team-nuggets': { type: 'basketball', jerseyPattern: 'solid', colors: ['#0e2240'], accent: '#fec524', logoUrl: '/icons/teams/nba/den.png' },
  'team-mavericks': { type: 'basketball', jerseyPattern: 'solid', colors: ['#00538c'], accent: '#002b5e', logoUrl: '/icons/teams/nba/dal.png' },
  'team-cavs': { type: 'basketball', jerseyPattern: 'solid', colors: ['#860038'], accent: '#fdbb30', logoUrl: '/icons/teams/nba/cle.png' },
  'team-thunder': { type: 'basketball', jerseyPattern: 'solid', colors: ['#007ac1'], accent: '#ef3b24', logoUrl: '/icons/teams/nba/okc.png' },
  'team-pistons': { type: 'basketball', jerseyPattern: 'split', colors: ['#c8102e', '#1d42ba'], accent: '#ffffff', logoUrl: '/icons/teams/nba/det.png' },
  'team-raptors': { type: 'basketball', jerseyPattern: 'solid', colors: ['#ce1141'], accent: '#000000', logoUrl: '/icons/teams/nba/tor.png' },
  'team-sixers': { type: 'basketball', jerseyPattern: 'solid', colors: ['#006bb6'], accent: '#ed174c', logoUrl: '/icons/teams/nba/phi.png' },
  'team-suns': { type: 'basketball', jerseyPattern: 'solid', colors: ['#1d1160'], accent: '#e56020', logoUrl: '/icons/teams/nba/phx.png' },
  'team-bucks': { type: 'basketball', jerseyPattern: 'solid', colors: ['#00471b'], accent: '#eee1c6', logoUrl: '/icons/teams/nba/mil.png' },
  'team-clippers': { type: 'basketball', jerseyPattern: 'solid', colors: ['#c8102e'], accent: '#1d428a', logoUrl: '/icons/teams/nba/lac.png' },
  'team-rockets': { type: 'basketball', jerseyPattern: 'solid', colors: ['#ce1141'], accent: '#000000', logoUrl: '/icons/teams/nba/hou.png' },
  'team-magic': { type: 'basketball', jerseyPattern: 'solid', colors: ['#0077c0'], accent: '#c4ced4', logoUrl: '/icons/teams/nba/orl.png' },
  'team-pacers': { type: 'basketball', jerseyPattern: 'solid', colors: ['#002d62'], accent: '#fdbb30', logoUrl: '/icons/teams/nba/ind.png' },
  'nat-lithuania': { type: 'flag', flagCode: 'lt', colors: ['#fdb913', '#006a44', '#c1272d'] },
  'draft-90s': { type: 'era', initials: '90' },
  'draft-2020s': { type: 'era', initials: '20' },
  'college-ucla': { type: 'college', jerseyPattern: 'solid', colors: ['#2774ae'], accent: '#ffd100', logoUrl: '/icons/teams/college/ucla.png' },
  'college-georgetown': { type: 'college', jerseyPattern: 'solid', colors: ['#041e42'], accent: '#8d817b', logoUrl: '/icons/teams/college/georgetown.png' },
  'college-kansas': { type: 'college', jerseyPattern: 'solid', colors: ['#0051ba'], accent: '#e8000d', logoUrl: '/icons/teams/college/kansas.png' },
  // Basketball other
  'pos-guard': { type: 'position', colors: ['#f97316'], initials: 'G' },
  'pos-forward': { type: 'position', colors: ['#8b5cf6'], initials: 'F' },
  'pos-center': { type: 'position', colors: ['#06b6d4'], initials: 'C' },
  'champ-3plus': { type: 'trophy', colors: ['#ffd700'], awardVariant: 'championship' },
  'champ-1plus': { type: 'trophy', colors: ['#c0c0c0'], awardVariant: 'championship' },
  'mvp': { type: 'award', awardVariant: 'mvp' },
  'allstar': { type: 'allstar', allStarVariant: 'nba' },
  'olympic': { type: 'award', awardVariant: 'olympic' },
  'scoring': { type: 'award', awardVariant: 'scoring' },
  'college-duke': { type: 'college', jerseyPattern: 'solid', colors: ['#003087'], accent: '#ffffff', logoUrl: '/icons/teams/college/duke.png' },
  'college-kentucky': { type: 'college', jerseyPattern: 'solid', colors: ['#0033a0'], accent: '#ffffff', logoUrl: '/icons/teams/college/kentucky.png' },
  'draft-10s': { type: 'era', initials: '10' },
  'draft-00s': { type: 'era', initials: '00' },
  'intl': { type: 'region' },
  // Baseball nationalities
  'nat-dominican': { type: 'flag', flagCode: 'do', colors: ['#002d62', '#fff', '#ce1126'] },
  'nat-venezuela': { type: 'flag', flagCode: 've', colors: ['#ffcc00', '#00247d', '#cf142b'] },
  'nat-japan': { type: 'flag', flagCode: 'jp', colors: ['#fff', '#bc002d'] },
  'nat-puerto-rico': { type: 'flag', flagCode: 'pr', colors: ['#ed0000', '#fff', '#0050f0'] },
  'nat-cuba': { type: 'flag', flagCode: 'cu', colors: ['#002a8f', '#fff', '#cf142b'] },
  // Baseball teams
  'team-yankees': { type: 'mlb', jerseyPattern: 'pinstripes', colors: ['#0c2340', '#ffffff'], accent: '#ffffff', logoUrl: '/icons/teams/mlb/yankees.svg' },
  'team-redsox': { type: 'mlb', jerseyPattern: 'solid', colors: ['#bd3039'], accent: '#ffffff', logoUrl: '/icons/teams/mlb/redsox.svg' },
  'team-dodgers': { type: 'mlb', jerseyPattern: 'solid', colors: ['#005a9c'], accent: '#ffffff', logoUrl: '/icons/teams/mlb/dodgers.svg' },
  'team-cubs': { type: 'mlb', jerseyPattern: 'solid', colors: ['#0e3386'], accent: '#cc3433', logoUrl: '/icons/teams/mlb/cubs.svg' },
  'team-cardinals': { type: 'mlb', jerseyPattern: 'solid', colors: ['#c41e3a'], accent: '#fcd116', logoUrl: '/icons/teams/mlb/cardinals.svg' },
  'team-braves': { type: 'mlb', jerseyPattern: 'solid', colors: ['#13274f'], accent: '#ce1141', logoUrl: '/icons/teams/mlb/braves.svg' },
  'team-giants': { type: 'mlb', jerseyPattern: 'solid', colors: ['#fd5a1e'], accent: '#000000', logoUrl: '/icons/teams/mlb/giants.svg' },
  'team-mets': { type: 'mlb', jerseyPattern: 'solid', colors: ['#002d72'], accent: '#ff5910', logoUrl: '/icons/teams/mlb/mets.svg' },
  'team-astros': { type: 'mlb', jerseyPattern: 'vertical', stripes: ['#002d62', '#eb6e1f', '#002d62'], logoUrl: '/icons/teams/mlb/astros.svg' },
  'team-phillies': { type: 'mlb', jerseyPattern: 'solid', colors: ['#e81828'], accent: '#ffffff', logoUrl: '/icons/teams/mlb/phillies.svg' },
  'team-angels': { type: 'mlb', jerseyPattern: 'solid', colors: ['#ba0021'], accent: '#ffffff', logoUrl: '/icons/teams/mlb/angels.svg' },
  'team-mariners': { type: 'mlb', jerseyPattern: 'vertical', stripes: ['#0c2c56', '#005c5c', '#0c2c56'], logoUrl: '/icons/teams/mlb/mariners.svg' },
  'team-padres': { type: 'mlb', jerseyPattern: 'split', colors: ['#2f241d', '#ffc425'], logoUrl: '/icons/teams/mlb/padres.svg' },
  'team-orioles': { type: 'mlb', jerseyPattern: 'solid', colors: ['#df4601'], accent: '#000000', logoUrl: '/icons/teams/mlb/orioles.svg' },
  'team-tigers': { type: 'mlb', jerseyPattern: 'solid', colors: ['#0c2340'], accent: '#fa4616', logoUrl: '/icons/teams/mlb/tigers.svg' },
  'team-blue-jays': { type: 'mlb', jerseyPattern: 'solid', colors: ['#134a8e'], accent: '#e8291c', logoUrl: '/icons/teams/mlb/blue-jays.svg' },
  'team-nationals': { type: 'mlb', jerseyPattern: 'solid', colors: ['#ab0003'], accent: '#14225a', logoUrl: '/icons/teams/mlb/nationals.svg' },
  'team-marlins': { type: 'mlb', jerseyPattern: 'solid', colors: ['#00a3e0'], accent: '#ff6600', logoUrl: '/icons/teams/mlb/marlins.svg' },
  'team-rangers': { type: 'mlb', jerseyPattern: 'solid', colors: ['#003278'], accent: '#c0111f', logoUrl: '/icons/teams/mlb/rangers.svg' },
  // Baseball positions
  'pos-pitcher': { type: 'position', colors: ['#dc2626'], initials: 'P' },
  'pos-outfield': { type: 'position', colors: ['#22c55e'], initials: 'OF' },
  'pos-infield': { type: 'position', colors: ['#3b82f6'], initials: 'IF' },
  'pos-catcher': { type: 'position', colors: ['#f59e0b'], initials: 'CAT' },
  'pos-dh': { type: 'position', colors: ['#8b5cf6'], initials: 'DH' },
  // Baseball leagues & awards
  'league-al': { type: 'league', colors: ['#041e42', '#c8102e'], initials: 'AL' },
  'league-nl': { type: 'league', colors: ['#1e3a8a', '#dc2626'], initials: 'NL' },
  'award-mvp': { type: 'award', awardVariant: 'mvp' },
  'award-cy-young': { type: 'award', initials: 'CY' },
  'award-world-series': { type: 'trophy', colors: ['#ffd700'] },
  'award-allstar': { type: 'allstar', allStarVariant: 'mlb' },
  'award-hof': { type: 'trophy', colors: ['#c0c0c0'] },
  'award-gold-glove': { type: 'trophy', colors: ['#d4af37'] },
  'batting-title': { type: 'award', initials: 'AVG' },
  'decade-80s': { type: 'era', initials: '80' },
};

function getMeta(categoryId: string, tag: CategoryTag, sport?: Sport): VisualMeta {
  if (CATEGORY_VISUALS[categoryId]) return CATEGORY_VISUALS[categoryId];

  if (tag === 'PLAYED IN' || tag === 'TEAM') {
    if (sport === 'basketball') return { type: 'basketball', colors: ['#1d428a', '#ffc72c'], initials: 'NBA' };
    if (sport === 'baseball') return { type: 'mlb', colors: ['#0c2340', '#0c2340'], accent: '#fff', initials: 'MLB' };
    return { type: 'jersey', colors: ['#1a472a', '#1a472a'], accent: '#fff' };
  }

  return {
    type: tag === 'NATIONALITY' ? 'flag' : tag === 'LEAGUE' ? 'league' : tag === 'WINNER' ? 'trophy' : 'award',
    colors: ['#5865f2'],
  };
}

function FlagCircle({ meta, size = 36 }: { meta: VisualMeta; size?: number }) {
  const code = meta.flagCode;
  if (code) {
    return (
      <div
        className="rounded-full overflow-hidden border-2 border-white/20 shadow-md shrink-0 bg-[#121316]"
        style={{ width: size, height: size }}
      >
        <img
          src={`https://flagcdn.com/w160/${code}.png`}
          srcSet={`https://flagcdn.com/w320/${code}.png 2x`}
          alt=""
          draggable={false}
          className="w-full h-full object-cover select-none"
          loading="lazy"
        />
      </div>
    );
  }

  const colors = meta.colors ?? ['#5865f2', '#fff'];
  return (
    <div
      className="rounded-full overflow-hidden border-2 border-white/20 shadow-md shrink-0 flex"
      style={{ width: size, height: size }}
    >
      {colors.map((c, i) => (
        <div key={i} className="flex-1 h-full" style={{ background: c }} />
      ))}
    </div>
  );
}

function LeagueLogo({
  logoUrl,
  size = 36,
  background,
}: {
  logoUrl: string;
  size?: number;
  background?: string;
}) {
  const pad = background ? Math.max(4, size * 0.1) : 0;

  return (
    <div
      className="shrink-0 flex items-center justify-center drop-shadow-md"
      style={{ width: size, height: size }}
    >
      <div
        className="flex items-center justify-center w-full h-full"
        style={background ? {
          background,
          borderRadius: size * 0.22,
          padding: pad,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
        } : undefined}
      >
        <img
          src={logoUrl}
          alt=""
          draggable={false}
          className="select-none object-contain"
          style={{ width: background ? '92%' : '88%', height: background ? '92%' : '88%' }}
          loading="lazy"
        />
      </div>
    </div>
  );
}

function LeagueBadge({ meta, size = 36, sport }: { meta: VisualMeta; size?: number; sport?: Sport }) {
  if (meta.logoUrl) {
    return (
      <LeagueLogo
        logoUrl={meta.logoUrl}
        size={size}
        background={meta.logoBackground}
      />
    );
  }

  if (sport === 'baseball') {
    return (
      <TeamJerseyIcon
        meta={{ ...meta, jerseyPattern: meta.jerseyPattern ?? 'solid' }}
        sport="baseball"
        size={size}
      />
    );
  }

  const c1 = meta.colors?.[0] ?? '#3d195b';
  const c2 = meta.colors?.[1] ?? '#00ff85';
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" className="shrink-0 drop-shadow-md">
      <path d="M20 4 C13 4 8 10 8 17 C8 26 20 40 20 40 C20 40 32 26 32 17 C32 10 27 4 20 4Z" fill={c1} stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      <text x="20" y="20" textAnchor="middle" fill={c2} fontSize="7" fontWeight="bold" fontFamily="system-ui">
        {meta.initials ?? 'LG'}
      </text>
    </svg>
  );
}

function TrophyIcon({ size = 36, color = '#f0b232' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 44" className="shrink-0 drop-shadow-md">
      <path d="M12 8 h16 v4 c0 6-3 10-8 10 s-8-4-8-10 v-4z" fill={color} />
      <path d="M8 10 h4 v2 c0 4-2 6-4 6 v-6z M32 10 h-4 v2 c0 4 2 6 4 6 v-6z" fill={color} opacity="0.7" />
      <rect x="16" y="22" width="8" height="4" fill={color} opacity="0.8" />
      <rect x="12" y="26" width="16" height="4" rx="1" fill={color} />
      <rect x="10" y="30" width="20" height="5" rx="2" fill={color} opacity="0.9" />
    </svg>
  );
}

function PositionIcon({ color, size = 36, role }: { color: string; size?: number; role?: string }) {
  const label = role?.toUpperCase() ?? 'POS';
  const isSoccer = ['FW', 'MF', 'DF', 'GK'].includes(label);
  const isBasketball = ['G', 'F', 'C'].includes(label);
  const isBaseball = ['P', 'OF', 'IF', 'CAT', 'DH'].includes(label);

  const fontSize = label.length > 2 ? 8.5 : label.length > 1 ? 11 : 13;

  const marker = (() => {
    if (label === 'FW') return { cx: 24, cy: 12 };
    if (label === 'MF') return { cx: 24, cy: 19 };
    if (label === 'DF') return { cx: 24, cy: 26 };
    if (label === 'GK') return { cx: 24, cy: 29 };
    if (label === 'G') return { cx: 31, cy: 21 };
    if (label === 'F') return { cx: 17, cy: 18 };
    if (label === 'C') return { cx: 24, cy: 14 };
    if (label === 'P') return { cx: 24, cy: 20 };
    if (label === 'OF') return { cx: 24, cy: 11 };
    if (label === 'IF') return { cx: 24, cy: 20 };
    if (label === 'CAT') return { cx: 24, cy: 28 };
    if (label === 'DH') return { cx: 31, cy: 19 };
    return { cx: 24, cy: 19 };
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="shrink-0 drop-shadow-md">
      <rect x="4" y="4" width="40" height="40" rx="10" fill={`${color}14`} stroke={color} strokeWidth="2" />

      {isSoccer && (
        <g opacity="0.4" stroke={color} strokeWidth="1" fill="none">
          <rect x="11" y="8" width="26" height="22" rx="2" />
          <line x1="11" y1="19" x2="37" y2="19" />
          <circle cx="24" cy="19" r="4" />
          <rect x="18" y="8" width="12" height="4" rx="1" />
          <rect x="18" y="26" width="12" height="4" rx="1" />
        </g>
      )}

      {isBasketball && (
        <g opacity="0.4" stroke={color} strokeWidth="1" fill="none">
          <rect x="13" y="8" width="22" height="22" rx="2" />
          <rect x="17" y="8" width="14" height="10" rx="1" />
          <path d="M 17 13 Q 24 18 31 13" />
        </g>
      )}

      {isBaseball && (
        <g opacity="0.4" stroke={color} strokeWidth="1" fill="none">
          <path d="M 24 9 L 34 19 L 24 29 L 14 19 Z" />
        </g>
      )}

      <circle cx={marker.cx} cy={marker.cy} r="3.5" fill={color} stroke="#fff" strokeWidth="1.2" />

      <rect x="8" y="32" width="32" height="11" rx="5.5" fill={color} />
      <text
        x="24"
        y="40"
        textAnchor="middle"
        fill="#fff"
        fontSize={fontSize}
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
        letterSpacing="-0.3"
      >
        {label}
      </text>
    </svg>
  );
}

function EraBadge({ initials = '10', size = 36 }: { initials?: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-[#2b2d31] border border-[#3f4147] flex items-center justify-center font-mono font-bold text-[#f2f3f5] shrink-0 shadow-md"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      '{initials}
    </div>
  );
}

function AwardBadge({ initials, size = 36 }: { initials?: string; size?: number }) {
  return (
    <div
      className="rounded-full bg-gradient-to-br from-[#f0b232] to-[#d97706] flex items-center justify-center font-black text-[#1a1a1a] shrink-0 shadow-md"
      style={{ width: size, height: size, fontSize: initials && initials.length > 2 ? size * 0.22 : size * 0.3 }}
    >
      {initials ?? '★'}
    </div>
  );
}

function RegionIcon({ size = 36 }: { meta?: VisualMeta; size?: number }) {
  return <AnimatedGlobeIcon size={size} />;
}

interface CategoryIconProps {
  categoryId: string;
  tag: CategoryTag;
  size?: number;
  sport?: Sport;
}

export function CategoryIcon({ categoryId, tag, size = 38, sport }: CategoryIconProps) {
  const meta = getMeta(categoryId, tag, sport);

  switch (meta.type) {
    case 'flag': return <FlagCircle meta={meta} size={size} />;
    case 'jersey': return <TeamJerseyIcon meta={meta} sport="soccer" size={size} />;
    case 'league': return <LeagueBadge meta={meta} size={size} sport={sport} />;
    case 'trophy':
      if (meta.logoUrl) {
        return (
          <LeagueLogo
            logoUrl={meta.logoUrl}
            size={size}
            background={meta.logoBackground}
          />
        );
      }
      return meta.awardVariant
        ? <BasketballAwardIcon variant={meta.awardVariant} size={size} sport={sport} />
        : <TrophyIcon size={size} color={meta.colors?.[0]} />;
    case 'basketball': return <TeamJerseyIcon meta={meta} sport="basketball" size={size} />;
    case 'mlb': return <TeamJerseyIcon meta={meta} sport="baseball" size={size} />;
    case 'position':
      if (meta.logoUrl) {
        return (
          <LeagueLogo
            logoUrl={meta.logoUrl}
            size={size}
            background={meta.logoBackground}
          />
        );
      }
      return <PositionIcon color={meta.colors?.[0] ?? '#f0b232'} size={size} role={meta.initials} />;
    case 'era': return <EraBadge initials={meta.initials} size={size} />;
    case 'award':
      return meta.awardVariant
        ? <BasketballAwardIcon variant={meta.awardVariant} size={size} sport={sport} />
        : <AwardBadge initials={meta.initials} size={size} />;
    case 'college': return <TeamJerseyIcon meta={meta} sport="basketball" size={size} />;
    case 'allstar': return <AllStarIcon variant={meta.allStarVariant ?? 'nba'} size={size} />;
    case 'region': return <RegionIcon meta={meta} size={size} />;
    default: return <AwardBadge size={size} />;
  }
}
