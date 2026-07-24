/** Soft synthesized menu SFX (no asset files). */

import { canPlayMenuSound, effectiveMenuVolume } from './settings';

let ctx: AudioContext | null = null;

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

/** Quick tick while the daily wheel spins */
export function playSpinTick() {
  tone(640 + Math.random() * 180, 0.045, {
    type: 'triangle',
    gain: 0.028,
    attack: 0.002,
    decay: 0.035,
  });
}

/** Confirm / equip / unlock */
export function playMenuConfirm() {
  tone(440, 0.14, { type: 'sine', gain: 0.05, attack: 0.01, decay: 0.11 });
  tone(660, 0.16, { type: 'triangle', gain: 0.04, attack: 0.012, decay: 0.13 });
}

/** Skin / pet unlock fanfare */
export function playUnlockFanfare() {
  if (!canPlayMenuSound()) return;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    window.setTimeout(() => {
      tone(freq, 0.22, {
        type: i === notes.length - 1 ? 'triangle' : 'sine',
        gain: 0.045 + i * 0.008,
        attack: 0.01,
        decay: 0.16 + i * 0.04,
      });
    }, i * 90);
  });
  window.setTimeout(() => {
    tone(1318.5, 0.28, { type: 'sine', gain: 0.03, attack: 0.012, decay: 0.24 });
  }, 380);
}

/** Back / dismiss */
export function playMenuBack() {
  tone(480, 0.08, { type: 'sine', gain: 0.035, attack: 0.005, decay: 0.07 });
  tone(320, 0.1, { type: 'triangle', gain: 0.03, attack: 0.006, decay: 0.09 });
}
