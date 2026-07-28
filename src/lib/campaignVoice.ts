import { setAmbientDuck } from './ambientControl';

export type CampaignSpeakPayload = {
  /** Short label spoken first (player name / trophy label). */
  lead?: string;
  /** Main question prompt. */
  prompt: string;
};

let currentAudio: HTMLAudioElement | null = null;
let currentObjectUrl: string | null = null;
let speakGeneration = 0;

/** In-browser cache so re-listen / same wording starts instantly. */
const blobCache = new Map<string, Blob>();
const BLOB_CACHE_LIMIT = 40;
const inflight = new Map<string, Promise<Blob | null>>();

function revokeObjectUrl() {
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl);
    currentObjectUrl = null;
  }
}

function releaseAudio() {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    currentAudio.pause();
    currentAudio.removeAttribute('src');
    currentAudio.load();
    currentAudio = null;
  }
  revokeObjectUrl();
  setAmbientDuck(1);
}

function buildSpokenText(payload: CampaignSpeakPayload): string {
  const lead = payload.lead?.trim();
  const prompt = payload.prompt.trim();
  if (!lead) return prompt;
  if (!prompt) return lead;
  // Comma keeps flow natural — a period makes the voice pause too long
  return `${lead}, ${prompt}`;
}

/** Always true — neural voice is preferred; browser TTS is emergency fallback. */
export function campaignVoiceSupported(): boolean {
  return typeof window !== 'undefined' && typeof Audio !== 'undefined';
}

export function stopCampaignVoice() {
  speakGeneration += 1;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  releaseAudio();
}

function rememberBlob(key: string, blob: Blob) {
  blobCache.set(key, blob);
  if (blobCache.size <= BLOB_CACHE_LIMIT) return;
  const first = blobCache.keys().next().value;
  if (first) blobCache.delete(first);
}

async function fetchNeuralMp3(text: string): Promise<Blob | null> {
  const hit = blobCache.get(text);
  if (hit) return hit;

  const pending = inflight.get(text);
  if (pending) return pending;

  const req = (async () => {
    try {
      const res = await fetch('/api/campaign-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return null;
      const type = res.headers.get('content-type') || '';
      if (!type.includes('audio')) return null;
      const blob = await res.blob();
      rememberBlob(text, blob);
      return blob;
    } catch {
      return null;
    } finally {
      inflight.delete(text);
    }
  })();

  inflight.set(text, req);
  return req;
}

/** Warm the voice route so the first question doesn’t wait on a cold server. */
export function warmCampaignVoice() {
  if (typeof window === 'undefined') return;
  void fetch('/api/campaign-voice', { method: 'GET' }).catch(() => undefined);
}

function speakBrowserFallback(
  text: string,
  opts?: { onStart?: () => void; onEnd?: () => void },
): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.12;
  u.pitch = 1;
  u.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const neural =
    voices.find(v => /neural|natural|enhanced|premium|jenny|aria|samantha|ava/i.test(v.name)) ||
    voices.find(v => /^en([-_]|$)/i.test(v.lang));
  if (neural) u.voice = neural;

  setAmbientDuck(0.35);
  opts?.onStart?.();
  u.onend = () => {
    setAmbientDuck(1);
    opts?.onEnd?.();
  };
  u.onerror = () => {
    setAmbientDuck(1);
    opts?.onEnd?.();
  };
  window.speechSynthesis.speak(u);
  return true;
}

/** Speak campaign question with a human-like neural voice (server), else browser TTS. */
export function speakCampaignQuestion(
  payload: CampaignSpeakPayload,
  opts?: { onStart?: () => void; onEnd?: () => void },
): boolean {
  if (!campaignVoiceSupported()) return false;

  const text = buildSpokenText(payload);
  if (!text) return false;

  stopCampaignVoice();
  const gen = speakGeneration;

  void (async () => {
    if (gen !== speakGeneration) return;

    const blob = await fetchNeuralMp3(text);
    if (gen !== speakGeneration) return;

    if (!blob) {
      if (gen === speakGeneration) speakBrowserFallback(text, opts);
      return;
    }

    const url = URL.createObjectURL(blob);
    currentObjectUrl = url;
    const audio = new Audio(url);
    // Tiny extra snap for timed rounds (neural already +18%)
    audio.playbackRate = 1.06;
    currentAudio = audio;
    audio.onended = () => {
      if (gen !== speakGeneration) return;
      releaseAudio();
      opts?.onEnd?.();
    };
    audio.onerror = () => {
      if (gen !== speakGeneration) return;
      releaseAudio();
      speakBrowserFallback(text, opts);
    };

    try {
      setAmbientDuck(0.35);
      opts?.onStart?.();
      await audio.play();
    } catch {
      if (gen !== speakGeneration) return;
      releaseAudio();
      speakBrowserFallback(text, opts);
    }
  })();

  return true;
}
