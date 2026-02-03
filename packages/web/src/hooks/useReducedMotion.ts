import { useEffect, useState } from 'react';

/**
 * Hook per rispettare prefers-reduced-motion
 * Usare per disabilitare/ridurre animazioni
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Varianti Framer Motion che rispettano reduced motion
 */
export const safeMotionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },

  // Versione sicura di slide up (diventa solo fade se reduced motion)
  slideUp: (reducedMotion: boolean) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reducedMotion ? 0 : 20 },
  }),

  // Scale sicuro
  scale: (reducedMotion: boolean) => ({
    initial: { opacity: 0, scale: reducedMotion ? 1 : 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: reducedMotion ? 1 : 0.95 },
  }),
};
