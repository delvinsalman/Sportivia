import type { CSSProperties } from 'react';
import type { Sport } from '../types';
import { assetUrl } from '../lib/assetUrl';

interface BallImageProps {
  src: string;
  size?: number;
  className?: string;
  style?: CSSProperties;
  /** Raster clip art often has extra padding — scale up to match soccer SVG fill */
  visualScale?: number;
}

function BallImage({ src, size = 40, className = '', style, visualScale = 1 }: BallImageProps) {
  const renderSize = size * visualScale;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <img
        src={src}
        alt=""
        width={renderSize}
        height={renderSize}
        draggable={false}
        className="select-none object-contain pointer-events-none"
        style={{
          width: renderSize,
          height: renderSize,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.45))',
        }}
      />
    </span>
  );
}

interface SoccerBallProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** Classic Telstar football — Wikimedia Commons (public domain) */
export function SoccerBall({ size = 40, className = '', style }: SoccerBallProps) {
  return (
    <BallImage
      src={assetUrl('/soccer-ball.svg')}
      size={size}
      className={className}
      style={style}
      visualScale={1}
    />
  );
}

interface BasketballBallProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function BasketballBall({ size = 40, className = '', style }: BasketballBallProps) {
  return (
    <BallImage
      src={assetUrl('/basketball-ball.png')}
      size={size}
      className={className}
      style={style}
      visualScale={1.28}
    />
  );
}

export function BaseballBall({ size = 40, className = '', style }: BasketballBallProps) {
  return (
    <BallImage
      src={assetUrl('/baseball-ball.png')}
      size={size}
      className={className}
      style={style}
      visualScale={1.28}
    />
  );
}

interface SvgBallProps {
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/** American football icon */
export function FootballBall({ size = 40, className = '', style }: SvgBallProps) {
  return (
    <BallImage
      src={assetUrl('/football-ball.png')}
      size={size}
      className={className}
      style={style}
      visualScale={1.2}
    />
  );
}

/** Hockey sticks + puck icon */
export function HockeyPuck({ size = 40, className = '', style }: SvgBallProps) {
  return (
    <BallImage
      src={assetUrl('/hockey-icon.png')}
      size={size}
      className={className}
      style={style}
      visualScale={1.2}
    />
  );
}

export function SportBall({ sport, size = 40, className = '' }: { sport: Sport; size?: number; className?: string }) {
  if (sport === 'soccer') return <SoccerBall size={size} className={className} />;
  if (sport === 'basketball') return <BasketballBall size={size} className={className} />;
  if (sport === 'football') return <FootballBall size={size} className={className} />;
  if (sport === 'hockey') return <HockeyPuck size={size} className={className} />;
  return <BaseballBall size={size} className={className} />;
}
