const ALL_STAR_LOGOS = {
  nba: '/icons/nba-all-star-2021.png',
  mlb: '/icons/mlb-all-star-2021.png',
} as const;

export function AllStarIcon({ variant = 'nba', size = 36 }: { variant?: 'nba' | 'mlb'; size?: number }) {
  return (
    <div
      className="shrink-0 flex items-center justify-center drop-shadow-md"
      style={{ width: size, height: size }}
    >
      <img
        src={ALL_STAR_LOGOS[variant]}
        alt=""
        draggable={false}
        className="select-none object-contain pointer-events-none"
        style={{ width: '100%', height: '100%' }}
        loading="lazy"
      />
    </div>
  );
}
