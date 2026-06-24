// components/ScrollToTop.tsx
'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 120px threshold — appears quickly on mobile too
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // check on mount in case page is already scrolled
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed z-[9999] flex items-center justify-center
        rounded-full shadow-lg transition-all duration-200
        hover:scale-105 active:scale-95"
      style={{
        /* Safe area aware — sits above mobile browser chrome */
        bottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
        right:  '1.25rem',
        width:  '40px',
        height: '40px',
        background: 'hsl(var(--primary))',
        color:      'hsl(var(--primary-foreground))',
      }}
    >
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
