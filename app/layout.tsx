import type { Metadata } from 'next';
import { JetBrains_Mono, Fraunces, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import './globals.css';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'REMA Club — Reverse. Reveal. Respond.',
    template: '%s — REMA Club',
  },
  description:
    'A learning hub for Reverse Engineering & Malware Analysis. Articles, video walkthroughs, MCQ tests with certificates, eBook and question bank — built for serious students of malware.',
  keywords: [
    'malware analysis',
    'reverse engineering',
    'cybersecurity education',
    'REMA',
    'static analysis',
    'dynamic analysis',
    'YARA',
    'incident response',
  ],
  authors: [{ name: 'Ashish Revar' }],
  openGraph: {
    title: 'REMA Club — Reverse. Reveal. Respond.',
    description: 'Learning hub for Reverse Engineering & Malware Analysis.',
    type: 'website',
    locale: 'en_IN',
  },
  robots: { index: true, follow: true },
  icons: { icon: '/logo.png', apple: '/logo.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${jetbrainsMono.variable} ${fraunces.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            className: 'font-mono text-sm border border-navy-700 bg-navy-800 text-bone-100',
          }}
        />
      </body>
    </html>
  );
}
