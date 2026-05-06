import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Eye, Download, ChevronLeft, User } from 'lucide-react';
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

  // Fire-and-forget view increment (no await blocking render)
  createAdminClient()
    .rpc('increment_article_views', { p_slug: params.slug })
    .then(
      () => {},
      () => {}
    );

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
              <span key={t} className="badge-tag">
                {t}
              </span>
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
        {/* @ts-expect-error Async Server Component */}
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
