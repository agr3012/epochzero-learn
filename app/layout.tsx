import type { Metadata } from 'next';
import { JetBrains_Mono, Fraunces, Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { Suspense } from 'react';
import { SiteChrome } from '@/components/SiteChrome';
import { ThemeProvider } from '@/components/theme-provider';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

/* ── Fonts ────────────────────────────────────────────────────── */

// Display: headings only
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

// Sans: all body + UI text (default font)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Serif: article long-form prose only
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

// Mono: code blocks, terminal widget, episode labels ONLY
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

/* ── Metadata ─────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default:  'EpochZero Learn — Multi-Domain Tech Learning Hub',
    template: '%s — EpochZero Learn',
  },
  description:
    'A learning and event platform for Reverse Engineering, Malware Analysis, Cloud Security, Cryptography, Web Development, and more. Articles, videos, tests with certificates, and event registrations.',
  keywords: [
    'malware analysis', 'reverse engineering', 'cloud security',
    'cryptography', 'web development', 'cybersecurity education', 'CTF',
  ],
  authors: [{ name: 'Ashish Revar' }],
  openGraph: {
    title:       'EpochZero Learn — Multi-Domain Tech Learning Hub',
    description: 'Learning and event platform for tech students.',
    type:        'website',
    locale:      'en_IN',
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: '/favicon.ico',       sizes: 'any'          },
      { url: '/favicon.svg',       type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: '/apple-touch-icon.png',
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
  },
};

/* ── Root Layout ──────────────────────────────────────────────── */

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`
        ${plusJakartaSans.variable}
        ${inter.variable}
        ${fraunces.variable}
        ${jetbrainsMono.variable}
      `}
      suppressHydrationWarning
    >
      {/* Inline script runs before React hydration — prevents flash of wrong theme */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('ez-theme') || 'dark';
                document.documentElement.classList.add(t);
                document.documentElement.setAttribute('data-theme', t);
              } catch(e) {
                document.documentElement.classList.add('dark');
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <NextTopLoader
            color="#E8A020"
            height={2}
            showSpinner={false}
            shadow={false}
            speed={200}
            crawlSpeed={200}
          />
          <Suspense fallback={null}>
            <SiteChrome>
              <main className="flex-1">{children}</main>
              {modal}
            </SiteChrome>
          </Suspense>
          <Toaster
            position="bottom-right"
            theme="system"
            toastOptions={{
              className:
                'font-sans text-sm rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]',
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
