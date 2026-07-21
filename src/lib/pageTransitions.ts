import type { Transition, Variants } from 'framer-motion';

/** Snappy ease — quick out, minimal float */
export const PAGE_EASE = [0.32, 0.72, 0, 1] as const;

export const PAGE_TRANSITION: Transition = {
  duration: 0.26,
  ease: PAGE_EASE,
};

export const PAGE_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.85,
};

export const PAGE_VARIANTS = {
  menu: {
    initial: { opacity: 0, y: 20, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -16, scale: 0.99 },
  },
  play: {
    initial: { opacity: 0, scale: 0.92, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.06, y: -10 },
  },
  game: {
    initial: { opacity: 0, y: 28, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -22, scale: 0.97 },
  },
} satisfies Record<string, Variants>;

export type PageTransitionVariant = keyof typeof PAGE_VARIANTS;
