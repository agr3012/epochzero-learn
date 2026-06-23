'use client';

// components/ScrollToTop.tsx

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() { setVisible(window.scrollY > 300); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 w-10 h-10
        rounded-full flex items-center justify-center
        shadow-lg transition-all duration-200
        hover:scale-105 active:scale-95"
      style={{
        background: 'hsl(var(--primary))',
        color: 'hsl(var(--primary-foreground))',
      }}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
