/** Soft ducking for ambient menu music (e.g. during pack openings). */

let duckFactor = 1;
const listeners = new Set<() => void>();

export function getAmbientDuck(): number {
  return duckFactor;
}

/** 1 = full volume, 0 = muted. */
export function setAmbientDuck(factor: number) {
  const next = Math.min(1, Math.max(0, factor));
  if (Math.abs(next - duckFactor) < 0.001) return;
  duckFactor = next;
  listeners.forEach(listener => listener());
}

export function subscribeAmbientDuck(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
