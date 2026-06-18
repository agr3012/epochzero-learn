import Link from 'next/link';
import Image from 'next/image';
import { Play, ShieldAlert, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Video Lessons' };

// Domain display labels — matches the `domain` column values in the videos table
const DOMAIN_LABELS: Record<string, string> = {
  rema:  'REMA',
  cloud: 'Cloud',
  crypto: 'Cryptography',
  webdev: 'Web Dev',
};

interface Props {
  searchParams: { domain?: string };
}

export default async function VideosPage({ searchParams }: Props) {
  const supabase = createClient();
  const activeDomain = searchParams.domain ?? null;

  // Fetch all published videos
  const { data: allVideos } = await supabase
    .from('videos')
    .select(
      'id, slug, youtube_id, title, description, malware_family, category, domain, duration_seconds, difficulty, view_count, episode_label, published_at'
    )
    .eq('is_published', true)
    .order('domain', { ascending: true })
    .order('order_index', { ascending: false });

  const videos = allVideos ?? [];

  // Derive unique domains present in published videos (dynamic — no hardcoding)
  const domains = Array.from(
    new Set(videos.map((v) => v.domain).filter((d): d is string => !!d))
  ).sort();

  // Filter by active domain
  const filtered = activeDomain
    ? videos.filter((v) => v.domain === activeDomain)
    : videos;

  return (
    <div className="container py-16 lg:py-24">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Video className="w-5 h-5 text-gold-500" />
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
          // Lessons
        </div>
      </div>

      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Video Lessons
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-8">
        Step-by-step lessons across Reverse Engineering, Malware Analysis, Cloud
        Security, and more. Each episode pairs with articles, resources, and
        follow-up MCQ assessments in the 4Q course view.
      </p>

      {/* Domain filter chips — dynamic from DB */}
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href="/videos"
            className={`font-mono text-xs uppercase tracking-wider px-4 py-1.5 border transition-colors ${
              !activeDomain
                ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                : 'border-navy-700 text-bone-300 hover:border-navy-600 hover:text-bone-100'
            }`}
          >
            All Domains
          </Link>
          {domains.map((domain) => (
            <Link
              key={domain}
              href={`/videos?domain=${encodeURIComponent(domain)}`}
              className={`font-mono text-xs uppercase tracking-wider px-4 py-1.5 border transition-colors ${
                activeDomain === domain
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-navy-700 text-bone-300 hover:border-navy-600 hover:text-bone-100'
              }`}
            >
              {DOMAIN_LABELS[domain] ?? domain}
            </Link>
          ))}
        </div>
      )}

      {/* Count label */}
      {filtered.length > 0 && (
        <p className="font-mono text-xs text-bone-400 mb-6 uppercase tracking-wider">
          {filtered.length} {filtered.length === 1 ? 'lesson' : 'lessons'}
          {activeDomain ? ` in ${DOMAIN_LABELS[activeDomain] ?? activeDomain}` : ' across all domains'}
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <Video className="w-10 h-10 text-gold-500/40 mx-auto mb-4" />
          <p className="font-mono text-sm text-bone-300">
            {activeDomain
              ? `No lessons published yet for "${DOMAIN_LABELS[activeDomain] ?? activeDomain}".`
              : 'No lessons published yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
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

                {/* Domain badge — top left */}
                {v.domain && (
                  <span className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-navy-900/90 border border-gold-500/60 text-gold-500">
                    {DOMAIN_LABELS[v.domain] ?? v.domain}
                  </span>
                )}

                {/* Malware family badge */}
                {v.malware_family && (
                  <span className="absolute top-3 right-3 badge-malware">
                    <ShieldAlert className="w-3 h-3" />
                    {v.malware_family}
                  </span>
                )}

                {/* Episode label */}
                {v.episode_label && (
                  <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-1 bg-navy-950/90 border border-gold-500/40 text-gold-500">
                    {v.episode_label}
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
