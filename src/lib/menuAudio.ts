/** Soft synthesized menu SFX (no asset files), plus pack sample clips. */

import { canPlayMenuSound, effectiveMenuVolume } from './settings';
import { assetUrl } from './assetUrl';

let ctx: AudioContext | null = null;
let suspenseCleanup: (() => void) | null = null;
const sampleCache = new Map<string, HTMLAudioElement>();

const PACK_OPEN_SFX = assetUrl('/sounds/packs/loot-box-open.mp3');

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function playSample(src: string, gain = 0.7) {
  if (!canPlayMenuSound()) return;
  // Resume WebAudio context so volume settings stay consistent with other SFX.
  getCtx();
  const vol = effectiveMenuVolume(gain);
  if (vol <= 0) return;

  let audio = sampleCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    sampleCache.set(src, audio);
  }
  const clip = audio.cloneNode() as HTMLAudioElement;
  clip.volume = Math.min(1, vol);
  void clip.play().catch(() => {});
}

function tone(
  frequency: number,
  duration: number,
  {
    type = 'sine',
    gain = 0.08,
    attack = 0.008,
    decay = 0.12,
  }: {
    type?: OscillatorType;
    gain?: number;
    attack?: number;
    decay?: number;
  } = {},
) {
  if (!canPlayMenuSound()) return;
  const audio = getCtx();
  if (!audio) return;

  const vol = effectiveMenuVolume(gain);
  if (vol <= 0) return;

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  const filter = audio.createBiquadFilter();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(2400, now);

  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(vol, now + attack);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

  osc.connect(filter);
  filter.connect(amp);
  amp.connect(audio.destination);

  osc.start(now);
  osc.stop(now + duration);
}

/** Light tap for general menu buttons */
export function playMenuClick() {
  tone(520, 0.09, { type: 'triangle', gain: 0.045, attack: 0.004, decay: 0.07 });
  tone(780, 0.07, { type: 'sine', gain: 0.025, attack: 0.004, decay: 0.05 });
}

/** Soft whoosh-tick when switching characters */
export function playMenuSelect() {
  tone(380, 0.12, { type: 'sine', gain: 0.04, attack: 0.01, decay: 0.1 });
  tone(620, 0.1, { type: 'triangle', gain: 0.035, attack: 0.008, decay: 0.08 });
  tone(920, 0.08, { type: 'sine', gain: 0.02, attack: 0.006, decay: 0.06 });
}

/** Confirm / equip / unlock */
export function playMenuConfirm() {
  tone(440, 0.14, { type: 'sine', gain: 0.05, attack: 0.01, decay: 0.11 });
  tone(660, 0.16, { type: 'triangle', gain: 0.04, attack: 0.012, decay: 0.13 });
}

/** Back / dismiss */
export function playMenuBack() {
  tone(480, 0.08, { type: 'sine', gain: 0.035, attack: 0.005, decay: 0.07 });
  tone(320, 0.1, { type: 'triangle', gain: 0.03, attack: 0.006, decay: 0.09 });
}

/** Pack preview wait — kept silent; the old drone was annoying. */
export function playPackSuspense() {
  stopPackSuspense();
}

export function stopPackSuspense() {
  suspenseCleanup?.();
  suspenseCleanup = null;
}

/** Loot-box style open when the player rips a pack. */
export function playPackOpen() {
  stopPackSuspense();
  playSample(PACK_OPEN_SFX, 0.78);
}

/** Soft flip when a card is revealed from a pack. */
export function playCardReveal(rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common') {
  const pitch = {
    common: 520,
    rare: 640,
    epic: 780,
    legendary: 960,
  }[rarity];
  tone(pitch, 0.14, { type: 'triangle', gain: 0.04, attack: 0.006, decay: 0.11 });
  tone(pitch * 1.5, 0.12, { type: 'sine', gain: 0.028, attack: 0.008, decay: 0.1 });
  if (rarity === 'legendary' || rarity === 'epic') {
    tone(pitch * 2, 0.18, { type: 'sine', gain: 0.02, attack: 0.01, decay: 0.15 });
  }
}
