// components/FadeIn.tsx
// Fade-in + slide-up on scroll using framer-motion (already in package.json)
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface Props {
  children:   ReactNode;
  delay?:     number;   // stagger delay in seconds
  className?: string;
  from?:      'bottom' | 'left' | 'none';
}

export function FadeIn({ children, delay = 0, className, from = 'bottom' }: Props) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const initial = {
    opacity: 0,
    y:  from === 'bottom' ?  18 : 0,
    x:  from === 'left'   ? -18 : 0,
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : initial}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
