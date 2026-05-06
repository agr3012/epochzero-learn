import { Headphones, Calendar } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, formatDuration } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Podcast' };

export default async function PodcastPage() {
  const supabase = createClient();
  const { data: episodes } = await supabase
    .from('podcasts')
    .select('*')
    .eq('is_published', true)
    .order('episode_number', { ascending: false });

  return (
    <div className="container py-16 lg:py-24">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Audio
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        REMA Club podcast
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Discussions on threat actors, current campaigns, and reverse engineering
        tradecraft. On the go.
      </p>

      {!episodes || episodes.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            No episodes published yet. Coming soon.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {episodes.map((ep) => (
            <article key={ep.id} className="card-forensic p-6 lg:p-8">
              <div className="flex items-start gap-6">
                <div className="hidden md:flex w-16 h-16 border border-gold-500/40 items-center justify-center shrink-0 bg-navy-950">
                  <Headphones className="w-7 h-7 text-gold-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2 font-mono text-xs text-bone-300">
                    {ep.episode_number !== null && ep.episode_number !== undefined && (
                      <span className="text-gold-500">EP {String(ep.episode_number).padStart(2, '0')}</span>
                    )}
                    {ep.published_at && (
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(ep.published_at)}
                      </span>
                    )}
                    {ep.duration_seconds && <span>{formatDuration(ep.duration_seconds)}</span>}
                  </div>
                  <h2 className="font-mono text-xl text-bone-50 mb-2 leading-tight">
                    {ep.title}
                  </h2>
                  {ep.description && (
                    <p className="font-serif text-bone-200 leading-relaxed mb-4">
                      {ep.description}
                    </p>
                  )}
                  <audio
                    controls
                    preload="none"
                    src={ep.audio_url}
                    className="w-full"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
