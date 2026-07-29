import { assetUrl } from '../lib/assetUrl';

const XP_SRC = '/icons/xp.png';

const SIZE_MAP = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 32,
  xl: 40,
} as const;

export type XpIconSize = keyof typeof SIZE_MAP | number;

interface XpIconProps {
  size?: XpIconSize;
  className?: string;
  alt?: string;
}

export function XpIcon({ size = 'md', className = '', alt = '' }: XpIconProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center ${className}`}
      style={{ width: px, height: px }}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src={assetUrl(XP_SRC)}
        alt={alt}
        width={px}
        height={px}
        draggable={false}
        className="block h-full w-full object-contain"
      />
    </span>
  );
}
