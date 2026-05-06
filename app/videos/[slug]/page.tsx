import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Calendar, Clock, ShieldAlert } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatDuration, getYouTubeThumbnail } from '@/lib/utils';
import { VideoPlayer } from '@/components/video-player';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from('videos')
    .select('title, description')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!data) return { title: 'Video Not Found' };
  return { title: data.title, description: data.description };
}

export default async function VideoDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!video) notFound();

  // Related videos: same malware family or category
  const { data: related } = await supabase
    .from('videos')
    .select('id, slug, youtube_id, title, duration_seconds, malware_family')
    .eq('is_published', true)
    .neq('id', video.id)
    .or(
      `malware_family.eq.${video.malware_family ?? '__none__'},category.eq.${video.category ?? '__none__'}`
    )
    .limit(4);

  // Increment views
  createAdminClient()
    .rpc('increment_video_views', { p_slug: params.slug })
    .then(
      () => {},
      () => {}
    );

  const steps = (Array.isArray(video.steps) ? video.steps : []) as Array<{
    title: string;
    description?: string;
    timestamp_seconds?: number;
  }>;

  return (
    <div className="container py-8 lg:py-12">
      <Link
        href="/videos"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 mb-6 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> All videos
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          <VideoPlayer youtubeId={video.youtube_id} steps={steps} />

          <div>
            <div className="flex items-center gap-2 mb-3">
              {video.malware_family && (
                <span className="badge-malware">
                  <ShieldAlert className="w-3 h-3" />
                  {video.malware_family}
                </span>
              )}
              {video.category && <span className="badge-tag">{video.category}</span>}
              {video.difficulty && (
                <span className="badge-tag">{video.difficulty}</span>
              )}
            </div>

            <h1 className="font-mono text-2xl lg:text-3xl font-bold text-bone-50 mb-3 leading-tight">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-bone-300 mb-6">
              {video.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gold-500" />
                  {formatDate(video.published_at)}
                </span>
              )}
              {video.duration_seconds && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gold-500" />
                  {formatDuration(video.duration_seconds)}
                </span>
              )}
              {typeof video.view_count === 'number' && (
                <span>{video.view_count.toLocaleString()} views</span>
              )}
            </div>

            {video.description && (
              <p className="font-serif text-lg text-bone-200 leading-relaxed">
                {video.description}
              </p>
            )}

            {/* Prerequisites */}
            {Array.isArray(video.prerequisites) && video.prerequisites.length > 0 && (
              <div className="mt-8 p-4 border-l-2 border-gold-500 bg-navy-800/50">
                <div className="font-mono text-xs uppercase tracking-wider text-gold-500 mb-2">
                  Prerequisites
                </div>
                <ul className="font-serif text-bone-200 space-y-1">
                  {video.prerequisites.map((p: string, i: number) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-gold-500">·</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: steps */}
        <aside className="lg:sticky lg:top-24 lg:self-start space-y-6">
          {steps.length > 0 && (
            <div className="card-forensic p-6">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-4">
                // Lab notes — step-by-step
              </div>
              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-7 h-7 border border-gold-500 flex items-center justify-center font-mono text-xs text-gold-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-bone-50 leading-tight mb-1">
                        {s.title}
                      </div>
                      {s.description && (
                        <p className="font-serif text-sm text-bone-200 leading-relaxed mb-1">
                          {s.description}
                        </p>
                      )}
                      {typeof s.timestamp_seconds === 'number' && (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtube_id}&t=${s.timestamp_seconds}s`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-gold-500 hover:text-gold-400 underline decoration-dotted underline-offset-4"
                        >
                          @ {formatDuration(s.timestamp_seconds)}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {related && related.length > 0 && (
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-3">
                // Related
              </div>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/videos/${r.slug}`}
                    className="flex gap-3 group"
                  >
                    <div className="relative w-32 aspect-video shrink-0 overflow-hidden border border-navy-700 group-hover:border-gold-500 transition-colors">
                      <Image
                        src={getYouTubeThumbnail(r.youtube_id, 'hq')}
                        alt={r.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-xs text-bone-50 group-hover:text-gold-500 transition-colors leading-tight line-clamp-3">
                        {r.title}
                      </div>
                      {r.duration_seconds && (
                        <div className="font-mono text-[10px] text-bone-300 mt-1">
                          {formatDuration(r.duration_seconds)}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
