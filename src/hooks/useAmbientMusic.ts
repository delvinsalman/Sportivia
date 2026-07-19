import { useEffect, useRef } from 'react';
import { effectiveMusicVolume, subscribeSettings } from '../lib/settings';
import { getAmbientDuck, subscribeAmbientDuck } from '../lib/ambientControl';
import { assetUrl } from '../lib/assetUrl';

const TRACK = assetUrl('/audio/starlight-strut.mp3');
const PLAYBACK_RATE = 0.82;
const FADE_MS = 1100;

type AmbientScreen = 'home' | 'about' | 'store' | 'settings' | 'career' | 'cards' | 'lobby' | 'intro' | 'game';

function isMenuScreen(screen: AmbientScreen) {
  return screen === 'home' || screen === 'store' || screen === 'about' || screen === 'settings' || screen === 'career' || screen === 'cards';
}

function fadeVolume(
  audio: HTMLAudioElement,
  to: number,
  durationMs: number,
  onDone?: () => void,
) {
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  const from = clamp(audio.volume);
  const target = clamp(to);
  if (Math.abs(from - target) < 0.01) {
    audio.volume = target;
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
    audio.volume = clamp(from + (target - from) * eased);
    if (t < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      audio.volume = target;
      onDone?.();
    }
  };

  raf = requestAnimationFrame(tick);
  return () => {
    cancelled = true;
    cancelAnimationFrame(raf);
  };
}

/** Loops menu music on home/store/settings; fades out in lobby/intro/game. */
export function useAmbientMusic(screen: AmbientScreen) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadeRef = useRef<(() => void) | null>(null);
  const wantsMusicRef = useRef(isMenuScreen(screen));
  const playMenuRef = useRef<() => void>(() => {});
  const fadeOutRef = useRef<() => void>(() => {});
  const syncVolumeRef = useRef<() => void>(() => {});

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

    const targetVol = () => effectiveMusicVolume() * getAmbientDuck();

    const playMenu = () => {
      if (!wantsMusicRef.current) return;
      const to = targetVol();
      if (to <= 0) {
        fadeTo(0, () => audio.pause());
        return;
      }

      const startFade = () => fadeTo(to);

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

    const syncVolume = () => {
      if (!wantsMusicRef.current) return;
      const to = targetVol();
      if (to <= 0) {
        // Duck / mute: keep playing quietly, or pause only if music is off
        if (effectiveMusicVolume() <= 0) {
          fadeTo(0, () => audio.pause());
          return;
        }
        if (audio.paused) {
          void audio.play().then(() => fadeTo(to)).catch(() => {});
        } else {
          fadeTo(to);
        }
        return;
      }
      if (audio.paused) {
        playMenu();
      } else {
        fadeTo(to);
      }
    };

    playMenuRef.current = playMenu;
    fadeOutRef.current = fadeOut;
    syncVolumeRef.current = syncVolume;

    const detachGestures = () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
      document.removeEventListener('touchstart', onGesture);
    };

    const onGesture = () => {
      if (!wantsMusicRef.current) return;
      if (targetVol() <= 0 && effectiveMusicVolume() <= 0) return;
      audio.volume = 0;
      void audio.play().then(() => {
        fadeTo(targetVol());
        detachGestures();
      }).catch(() => {
        // Keep listening until a gesture succeeds
      });
    };

    document.addEventListener('pointerdown', onGesture);
    document.addEventListener('keydown', onGesture);
    document.addEventListener('touchstart', onGesture, { passive: true });

    const unsub = subscribeSettings(() => syncVolumeRef.current());
    const unsubDuck = subscribeAmbientDuck(() => syncVolumeRef.current());

    playMenu();

    return () => {
      stopFade();
      detachGestures();
      unsub();
      unsubDuck();
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
