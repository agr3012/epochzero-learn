import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container py-24 lg:py-32 text-center">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-crimson-400 mb-4">
        // 0x404
      </div>
      <h1 className="font-mono text-6xl lg:text-8xl font-bold text-bone-50 mb-6">
        Sample not found.
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-xl mx-auto leading-relaxed mb-12">
        The page you tried to analyse doesn't exist. Either the URL is wrong, or
        the resource was unpublished.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="btn-primary">
          <Home className="w-4 h-4" />
          Back to home
        </Link>
        <Link href="/articles" className="btn-ghost">
          <ArrowLeft className="w-4 h-4" />
          Browse articles
        </Link>
      </div>
    </div>
  );
}
