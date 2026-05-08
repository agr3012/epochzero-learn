import type { Metadata } from 'next';
import { JetBrains_Mono, Fraunces, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/navbar';
import { Suspense } from 'react';
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
    default: 'EpochZero Learn — Multi-Domain Tech Learning Hub',
    template: '%s — EpochZero Learn',
  },
  description:
    'A learning and event platform for Reverse Engineering, Malware Analysis, Cloud, Cryptography, Web Development, and more. Articles, videos, tests with certificates, and event registrations.',
  keywords: [
    'malware analysis',
    'reverse engineering',
    'cloud security',
    'cryptography',
    'web development',
    'cybersecurity education',
    'CTF',
    'student events',
  ],
  authors: [{ name: 'Ashish Revar' }],
  openGraph: {
    title: 'EpochZero Learn — Multi-Domain Tech Learning Hub',
    description: 'Learning and event platform for tech students.',
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
        <Suspense fallback={<div className="h-16 border-b border-navy-700 bg-navy-900" />}>
          <Navbar />
        </Suspense>
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
