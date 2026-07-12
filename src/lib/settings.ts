export interface GameSettings {
  /** Master mute — overrides music + sfx + menu when on */
  muted: boolean;
  musicEnabled: boolean;
  /** 0–1 */
  musicVolume: number;
  sfxEnabled: boolean;
  /** 0–1 */
  sfxVolume: number;
  menuSoundsEnabled: boolean;
  reduceMotion: boolean;
  showOnlineCount: boolean;
  /** Footer tip line during matches */
  showHints: boolean;
  /** Soft clock ticks in the last seconds */
  clockTicks: boolean;
}

const STORAGE_KEY = 'sportivia-settings-v1';

export const DEFAULT_SETTINGS: GameSettings = {
  muted: false,
  musicEnabled: true,
  musicVolume: 0.7,
  sfxEnabled: true,
  sfxVolume: 0.85,
  menuSoundsEnabled: true,
  reduceMotion: false,
  showOnlineCount: true,
  showHints: true,
  clockTicks: true,
};

let cached: GameSettings | null = null;
const listeners = new Set<() => void>();

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function normalize(partial?: Partial<GameSettings>): GameSettings {
  const base = { ...DEFAULT_SETTINGS, ...partial };
  return {
    muted: Boolean(base.muted),
    musicEnabled: Boolean(base.musicEnabled),
    musicVolume: clamp01(base.musicVolume),
    sfxEnabled: Boolean(base.sfxEnabled),
    sfxVolume: clamp01(base.sfxVolume),
    menuSoundsEnabled: Boolean(base.menuSoundsEnabled),
    reduceMotion: Boolean(base.reduceMotion),
    showOnlineCount: Boolean(base.showOnlineCount),
    showHints: Boolean(base.showHints),
    clockTicks: Boolean(base.clockTicks),
  };
}

export function loadSettings(): GameSettings {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cached = { ...DEFAULT_SETTINGS };
      return cached;
    }
    cached = normalize(JSON.parse(raw) as Partial<GameSettings>);
    return cached;
  } catch {
    cached = { ...DEFAULT_SETTINGS };
    return cached;
  }
}

export function getSettings(): GameSettings {
  return loadSettings();
}

function applyDomFlags(settings: GameSettings) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.reduceMotion = settings.reduceMotion ? '1' : '0';
  document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
}

export function saveSettings(patch: Partial<GameSettings>): GameSettings {
  const next = normalize({ ...loadSettings(), ...patch });
  cached = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  applyDomFlags(next);
  for (const cb of listeners) cb();
  return next;
}

export function resetSettings(): GameSettings {
  cached = { ...DEFAULT_SETTINGS };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cached));
  } catch {
    /* ignore */
  }
  applyDomFlags(cached);
  for (const cb of listeners) cb();
  return cached;
}

export function subscribeSettings(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Effective menu music volume (0 if muted/disabled). */
export function effectiveMusicVolume(): number {
  const s = getSettings();
  if (s.muted || !s.musicEnabled) return 0;
  return clamp01(s.musicVolume) * 0.18; // map UI 0–1 onto a gentle actual gain
}

export function canPlaySfx(): boolean {
  const s = getSettings();
  return !s.muted && s.sfxEnabled;
}

export function canPlayMenuSound(): boolean {
  const s = getSettings();
  return !s.muted && s.menuSoundsEnabled;
}

export function effectiveSfxVolume(base = 1): number {
  const s = getSettings();
  if (s.muted || !s.sfxEnabled) return 0;
  return clamp01(base) * clamp01(s.sfxVolume);
}

export function effectiveMenuVolume(base = 1): number {
  const s = getSettings();
  if (s.muted || !s.menuSoundsEnabled) return 0;
  return clamp01(base) * clamp01(s.sfxVolume);
}

// Apply reduce-motion flag early on load
if (typeof document !== 'undefined') {
  applyDomFlags(loadSettings());
}
