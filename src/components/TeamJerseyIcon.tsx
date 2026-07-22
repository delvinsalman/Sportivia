export type JerseySport = 'soccer' | 'basketball' | 'baseball' | 'football' | 'hockey';
export type JerseyPattern = 'solid' | 'vertical' | 'horizontal' | 'pinstripes' | 'hoops' | 'split';

export interface TeamJerseyMeta {
  colors?: string[];
  stripes?: string[];
  accent?: string;
  initials?: string;
  logoUrl?: string;
  jerseyPattern?: JerseyPattern;
}

/** Detailed basketball tank — viewBox 0 0 200 250 */
const BASKETBALL_KIT_BODY = `M 70 40 L 85 40 Q 100 68 115 40 L 130 40 Q 122 75 145 95 L 140 220 L 60 220 L 55 95 Q 78 75 70 40 Z`;

const BASKETBALL_VIEW_W = 200;
const BASKETBALL_VIEW_H = 250;

/** NFL kit — viewBox 0 0 400 500 */
const NFL_VIEW_W = 400;
const NFL_VIEW_H = 500;
const NFL_BODY = `M 80,60 C 80,60 70,65 60,80 L 55,100 L 50,120 L 45,200 L 40,280 L 38,320 L 40,360 L 45,400 L 55,440 L 65,460 L 75,470 L 85,475 L 100,478 L 150,480 L 200,482 L 250,480 L 300,478 L 315,475 L 325,470 L 335,460 L 345,440 L 355,400 L 360,360 L 362,320 L 360,280 L 355,200 L 350,120 L 345,100 L 340,80 C 330,65 320,60 320,60 L 200,50 Z`;
const NFL_LEFT_SLEEVE = `M 60,80 L 40,95 L 25,120 L 20,150 L 25,180 L 35,200 L 45,210 L 55,200 L 50,150 L 55,120 L 60,100 Z`;
const NFL_RIGHT_SLEEVE = `M 340,80 L 360,95 L 375,120 L 380,150 L 375,180 L 365,200 L 355,210 L 345,200 L 350,150 L 345,120 L 340,100 Z`;

/** Long-sleeve hockey sweater inspired by a classic NHL jersey silhouette. */
const HOCKEY_VIEW_W = 200;
const HOCKEY_VIEW_H = 220;
const HOCKEY_BODY = `M 66 38 Q 82 30 100 30 Q 118 30 134 38
  L 143 68 L 151 184 Q 126 192 100 192 Q 74 192 49 184 L 57 68 Z`;
const HOCKEY_LEFT_SLEEVE = `M 61 43 Q 48 43 38 54 L 18 104 L 4 168 L 34 180 L 57 111 L 70 58 Z`;
const HOCKEY_RIGHT_SLEEVE = `M 139 43 Q 152 43 162 54 L 182 104 L 196 168 L 166 180 L 143 111 L 130 58 Z`;

/** Detailed baseball button-up — viewBox 0 0 200 250 */
const BASEBALL_KIT = {
  leftSleeve: 'M 84 50 L 55 50 L 15 80 L 32 110 L 60 95 Z',
  rightSleeve: 'M 116 50 L 145 50 L 185 80 L 168 110 L 140 95 Z',
  body: 'M 84 50 Q 100 78 116 50 L 140 95 L 140 220 Q 100 228 60 220 L 60 95 Z',
  neckTrim: 'M 84 50 Q 100 78 116 50',
  leftCuffTrim: 'M 22 83 L 36 107',
  rightCuffTrim: 'M 178 83 L 164 107',
};

const BASEBALL_VIEW_W = 200;
const BASEBALL_VIEW_H = 250;
const SOCCER_KIT = {
  body: `M 60 35 C 60 35, 55 40, 52 48 L 40 130 C 38 142, 42 155, 50 162 L 70 175 C 78 180, 85 182, 100 182 C 115 182, 122 180, 130 175 L 150 162 C 158 155, 162 142, 160 130 L 148 48 C 145 40, 140 35, 140 35 Z`,
  leftSleeve: `M 52 48 C 42 50, 28 58, 24 72 C 20 86, 26 100, 36 108 L 50 100 C 44 90, 42 78, 48 68 Z`,
  rightSleeve: `M 148 48 C 158 50, 172 58, 176 72 C 180 86, 174 100, 164 108 L 150 100 C 156 90, 158 78, 152 68 Z`,
  leftCuff: `M 24 72 C 22 78, 24 86, 28 92 L 38 100 C 40 94, 40 88, 36 82 Z`,
  rightCuff: `M 176 72 C 178 78, 176 86, 172 92 L 162 100 C 160 94, 160 88, 164 82 Z`,
  collar: `M 70 38 C 75 34, 85 32, 100 32 C 115 32, 125 34, 130 38 L 120 58 C 112 52, 100 48, 100 48 C 100 48, 88 52, 80 58 Z`,
  collarInner: `M 80 58 C 88 52, 100 48, 100 48 C 100 48, 112 52, 120 58 C 114 64, 106 66, 100 66 C 94 66, 86 64, 80 58 Z`,
};

const SOCCER_VIEW_W = 200;
const SOCCER_VIEW_H = 220;

const SOCCER_BODY = `M 21 5 L 24 10 L 26 11 L 28 10 L 31 5
  C 36 6 42 11 44 18 L 46 26 L 43 29 L 40 24
  L 38 54 L 14 54 L 12 24 L 9 29 L 6 26 L 8 18
  C 10 11 16 6 21 5 Z`;

const BASKETBALL_BODY = `M 10 5
  H 18
  Q 26 13 34 5
  H 42
  L 46 15
  Q 48 26 45 34
  L 44 54
  H 8
  L 7 34
  Q 4 26 6 15
  L 10 5 Z`;

const BASEBALL_BODY = SOCCER_BODY;

function bodyPath(sport: JerseySport) {
  if (sport === 'basketball') return BASKETBALL_BODY;
  return sport === 'baseball' ? BASEBALL_BODY : SOCCER_BODY;
}

function parseHex(hex: string): [number, number, number] | null {
  const normalized = hex.replace('#', '');
  if (normalized.length === 3) {
    const [r, g, b] = normalized.split('');
    return [
      parseInt(r + r, 16),
      parseInt(g + g, 16),
      parseInt(b + b, 16),
    ];
  }
  if (normalized.length !== 6) return null;
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${[clamp(r), clamp(g), clamp(b)].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

function adjustColor(hex: string, amount: number): string {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  if (amount >= 0) {
    return toHex(r + (255 - r) * amount, g + (255 - g) * amount, b + (255 - b) * amount);
  }
  const factor = 1 + amount;
  return toHex(r * factor, g * factor, b * factor);
}

function isLightColor(hex: string): boolean {
  const rgb = parseHex(hex);
  if (!rgb) return false;
  const [r, g, b] = rgb;
  return (r * 299 + g * 587 + b * 114) / 1000 > 170;
}

function patternColors(meta: TeamJerseyMeta): string[] {
  if (meta.stripes?.length) return meta.stripes;
  const primary = meta.colors?.[0] ?? '#1a472a';
  const secondary = meta.colors?.[1] ?? meta.accent ?? '#ffffff';
  return [primary, secondary];
}

function jerseyPattern(meta: TeamJerseyMeta): JerseyPattern {
  return meta.jerseyPattern ?? (meta.stripes ? 'vertical' : 'solid');
}

function PatternLayer({
  uid,
  body,
  meta,
}: {
  uid: string;
  body: string;
  meta: TeamJerseyMeta;
}) {
  const pattern = jerseyPattern(meta);
  const colors = patternColors(meta);
  const primary = colors[0];
  const secondary = colors[1] ?? meta.accent ?? '#fff';

  if (pattern === 'solid') {
    return <path d={body} fill={primary} />;
  }

  return (
    <>
      <path d={body} fill={pattern === 'vertical' ? '#f4f4f4' : primary} />
      <g clipPath={`url(#${uid}-body)`}>
        {pattern === 'vertical' &&
          (meta.stripes ?? colors).map((c, i) => (
            <rect key={i} x={14 + i * 5.5} y="5" width="5.5" height="50" fill={c} />
          ))}
        {pattern === 'horizontal' &&
          [0, 1, 2, 3, 4].map(i => (
            <rect
              key={i}
              x="12"
              y={14 + i * 8}
              width="28"
              height="8"
              fill={i % 2 === 0 ? colors[0] : colors[1] ?? '#fff'}
            />
          ))}
        {pattern === 'hoops' &&
          Array.from({ length: 6 }, (_, i) => (
            <rect
              key={i}
              x="12"
              y={10 + i * 7.5}
              width="28"
              height="7.5"
              fill={i % 2 === 0 ? primary : secondary}
            />
          ))}
        {pattern === 'pinstripes' &&
          Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1={15 + i * 2.6}
              y1="8"
              x2={15 + i * 2.6}
              y2="54"
              stroke={secondary}
              strokeWidth="0.5"
              opacity="0.35"
            />
          ))}
        {pattern === 'split' && (
          <>
            <rect x="12" y="5" width="14" height="50" fill={primary} />
            <rect x="26" y="5" width="14" height="50" fill={secondary} />
          </>
        )}
      </g>
    </>
  );
}

function JerseyDetails({
  sport,
  body,
  meta,
  accent,
}: {
  sport: JerseySport;
  body: string;
  meta: TeamJerseyMeta;
  accent: string;
}) {
  const trim = meta.accent ?? accent;

  if (sport === 'soccer') {
    return (
      <>
        <path d="M 21 5 C 24 8 26 9 28 8 C 30 8 31 6 31 5" fill="none" stroke={trim} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 6 26 L 12 24" stroke={trim} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        <path d="M 46 26 L 40 24" stroke={trim} strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
        <path d="M 14 54 L 38 54" stroke={trim} strokeWidth="1.2" opacity="0.35" />
      </>
    );
  }

  if (sport === 'basketball') {
    return (
      <>
        <path d="M 18 6 Q 26 12 34 6" fill="none" stroke={trim} strokeWidth="1.8" strokeLinecap="round" opacity="0.85" />
        <path d="M 6 15 Q 4 26 7 34" fill="none" stroke={trim} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
        <path d="M 46 15 Q 48 26 45 34" fill="none" stroke={trim} strokeWidth="2.2" strokeLinecap="round" opacity="0.9" />
        <path d="M 8 51 H 44" fill="none" stroke={trim} strokeWidth="2.4" strokeLinecap="round" opacity="0.65" />
        <path d={body} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1.5" strokeLinejoin="round" />
      </>
    );
  }

  return (
    <>
      <line x1="26" y1="11" x2="26" y2="50" stroke={trim} strokeWidth="0.9" opacity="0.4" />
      {[18, 24, 30, 36, 42].map(y => (
        <circle key={y} cx="26" cy={y} r="0.9" fill={trim} opacity="0.55" />
      ))}
      <path d="M 21 5 C 24 8 26 9 28 8 C 30 8 31 6 31 5" fill="none" stroke={trim} strokeWidth="1.3" />
      <path d="M 6 26 L 12 24" stroke={trim} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      <path d="M 46 26 L 40 24" stroke={trim} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
    </>
  );
}

function jerseyHeight(sport: JerseySport, size: number) {
  if (sport === 'soccer') return size * (SOCCER_VIEW_H / SOCCER_VIEW_W);
  if (sport === 'basketball') return size * (BASKETBALL_VIEW_H / BASKETBALL_VIEW_W);
  if (sport === 'baseball') return size * (BASEBALL_VIEW_H / BASEBALL_VIEW_W);
  if (sport === 'football') return size * (NFL_VIEW_H / NFL_VIEW_W);
  if (sport === 'hockey') return size * (HOCKEY_VIEW_H / HOCKEY_VIEW_W);
  return size * 1.12;
}

function SoccerJerseyGraphic({
  uid,
  meta,
  size,
}: {
  uid: string;
  meta: TeamJerseyMeta;
  size: number;
}) {
  const colors = patternColors(meta);
  const primary = colors[0];
  const secondary = colors[1] ?? meta.accent ?? '#ffffff';
  const accent = meta.accent ?? secondary;
  const pattern = jerseyPattern(meta);
  const stroke = isLightColor(primary) ? adjustColor(primary, -0.35) : adjustColor(primary, -0.22);
  const cuffFill = meta.accent && meta.accent.toLowerCase() !== primary.toLowerCase()
    ? meta.accent
    : isLightColor(primary) ? adjustColor(primary, -0.12) : '#f0f0f0';
  const cuffStroke = adjustColor(cuffFill, -0.2);
  const collarTop = adjustColor(accent, 0.35);
  const collarBottom = adjustColor(accent, -0.08);
  const collarStroke = adjustColor(accent, -0.25);
  const height = size * (SOCCER_VIEW_H / SOCCER_VIEW_W);
  const kitFill = `url(#${uid}-kit-fill)`;
  const stripes = meta.stripes ?? colors;

  return (
    <svg width={size} height={height} viewBox={`0 0 ${SOCCER_VIEW_W} ${SOCCER_VIEW_H}`} className="block">
      <defs>
        <filter id={`${uid}-shadow`} x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.22" />
        </filter>
        {pattern === 'solid' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(primary, 0.08)} />
            <stop offset="100%" stopColor={adjustColor(primary, -0.14)} />
          </linearGradient>
        )}
        {pattern === 'split' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        )}
        {pattern === 'vertical' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            {stripes.flatMap((color, i) => {
              const start = (i / stripes.length) * 100;
              const end = ((i + 1) / stripes.length) * 100;
              return [
                <stop key={`${i}-a`} offset={`${start}%`} stopColor={color} />,
                <stop key={`${i}-b`} offset={`${end}%`} stopColor={color} />,
              ];
            })}
          </linearGradient>
        )}
        {(pattern === 'horizontal' || pattern === 'hoops') && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        )}
        <linearGradient id={`${uid}-collar`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={collarTop} />
          <stop offset="100%" stopColor={collarBottom} />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="210" rx="42" ry="4" fill="#000" opacity="0.18" />

      <path d={SOCCER_KIT.body} fill={kitFill} stroke={stroke} strokeWidth="2" filter={`url(#${uid}-shadow)`} />
      <path d={SOCCER_KIT.leftSleeve} fill={kitFill} stroke={stroke} strokeWidth="2" />
      <path d={SOCCER_KIT.rightSleeve} fill={kitFill} stroke={stroke} strokeWidth="2" />

      <path d={SOCCER_KIT.leftCuff} fill={cuffFill} stroke={cuffStroke} strokeWidth="1.5" />
      <path d={SOCCER_KIT.rightCuff} fill={cuffFill} stroke={cuffStroke} strokeWidth="1.5" />

      <path d={SOCCER_KIT.collar} fill={`url(#${uid}-collar)`} stroke={collarStroke} strokeWidth="1.8" />
      <path d={SOCCER_KIT.collarInner} fill="#2a2a3a" opacity="0.28" />

      <path d="M 52 48 L 60 60" stroke={stroke} strokeWidth="1.5" opacity="0.55" />
      <path d="M 148 48 L 140 60" stroke={stroke} strokeWidth="1.5" opacity="0.55" />
      <path
        d="M 65 172 C 78 178, 90 180, 100 180 C 110 180, 122 178, 135 172"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        opacity="0.45"
      />
    </svg>
  );
}

function BasketballJerseyGraphic({
  uid,
  meta,
  size,
}: {
  uid: string;
  meta: TeamJerseyMeta;
  size: number;
}) {
  const colors = patternColors(meta);
  const primary = colors[0];
  const secondary = colors[1] ?? meta.accent ?? '#ffffff';
  const accent = meta.accent ?? secondary;
  const pattern = jerseyPattern(meta);
  const stroke = isLightColor(primary) ? adjustColor(primary, -0.32) : adjustColor(primary, -0.2);
  const sideStripe = isLightColor(primary) ? adjustColor(primary, -0.14) : adjustColor(primary, -0.28);
  const trim = accent;
  const trimSoft = adjustColor(trim, isLightColor(trim) ? -0.12 : 0.18);
  const height = size * (BASKETBALL_VIEW_H / BASKETBALL_VIEW_W);
  const kitFill = `url(#${uid}-kit-fill)`;
  const stripes = meta.stripes ?? colors;

  return (
    <svg width={size} height={height} viewBox={`0 0 ${BASKETBALL_VIEW_W} ${BASKETBALL_VIEW_H}`} className="block">
      <defs>
        <filter id={`${uid}-shadow`} x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.24" />
        </filter>
        <pattern id={`${uid}-mesh`} width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#ffffff" opacity="0.09" />
        </pattern>
        {pattern === 'solid' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(primary, 0.1)} />
            <stop offset="100%" stopColor={adjustColor(primary, -0.16)} />
          </linearGradient>
        )}
        {pattern === 'split' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        )}
        {pattern === 'vertical' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            {stripes.flatMap((color, i) => {
              const start = (i / stripes.length) * 100;
              const end = ((i + 1) / stripes.length) * 100;
              return [
                <stop key={`${i}-a`} offset={`${start}%`} stopColor={color} />,
                <stop key={`${i}-b`} offset={`${end}%`} stopColor={color} />,
              ];
            })}
          </linearGradient>
        )}
        {(pattern === 'horizontal' || pattern === 'hoops') && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        )}
        {pattern === 'pinstripes' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(primary, 0.06)} />
            <stop offset="100%" stopColor={adjustColor(primary, -0.12)} />
          </linearGradient>
        )}
      </defs>

      <ellipse cx="100" cy="238" rx="44" ry="4" fill="#000" opacity="0.2" />

      <path
        d={BASKETBALL_KIT_BODY}
        fill={kitFill}
        stroke={stroke}
        strokeWidth="2"
        filter={`url(#${uid}-shadow)`}
      />
      <path d={BASKETBALL_KIT_BODY} fill={`url(#${uid}-mesh)`} />

      {pattern === 'pinstripes' &&
        Array.from({ length: 13 }, (_, i) => {
          const x = 64 + i * 5.8;
          return (
            <line
              key={i}
              x1={x}
              y1="48"
              x2={x}
              y2="218"
              stroke={secondary}
              strokeWidth="1.2"
              opacity="0.35"
            />
          );
        })}

      <path d="M 57 105 L 62 220" fill="none" stroke={sideStripe} strokeWidth="2.5" opacity="0.55" />
      <path d="M 143 105 L 138 220" fill="none" stroke={sideStripe} strokeWidth="2.5" opacity="0.55" />

      <path
        d="M 85 40 Q 100 68 115 40"
        fill="none"
        stroke={trim}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 130 40 Q 122 75 145 95"
        fill="none"
        stroke={trim}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 70 40 Q 78 75 55 95"
        fill="none"
        stroke={trim}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 60 220 L 140 220"
        fill="none"
        stroke={trim}
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 61 216 L 139 216"
        fill="none"
        stroke={trimSoft}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

function BaseballJerseyGraphic({
  uid,
  meta,
  size,
}: {
  uid: string;
  meta: TeamJerseyMeta;
  size: number;
}) {
  const colors = patternColors(meta);
  const primary = colors[0];
  const secondary = colors[1] ?? meta.accent ?? '#ffffff';
  const accent = meta.accent ?? secondary;
  const pattern = jerseyPattern(meta);
  const stroke = isLightColor(primary) ? adjustColor(primary, -0.32) : adjustColor(primary, -0.2);
  const trim = accent;
  const trimSoft = adjustColor(trim, isLightColor(trim) ? -0.1 : 0.15);
  const placketFill = isLightColor(primary) ? adjustColor(primary, -0.08) : adjustColor(primary, -0.18);
  const buttonFill = isLightColor(trim) ? adjustColor(trim, -0.15) : trim;
  const height = size * (BASEBALL_VIEW_H / BASEBALL_VIEW_W);
  const kitFill = `url(#${uid}-kit-fill)`;
  const stripes = meta.stripes ?? colors;
  const buttonYs = [95, 125, 155, 185, 210];

  return (
    <svg width={size} height={height} viewBox={`0 0 ${BASEBALL_VIEW_W} ${BASEBALL_VIEW_H}`} className="block">
      <defs>
        <filter id={`${uid}-shadow`} x="-15%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.24" />
        </filter>
        {pattern === 'solid' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(primary, 0.08)} />
            <stop offset="100%" stopColor={adjustColor(primary, -0.14)} />
          </linearGradient>
        )}
        {pattern === 'split' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        )}
        {pattern === 'vertical' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="100%" y2="0%">
            {stripes.flatMap((color, i) => {
              const start = (i / stripes.length) * 100;
              const end = ((i + 1) / stripes.length) * 100;
              return [
                <stop key={`${i}-a`} offset={`${start}%`} stopColor={color} />,
                <stop key={`${i}-b`} offset={`${end}%`} stopColor={color} />,
              ];
            })}
          </linearGradient>
        )}
        {(pattern === 'horizontal' || pattern === 'hoops') && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primary} />
            <stop offset="50%" stopColor={primary} />
            <stop offset="50%" stopColor={secondary} />
            <stop offset="100%" stopColor={secondary} />
          </linearGradient>
        )}
        {pattern === 'pinstripes' && (
          <linearGradient id={`${uid}-kit-fill`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={adjustColor(primary, 0.05)} />
            <stop offset="100%" stopColor={adjustColor(primary, -0.1)} />
          </linearGradient>
        )}
      </defs>

      <ellipse cx="100" cy="238" rx="44" ry="4" fill="#000" opacity="0.2" />

      <path d={BASEBALL_KIT.leftSleeve} fill={kitFill} stroke={stroke} strokeWidth="1.8" filter={`url(#${uid}-shadow)`} />
      <path d={BASEBALL_KIT.rightSleeve} fill={kitFill} stroke={stroke} strokeWidth="1.8" />
      <path d={BASEBALL_KIT.body} fill={kitFill} stroke={stroke} strokeWidth="2" filter={`url(#${uid}-shadow)`} />

      {pattern === 'pinstripes' &&
        [75, 88, 112, 125].map(x => (
          <line
            key={x}
            x1={x}
            y1="80"
            x2={x}
            y2="222"
            stroke={secondary}
            strokeWidth="1.1"
            opacity="0.32"
          />
        ))}

      <rect x="95" y="71" width="10" height="151" rx="2" fill={placketFill} stroke={trim} strokeWidth="1.2" opacity="0.9" />
      {buttonYs.map(y => (
        <circle key={y} cx="100" cy={y} r="2.5" fill={buttonFill} stroke={stroke} strokeWidth="0.8" />
      ))}

      <path
        d={BASEBALL_KIT.neckTrim}
        fill="none"
        stroke={trim}
        strokeWidth="2.8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d={BASEBALL_KIT.leftCuffTrim}
        fill="none"
        stroke={trim}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d={BASEBALL_KIT.rightCuffTrim}
        fill="none"
        stroke={trim}
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M 60 220 Q 100 228 140 220"
        fill="none"
        stroke={trimSoft}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function FootballJerseyGraphic({
  uid,
  meta,
  size,
}: {
  uid: string;
  meta: TeamJerseyMeta;
  size: number;
}) {
  const colors = patternColors(meta);
  const primary = colors[0];
  const accent = meta.accent ?? colors[1] ?? '#ffffff';
  const sleeve = adjustColor(primary, isLightColor(primary) ? -0.18 : -0.22);
  const collar = adjustColor(primary, isLightColor(primary) ? -0.28 : -0.35);
  const stroke = isLightColor(primary) ? adjustColor(primary, -0.35) : adjustColor(primary, -0.12);
  const stripeLite = adjustColor(accent, isLightColor(accent) ? -0.05 : 0.18);
  const height = size * (NFL_VIEW_H / NFL_VIEW_W);

  return (
    <svg width={size} height={height} viewBox={`0 0 ${NFL_VIEW_W} ${NFL_VIEW_H}`} className="block">
      <defs>
        <linearGradient id={`${uid}-jersey`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={adjustColor(primary, 0.12)} />
          <stop offset="50%" stopColor={primary} />
          <stop offset="100%" stopColor={adjustColor(primary, -0.18)} />
        </linearGradient>
        <linearGradient id={`${uid}-stripe`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="50%" stopColor={stripeLite} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-8%" y="-5%" width="116%" height="116%">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
        <pattern id={`${uid}-fabric`} width="4" height="4" patternUnits="userSpaceOnUse">
          <rect width="4" height="4" fill="transparent" />
          <line x1="0" y1="0" x2="4" y2="0" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          <line x1="0" y1="2" x2="4" y2="2" stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" />
        </pattern>
      </defs>

      <ellipse cx="200" cy="486" rx="88" ry="6" fill="#000" opacity="0.22" />

      <g filter={`url(#${uid}-shadow)`}>
        <path d={NFL_BODY} fill={`url(#${uid}-jersey)`} stroke={stroke} strokeWidth="1.5" />
        <path d={NFL_BODY} fill={`url(#${uid}-fabric)`} opacity="0.45" />
        <path d={NFL_LEFT_SLEEVE} fill={sleeve} stroke={stroke} strokeWidth="1" />
        <path d={NFL_RIGHT_SLEEVE} fill={sleeve} stroke={stroke} strokeWidth="1" />
      </g>

      <ellipse cx="200" cy="58" rx="72" ry="18" fill={collar} stroke={stroke} strokeWidth="2" />
      <ellipse cx="200" cy="56" rx="62" ry="14" fill={adjustColor(collar, 0.08)} stroke={stroke} strokeWidth="1.2" />
      <path d="M 168,52 L 200,72 L 232,52" fill="none" stroke={stroke} strokeWidth="2" />
      <path
        d="M 172,54 L 200,70 L 228,54"
        fill="none"
        stroke={`url(#${uid}-stripe)`}
        strokeWidth="1.5"
        opacity="0.65"
      />

      <path d="M 35,130 L 50,120" stroke={`url(#${uid}-stripe)`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 33,145 L 48,135" stroke={`url(#${uid}-stripe)`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 32,160 L 47,150" stroke={`url(#${uid}-stripe)`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 365,130 L 350,120" stroke={`url(#${uid}-stripe)`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 367,145 L 352,135" stroke={`url(#${uid}-stripe)`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M 368,160 L 353,150" stroke={`url(#${uid}-stripe)`} strokeWidth="4.5" strokeLinecap="round" />

      <path
        d="M 115,100 L 105,200 L 100,300 L 105,400 L 115,470"
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
        opacity="0.18"
      />
      <path
        d="M 285,100 L 295,200 L 300,300 L 295,400 L 285,470"
        stroke={accent}
        strokeWidth="1.5"
        fill="none"
        opacity="0.18"
      />

      <rect x="22" y="195" width="36" height="8" rx="3" fill={collar} stroke={stroke} strokeWidth="0.5" />
      <rect x="342" y="195" width="36" height="8" rx="3" fill={collar} stroke={stroke} strokeWidth="0.5" />
      <rect x="80" y="472" width="240" height="5" rx="2" fill={`url(#${uid}-stripe)`} opacity="0.45" />
    </svg>
  );
}

function HockeyJerseyGraphic({
  uid,
  meta,
  size,
}: {
  uid: string;
  meta: TeamJerseyMeta;
  size: number;
}) {
  const colors = patternColors(meta);
  const primary = colors[0];
  const accent = meta.accent ?? colors[1] ?? '#ffffff';
  const stroke = isLightColor(primary) ? adjustColor(primary, -0.38) : adjustColor(primary, -0.18);
  const shadow = adjustColor(primary, -0.2);
  const height = size * (HOCKEY_VIEW_H / HOCKEY_VIEW_W);

  return (
    <svg width={size} height={height} viewBox={`0 0 ${HOCKEY_VIEW_W} ${HOCKEY_VIEW_H}`} className="block">
      <defs>
        <linearGradient id={`${uid}-hockey`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={adjustColor(primary, 0.12)} />
          <stop offset="52%" stopColor={primary} />
          <stop offset="100%" stopColor={shadow} />
        </linearGradient>
        <filter id={`${uid}-hockey-shadow`} x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
        <pattern id={`${uid}-hockey-knit`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 1 H4 M0 3 H4" stroke="#fff" strokeWidth="0.35" opacity="0.05" />
        </pattern>
      </defs>

      <ellipse cx="100" cy="207" rx="48" ry="5" fill="#000" opacity="0.22" />
      <g filter={`url(#${uid}-hockey-shadow)`}>
        <path d={HOCKEY_LEFT_SLEEVE} fill={`url(#${uid}-hockey)`} stroke={stroke} strokeWidth="2" />
        <path d={HOCKEY_RIGHT_SLEEVE} fill={`url(#${uid}-hockey)`} stroke={stroke} strokeWidth="2" />
        <path d={HOCKEY_BODY} fill={`url(#${uid}-hockey)`} stroke={stroke} strokeWidth="2" />
      </g>
      <path d={HOCKEY_LEFT_SLEEVE} fill={`url(#${uid}-hockey-knit)`} />
      <path d={HOCKEY_RIGHT_SLEEVE} fill={`url(#${uid}-hockey-knit)`} />
      <path d={HOCKEY_BODY} fill={`url(#${uid}-hockey-knit)`} />

      <path d="M72 35 Q100 62 128 35 L117 28 Q100 43 83 28 Z" fill={stroke} />
      <path d="M82 29 Q100 44 118 29" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />

      <path d="M48 151 L151 151 L151 166 L48 166 Z" fill={accent} opacity="0.96" />
      <path d="M49 170 L151 170 L151 181 Q100 188 49 181 Z" fill={accent} opacity="0.55" />
      <path d="M10 146 L39 156 L34 180 L4 168 Z" fill={accent} />
      <path d="M190 146 L161 156 L166 180 L196 168 Z" fill={accent} />
      <path d="M23 116 L48 126" stroke={accent} strokeWidth="8" opacity="0.7" />
      <path d="M177 116 L152 126" stroke={accent} strokeWidth="8" opacity="0.7" />
    </svg>
  );
}

export function TeamJerseyIcon({
  meta,
  sport,
  size = 36,
}: {
  meta: TeamJerseyMeta;
  sport: JerseySport;
  size?: number;
}) {
  const body = bodyPath(sport);
  const colors = patternColors(meta);
  const accent = meta.accent ?? colors[1] ?? '#ffffff';
  const uid = `tj-${sport}-${colors[0].replace('#', '')}`;
  const height = jerseyHeight(sport, size);

  return (
    <div className="relative shrink-0 drop-shadow-lg" style={{ width: size, height }}>
      {sport === 'soccer' ? (
        <SoccerJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : sport === 'basketball' ? (
        <BasketballJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : sport === 'baseball' ? (
        <BaseballJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : sport === 'football' ? (
        <FootballJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : sport === 'hockey' ? (
        <HockeyJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : (
        <svg width={size} height={height} viewBox="0 0 52 58" className="block">
          <defs>
            <linearGradient id={`${uid}-sh`} x1="0" y1="0" x2="0.35" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
            </linearGradient>
            <clipPath id={`${uid}-body`}>
              <path d={body} />
            </clipPath>
          </defs>

          <ellipse cx="26" cy="56" rx="13" ry="1.8" fill="#000" opacity="0.22" />
          <PatternLayer uid={uid} body={body} meta={meta} />
          <path d={body} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6" />
          <JerseyDetails sport={sport} body={body} meta={meta} accent={accent} />
          <path d={body} fill={`url(#${uid}-sh)`} pointerEvents="none" />
        </svg>
      )}
    </div>
  );
}
