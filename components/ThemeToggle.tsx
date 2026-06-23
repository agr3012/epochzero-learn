// components/ThemeToggle.tsx
'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 flex items-center justify-center rounded-full
        transition-colors duration-150"
      style={{
        color: 'hsl(var(--foreground-muted))',
        background: 'hsl(var(--border))',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'hsl(var(--border-strong))';
        (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground))';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'hsl(var(--border))';
        (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground-muted))';
      }}
    >
      {theme === 'dark'
        ? <Sun  className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
