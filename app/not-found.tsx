import Link from 'next/link'
import { Home, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center space-y-8">

        <div className="space-y-4">
          <p className="font-mono text-xs tracking-widest text-[hsl(var(--primary))] uppercase">
            404
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[hsl(var(--foreground))]">
            Page not found.
          </h1>
          <p className="text-[hsl(var(--foreground-muted))] leading-relaxed">
            The page you are looking for does not exist. The URL may be incorrect, or the content may have been unpublished.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Home className="w-4 h-4" />
            Back to home
          </Link>
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))] text-sm font-medium hover:border-[hsl(var(--primary)/0.4)] transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Browse learning paths
          </Link>
        </div>

      </div>
    </div>
  )
}
