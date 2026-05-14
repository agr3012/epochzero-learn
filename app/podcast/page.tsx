import { Headphones, Calendar, AudioLines, Radio, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDuration } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Tech Talks' };

interface Props {
  searchParams: { tag?: string };
}

export default async function PodcastPage({ searchParams }: Props) {
  const supabase = createClient();
  const activeTag = searchParams.tag ?? null;

  const { data: allEpisodes } = await supabase
    .from('podcasts')
    .select('id, slug, title, description, episode_number, cover_image, topic_tag, published_at, duration_seconds, audio_url')
    .eq('is_published', true)
    .order('episode_number', { ascending: false });

  const episodes = allEpisodes ?? [];

  const tags = Array.from(
    new Set(
      episodes
        .map((ep) => ep.topic_tag)
        .filter((t): t is string => !!t)
    )
  ).sort();

  const filtered = activeTag
    ? episodes.filter((ep) => ep.topic_tag === activeTag)
    : episodes;

  return (
    <div className="container py-16 lg:py-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Radio className="w-5 h-5 text-gold-500" />
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
          // Audio
        </div>
      </div>

      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Tech Talks
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-8">
        Audio conversations across cybersecurity, cloud, machine learning, and
        other corners of modern technology.
      </p>

      {/* Tag filter chips */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/podcast"
            className={`font-mono text-xs uppercase tracking-wider px-4 py-1.5 border transition-colors ${
              !activeTag
                ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                : 'border-navy-700 text-bone-300 hover:border-navy-600 hover:text-bone-100'
            }`}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/podcast?tag=${encodeURIComponent(tag)}`}
              className={`font-mono text-xs uppercase tracking-wider px-4 py-1.5 border transition-colors ${
                activeTag === tag
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-navy-700 text-bone-300 hover:border-navy-600 hover:text-bone-100'
              }`}
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <AudioLines className="w-10 h-10 text-gold-500/60 mx-auto mb-4" />
          <p className="font-mono text-sm text-bone-300">
            {activeTag
              ? `No episodes published yet for "${activeTag}".`
              : 'No episodes published yet. Coming soon.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((ep) => (
            <Link
              key={ep.id}
              href={`/podcast/${ep.slug}`}
              className="card-forensic flex flex-col hover:border-gold-500/40 transition-colors overflow-hidden group"
            >
              {/* Cover image */}
              {ep.cover_image ? (
                <div className="relative w-full h-48 bg-navy-950 overflow-hidden">
                  <Image
                    src={ep.cover_image}
                    alt={`${ep.title} cover art`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Tag chip */}
                  {ep.topic_tag && (
                    <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-navy-900/90 border border-gold-500/60 text-gold-500">
                      {ep.topic_tag}
                    </span>
                  )}
                  {/* Duration chip */}
                  {ep.duration_seconds && (
                    <span className="absolute bottom-3 right-3 font-mono text-[10px] px-2 py-0.5 bg-navy-950/90 border border-navy-700 text-bone-100 inline-flex items-center gap-1">
                      <AudioLines className="w-2.5 h-2.5" />
                      {formatDuration(ep.duration_seconds)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-48 bg-navy-950 border-b border-navy-700 flex items-center justify-center">
                  <Headphones className="w-16 h-16 text-gold-500/40" />
                  {ep.topic_tag && (
                    <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-navy-900/90 border border-gold-500/60 text-gold-500">
                      {ep.topic_tag}
                    </span>
                  )}
                </div>
              )}

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5">
                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 font-mono text-xs text-bone-300">
                  {ep.episode_number != null && (
                    <span className="text-gold-500">
                      EP {String(ep.episode_number).padStart(2, '0')}
                    </span>
                  )}
                  {ep.published_at && (
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(ep.published_at)}
                    </span>
                  )}
                </div>

                <h2 className="font-mono text-lg text-bone-50 mb-2 leading-tight group-hover:text-gold-500 transition-colors">
                  {ep.title}
                </h2>

                {ep.description && (
                  <p className="font-serif text-sm text-bone-200 leading-relaxed line-clamp-3 mb-4">
                    {ep.description}
                  </p>
                )}

                <div className="flex-1" />

                {/* Listen CTA */}
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gold-500 group-hover:gap-3 transition-all">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Listen to episode</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
