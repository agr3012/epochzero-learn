import Link from 'next/link';
import Image from 'next/image';
import { Play, ShieldAlert, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Video Walkthroughs' };

export default async function VideosPage() {
  const supabase = createClient();
  const { data: videos } = await supabase
    .from('videos')
    .select('id, slug, youtube_id, title, description, malware_family, category, duration_seconds, difficulty, view_count, published_at')
    .eq('is_published', true)
    .order('order_index', { ascending: true })
    .order('published_at', { ascending: false });

  return (
    <div className="container py-16 lg:py-24">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Walkthroughs
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Video analyses
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Step-by-step reverse engineering and malware analysis sessions on real
        samples. Each video is paired with synchronized lab notes and follow-up
        resources.
      </p>

      {!videos || videos.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            No videos published yet. Add them via the admin panel.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <Link key={v.id} href={`/videos/${v.slug}`} className="group">
              <div className="relative aspect-video overflow-hidden border border-navy-700 group-hover:border-gold-500 transition-colors">
                <Image
                  src={getYouTubeThumbnail(v.youtube_id, 'maxres')}
                  alt={v.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-transparent to-transparent" />

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-gold-500 flex items-center justify-center">
                    <Play className="w-7 h-7 text-navy-900 ml-1" fill="currentColor" />
                  </div>
                </div>

                {/* Top badges */}
                {v.malware_family && (
                  <span className="absolute top-3 left-3 badge-malware">
                    <ShieldAlert className="w-3 h-3" />
                    {v.malware_family}
                  </span>
                )}

                {/* Duration */}
                {v.duration_seconds && (
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-navy-950/90 border border-navy-700 font-mono text-xs text-bone-100">
                    {formatDuration(v.duration_seconds)}
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <h3 className="font-mono text-base text-bone-50 group-hover:text-gold-500 transition-colors line-clamp-2 leading-tight">
                  {v.title}
                </h3>
                {v.description && (
                  <p className="font-serif text-sm text-bone-200 leading-relaxed line-clamp-2">
                    {v.description}
                  </p>
                )}
                <div className="flex items-center gap-3 font-mono text-xs text-bone-300 pt-1">
                  {v.category && <span>{v.category}</span>}
                  {v.difficulty && (
                    <>
                      <span>·</span>
                      <span className="uppercase">{v.difficulty}</span>
                    </>
                  )}
                  {typeof v.view_count === 'number' && v.view_count > 0 && (
                    <>
                      <span>·</span>
                      <span>{v.view_count.toLocaleString()} views</span>
                    </>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
