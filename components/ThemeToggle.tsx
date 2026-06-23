// components/ThemeToggle.tsx
// Add this button to your Navbar (top-right icon area — like CyberDefenders)
'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-8 h-8 flex items-center justify-center rounded-md
        text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))]
        hover:bg-[hsl(var(--card))] transition-colors duration-150"
    >
      {theme === 'dark'
        ? <Sun  className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  );
}
