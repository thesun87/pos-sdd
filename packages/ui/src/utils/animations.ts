import { type Variants } from 'framer-motion';

export const animations = {
  flyToCart: {
    initial: { scale: 1, opacity: 1 },
    animate: { scale: 0.5, opacity: 0, x: '100%', y: '-100%', transition: { duration: 0.3, ease: 'easeInOut' } },
  },
  slideIn: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { type: 'spring', damping: 20, stiffness: 100 } },
    exit: { x: '100%', opacity: 0 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0 },
  },
  shake: {
    animate: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.4 } },
  },
} satisfies Record<string, Variants>;
