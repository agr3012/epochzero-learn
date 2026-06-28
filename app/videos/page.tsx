// app/videos/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Play, ShieldAlert, Video } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDuration, getYouTubeThumbnail } from '@/lib/utils';
import { DOMAIN_COLOR } from '@/lib/colors';

export const revalidate = 60;
export const metadata = { title: 'Video Lessons' };

const DOMAIN_LABELS: Record<string, string> = {
  rema:   'REMA',
  cloud:  'Cloud',
  crypto: 'Cryptography',
  webdev: 'Web Dev',
};

interface Props { searchParams: { domain?: string } }

export default async function VideosPage({ searchParams }: Props) {
  const supabase = createClient();
  const activeDomain = searchParams.domain ?? null;

  const { data: allVideos } = await supabase
    .from('videos')
    .select('id, slug, youtube_id, title, description, malware_family, category, domain, duration_seconds, difficulty, view_count, episode_label, published_at')
    .eq('is_published', true)
    .order('order_index', { ascending: false });

  const videos  = allVideos ?? [];
  const domains = Array.from(new Set(videos.map(v => v.domain).filter((d): d is string => !!d))).sort();
  const filtered = activeDomain ? videos.filter(v => v.domain === activeDomain) : videos;

  return (
    <div className="container py-16 lg:py-24">

      {/* ── Header ── */}
      <div className="mb-10">
        <p className="eyebrow mb-3">Lessons</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          Video Lessons
        </h1>
        <p className="font-serif text-lg max-w-2xl leading-relaxed"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Step-by-step lessons across Reverse Engineering, Malware Analysis, Cloud Security,
          and more. Each episode pairs with articles, resources, and follow-up MCQ
          assessments in the 4Q course view.
        </p>
      </div>

      {/* ── Domain filter pills ── */}
      {domains.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/videos"
            className="font-sans text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
            style={!activeDomain ? {
              background: 'hsl(var(--primary)/0.12)',
              color: 'hsl(var(--primary))',
              border: '1px solid hsl(var(--primary)/0.3)',
            } : {
              color: 'hsl(var(--foreground-muted))',
            }}>
            All Domains
          </Link>
          {domains.map(domain => {
            const c = DOMAIN_COLOR[domain] ?? 'hsl(var(--primary))';
            return (
              <Link key={domain}
                href={`/videos?domain=${encodeURIComponent(domain)}`}
                className="font-sans text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
                style={activeDomain === domain ? {
                  background: `${c}18`,
                  color: c,
                  border: `1px solid ${c}40`,
                  fontWeight: 600,
                } : {
                  color: 'hsl(var(--foreground-muted))',
                }}>
                {DOMAIN_LABELS[domain] ?? domain}
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Count ── */}
      {filtered.length > 0 && (
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
          {filtered.length} {filtered.length === 1 ? 'lesson' : 'lessons'}
          {activeDomain ? ` in ${DOMAIN_LABELS[activeDomain] ?? activeDomain}` : ' across all domains'}
        </p>
      )}

      {/* ── Empty ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Video className="w-10 h-10 mx-auto mb-4" style={{ color: 'hsl(var(--foreground-subtle))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            {activeDomain
              ? `No lessons published yet for "${DOMAIN_LABELS[activeDomain] ?? activeDomain}".`
              : 'No lessons published yet.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => {
            const domainColor = DOMAIN_COLOR[v.domain ?? ''] ?? '#1B5FA8';
            return (
              <Link key={v.id} href={`/videos/${v.slug}`} className="group">

                {/* ── Thumbnail ── */}
                <div className="relative aspect-video overflow-hidden rounded-lg"
                  style={{ border: '1px solid hsl(var(--border))' }}>
                  <Image
                    src={getYouTubeThumbnail(v.youtube_id, 'maxres')}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Play hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                      style={{ background: 'hsl(var(--primary))' }}>
                      <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
                    </div>
                  </div>

                  {/* Domain pill — top left */}
                  {v.domain && (
                    <span className="absolute top-3 left-3 font-sans text-xs font-semibold
                      px-2 py-0.5 rounded-full backdrop-blur-sm"
                      style={{
                        background: `${domainColor}cc`,
                        color: 'white',
                      }}>
                      {DOMAIN_LABELS[v.domain] ?? v.domain}
                    </span>
                  )}

                  {/* Malware family */}
                  {v.malware_family && (
                    <span className="absolute top-3 right-3 badge-malware">
                      <ShieldAlert className="w-3 h-3" />
                      {v.malware_family}
                    </span>
                  )}

                  {/* Episode label — keep mono, content identifier */}
                  {v.episode_label && (
                    <span className="absolute bottom-3 left-3 font-mono text-[9px]
                      uppercase tracking-wider px-2 py-1 rounded text-white"
                      style={{ background: domainColor }}>
                      {v.episode_label}
                    </span>
                  )}

                  {/* Duration */}
                  {v.duration_seconds && (
                    <span className="absolute bottom-3 right-3 font-mono text-[10px]
                      px-2 py-1 rounded text-white"
                      style={{ background: 'rgba(0,0,0,0.75)' }}>
                      {formatDuration(v.duration_seconds)}
                    </span>
                  )}
                </div>

                {/* ── Text ── */}
                <div className="mt-4 space-y-1.5">
                  <h3 className="font-display text-base font-semibold leading-snug line-clamp-2
                    group-hover:text-[hsl(var(--primary))] transition-colors"
                    style={{ color: 'hsl(var(--foreground))' }}>
                    {v.title}
                  </h3>
                  {v.description && (
                    <p className="text-sm leading-relaxed line-clamp-2"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {v.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs pt-0.5"
                    style={{ color: 'hsl(var(--foreground-subtle))' }}>
                    {v.category && <span>{v.category}</span>}
                    {v.difficulty && <><span>·</span><span className="capitalize">{v.difficulty}</span></>}
                    {typeof v.view_count === 'number' && v.view_count > 0 && (
                      <><span>·</span><span>{v.view_count.toLocaleString()} views</span></>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
