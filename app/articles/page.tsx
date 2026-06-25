// app/articles/page.tsx
import Link from 'next/link';
import { Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

const PAGE_SIZE = 9;

interface Props {
  searchParams: { category?: string; page?: string };
}

export async function generateMetadata({ searchParams }: Props) {
  const cat = searchParams.category;
  return {
    title: cat ? `${cat} — Articles` : 'Articles & Writeups',
    description: 'In-depth analyses, malware writeups, and technique deep-dives.',
  };
}

export default async function ArticlesPage({ searchParams }: Props) {
  const supabase     = createClient();
  const activeCategory = searchParams.category ?? null;
  const currentPage  = Math.max(1, parseInt(searchParams.page ?? '1', 10));
  const from         = (currentPage - 1) * PAGE_SIZE;
  const to           = from + PAGE_SIZE - 1;

  // Fetch all categories for filter pills (distinct)
  const { data: allForCats } = await supabase
    .from('articles')
    .select('category')
    .eq('is_published', true)
    .not('category', 'is', null)
    .order('category');

  const categories: string[] = Array.from(
    new Set((allForCats ?? []).map((a: any) => a.category).filter(Boolean))
  ).sort() as string[];

  // Fetch paginated + filtered articles
  let query = supabase
    .from('articles')
    .select('id, slug, title, excerpt, category, tags, published_at, reading_time, view_count', { count: 'exact' })
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (activeCategory) query = query.eq('category', activeCategory);
  query = query.range(from, to);

  const { data: articles, count } = await query;
  const totalArticles = count ?? 0;
  const totalPages    = Math.ceil(totalArticles / PAGE_SIZE);

  function buildHref(opts: { cat?: string | null; page?: number }) {
    const params = new URLSearchParams();
    const cat  = 'cat'  in opts ? opts.cat  : activeCategory;
    const page = 'page' in opts ? opts.page : currentPage;
    if (cat)        params.set('category', cat);
    if (page && page > 1) params.set('page', String(page));
    const qs = params.toString();
    return `/articles${qs ? `?${qs}` : ''}`;
  }

  // Page window: show 5 pages around current
  function pageWindow() {
    const delta = 2;
    const left  = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    const pages: (number | '...')[] = [];
    if (left > 1)            { pages.push(1); if (left > 2) pages.push('...'); }
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages) { if (right < totalPages - 1) pages.push('...'); pages.push(totalPages); }
    return pages;
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Header ── */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-12">
          <p className="eyebrow mb-3">Lab notebook</p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            style={{ color: 'hsl(var(--foreground))' }}>
            Articles &amp; writeups
          </h1>
          <p className="font-serif text-lg max-w-2xl leading-relaxed"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            In-depth analyses of malware samples, technique deep-dives, and lab notes
            from the field. Long-form, technical, no fluff.
          </p>
        </div>
      </section>

      <div className="container py-10">

        {/* ── Category filter pills ── */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {/* All */}
            <Link href={buildHref({ cat: null, page: 1 })}
              className="font-sans text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
              style={!activeCategory ? {
                background: 'hsl(var(--primary)/0.12)',
                color:      'hsl(var(--primary))',
                border:     '1px solid hsl(var(--primary)/0.35)',
              } : {
                color:  'hsl(var(--foreground-muted))',
                border: '1px solid hsl(var(--border))',
              }}>
              All articles
            </Link>

            {categories.map(cat => (
              <Link key={cat} href={buildHref({ cat, page: 1 })}
                className="font-sans text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
                style={activeCategory === cat ? {
                  background: 'hsl(var(--primary)/0.12)',
                  color:      'hsl(var(--primary))',
                  border:     '1px solid hsl(var(--primary)/0.35)',
                } : {
                  color:  'hsl(var(--foreground-muted))',
                  border: '1px solid hsl(var(--border))',
                }}>
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* ── Result count ── */}
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
          {totalArticles} article{totalArticles !== 1 ? 's' : ''}
          {activeCategory ? ` in "${activeCategory}"` : ' across all categories'}
          {totalPages > 1 && ` — page ${currentPage} of ${totalPages}`}
        </p>

        {/* ── Empty state ── */}
        {(!articles || articles.length === 0) ? (
          <div className="card p-16 text-center rounded-xl">
            <BookOpen className="w-10 h-10 mx-auto mb-4"
              style={{ color: 'hsl(var(--foreground-subtle))' }} />
            <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>
              {activeCategory
                ? `No articles in "${activeCategory}" yet.`
                : 'No articles published yet.'}
            </p>
            {activeCategory && (
              <Link href="/articles" className="btn-ghost inline-flex">
                View all articles
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* ── Article grid ── */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {articles.map((a: any) => (
                <Link key={a.id} href={`/articles/${a.slug}`}
                  className="card card-interactive p-6 group flex flex-col">

                  {/* Category badge */}
                  {a.category && (
                    <div className="mb-4">
                      <span className="badge badge-tag">{a.category}</span>
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="font-display text-lg font-semibold mb-3 leading-snug
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {a.title}
                  </h2>

                  {/* Excerpt */}
                  {a.excerpt && (
                    <p className="font-serif text-sm leading-relaxed mb-4 line-clamp-3 flex-1"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {a.excerpt}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-4 flex items-center justify-between text-xs"
                    style={{ borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground-subtle))' }}>
                    <span>{a.published_at ? formatDate(a.published_at) : ''}</span>
                    {a.reading_time && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {a.reading_time} min
                      </span>
                    )}
                  </div>

                  {/* Read link */}
                  <span className="mt-4 font-sans text-sm font-semibold inline-flex items-center gap-1
                    group-hover:gap-2 transition-all"
                    style={{ color: 'hsl(var(--primary))' }}>
                    Read &rarr;
                  </span>
                </Link>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-1 flex-wrap">
                {/* Prev */}
                {currentPage > 1 ? (
                  <Link href={buildHref({ page: currentPage - 1 })}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors hover:bg-[hsl(var(--card-hover))]"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium opacity-35"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </span>
                )}

                {/* Page numbers */}
                {pageWindow().map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-2 text-sm"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      ...
                    </span>
                  ) : (
                    <Link key={p} href={buildHref({ page: p as number })}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold
                        transition-colors"
                      style={p === currentPage ? {
                        background: 'hsl(var(--primary))',
                        color:      'hsl(var(--primary-foreground))',
                      } : {
                        color: 'hsl(var(--foreground-muted))',
                      }}>
                      {p}
                    </Link>
                  )
                )}

                {/* Next */}
                {currentPage < totalPages ? (
                  <Link href={buildHref({ page: currentPage + 1 })}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors hover:bg-[hsl(var(--card-hover))]"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    Next <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium opacity-35"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    Next <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
