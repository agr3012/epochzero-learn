// app/articles/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, Clock, Eye, Download, ChevronLeft,
  User, Headphones, Globe, ExternalLink, BookOpen, ArrowRight,
} from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount } from '@/lib/auth';
import { getArticleReadSet, getReelWatchedSet } from '@/lib/progress';
import { formatDate } from '@/lib/utils';
import { ArticleMarkReadButton } from '@/components/article-mark-read-button';
import { ReelPlayer } from '@/components/ReelPlayer';

export const dynamic = 'force-dynamic';
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles').select('title, excerpt')
    .eq('slug', params.slug).eq('is_published', true).single();
  if (!data) return { title: 'Article Not Found' };
  return { title: data.title, description: data.excerpt };
}

// Related-section icon colors
const SEC = { podcast: '#8B5E1A', resource: '#1B5FA8', external: '#1B7C3E' };

export default async function ArticleDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: article } = await supabase
    .from('articles').select('*')
    .eq('slug', params.slug).eq('is_published', true).single();
  if (!article) notFound();

  createAdminClient()
    .rpc('increment_article_views', { p_slug: params.slug })
    .then(() => {}, () => {});

  const account = await getCurrentAccount();
  const alreadyRead = account ? (await getArticleReadSet(account.id, [article.id])).has(article.id) : false;

  // Quick Bite: look for a reel that supplements this article.
  // Use admin client so RLS on the reels table never blocks the fetch.
  const { data: articleReel } = await createAdminClient()
    .from('reels')
    .select('id, youtube_id, title, description, duration_seconds')
    .eq('topic_slug', params.slug)
    .eq('is_published', true)
    .limit(1)
    .maybeSingle();
  const reelWatched = (articleReel && account)
    ? (await getReelWatchedSet(account.id, [articleReel.id])).has(articleReel.id)
    : false;

  const { data: topicRow } = await supabase
    .from('topics').select('id')
    .eq('slug', params.slug).maybeSingle();

  let webLinks: { id: string; title: string; url: string; description: string | null; source_type: string | null }[] = [];
  let resources: { id: string; slug: string | null; title: string; file_url: string; type: string | null; page_count: number | null; version: string | null }[] = [];

  if (topicRow?.id) {
    const [linksRes, resourcesRes] = await Promise.all([
      supabase.from('topic_web_links').select('id, title, url, description, source_type')
        .eq('topic_id', topicRow.id).order('order_index', { ascending: true }),
      supabase.from('topic_resources').select('order_index, resources(id, slug, title, file_url, type, page_count, version)')
        .eq('topic_id', topicRow.id).order('order_index', { ascending: true }),
    ]);
    webLinks  = linksRes.data ?? [];
    resources = (resourcesRes.data ?? []).map((r: any) => r.resources).filter(Boolean);
  }

  const podcastLinks  = webLinks.filter(l => l.source_type === 'podcast');
  const externalLinks = webLinks.filter(l => l.source_type !== 'podcast');
  const hasRelated    = podcastLinks.length > 0 || externalLinks.length > 0 || resources.length > 0;

  return (
    <article className="container py-12 lg:py-16 max-w-4xl">

      {/* ── Back link ── */}
      <Link href="/articles"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors
          hover:text-[hsl(var(--foreground))]"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" /> All articles
      </Link>

      {/* ── Header ── */}
      <header className="mb-10">
        {/* Badges */}
        {(article.category || (Array.isArray(article.tags) && article.tags.length > 0)) && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {article.category && <span className="badge badge-tag self-start">{article.category}</span>}
            {Array.isArray(article.tags) && article.tags.slice(0, 3).map((t: string) => (
              <span key={t} className="badge badge-tag self-start">{t}</span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="font-display text-3xl lg:text-5xl font-bold leading-[1.1] mb-5 text-balance"
          style={{ color: 'hsl(var(--foreground))' }}>
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="font-serif text-xl leading-relaxed mb-7 max-w-3xl"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            {article.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm pb-7"
          style={{
            color: 'hsl(var(--foreground-muted))',
            borderBottom: '1px solid hsl(var(--border))',
          }}>
          {article.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
              {article.author}
            </span>
          )}
          {article.published_at && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
              {formatDate(article.published_at)}
            </span>
          )}
          {article.reading_time && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
              {article.reading_time} min read
            </span>
          )}
          {typeof article.view_count === 'number' && article.view_count > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" style={{ color: 'hsl(var(--primary))' }} />
              {article.view_count.toLocaleString()} views
            </span>
          )}
          {article.pdf_url && (
            <a href={article.pdf_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium transition-colors
                hover:text-[hsl(var(--foreground))]"
              style={{ color: 'hsl(var(--primary))' }}>
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          )}
        </div>
      </header>

      {/* ── Cover image ── */}
      {article.cover_image && (
        <div className="relative aspect-video mb-10 rounded-xl overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))' }}>
          <Image src={article.cover_image} alt={article.title} fill className="object-cover" />
        </div>
      )}

      {/* ── Quick Bite reel (if one exists for this article) ── */}
      {articleReel && (
        <div className="mb-10 rounded-2xl overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
          <div className="flex flex-col sm:flex-row gap-0">
            {/* Portrait player */}
            <div className="shrink-0 p-4 flex items-center justify-center"
              style={{ background: 'hsl(var(--muted) / 0.4)' }}>
              <ReelPlayer
                youtubeId={articleReel.youtube_id}
                reelId={articleReel.id}
                durationSeconds={articleReel.duration_seconds}
                initialCompleted={reelWatched}
                layout="portrait"
              />
            </div>
            {/* Info */}
            <div className="p-5 sm:p-6 flex flex-col gap-3 justify-center">
              <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.12em]"
                style={{ color: 'hsl(var(--primary))' }}>
                ⚡ Quick Bite · {articleReel.duration_seconds}s
              </p>
              <h3 className="font-display text-base font-bold leading-snug"
                style={{ color: 'hsl(var(--foreground))' }}>
                {articleReel.title}
              </h3>
              {articleReel.description && (
                <p className="font-serif text-sm leading-relaxed"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {articleReel.description}
                </p>
              )}
              <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                Watch this {articleReel.duration_seconds}-second summary before diving into the full article.
                {!account && ' Sign in to earn 5 leaderboard points.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MDX content ── */}
      <div className="prose-rema">
        <MDXRemote
          source={article.mdx_content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, rehypeHighlight] } }}
        />
      </div>

      {/* ── Mark as read ── */}
      <div className="mt-10 pt-8" style={{ borderTop: '1px solid hsl(var(--border))' }}>
        {account ? (
          <ArticleMarkReadButton articleId={article.id} initialRead={alreadyRead} />
        ) : (
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            <Link href="/dashboard/login" className="hover:underline" style={{ color: 'hsl(var(--primary))' }}>Sign in</Link>{' '}
            to mark this article as read and track your progress.
          </p>
        )}
      </div>

      {/* ── Related Resources ── */}
      {hasRelated && (
        <aside className="mt-16 pt-10 space-y-8"
          style={{ borderTop: '1px solid hsl(var(--border))' }}>
          {/* Heading */}
          <div>
            <p className="eyebrow mb-2">Related to this topic</p>
            <h2 className="font-display text-2xl font-semibold"
              style={{ color: 'hsl(var(--foreground))' }}>
              Continue learning
            </h2>
          </div>

          {/* Podcast episodes */}
          {podcastLinks.length > 0 && (
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wide mb-3
                inline-flex items-center gap-2"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <Headphones className="w-3.5 h-3.5" style={{ color: SEC.podcast }} />
                Listen
              </h3>
              <div className="space-y-2">
                {podcastLinks.map(link => (
                  <a key={link.id} href={link.url}
                    className="card card-interactive flex items-start gap-4 p-4 group">
                    <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center"
                      style={{ background: SEC.podcast }}>
                      <Headphones className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans text-sm font-semibold mb-1
                        group-hover:text-[hsl(var(--primary))] transition-colors"
                        style={{ color: 'hsl(var(--foreground))' }}>
                        {link.title}
                      </div>
                      {link.description && (
                        <p className="font-serif text-xs leading-relaxed"
                          style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5"
                      style={{ color: 'hsl(var(--foreground-subtle))' }} />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Downloadable resources — 2×2 grid with correct portal links */}
          {resources.length > 0 && (
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wide mb-3
                inline-flex items-center gap-2"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <BookOpen className="w-3.5 h-3.5" style={{ color: SEC.resource }} />
                Reference material
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {resources.map(r => {
                  const href = r.slug ? `/resources/${r.slug}` : `/api/pdf/${r.file_url}`;
                  return (
                    <Link key={r.id} href={href}
                      className="card card-interactive p-5 group flex flex-col gap-3">
                      <div className="flex items-start justify-between">
                        <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                          style={{ background: SEC.resource }}>
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        {r.type && (
                          <span className="badge badge-tag text-[10px]">{r.type}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-display text-sm font-semibold mb-1 leading-snug
                          group-hover:text-[hsl(var(--primary))] transition-colors"
                          style={{ color: 'hsl(var(--foreground))' }}>
                          {r.title}
                        </div>
                        <div className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {[r.page_count ? `${r.page_count} pages` : null, r.version ? `v${r.version}` : null]
                            .filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold"
                        style={{ color: SEC.resource }}>
                        Open resource <ArrowRight className="w-3 h-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* External links */}
          {externalLinks.length > 0 && (
            <div>
              <h3 className="font-sans text-xs font-semibold uppercase tracking-wide mb-3
                inline-flex items-center gap-2"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <Globe className="w-3.5 h-3.5" style={{ color: SEC.external }} />
                External references
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {externalLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="card card-interactive flex items-start gap-3 p-4 group">
                    <Globe className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: SEC.external }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-sans text-sm font-medium leading-snug
                          group-hover:text-[hsl(var(--primary))] transition-colors"
                          style={{ color: 'hsl(var(--foreground))' }}>
                          {link.title}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 mt-0.5"
                          style={{ color: 'hsl(var(--foreground-subtle))' }} />
                      </div>
                      {link.description && (
                        <p className="font-serif text-xs leading-relaxed"
                          style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {link.description}
                        </p>
                      )}
                      {link.source_type && (
                        <span className="badge badge-tag text-[10px] mt-2 inline-flex self-start">
                          {link.source_type}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* ── Footer ── */}
      <footer className="mt-16 pt-8 flex flex-wrap gap-3"
        style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <Link href="/articles" className="btn-ghost">
          <ChevronLeft className="w-4 h-4" /> More articles
        </Link>
        <Link href="/tests" className="btn-ghost">
          Test your knowledge <ArrowRight className="w-4 h-4" />
        </Link>
      </footer>
    </article>
  );
}
