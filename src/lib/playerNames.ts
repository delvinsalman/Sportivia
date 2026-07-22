/** Display-name pool for brand-new profiles (max 18 chars — matches home editor). */

const NAME_POOL = [
  // Sporty handles
  'AceShot', 'AirBall', 'AllNet', 'AnkleBreak', 'Backboard', 'BenchBoss',
  'Blueline', 'BoardKing', 'BoxScore', 'Breakaway', 'BuzzerBeater', 'CageAce',
  'CenterIce', 'CheckDown', 'ChipShot', 'ClutchKick', 'CornerKick', 'CourtAce',
  'Crossbar', 'CurveBall', 'DashLane', 'DeadBall', 'DeepThreat', 'DekeKing',
  'DoublePlay', 'DropGoal', 'Endzone', 'FastBreak', 'FieldGoal', 'FirstDown',
  'FreeKick', 'FullCourt', 'GameWinner', 'GoalRush', 'GoldenBoot', 'Gridiron',
  'HatTrick', 'HighStick', 'HomeRun', 'IceBreaker', 'JumpShot', 'Kickoff',
  'LaneSteal', 'LastShot', 'LineDrive', 'LobPass', 'LongBomb', 'Midfield',
  'NetFront', 'NetMinder', 'NoLook', 'Offsides', 'OnDeck', 'Overtime',
  'OwnGoal', 'ParkTheBus', 'PenaltyKick', 'PickSix', 'PitchAce', 'PlayAction',
  'PointGuard', 'PowerPlay', 'PuckLuck', 'PuntReturn', 'QuickSnap', 'RedCard',
  'RedZone', 'RimRock', 'RoadRunner', 'RookieRun', 'SafeHit', 'ScreenPass',
  'SetPiece', 'Shootout', 'Sideline', 'SlapShot', 'SlideTackle', 'SlotShot',
  'SnapCount', 'SoftHands', 'SpinMove', 'SplitEnd', 'SportStar', 'SprintKing',
  'StealCity', 'StrikeZone', 'SuddenDeath', 'SweetSpot', 'TackleBox', 'TapIn',
  'ThirdDown', 'TipDrill', 'TopBin', 'Touchdown', 'TrapPlay', 'TripleAxel',
  'TurboPass', 'TwoMinute', 'Upper90', 'Volleyball', 'WalkOff', 'WideOpen',
  'WingPlay', 'ZoneBlitz',

  // Vibey / casual
  'Astra', 'Atlas', 'Blaze', 'Bolt', 'Breeze', 'Cascade', 'Cipher', 'Comet',
  'Cosmo', 'Crimson', 'Drift', 'Echo', 'Ember', 'Falcon', 'Flux', 'Frost',
  'Ghost', 'Glitch', 'Haze', 'Helix', 'Horizon', 'Ignite', 'Jade', 'Jet',
  'Karma', 'Kite', 'Lumen', 'Lunar', 'Lynx', 'Maven', 'Mirage', 'Nebula',
  'Nova', 'Onyx', 'Orbit', 'Phoenix', 'Pixel', 'Pulse', 'Quasar', 'Raven',
  'Riot', 'Rogue', 'Sapphire', 'Shadow', 'Sonic', 'Spark', 'Storm', 'Summit',
  'Tide', 'Titan', 'Turbo', 'Vortex', 'Wave', 'Zenith', 'Zephyr',

  // Numbered tags
  'Ace07', 'Baller9', 'Captain12', 'Clutch3', 'Dash22', 'Elite88', 'Flash10',
  'Gamer17', 'Goalie1', 'Hero99', 'Icon23', 'Joker7', 'King21', 'Legend8',
  'MVP16', 'Nitro5', 'Prodigy4', 'Rookie11', 'Scout6', 'Star13', 'Team14',
  'Ultra2', 'Viper15', 'Wolf19', 'XRay18', 'Yolo20', 'Zed25',

  // Compound fun
  'BlueSpark', 'BrightPass', 'CityLights', 'CoolHand', 'DarkHorse', 'DayBreak',
  'DreamRun', 'FireFly', 'GoldRush', 'GreenWave', 'HighTide', 'IronWill',
  'LuckyDog', 'NightOwl', 'OpenField', 'PrimeTime', 'QuickFire', 'RainMaker',
  'SkyLine', 'SnowFox', 'SunRise', 'TrueBlue', 'WildCard', 'WindRush',

  // More variety
  'Archer', 'Baron', 'Beacon', 'Canyon', 'Cedar', 'Chaser', 'Cobalt', 'Copper',
  'Dagger', 'Delta', 'Diesel', 'Dynamo', 'Eagle', 'Enigma', 'Fable', 'Fang',
  'Forge', 'Fury', 'Galaxy', 'Grit', 'Hawk', 'Hunter', 'Impulse', 'Javelin',
  'Jester', 'Knight', 'Lance', 'Lotus', 'Magnet', 'Meteor', 'Monarch', 'Nimbus',
  'Nomad', 'Oracle', 'Outlaw', 'Paladin', 'Patriot', 'Pioneer', 'Prism', 'Quest',
  'Radar', 'Ranger', 'Rebel', 'Reckon', 'Relay', 'Remy', 'Ridge', 'Rift',
  'River', 'Rocket', 'Rune', 'Saber', 'Scout', 'Sentinel', 'Sierra', 'Signal',
  'Slate', 'Spectre', 'Spire', 'Stellar', 'Stride', 'Surge', 'Swift', 'Tempest',
  'Thunder', 'Torch', 'Trail', 'Trek', 'Trinity', 'Trophy', 'Vector', 'Vega',
  'Velvet', 'Vertex', 'Volt', 'Voyager', 'Warden', 'Whisper', 'Wildfire', 'Wraith',

  // Extra sports flavor
  'AlleyOop', 'AssistBomb', 'Baseline', 'Beater', 'BlockParty', 'Bogey',
  'Bullpen', 'CarryOver', 'CleanSheet', 'Clipper', 'Closer', 'Dinger',
  'DraftPick', 'DriveWay', 'DunkCity', 'FaceOff', 'FoulTip', 'GoalPost',
  'HalfCourt', 'HoleInOne', 'InBounds', 'KickSave', 'Layup', 'MatchPoint',
  'NoHitter', 'OnPace', 'PostUp', 'PowerForward', 'Rebound', 'RinkRat',
  'Scramble', 'ShortStop', 'Shutout', 'Skyhook', 'Slider', 'Southpaw',
  'Spike', 'Steal', 'Stoppage', 'Swish', 'TipOff', 'Trap', 'TripleDouble',
  'Turnover', 'Wingman', 'Yardage',
] as const;

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Pick a random display name from the pool (fits the 18-char name field). */
export function pickRandomPlayerName(random: () => number = Math.random): string {
  const index = Math.floor(random() * NAME_POOL.length) % NAME_POOL.length;
  return NAME_POOL[index]!;
}

/** Deterministic pick — useful for tests / stable previews. */
export function pickPlayerNameFromSeed(seed: string): string {
  const index = hashSeed(seed) % NAME_POOL.length;
  return NAME_POOL[index]!;
}

export const PLAYER_NAME_POOL_SIZE = NAME_POOL.length;
