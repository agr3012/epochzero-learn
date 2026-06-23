import Link from 'next/link';
import { ArrowRight, Clock, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Articles' };

export default async function ArticlesPage() {
  const supabase = createClient();
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, tags, published_at, reading_time, view_count')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  return (
    <div className="container py-16 lg:py-24">

      {/* ── Header ── */}
      <div className="mb-12">
        <p className="eyebrow mb-3">Lab notebook</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold
          text-[hsl(var(--foreground))] mb-4 leading-tight">
          Articles &amp; writeups
        </h1>
        <p className="font-serif text-lg text-[hsl(var(--foreground-muted))]
          max-w-2xl leading-relaxed">
          In-depth analyses of malware samples, technique deep-dives, and lab
          notes from the field. Long-form, technical, no fluff.
        </p>
      </div>

      {/* ── Empty state ── */}
      {!articles || articles.length === 0 ? (
        <div className="card p-12 text-center">
          <BookOpen className="w-10 h-10 text-[hsl(var(--foreground-subtle))] mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            No articles published yet. Add them via the admin panel.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/articles/${a.slug}`}
              className="card card-interactive p-6 group flex flex-col"
            >
              {/* ── Category badge ── */}
              {a.category && (
                <div className="mb-4">
                  <span className="badge badge-tag">{a.category}</span>
                </div>
              )}

              {/* ── Title ── */}
              <h2 className="font-display text-lg font-semibold
                text-[hsl(var(--foreground))] mb-3
                group-hover:text-[hsl(var(--primary))] transition-colors
                leading-snug">
                {a.title}
              </h2>

              {/* ── Excerpt ── */}
              {a.excerpt && (
                <p className="font-serif text-sm text-[hsl(var(--foreground-muted))]
                  leading-relaxed mb-4 line-clamp-3">
                  {a.excerpt}
                </p>
              )}

              {/* ── Footer row ── */}
              <div className="mt-auto pt-4 border-t border-[hsl(var(--border))]
                flex items-center justify-between
                text-xs text-[hsl(var(--foreground-subtle))]">
                <span>{a.published_at ? formatDate(a.published_at) : '—'}</span>
                {a.reading_time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {a.reading_time} min
                  </span>
                )}
              </div>

              {/* ── Read link ── */}
              <span className="mt-4 font-sans text-sm font-medium
                text-[hsl(var(--primary))]
                inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Read <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
