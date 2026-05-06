import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
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
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Lab notebook
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Articles &amp; writeups
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        In-depth analyses of malware samples, technique deep-dives, and lab
        notes from the field. Long-form, technical, no fluff.
      </p>

      {!articles || articles.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            No articles published yet. Add them via the admin panel.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((a) => (
            <Link key={a.id} href={`/articles/${a.slug}`} className="card-forensic p-6 group flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                {a.category && <span className="badge-tag">{a.category}</span>}
              </div>
              <h2 className="font-mono text-xl text-bone-50 mb-3 group-hover:text-gold-500 transition-colors leading-tight">
                {a.title}
              </h2>
              {a.excerpt && (
                <p className="font-serif text-bone-200 leading-relaxed mb-4 line-clamp-3">
                  {a.excerpt}
                </p>
              )}
              <div className="mt-auto pt-4 border-t border-navy-700 flex items-center justify-between font-mono text-xs text-bone-300">
                <span>{a.published_at ? formatDate(a.published_at) : '—'}</span>
                {a.reading_time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {a.reading_time} min
                  </span>
                )}
              </div>
              <span className="mt-4 font-mono text-xs uppercase tracking-wider text-gold-500 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Read <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
