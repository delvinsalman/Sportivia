import { useEffect, useRef } from 'react';
import { effectiveMusicVolume, subscribeSettings } from '../lib/settings';
import { getAmbientDuck, subscribeAmbientDuck } from '../lib/ambientControl';
import { assetUrl } from '../lib/assetUrl';

const MENU_TRACK = assetUrl('/audio/starlight-strut.mp3');
const CARDS_TRACK = assetUrl('/audio/playing-games.mp3');

const MENU_RATE = 0.82;
/** Slightly slower + softer bed for the Cards screen. */
const CARDS_RATE = 0.76;
const CARDS_GAIN = 0.72;
const FADE_MS = 1_250;

type AmbientScreen =
  | 'home'
  | 'about'
  | 'store'
  | 'cards'
  | 'settings'
  | 'career'
  | 'lobby'
  | 'bot-stake'
  | 'duel-versus'
  | 'intro'
  | 'game';

type BedId = 'menu' | 'cards' | 'none';

function isMenuScreen(screen: AmbientScreen) {
  return (
    screen === 'home' ||
    screen === 'store' ||
    screen === 'cards' ||
    screen === 'about' ||
    screen === 'settings' ||
    screen === 'career' ||
    screen === 'bot-stake'
  );
}

function bedForScreen(screen: AmbientScreen): BedId {
  if (!isMenuScreen(screen)) return 'none';
  return screen === 'cards' ? 'cards' : 'menu';
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
    // Smoothstep — gentle ease in/out for bed swaps
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

/**
 * Menu beds: default strut on most menus, a lighter/slower track on Cards.
 * Crossfades between beds and keeps each track’s playhead so returning
 * doesn’t restart from the top.
 */
export function useAmbientMusic(screen: AmbientScreen) {
  const menuRef = useRef<HTMLAudioElement | null>(null);
  const cardsRef = useRef<HTMLAudioElement | null>(null);
  const cancelFadesRef = useRef<Array<() => void>>([]);
  const bedRef = useRef<BedId>(bedForScreen(screen));
  const applyBedRef = useRef<(bed: BedId) => void>(() => {});
  const syncVolumeRef = useRef<() => void>(() => {});

  bedRef.current = bedForScreen(screen);

  useEffect(() => {
    const menu = new Audio(MENU_TRACK);
    menu.loop = true;
    menu.preload = 'auto';
    menu.volume = 0;
    menu.playbackRate = MENU_RATE;

    const cards = new Audio(CARDS_TRACK);
    cards.loop = true;
    cards.preload = 'auto';
    cards.volume = 0;
    cards.playbackRate = CARDS_RATE;

    menuRef.current = menu;
    cardsRef.current = cards;

    const stopFades = () => {
      cancelFadesRef.current.forEach(c => c());
      cancelFadesRef.current = [];
    };

    const fadeEl = (audio: HTMLAudioElement, to: number, onDone?: () => void) => {
      const cancel = fadeVolume(audio, to, FADE_MS, onDone);
      cancelFadesRef.current.push(cancel);
    };

    const targetFor = (bed: 'menu' | 'cards') => {
      const base = effectiveMusicVolume() * getAmbientDuck();
      if (base <= 0) return 0;
      return bed === 'cards' ? base * CARDS_GAIN : base;
    };

    const ensurePlaying = (audio: HTMLAudioElement) => {
      if (!audio.paused) return Promise.resolve();
      // Resume mid-track — never reset currentTime.
      return audio.play().then(() => undefined).catch(() => undefined);
    };

    const applyBed = (bed: BedId) => {
      stopFades();
      const menuTarget = bed === 'menu' ? targetFor('menu') : 0;
      const cardsTarget = bed === 'cards' ? targetFor('cards') : 0;

      const settleMenu = () => {
        if (menuTarget <= 0 && menu.volume < 0.02) menu.pause();
      };
      const settleCards = () => {
        if (cardsTarget <= 0 && cards.volume < 0.02) cards.pause();
      };

      if (bed === 'menu' && menuTarget > 0) {
        void ensurePlaying(menu).then(() => fadeEl(menu, menuTarget));
      } else {
        fadeEl(menu, 0, settleMenu);
      }

      if (bed === 'cards' && cardsTarget > 0) {
        void ensurePlaying(cards).then(() => fadeEl(cards, cardsTarget));
      } else {
        fadeEl(cards, 0, settleCards);
      }
    };

    const syncVolume = () => {
      applyBed(bedRef.current);
    };

    applyBedRef.current = applyBed;
    syncVolumeRef.current = syncVolume;

    const detachGestures = () => {
      document.removeEventListener('pointerdown', onGesture);
      document.removeEventListener('keydown', onGesture);
      document.removeEventListener('touchstart', onGesture);
    };

    const onGesture = () => {
      if (bedRef.current === 'none') return;
      if (effectiveMusicVolume() <= 0) return;
      const active = bedRef.current === 'cards' ? cards : menu;
      active.volume = 0;
      void active.play().then(() => {
        applyBed(bedRef.current);
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

    applyBed(bedRef.current);

    return () => {
      stopFades();
      detachGestures();
      unsub();
      unsubDuck();
      menu.pause();
      cards.pause();
      menu.src = '';
      cards.src = '';
      menuRef.current = null;
      cardsRef.current = null;
    };
  }, []);

  useEffect(() => {
    applyBedRef.current(bedForScreen(screen));
  }, [screen]);
}
