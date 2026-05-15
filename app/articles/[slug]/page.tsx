import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  Eye,
  Download,
  ChevronLeft,
  User,
  Headphones,
  Globe,
  ExternalLink,
  BookOpen,
} from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!data) return { title: 'Article Not Found' };
  return { title: data.title, description: data.excerpt };
}

export default async function ArticleDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!article) notFound();

  // Fire-and-forget view increment
  createAdminClient()
    .rpc('increment_article_views', { p_slug: params.slug })
    .then(() => {}, () => {});

  // Fetch related resources from the topic matching this article's slug.
  // Articles and topics share the same slug, so topic_id can be found by
  // joining through topics.slug = article.slug.
  const { data: topicRow } = await supabase
    .from('topics')
    .select('id')
    .eq('slug', params.slug)
    .maybeSingle();

  let webLinks: {
    id: string;
    title: string;
    url: string;
    description: string | null;
    source_type: string | null;
  }[] = [];

  let resources: {
    id: string;
    title: string;
    file_url: string;
    type: string | null;
    page_count: number | null;
    version: string | null;
  }[] = [];

  if (topicRow?.id) {
    const [linksRes, resourcesRes] = await Promise.all([
      supabase
        .from('topic_web_links')
        .select('id, title, url, description, source_type')
        .eq('topic_id', topicRow.id)
        .order('order_index', { ascending: true }),
      supabase
        .from('topic_resources')
        .select('order_index, resources(id, title, file_url, type, page_count, version)')
        .eq('topic_id', topicRow.id)
        .order('order_index', { ascending: true }),
    ]);

    webLinks = linksRes.data ?? [];
    resources = (resourcesRes.data ?? [])
      .map((r: any) => r.resources)
      .filter(Boolean);
  }

  // Split web links into podcast and non-podcast
  const podcastLinks = webLinks.filter((l) => l.source_type === 'podcast');
  const externalLinks = webLinks.filter((l) => l.source_type !== 'podcast');
  const hasRelated = podcastLinks.length > 0 || externalLinks.length > 0 || resources.length > 0;

  return (
    <article className="container py-12 lg:py-16 max-w-4xl">
      <Link
        href="/articles"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 mb-8 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> All articles
      </Link>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          {article.category && <span className="badge-tag">{article.category}</span>}
          {Array.isArray(article.tags) &&
            article.tags.slice(0, 3).map((t: string) => (
              <span key={t} className="badge-tag">{t}</span>
            ))}
        </div>

        <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-6 leading-[1.1] text-balance">
          {article.title}
        </h1>

        {article.excerpt && (
          <p className="font-serif text-xl text-bone-200 leading-relaxed mb-8 max-w-3xl">
            {article.excerpt}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-xs text-bone-300 pb-8 border-b border-navy-700">
          {article.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3 h-3 text-gold-500" />
              {article.author}
            </span>
          )}
          {article.published_at && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-gold-500" />
              {formatDate(article.published_at)}
            </span>
          )}
          {article.reading_time && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-gold-500" />
              {article.reading_time} min read
            </span>
          )}
          {typeof article.view_count === 'number' && (
            <span className="inline-flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-gold-500" />
              {article.view_count.toLocaleString()} views
            </span>
          )}
          {article.pdf_url && (
            <a
              href={article.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-400 transition-colors"
            >
              <Download className="w-3 h-3" />
              Download PDF
            </a>
          )}
        </div>
      </header>

      {/* Cover image */}
      {article.cover_image && (
        <div className="relative aspect-video mb-12 border border-navy-700 overflow-hidden">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* MDX content */}
      <div className="prose-rema">
        <MDXRemote
          source={article.mdx_content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeHighlight],
            },
          }}
        />
      </div>

      {/* ── Related Resources ─────────────────────────────────────────── */}
      {hasRelated && (
        <aside className="mt-16 pt-8 border-t border-navy-700 space-y-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-1">
              // Related to this topic
            </div>
            <h2 className="font-mono text-xl text-bone-50">
              Continue learning
            </h2>
          </div>

          {/* Podcast episodes */}
          {podcastLinks.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-bone-400 mb-3 inline-flex items-center gap-2">
                <Headphones className="w-3 h-3 text-gold-500" />
                Listen
              </h3>
              <div className="space-y-3">
                {podcastLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    className="flex items-start gap-4 p-4 border border-navy-700 hover:border-gold-500 transition-colors group"
                  >
                    <div className="w-10 h-10 shrink-0 border border-gold-500/40 bg-navy-800 flex items-center justify-center">
                      <Headphones className="w-4 h-4 text-gold-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-bone-50 group-hover:text-gold-500 transition-colors mb-1">
                        {link.title}
                      </div>
                      {link.description && (
                        <p className="font-serif text-xs text-bone-300 leading-relaxed">
                          {link.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-bone-400 shrink-0 mt-1" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Downloadable resources */}
          {resources.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-bone-400 mb-3 inline-flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-gold-500" />
                Reference material
              </h3>
              <div className="space-y-2">
                {resources.map((r) => (
                  <a
                    key={r.id}
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-navy-700 hover:border-gold-500 transition-colors group"
                  >
                    <div className="w-10 h-10 shrink-0 border border-gold-500/40 bg-navy-800 flex items-center justify-center">
                      <Download className="w-4 h-4 text-gold-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-bone-50 group-hover:text-gold-500 transition-colors">
                        {r.title}
                      </div>
                      <div className="font-mono text-xs text-bone-300 mt-0.5">
                        {r.type}
                        {r.page_count ? ` · ${r.page_count} pages` : ''}
                        {r.version ? ` · v${r.version}` : ''}
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-bone-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* External links */}
          {externalLinks.length > 0 && (
            <div>
              <h3 className="font-mono text-xs uppercase tracking-wider text-bone-400 mb-3 inline-flex items-center gap-2">
                <Globe className="w-3 h-3 text-gold-500" />
                External references
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {externalLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-4 border border-navy-700 hover:border-gold-500 transition-colors group"
                  >
                    <Globe className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-bone-50 group-hover:text-gold-500 transition-colors leading-tight mb-1">
                        {link.title}
                      </div>
                      {link.description && (
                        <p className="font-serif text-xs text-bone-300 leading-relaxed">
                          {link.description}
                        </p>
                      )}
                      {link.source_type && (
                        <span className="badge-tag text-[10px] mt-2 inline-block">
                          {link.source_type}
                        </span>
                      )}
                    </div>
                    <ExternalLink className="w-3 h-3 text-bone-400 shrink-0 mt-0.5" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-navy-700">
        <p className="font-mono text-xs text-bone-300 mb-4 uppercase tracking-wider">
          // End of article
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/articles" className="btn-ghost">
            More articles
          </Link>
          <Link href="/tests" className="btn-ghost">
            Test your knowledge
          </Link>
        </div>
      </footer>
    </article>
  );
}
