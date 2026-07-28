import { createHash } from 'crypto';
import { MsEdgeTTS, OUTPUT_FORMAT, ProsodyOptions } from 'msedge-tts';

/** Warm, conversational US English neural voice — human-like read-aloud. */
const VOICE = 'en-US-AvaNeural';
/** Smaller MP3 = less wait before playback starts. */
const FORMAT = OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3;
/** Snappy for timed rounds — still clear, not rushed cartoon. */
const SPEAK_RATE = '+18%';
const MAX_CHARS = 420;
const CACHE_LIMIT = 80;

type CacheEntry = { buf: Buffer; touched: number };

const cache = new Map<string, CacheEntry>();
let ttsReady: Promise<MsEdgeTTS> | null = null;
const synthQueue: Promise<unknown>[] = [];

function normalizeText(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().slice(0, MAX_CHARS);
}

function cacheKey(text: string): string {
  return createHash('sha1').update(`${VOICE}|${SPEAK_RATE}|${text}`).digest('hex');
}

function touchCache(key: string, buf: Buffer) {
  cache.set(key, { buf, touched: Date.now() });
  if (cache.size <= CACHE_LIMIT) return;
  const oldest = [...cache.entries()].sort((a, b) => a[1].touched - b[1].touched)[0];
  if (oldest) cache.delete(oldest[0]);
}

async function getTts(): Promise<MsEdgeTTS> {
  if (!ttsReady) {
    ttsReady = (async () => {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(VOICE, FORMAT);
      return tts;
    })().catch(err => {
      ttsReady = null;
      throw err;
    });
  }
  return ttsReady;
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/** Serialize synthesizer calls — Edge TTS is happier one-at-a-time. */
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const run = (synthQueue[synthQueue.length - 1] ?? Promise.resolve())
    .catch(() => undefined)
    .then(job);
  synthQueue.push(run);
  if (synthQueue.length > 8) synthQueue.splice(0, synthQueue.length - 4);
  return run;
}

export async function synthesizeCampaignVoice(rawText: string): Promise<Buffer | null> {
  const text = normalizeText(rawText);
  if (!text) return null;

  const key = cacheKey(text);
  const hit = cache.get(key);
  if (hit) {
    hit.touched = Date.now();
    return hit.buf;
  }

  return enqueue(async () => {
    const again = cache.get(key);
    if (again) {
      again.touched = Date.now();
      return again.buf;
    }

    const tts = await getTts();
    const prosody = new ProsodyOptions();
    // Timed game — keep it brisk and natural
    prosody.rate = SPEAK_RATE;
    prosody.pitch = '+0Hz';

    const { audioStream } = tts.toStream(text, prosody);
    const buf = await streamToBuffer(audioStream);
    if (buf.length < 64) throw new Error('empty_tts_audio');
    touchCache(key, buf);
    return buf;
  });
}

export function campaignVoiceLimits() {
  return { maxChars: MAX_CHARS, voice: VOICE };
}
