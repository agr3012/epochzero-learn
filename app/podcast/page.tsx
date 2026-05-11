import { Headphones, Calendar, Radio, AudioLines } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDuration } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Tech Talks' };

export default async function PodcastPage() {
  const supabase = createClient();
  const { data: episodes } = await supabase
    .from('podcasts')
    .select('*')
    .eq('is_published', true)
    .order('episode_number', { ascending: false });

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
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Audio conversations across cybersecurity, cloud, machine learning, and
        other corners of modern technology.
      </p>

      {/* Empty state */}
      {!episodes || episodes.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <AudioLines className="w-10 h-10 text-gold-500/60 mx-auto mb-4" />
          <p className="font-mono text-sm text-bone-300">
            No episodes published yet. Coming soon.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {episodes.map((ep) => (
            <article
              key={ep.id}
              className="card-forensic p-6 lg:p-8 hover:border-gold-500/40 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Cover art */}
                <div className="shrink-0">
                  {ep.cover_image ? (
                    <div className="relative w-full md:w-40 h-40 border border-navy-700 overflow-hidden bg-navy-950">
                      <Image
                        src={ep.cover_image}
                        alt={`${ep.title} cover art`}
                        fill
                        sizes="(max-width: 768px) 100vw, 160px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full md:w-40 h-40 border border-gold-500/40 flex items-center justify-center bg-navy-950">
                      <Headphones className="w-12 h-12 text-gold-500/70" />
                    </div>
                  )}
                </div>

                {/* Episode details */}
                <div className="flex-1 min-w-0">
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

                  <h2 className="font-mono text-xl text-bone-50 mb-2 leading-tight">
                    {ep.title}
                  </h2>

                  {ep.description && (
                    <p className="font-serif text-bone-200 leading-relaxed mb-4">
                      {ep.description}
                    </p>
                  )}

                  {/* Audio player */}
                  <div className="bg-navy-950 border border-navy-700 p-3 flex items-center gap-3">
                    <Headphones className="w-4 h-4 text-gold-500 shrink-0" />
                    <audio
                      controls
                      preload="none"
                      src={ep.audio_url}
                      className="w-full"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>

                  {/* Show notes */}
                  {ep.show_notes && (
                    <details className="mt-4 group">
                      <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors list-none">
                        <span className="group-open:hidden">Show notes ▾</span>
                        <span className="hidden group-open:inline">
                          Hide notes ▴
                        </span>
                      </summary>
                      <div className="mt-3 font-serif text-sm text-bone-200 leading-relaxed whitespace-pre-line border-l-2 border-gold-500/30 pl-4">
                        {ep.show_notes}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
