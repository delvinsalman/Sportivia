import { assetUrl } from '../lib/assetUrl';

export type HockeyAwardVariant = 'stanley' | 'hart' | 'allstar' | 'hall';

const AWARD_LOGOS: Partial<Record<HockeyAwardVariant, string>> = {
  allstar: '/icons/nhl-all-star-2024.png',
  hall: '/icons/trophies/nhl-hof.png',
};

export function HockeyAwardIcon({
  variant,
  size = 38,
}: {
  variant: HockeyAwardVariant;
  size?: number;
}) {
  const logoUrl = AWARD_LOGOS[variant];
  if (logoUrl) {
    return (
      <div
        className="shrink-0 flex items-center justify-center drop-shadow-md"
        style={{ width: size, height: size }}
      >
        <img
          src={assetUrl(logoUrl)}
          alt=""
          draggable={false}
          className="select-none object-contain pointer-events-none"
          style={{ width: '100%', height: '100%' }}
          loading="lazy"
        />
      </div>
    );
  }

  if (variant === 'stanley') {
    return (
      <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0 drop-shadow-md">
        <defs>
          <linearGradient id="stanley-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor="#94a3b8" />
            <stop offset="72%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="8" rx="9" ry="4" fill="url(#stanley-silver)" stroke="#fff" strokeWidth="1" />
        <path d="M17 9 Q17 18 20 22 L18 31 H30 L28 22 Q31 18 31 9Z" fill="url(#stanley-silver)" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M15 31 H33 L36 39 H12Z" fill="url(#stanley-silver)" stroke="#cbd5e1" strokeWidth="1" />
        <rect x="9" y="39" width="30" height="5" rx="2" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1" />
        <path d="M17 14 H31 M19 25 H29 M14 35 H34" stroke="#475569" strokeWidth="1" opacity="0.65" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0 drop-shadow-md">
      <path d="M24 4 L39 10 V23 C39 33 32 40 24 44 C16 40 9 33 9 23 V10Z" fill="#f0b232" stroke="#f8fafc" strokeWidth="2" />
      <path d="M24 8 L35 12 V23 C35 30 31 35 24 39 C17 35 13 30 13 23 V12Z" fill="#0f172a" opacity="0.38" />
      <text
        x="24"
        y="28"
        textAnchor="middle"
        fill="#fff"
        fontSize={10}
        fontWeight="900"
        fontFamily="system-ui, sans-serif"
      >
        MVP
      </text>
    </svg>
  );
}
