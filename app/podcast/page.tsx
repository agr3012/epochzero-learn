import { Headphones, Calendar, Radio, AudioLines } from 'lucide-react';
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

  // Fetch all published episodes
  const { data: allEpisodes } = await supabase
    .from('podcasts')
    .select('*')
    .eq('is_published', true)
    .order('episode_number', { ascending: false });

  const episodes = allEpisodes ?? [];

  // Derive unique tags from published episodes (dynamic)
  const tags = Array.from(
    new Set(
      episodes
        .map((ep) => ep.topic_tag)
        .filter((t): t is string => !!t)
    )
  ).sort();

  // Filter by active tag
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

      {/* Chips filter — only shown if there are tags */}
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
            <article
              key={ep.id}
              className="card-forensic flex flex-col hover:border-gold-500/40 transition-colors overflow-hidden"
            >
              {/* Cover image — full width top */}
              {ep.cover_image ? (
                <div className="relative w-full h-48 bg-navy-950 overflow-hidden">
                  <Image
                    src={ep.cover_image}
                    alt={`${ep.title} cover art`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {/* Tag chip overlay */}
                  {ep.topic_tag && (
                    <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-navy-900/90 border border-gold-500/60 text-gold-500">
                      {ep.topic_tag}
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
                  {ep.episode_number !== null &&
                    ep.episode_number !== undefined && (
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
                  {ep.duration_seconds && (
                    <span className="inline-flex items-center gap-1.5">
                      <AudioLines className="w-3 h-3" />
                      {formatDuration(ep.duration_seconds)}
                    </span>
                  )}
                </div>

                <h2 className="font-mono text-lg text-bone-50 mb-2 leading-tight">
                  {ep.title}
                </h2>

                {ep.description && (
                  <p className="font-serif text-sm text-bone-200 leading-relaxed mb-4 line-clamp-3">
                    {ep.description}
                  </p>
                )}

                {/* Spacer to push player to bottom */}
                <div className="flex-1" />

                {/* Audio player */}
                <div className="bg-navy-950 border border-navy-700 p-2.5 flex items-center gap-2 mb-3">
                  <Headphones className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                  <audio
                    controls
                    preload="none"
                    src={ep.audio_url}
                    className="w-full h-8"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>

                {/* Show notes */}
                {ep.show_notes && (
                  <details className="group">
                    <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors list-none">
                      <span className="group-open:hidden">Show notes ▾</span>
                      <span className="hidden group-open:inline">Hide notes ▴</span>
                    </summary>
                    <div className="mt-3 font-serif text-xs text-bone-200 leading-relaxed whitespace-pre-line border-l-2 border-gold-500/30 pl-3">
                      {ep.show_notes}
                    </div>
                  </details>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
