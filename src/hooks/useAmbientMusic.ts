import { useEffect, useRef } from 'react';

const TRACK = '/audio/starlight-strut.mp3';
const TARGET_VOLUME = 0.12;
const PLAYBACK_RATE = 0.82;
const FADE_MS = 1100;

type AmbientScreen = 'home' | 'about' | 'store' | 'lobby' | 'intro' | 'game';

function isMenuScreen(screen: AmbientScreen) {
  return screen === 'home' || screen === 'store' || screen === 'about';
}

function fadeVolume(
  audio: HTMLAudioElement,
  to: number,
  durationMs: number,
  onDone?: () => void,
) {
  const from = audio.volume;
  if (Math.abs(from - to) < 0.01) {
    audio.volume = to;
    onDone?.();
    return () => {};
  }

  const start = performance.now();
  let raf = 0;
  let cancelled = false;

  const tick = (now: number) => {
    if (cancelled) return;
    const t = Math.min(1, (now - start) / durationMs);
    const eased = t * t * (3 - 2 * t);
    audio.volume = from + (to - from) * eased;
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      audio.volume = to;
      onDone?.();
    }
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

/** Loops menu music on home/store; fades out when entering lobby/intro/game. */
export function useAmbientMusic(screen: AmbientScreen) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);
  const wantsMusicRef = useRef(isMenuScreen(screen));
  const playMenuRef = useRef<() => void>(() => {});
  const fadeOutRef = useRef<() => void>(() => {});

  wantsMusicRef.current = isMenuScreen(screen);

  useEffect(() => {
    const audio = new Audio(TRACK);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.playbackRate = PLAYBACK_RATE;
    audioRef.current = audio;

    const stopFade = () => {
      cancelFadeRef.current?.();
      cancelFadeRef.current = null;
    };

    const fadeTo = (to: number, onDone?: () => void) => {
      stopFade();
      cancelFadeRef.current = fadeVolume(audio, to, FADE_MS, onDone);
    };

    const playMenu = () => {
      if (!wantsMusicRef.current) return;

      const startFade = () => fadeTo(TARGET_VOLUME);

      if (audio.paused) {
        audio.volume = 0;
        void audio.play().then(startFade).catch(() => {
          // Autoplay blocked — gesture listener will retry
        });
      } else {
        startFade();
      }
    };

    const fadeOut = () => {
      fadeTo(0, () => audio.pause());
    };

    playMenuRef.current = playMenu;
    fadeOutRef.current = fadeOut;

    const detachGestures = () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
      document.removeEventListener('touchstart', onGesture);
    };

    const onGesture = () => {
      if (!wantsMusicRef.current) return;
      audio.volume = 0;
      void audio.play().then(() => {
        fadeTo(TARGET_VOLUME);
        detachGestures();
      }).catch(() => {
        // Keep listening until a gesture succeeds
      });
    };

    document.addEventListener('pointerdown', onGesture);
    document.addEventListener('keydown', onGesture);
    document.addEventListener('touchstart', onGesture, { passive: true });

    playMenu();

    return () => {
      stopFade();
      detachGestures();
      audio.pause();
      audio.src = '';
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isMenuScreen(screen)) {
      playMenuRef.current();
    } else {
      fadeOutRef.current();
    }
  }, [screen]);
}
