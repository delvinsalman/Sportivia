import type { CSSProperties } from 'react';

interface BaseballIconProps {
  size?: number;
  initials?: string;
  className?: string;
  style?: CSSProperties;
}

type Point = [number, number];

function quadPoint(t: number, p0: Point, p1: Point, p2: Point) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0],
    y: mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1],
  };
}

function stitchPath(
  tipX: number,
  tipY: number,
  towardX: number,
  towardY: number,
  halfWidth = 2.8,
  length = 4.2,
) {
  const dx = towardX - tipX;
  const dy = towardY - tipY;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const baseX = tipX - ux * length;
  const baseY = tipY - uy * length;

  return `M ${baseX + px * halfWidth} ${baseY + py * halfWidth} L ${tipX} ${tipY} L ${baseX - px * halfWidth} ${baseY - py * halfWidth}`;
}

function renderSeam(
  p0: Point,
  p1: Point,
  p2: Point,
  toward: Point,
  stitchCount = 11,
) {
  const curve = `M ${p0[0]} ${p0[1]} Q ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]}`;
  const stitches = Array.from({ length: stitchCount }, (_, i) => {
    const t = (i + 1) / (stitchCount + 1);
    const pt = quadPoint(t, p0, p1, p2);
    return (
      <path
        key={i}
        d={stitchPath(pt.x, pt.y, toward[0], toward[1])}
        fill="none"
        stroke="#e11d2e"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  });

  return (
    <g>
      <path d={curve} fill="none" stroke="#d1d5db" strokeWidth="1.15" />
      {stitches}
    </g>
  );
}

/** Flat white baseball with grey seams and red chevron stitches */
export function BaseballIcon({ size = 40, className = '', style }: BaseballIconProps) {
  const center: Point = [50, 50];
  const leftStart: Point = [25, 11];
  const leftControl: Point = [10, 50];
  const leftEnd: Point = [25, 89];
  const rightStart: Point = [75, 11];
  const rightControl: Point = [90, 50];
  const rightEnd: Point = [75, 89];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`select-none shrink-0 ${className}`}
      style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))', ...style }}
    >
      <circle cx="50" cy="50" r="47" fill="#ffffff" stroke="#6b7280" strokeWidth="2" />
      {renderSeam(leftStart, leftControl, leftEnd, center)}
      {renderSeam(rightStart, rightControl, rightEnd, center)}
    </svg>
  );
}
