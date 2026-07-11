export function AnimatedGlobeIcon({ size = 36 }: { size?: number }) {
  return (
    <img
      src="/icons/earth-globe.webp"
      alt=""
      width={size}
      height={size}
      draggable={false}
      className="shrink-0 object-contain drop-shadow-md select-none rounded-full"
    />
  );
}
