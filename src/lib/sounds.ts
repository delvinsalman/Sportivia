import type { Sport } from '../types';

let ctx: AudioContext | null = null;

const SOCCER_WRONG = ['/sounds/soccer/wrong-whistle.webm', '/sounds/soccer/wrong-whistle.m4a'];
const SOCCER_CORRECT = ['/sounds/soccer/correct-kick.webm', '/sounds/soccer/correct-kick.m4a'];

const audioCache = new Map<string, HTMLAudioElement>();

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function pickSource(sources: string[]): string {
  if (typeof document === 'undefined') return sources[0];
  const probe = document.createElement('audio');
  for (const src of sources) {
    const type = src.endsWith('.webm') ? 'audio/webm' : 'audio/mp4';
    if (probe.canPlayType(type) !== '') return src;
  }
  return sources[sources.length - 1];
}

function playSample(sources: string[], volume = 0.75) {
  getCtx();
  const src = pickSource(sources);
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = 'auto';
    audioCache.set(src, audio);
  }
  const clip = audio.cloneNode() as HTMLAudioElement;
  clip.volume = volume;
  clip.play().catch(() => {});
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.15,
  when = 0,
) {
  const c = getCtx();
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, c.currentTime + when);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + when + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(c.currentTime + when);
  osc.stop(c.currentTime + when + duration);
}

function noise(duration: number, volume = 0.08, lowpass = 800) {
  const c = getCtx();
  const bufferSize = Math.floor(c.sampleRate * duration);
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = c.createBufferSource();
  source.buffer = buffer;
  const gain = c.createGain();
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(c.destination);
  source.start();
}

/** Referee whistle — used for wrong answers in all sports */
function playWhistle() {
  const c = getCtx();
  const t = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(3100, t);
  osc.frequency.exponentialRampToValueAtTime(2400, t + 0.12);
  osc.frequency.setValueAtTime(3200, t + 0.18);
  osc.frequency.exponentialRampToValueAtTime(1900, t + 0.42);
  gain.gain.setValueAtTime(0.001, t);
  gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
  gain.gain.setValueAtTime(0.18, t + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + 0.5);
}

function playNetSplash() {
  noise(0.3, 0.14, 600);
  tone(380, 0.12, 'sine', 0.1);
  tone(220, 0.22, 'sine', 0.08, 0.06);
  tone(160, 0.18, 'triangle', 0.06, 0.12);
}

function playBatCrack() {
  noise(0.05, 0.28, 2000);
  tone(180, 0.03, 'square', 0.12);
  tone(520, 0.04, 'sine', 0.14, 0.01);
  tone(320, 0.06, 'triangle', 0.06, 0.02);
}

export function playCountdownTick() {
  tone(520, 0.08, 'sine', 0.12);
}

export function playGo() {
  tone(660, 0.1, 'sine', 0.14);
  tone(880, 0.15, 'sine', 0.12, 0.08);
}

export function playCorrect(sport: Sport, streak: number) {
  if (sport === 'soccer') {
    // Kick only — no layered synth tones
    playSample(SOCCER_CORRECT, 0.8);
    return;
  }
  if (sport === 'basketball') playNetSplash();
  else playBatCrack();

  if (streak >= 3) {
    tone(700 + Math.min(streak, 5) * 50, 0.08, 'sine', 0.1, 0.08);
  }
}

export function playWrong(sport?: Sport) {
  if (sport === 'soccer') {
    playSample(SOCCER_WRONG, 0.85);
    return;
  }
  playWhistle();
}

export function playPick(sport: Sport) {
  if (sport === 'soccer') {
    noise(0.04, 0.05);
    tone(200, 0.05, 'triangle', 0.06);
  } else if (sport === 'basketball') {
    tone(350, 0.03, 'sine', 0.08);
    tone(280, 0.05, 'sine', 0.06, 0.02);
  } else {
    tone(300, 0.03, 'triangle', 0.07);
    tone(240, 0.04, 'sine', 0.05, 0.02);
  }
}

export function playSkip() {
  tone(300, 0.08, 'sine', 0.08);
  tone(240, 0.1, 'sine', 0.06, 0.06);
}

export function playBoardReset() {
  tone(500, 0.1, 'sine', 0.1);
  tone(700, 0.1, 'sine', 0.1, 0.1);
  tone(900, 0.15, 'sine', 0.12, 0.2);
}

export function playStreakFire() {
  tone(900, 0.06, 'sine', 0.1);
  tone(1100, 0.08, 'sine', 0.1, 0.05);
}

/** Soft clock tick for the last 3 seconds */
export function playClockTick(secondsLeft = 3) {
  const c = getCtx();
  const t = c.currentTime;
  // Higher / sharper as time runs out
  const high = 980 + (3 - Math.min(3, Math.max(1, secondsLeft))) * 140;
  const low = high * 0.55;

  const tick = (freq: number, when: number, vol: number, dur: number) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(vol, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, when + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  };

  // Classic tick-tock pair
  tick(high, t, 0.11, 0.055);
  tick(low, t + 0.09, 0.07, 0.07);
}

/** Smooth match-end chime — soft descending bells, no harsh buzzer */
export function playTimesUp() {
  const c = getCtx();
  const t = c.currentTime;
  const notes = [660, 554, 440, 330];

  notes.forEach((freq, i) => {
    const when = t + i * 0.16;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, when);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.92, when + 0.45);
    gain.gain.setValueAtTime(0.001, when);
    gain.gain.linearRampToValueAtTime(0.12 - i * 0.015, when + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, when + 0.55);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(when);
    osc.stop(when + 0.6);

    // Soft harmonic for body
    const harm = c.createOscillator();
    const harmGain = c.createGain();
    harm.type = 'triangle';
    harm.frequency.value = freq * 2;
    harmGain.gain.setValueAtTime(0.001, when);
    harmGain.gain.linearRampToValueAtTime(0.035, when + 0.03);
    harmGain.gain.exponentialRampToValueAtTime(0.001, when + 0.35);
    harm.connect(harmGain);
    harmGain.connect(c.destination);
    harm.start(when);
    harm.stop(when + 0.4);
  });
}
