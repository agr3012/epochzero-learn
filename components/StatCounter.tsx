// components/StatCounter.tsx
// Animated count-up when the element scrolls into view
// Uses native IntersectionObserver — no extra package needed
'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  value:    number;
  suffix?:  string;
  duration?: number; // ms
}

export function StatCounter({ value, suffix = '', duration = 1600 }: Props) {
  const [display, setDisplay] = useState(0);
  const spanRef  = useRef<HTMLSpanElement>(null);
  const started  = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true;
          const t0 = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - t0) / duration, 1);
            // Ease-out cubic — fast start, gentle landing
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(tick);
          };

          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={spanRef}>
      {display.toLocaleString()}{suffix}
    </span>
  );
}
