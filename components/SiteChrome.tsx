'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './navbar';
import { Footer } from './footer';
import { ScrollToTop } from './ScrollToTop';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAdmin = path.startsWith('/admin');
  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && <Footer />}
      {!isAdmin && <ScrollToTop />}
    </>
  );
}
