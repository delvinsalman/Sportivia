/** Soft ducking for ambient menu music during focused UI moments. */

let duckFactor = 1;
const listeners = new Set<() => void>();

/** When true, Quick Play bed is allowed (after countdown). */
let quickPlayLive = false;
const quickListeners = new Set<() => void>();

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

export function getQuickPlayLive(): boolean {
  return quickPlayLive;
}

export function setQuickPlayLive(live: boolean) {
  if (quickPlayLive === live) return;
  quickPlayLive = live;
  quickListeners.forEach(listener => listener());
}

export function subscribeQuickPlayLive(listener: () => void) {
  quickListeners.add(listener);
  return () => {
    quickListeners.delete(listener);
  };
}
