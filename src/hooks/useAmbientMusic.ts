import { useEffect, useRef } from 'react';
import { effectiveMusicVolume, subscribeSettings } from '../lib/settings';
import { getAmbientDuck, subscribeAmbientDuck } from '../lib/ambientControl';
import { assetUrl } from '../lib/assetUrl';

const MENU_TRACK = assetUrl('/audio/starlight-strut.mp3');
const GAME_TRACK = assetUrl('/audio/efr-gameplay.mp3');

/** Menu bed — slightly under tempo. */
const MENU_RATE = 0.82;
/** Quiz bed — slower / more formal. */
const GAME_RATE = 0.72;
/** Gameplay sits quieter than menu under the same settings slider. */
const GAME_GAIN = 0.45;
const FADE_MS = 1100;

type AmbientScreen =
  | 'home'
  | 'about'
  | 'store'
  | 'settings'
  | 'career'
  | 'cards'
  | 'lobby'
  | 'intro'
  | 'game';

type AmbientMode = 'menu' | 'game' | 'off';

function modeForScreen(screen: AmbientScreen): AmbientMode {
  if (screen === 'game') return 'game';
  if (
    screen === 'home' ||
    screen === 'store' ||
    screen === 'about' ||
    screen === 'settings' ||
    screen === 'career' ||
    screen === 'cards'
  ) {
    return 'menu';
  }
  return 'off';
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

function makeLayer(src: string, rate: number) {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  audio.playbackRate = rate;
  // Keep pitch from sounding chipmunk/chip when slowed (where supported).
  try {
    (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
  } catch {
    /* ignore */
  }
  return audio;
}

/** Menu bed on home/store/… ; light slowed quiz bed during gameplay. */
export function useAmbientMusic(screen: AmbientScreen) {
  const menuRef = useRef<HTMLAudioElement | null>(null);
  const gameRef = useRef<HTMLAudioElement | null>(null);
  const cancelMenuFade = useRef<(() => void) | null>(null);
  const cancelGameFade = useRef<(() => void) | null>(null);
  const modeRef = useRef<AmbientMode>(modeForScreen(screen));
  const applyModeRef = useRef<(mode: AmbientMode) => void>(() => {});
  const syncVolumeRef = useRef<() => void>(() => {});

  modeRef.current = modeForScreen(screen);

  useEffect(() => {
    const menu = makeLayer(MENU_TRACK, MENU_RATE);
    const game = makeLayer(GAME_TRACK, GAME_RATE);
    menuRef.current = menu;
    gameRef.current = game;

    const stopFade = (which: 'menu' | 'game') => {
      if (which === 'menu') {
        cancelMenuFade.current?.();
        cancelMenuFade.current = null;
      } else {
        cancelGameFade.current?.();
        cancelGameFade.current = null;
      }
    };

    const fadeLayer = (
      audio: HTMLAudioElement,
      which: 'menu' | 'game',
      to: number,
      onDone?: () => void,
    ) => {
      stopFade(which);
      const cancel = fadeVolume(audio, to, FADE_MS, onDone);
      if (which === 'menu') cancelMenuFade.current = cancel;
      else cancelGameFade.current = cancel;
    };

    const menuTarget = () => effectiveMusicVolume() * getAmbientDuck();
    const gameTarget = () => effectiveMusicVolume() * getAmbientDuck() * GAME_GAIN;

    const playLayer = (audio: HTMLAudioElement, which: 'menu' | 'game', to: number) => {
      if (to <= 0) {
        fadeLayer(audio, which, 0, () => audio.pause());
        return;
      }
      const startFade = () => fadeLayer(audio, which, to);
      if (audio.paused) {
        audio.volume = 0;
        void audio
          .play()
          .then(startFade)
          .catch(() => {
            /* gesture retry */
          });
      } else {
        startFade();
      }
    };

    const hushLayer = (audio: HTMLAudioElement, which: 'menu' | 'game') => {
      fadeLayer(audio, which, 0, () => audio.pause());
    };

    const applyMode = (mode: AmbientMode) => {
      if (mode === 'menu') {
        hushLayer(game, 'game');
        playLayer(menu, 'menu', menuTarget());
      } else if (mode === 'game') {
        hushLayer(menu, 'menu');
        playLayer(game, 'game', gameTarget());
      } else {
        hushLayer(menu, 'menu');
        hushLayer(game, 'game');
      }
    };

    const syncVolume = () => {
      const mode = modeRef.current;
      if (mode === 'menu') {
        const to = menuTarget();
        if (to <= 0 && effectiveMusicVolume() <= 0) {
          fadeLayer(menu, 'menu', 0, () => menu.pause());
          return;
        }
        if (menu.paused && to > 0) playLayer(menu, 'menu', to);
        else fadeLayer(menu, 'menu', to, to <= 0 ? () => menu.pause() : undefined);
      } else if (mode === 'game') {
        const to = gameTarget();
        if (to <= 0 && effectiveMusicVolume() <= 0) {
          fadeLayer(game, 'game', 0, () => game.pause());
          return;
        }
        if (game.paused && to > 0) playLayer(game, 'game', to);
        else fadeLayer(game, 'game', to, to <= 0 ? () => game.pause() : undefined);
      }
    };

    applyModeRef.current = applyMode;
    syncVolumeRef.current = syncVolume;

    const detachGestures = () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
      document.removeEventListener('touchstart', onGesture);
    };

    const onGesture = () => {
      const mode = modeRef.current;
      if (mode === 'off') return;
      if (effectiveMusicVolume() <= 0) return;
      const audio = mode === 'game' ? game : menu;
      const to = mode === 'game' ? gameTarget() : menuTarget();
      if (to <= 0) return;
      audio.volume = 0;
      void audio
        .play()
        .then(() => {
          fadeLayer(audio, mode === 'game' ? 'game' : 'menu', to);
          detachGestures();
        })
        .catch(() => {
          /* keep listening */
        });
    };

    document.addEventListener('pointerdown', onGesture);
    document.addEventListener('keydown', onGesture);
    document.addEventListener('touchstart', onGesture, { passive: true });

    const unsub = subscribeSettings(() => syncVolumeRef.current());
    const unsubDuck = subscribeAmbientDuck(() => syncVolumeRef.current());

    applyMode(modeRef.current);

    return () => {
      stopFade('menu');
      stopFade('game');
      detachGestures();
      unsub();
      unsubDuck();
      menu.pause();
      game.pause();
      menu.src = '';
      game.src = '';
      menuRef.current = null;
      gameRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyModeRef.current(modeForScreen(screen));
  }, [screen]);
}
