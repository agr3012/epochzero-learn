import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        // ── Brand palette ────────────────────────────────────────────────
        navy: {
          950: '#050D1A',
          900: '#080F1E',   // slightly bluer-dark for depth
          850: '#0C1729',   // NEW — between 900 and 800
          800: '#101E36',
          700: '#172B4D',
          600: '#1E3A66',
        },
        gold: {
          300: '#FFE8A3',   // NEW — light mode tint
          400: '#FFD680',
          500: '#E8A020',   // slightly amber, less "highlighter yellow"
          600: '#C47E0A',   // deeper for hover states
          700: '#9E6208',   // NEW — dark gold for light mode text
        },
        crimson: {
          400: '#D85A56',
          500: '#C73E3A',
          600: '#A82E2B',
        },
        bone: {
          50:  '#F5F1E6',
          100: '#E8EAF0',   // cooler — less warm/AI
          200: '#C8CDD9',
          300: '#8A91A8',
          400: '#5A6070',   // NEW — dark muted
        },

        // ── Semantic tokens (shadcn-compatible) ──────────────────────────
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },

      fontFamily: {
        // display: headings only — Plus Jakarta Sans adds character vs body Inter
        display: ['var(--font-display)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        // sans: all body + UI text
        sans:    ['var(--font-sans)',    'Inter', 'system-ui', 'sans-serif'],
        // mono: code blocks, terminal widget, episode labels ONLY
        mono:    ['var(--font-mono)',    'JetBrains Mono', 'Consolas', 'monospace'],
        // serif: article long-form prose only
        serif:   ['var(--font-serif)',   'Fraunces', 'Georgia', 'serif'],
      },

      borderRadius: {
        // --radius now 0.625rem (10px) — globally rounder than before
        '2xl': '1rem',
        xl:    '0.75rem',
        lg:    'var(--radius)',                     // 10px
        md:    'calc(var(--radius) - 2px)',          // 8px
        sm:    'calc(var(--radius) - 4px)',          // 6px
      },

      backgroundImage: {
        'grid-pattern':
          'linear-gradient(rgba(255,200,87,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,200,87,0.03) 1px, transparent 1px)',
        'scanlines':
          'repeating-linear-gradient(0deg, rgba(255,255,255,0.012), rgba(255,255,255,0.012) 1px, transparent 1px, transparent 3px)',
        'noise':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(232,160,32,0.10)' },
          '50%':      { boxShadow: '0 0 36px rgba(232,160,32,0.25)' },
        },
        'scan': {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)'  },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.5s ease-out forwards',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'scan':       'scan 4s linear infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
