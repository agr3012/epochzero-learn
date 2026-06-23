// components/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme:  Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme:  'dark',
  toggle: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function applyTheme(t: Theme) {
  const html = document.documentElement;
  // Class-based (for Tailwind dark: variants)
  html.classList.remove('dark', 'light');
  html.classList.add(t);
  // data-theme attribute (for CSS var selectors like [data-theme="dark"])
  html.setAttribute('data-theme', t);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = (localStorage.getItem('ez-theme') as Theme) ?? 'dark';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('ez-theme', next);
    applyTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
