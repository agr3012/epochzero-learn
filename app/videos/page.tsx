import Link from 'next/link';
import Image from 'next/image';
import { Play, ShieldAlert, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Video Lessons' };

const DOMAIN_LABELS: Record<string, string> = {
  rema:   'REMA',
  cloud:  'Cloud',
  crypto: 'Cryptography',
  webdev: 'Web Dev',
};

// Domain badge colours — content metadata tiles
const DOMAIN_BADGE: Record<string, string> = {
  rema:   'bg-[rgba(232,160,32,0.12)]  text-[#E8A020] border border-[rgba(232,160,32,0.3)]',
  cloud:  'bg-[rgba(56,139,253,0.12)]  text-[#58A6FF] border border-[rgba(56,139,253,0.3)]',
  crypto: 'bg-[rgba(139,92,246,0.12)]  text-[#A78BFA] border border-[rgba(139,92,246,0.3)]',
  webdev: 'bg-[rgba(34,197,94,0.12)]   text-[#4ADE80] border border-[rgba(34,197,94,0.3)]',
};

interface Props {
  searchParams: { domain?: string };
}

export default async function VideosPage({ searchParams }: Props) {
  const supabase = createClient();
  const activeDomain = searchParams.domain ?? null;

  const { data: allVideos } = await supabase
    .from('videos')
    .select(
      'id, slug, youtube_id, title, description, malware_family, category, domain, duration_seconds, difficulty, view_count, episode_label, published_at'
    )
    .eq('is_published', true)
    .order('order_index', { ascending: false });

  const videos = allVideos ?? [];

  const domains = Array.from(
    new Set(videos.map((v) => v.domain).filter((d): d is string => !!d))
  ).sort();

  const filtered = activeDomain
    ? videos.filter((v) => v.domain === activeDomain)
    : videos;

  return (
    <div className="container py-16 lg:py-24">

      {/* ── Page header ── */}
      <div className="mb-10">
        <p className="eyebrow mb-3">Lessons</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold
          text-[hsl(var(--foreground))] mb-4 leading-tight">
          Video Lessons
        </h1>
        <p className="font-serif text-lg text-[hsl(var(--foreground-muted))]
          max-w-2xl leading-relaxed">
          Step-by-step lessons across Reverse Engineering, Malware Analysis, Cloud
          Security, and more. Each episode pairs with articles, resources, and
          follow-up MCQ assessments in the 4Q course view.
        </p>
      </div>

      {/* ── Domain filter pills ── */}
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/videos"
            className={`font-sans text-sm font-medium px-4 py-1.5 rounded-full
              transition-colors ${
              !activeDomain
                ? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.3)]'
                : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))]'
            }`}
          >
            All Domains
          </Link>
          {domains.map((domain) => (
            <Link
              key={domain}
              href={`/videos?domain=${encodeURIComponent(domain)}`}
              className={`font-sans text-sm font-medium px-4 py-1.5 rounded-full
                transition-colors ${
                activeDomain === domain
                  ? `${DOMAIN_BADGE[domain] ?? 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]'} font-semibold`
                  : 'text-[hsl(var(--foreground-muted))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))]'
              }`}
            >
              {DOMAIN_LABELS[domain] ?? domain}
            </Link>
          ))}
        </div>
      )}

      {/* ── Count label ── */}
      {filtered.length > 0 && (
        <p className="text-sm text-[hsl(var(--foreground-muted))] mb-6">
          {filtered.length} {filtered.length === 1 ? 'lesson' : 'lessons'}
          {activeDomain
            ? ` in ${DOMAIN_LABELS[activeDomain] ?? activeDomain}`
            : ' across all domains'}
        </p>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Video className="w-10 h-10 text-[hsl(var(--foreground-subtle))] mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            {activeDomain
              ? `No lessons published yet for "${DOMAIN_LABELS[activeDomain] ?? activeDomain}".`
              : 'No lessons published yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <Link key={v.id} href={`/videos/${v.slug}`} className="group">

              {/* ── Thumbnail ── */}
              <div className="relative aspect-video overflow-hidden rounded-lg
                border border-navy-700/50 group-hover:border-navy-600
                transition-colors">
                <Image
                  src={getYouTubeThumbnail(v.youtube_id, 'maxres')}
                  alt={v.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t
                  from-navy-900/80 via-transparent to-transparent" />

                {/* Play button on hover — gold as primary action */}
                <div className="absolute inset-0 flex items-center justify-center
                  opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-[hsl(var(--primary))]
                    flex items-center justify-center shadow-xl">
                    <Play className="w-6 h-6 text-navy-950 ml-0.5" fill="currentColor" />
                  </div>
                </div>

                {/* Domain badge — coloured tile, top-left */}
                {v.domain && (
                  <span className={`absolute top-3 left-3 font-sans text-xs
                    font-medium px-2 py-0.5 rounded-full
                    ${DOMAIN_BADGE[v.domain] ?? 'bg-navy-800/90 text-bone-200'}
                    bg-opacity-90 backdrop-blur-sm`}>
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

                {/* Episode label — keep mono, it's a content identifier */}
                {v.episode_label && (
                  <span className="absolute bottom-3 left-3 font-mono text-[9px]
                    uppercase tracking-wider px-2 py-1
                    bg-navy-950/90 border border-[hsl(var(--primary)/0.35)]
                    text-[hsl(var(--primary))] rounded">
                    {v.episode_label}
                  </span>
                )}

                {/* Duration */}
                {v.duration_seconds && (
                  <span className="absolute bottom-3 right-3 font-mono text-xs
                    px-2 py-1 bg-navy-950/90 border border-navy-700/60
                    text-bone-200 rounded">
                    {formatDuration(v.duration_seconds)}
                  </span>
                )}
              </div>

              {/* ── Card text ── */}
              <div className="mt-4 space-y-1.5">
                <h3 className="font-display text-base font-semibold
                  text-[hsl(var(--foreground))]
                  group-hover:text-[hsl(var(--primary))] transition-colors
                  line-clamp-2 leading-snug">
                  {v.title}
                </h3>
                {v.description && (
                  <p className="text-sm text-[hsl(var(--foreground-muted))]
                    leading-relaxed line-clamp-2">
                    {v.description}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs
                  text-[hsl(var(--foreground-subtle))] pt-0.5">
                  {v.category && <span>{v.category}</span>}
                  {v.difficulty && (
                    <>
                      <span>·</span>
                      <span className="capitalize">{v.difficulty}</span>
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
