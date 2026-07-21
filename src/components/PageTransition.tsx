import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
  PAGE_TRANSITION,
  PAGE_VARIANTS,
  type PageTransitionVariant,
} from '../lib/pageTransitions';

interface PageTransitionProps {
  children: ReactNode;
  variant?: PageTransitionVariant;
  className?: string;
}

export function PageTransition({
  children,
  variant = 'menu',
  className = 'min-h-svh w-full',
}: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      variants={PAGE_VARIANTS[variant]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={PAGE_TRANSITION}
    >
      {children}
    </motion.div>
  );
}
