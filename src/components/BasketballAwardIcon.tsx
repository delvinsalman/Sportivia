export type BasketballAwardVariant = 'mvp' | 'scoring' | 'championship' | 'olympic';

export function BasketballAwardIcon({
  variant,
  size = 36,
  sport,
}: {
  variant: BasketballAwardVariant;
  size?: number;
  sport?: 'soccer' | 'basketball' | 'baseball';
}) {
  const uid = `nba-award-${variant}`;

  if (variant === 'championship') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 72" className="shrink-0 drop-shadow-md">
        <defs>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#ffe566" />
            <stop offset="45%" stopColor="#f0b232" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
          <linearGradient id={`${uid}-silver`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f4f4f5" />
            <stop offset="100%" stopColor="#a1a1aa" />
          </linearGradient>
          <radialGradient id={`${uid}-ball`} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff9a3c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="68" rx="18" ry="2.5" fill="#000" opacity="0.2" />
        <rect x="22" y="54" width="20" height="10" rx="2" fill={`url(#${uid}-gold)`} stroke="#8b6914" strokeWidth="0.6" />
        <rect x="26" y="48" width="12" height="8" rx="1" fill={`url(#${uid}-gold)`} stroke="#8b6914" strokeWidth="0.5" />
        <ellipse cx="32" cy="48" rx="14" ry="3" fill="none" stroke={`url(#${uid}-silver)`} strokeWidth="2.5" />
        <path d="M 20 48 Q 32 58 44 48" fill="none" stroke={`url(#${uid}-silver)`} strokeWidth="1.8" opacity="0.85" />
        <circle cx="32" cy="34" r="11" fill={`url(#${uid}-ball)`} stroke="#7c2d12" strokeWidth="0.6" />
        <path d="M 24 30 Q 32 40 40 30 M 28 26 Q 32 36 36 26" fill="none" stroke="#7c2d12" strokeWidth="0.9" opacity="0.55" />
      </svg>
    );
  }

  if (variant === 'mvp') {
    const isBaseball = sport === 'baseball';
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0 drop-shadow-md">
        <defs>
          <linearGradient id={`${uid}-navy`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a2744" />
            <stop offset="100%" stopColor="#0d1528" />
          </linearGradient>
          <linearGradient id={`${uid}-red-a`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#9f1239" />
          </linearGradient>
          <linearGradient id={`${uid}-red-b`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>
        <polygon
          points="32,4 38,18 52,20 41,30 44,44 32,37 20,44 23,30 12,20 26,18"
          fill={`url(#${uid}-navy)`}
          stroke="#f8fafc"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <polygon points="32,4 38,18 32,22 26,18" fill={`url(#${uid}-red-a)`} opacity="0.95" />
        <polygon points="32,4 38,18 41,30 32,26" fill={`url(#${uid}-red-b)`} opacity="0.85" />
        <polygon points="32,4 26,18 23,30 32,26" fill={`url(#${uid}-red-a)`} opacity="0.8" />
        <polygon points="20,44 23,30 32,37 32,44" fill={`url(#${uid}-red-b)`} opacity="0.75" />
        <polygon points="44,44 41,30 32,37 32,44" fill={`url(#${uid}-red-a)`} opacity="0.75" />
        <text
          x="32"
          y="31"
          textAnchor="middle"
          fill="#f5f0e1"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="-0.5"
          stroke="#0d1528"
          strokeWidth="0.6"
          paintOrder="stroke"
        >
          MVP
        </text>
        {isBaseball ? (
          <g transform="translate(32, 50)">
            <circle r="5.5" fill="#f8fafc" stroke="#0d1528" strokeWidth="0.5" />
            <path d="M -3.5 -2 Q 0 0 3.5 -2 M -3.5 2 Q 0 0 3.5 2" fill="none" stroke="#dc2626" strokeWidth="0.7" />
          </g>
        ) : (
          <g transform="translate(32, 50)">
            <circle r="5.5" fill="#ea580c" stroke="#7c2d12" strokeWidth="0.5" />
            <path d="M -3 -1.5 Q 0 1.5 3 -1.5 M -2.5 1.5 Q 0 -0.5 2.5 1.5" fill="none" stroke="#7c2d12" strokeWidth="0.55" opacity="0.6" />
          </g>
        )}
      </svg>
    );
  }

  if (variant === 'scoring') {
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" className="shrink-0 drop-shadow-md">
        <defs>
          <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id={`${uid}-ball`} cx="35%" cy="32%" r="60%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="100%" stopColor="#c2410c" />
          </radialGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="14" fill={`url(#${uid}-bg)`} stroke="#f97316" strokeWidth="1.5" />
        <circle cx="32" cy="26" r="13" fill={`url(#${uid}-ball)`} stroke="#7c2d12" strokeWidth="0.7" />
        <path d="M 24 22 Q 32 32 40 22 M 27 18 Q 32 26 37 18" fill="none" stroke="#7c2d12" strokeWidth="0.9" opacity="0.55" />
        <path
          d="M 18 42 L 26 34 L 32 40 L 46 26"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon points="46,26 42,28 44,32" fill="#fbbf24" />
        <text x="32" y="54" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="900" fontFamily="system-ui" letterSpacing="0.5">
          PPG
        </text>
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 64 40" className="shrink-0 drop-shadow-md">
      <ellipse cx="32" cy="37" rx="22" ry="2" fill="#000" opacity="0.15" />
      {[
        { cx: 14, cy: 20, color: '#0085c7' },
        { cx: 26, cy: 20, color: '#000000' },
        { cx: 38, cy: 20, color: '#ee334e' },
        { cx: 20, cy: 30, color: '#fcb131' },
        { cx: 32, cy: 30, color: '#00a651' },
      ].map((ring, i) => (
        <circle
          key={i}
          cx={ring.cx}
          cy={ring.cy}
          r="8"
          fill="none"
          stroke={ring.color}
          strokeWidth="2.8"
        />
      ))}
    </svg>
  );
}
