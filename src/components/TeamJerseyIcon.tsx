export type JerseySport = 'soccer' | 'basketball' | 'baseball';
export type JerseyPattern = 'solid' | 'vertical' | 'horizontal' | 'pinstripes' | 'hoops' | 'split';

export interface TeamJerseyMeta {
  colors?: string[];
  stripes?: string[];
  accent?: string;
  initials?: string;
  logoUrl?: string;
  jerseyPattern?: JerseyPattern;
}

const LOGO_SIZE_RATIO = 0.3;
const SOCCER_LOGO_SIZE_RATIO = 0.28;
const BASKETBALL_LOGO_SIZE_RATIO = 0.28;

/** Detailed basketball tank — viewBox 0 0 200 250 */
const BASKETBALL_KIT_BODY = `M 70 40 L 85 40 Q 100 68 115 40 L 130 40 Q 122 75 145 95 L 140 220 L 60 220 L 55 95 Q 78 75 70 40 Z`;

const BASKETBALL_VIEW_W = 200;
const BASKETBALL_VIEW_H = 250;

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
const BASEBALL_LOGO_SIZE_RATIO = 0.26;

/** Detailed soccer kit — viewBox 0 0 200 220 */
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
  return size * 1.12;
}

function logoPlacement(sport: JerseySport, size: number, height: number) {
  if (sport === 'soccer') {
    const badgeSize = size * SOCCER_LOGO_SIZE_RATIO;
    return { badgeSize, top: height * 0.36 };
  }
  if (sport === 'basketball') {
    const badgeSize = size * BASKETBALL_LOGO_SIZE_RATIO;
    return { badgeSize, top: height * 0.38 };
  }
  if (sport === 'baseball') {
    const badgeSize = size * BASEBALL_LOGO_SIZE_RATIO;
    return { badgeSize, top: height * 0.34 };
  }
  const badgeSize = size * LOGO_SIZE_RATIO;
  return { badgeSize, top: size * 0.28 };
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
  const uid = `tj-${sport}-${meta.logoUrl?.replace(/\W/g, '') ?? colors[0].replace('#', '')}`;
  const height = jerseyHeight(sport, size);
  const { badgeSize, top: badgeTop } = logoPlacement(sport, size, height);

  return (
    <div className="relative shrink-0 drop-shadow-lg" style={{ width: size, height }}>
      {sport === 'soccer' ? (
        <SoccerJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : sport === 'basketball' ? (
        <BasketballJerseyGraphic uid={uid} meta={meta} size={size} />
      ) : sport === 'baseball' ? (
        <BaseballJerseyGraphic uid={uid} meta={meta} size={size} />
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

      {meta.logoUrl ? (
        <img
          src={meta.logoUrl}
          alt=""
          className={`absolute object-contain drop-shadow-md pointer-events-none ${sport === 'baseball' ? '' : 'left-1/2 -translate-x-1/2'}`}
          style={{
            top: badgeTop,
            ...(sport === 'baseball' ? { left: '36%' } : {}),
            width: badgeSize,
            height: badgeSize,
            maxWidth: badgeSize,
            maxHeight: badgeSize,
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.95)) drop-shadow(0 1px 2px rgba(0,0,0,0.45))',
          }}
          loading="lazy"
        />
      ) : meta.initials ? (
        <div
          className={`absolute rounded-md bg-black/25 border border-white/20 flex items-center justify-center font-black text-white ${sport === 'baseball' ? '' : 'left-1/2 -translate-x-1/2'}`}
          style={{
            top: badgeTop + badgeSize * 0.05,
            ...(sport === 'baseball' ? { left: '36%' } : {}),
            width: badgeSize * 0.95,
            height: badgeSize * 0.55,
            fontSize: badgeSize * 0.28,
          }}
        >
          {meta.initials}
        </div>
      ) : null}
    </div>
  );
}
