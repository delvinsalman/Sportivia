const COIN_SRC = '/icons/coin.png';

const SIZE_MAP = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 32,
  xl: 40,
} as const;

export type CoinIconSize = keyof typeof SIZE_MAP | number;

interface CoinIconProps {
  size?: CoinIconSize;
  className?: string;
  alt?: string;
}

export function CoinIcon({ size = 'md', className = '', alt = '' }: CoinIconProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  return (
    <span
      className={`coin-icon-shine inline-flex shrink-0 select-none items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={COIN_SRC}
        alt={alt}
        width={px}
        height={px}
        draggable={false}
        className="block h-full w-full object-contain"
      />
    </span>
  );
}
