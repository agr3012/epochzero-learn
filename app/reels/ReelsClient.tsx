'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, Zap, CheckCircle2 } from 'lucide-react';
import { ReelPlayer } from '@/components/ReelPlayer';

type Reel = {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  domain: string;
  topic_slug: string | null;
  duration_seconds: number;
};

const DOMAIN_META: Record<string, { label: string; color: string; bg: string }> = {
  'rema':           { label: 'REMA',          color: '#8B5E1A', bg: 'rgba(139,94,26,0.12)' },
  'cloud-security': { label: 'Cloud Security', color: '#1B5FA8', bg: 'rgba(27,95,168,0.12)' },
};

const FILTER_BASE = 'px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer';

export function ReelsClient({
  reels,
  watchedIds,
  initialDomain = 'all',
}: {
  reels: Reel[];
  watchedIds: Set<string>;
  initialDomain?: string;
}) {
  const [domain, setDomain] = useState<string>(initialDomain);
  const [openReel, setOpenReel] = useState<Reel | null>(null);
  const [watched, setWatched] = useState<Set<string>>(watchedIds);

  const filtered = useMemo(() =>
    domain === 'all' ? reels : reels.filter(r => r.domain === domain),
    [reels, domain]
  );

  // Close modal on Escape
  useEffect(() => {
    if (!openReel) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenReel(null); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [openReel]);

  function domainStyle(d: string): React.CSSProperties {
    const isActive = domain === d;
    if (!isActive) return { background: 'transparent', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' };
    if (d === 'all') return { background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', borderColor: 'hsl(var(--foreground))' };
    const m = DOMAIN_META[d];
    return { background: m.bg, color: m.color, borderColor: m.color };
  }

  return (
    <div className="container py-16 lg:py-24">

      {/* ── Header ── */}
      <div className="mb-10">
        <p className="eyebrow mb-3">Quick Bites</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-[hsl(var(--foreground))] mb-4 leading-tight">
          Learn in 30 seconds.
        </h1>
        <p className="font-serif text-lg text-[hsl(var(--foreground-muted))] max-w-2xl leading-relaxed">
          Each Quick Bite is a punchy, 20–30 second technical masterclass paired
          to a full article. Watch them all — each one earns you 5 points on the leaderboard.
        </p>
      </div>

      {/* ── Domain filter ── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {['all', 'rema', 'cloud-security'].map(d => (
          <button key={d} onClick={() => setDomain(d)}
            className={FILTER_BASE} style={domainStyle(d)}>
            {d === 'all' ? 'All Domains' : DOMAIN_META[d].label}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(r => {
          const meta = DOMAIN_META[r.domain] ?? DOMAIN_META.rema;
          const isWatched = watched.has(r.id);
          return (
            <button key={r.id}
              onClick={() => setOpenReel(r)}
              className="group relative text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2"
              style={{ aspectRatio: '9/16', background: '#111', border: '1px solid hsl(var(--border))' }}>

              {/* Thumbnail */}
              <Image
                src={`https://i.ytimg.com/vi/${r.youtube_id}/hqdefault.jpg`}
                alt={r.title}
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                  <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                </div>
              </div>

              {/* Watched badge */}
              {isWatched && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                  style={{ background: 'rgba(27,124,62,0.85)' }}>
                  <CheckCircle2 className="w-3 h-3" /> Watched
                </div>
              )}

              {/* Domain badge + title */}
              <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: meta.bg, color: meta.color, backdropFilter: 'blur(4px)' }}>
                  {meta.label}
                </span>
                <p className="font-display text-xs font-semibold text-white leading-snug line-clamp-3">
                  {r.title}
                </p>
                <p className="font-mono text-[10px] text-white/60">{r.duration_seconds}s</p>
              </div>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card p-12 text-center mt-4">
          <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No Quick Bites for this domain yet.
          </p>
        </div>
      )}

      {/* ── Modal ── */}
      {openReel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}
          onClick={() => setOpenReel(null)}>

          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            onClick={() => setOpenReel(null)}>
            <X className="w-5 h-5" />
          </button>

          <div
            className="flex flex-col lg:flex-row items-start gap-0 overflow-hidden rounded-2xl max-w-full max-h-[95vh]"
            style={{ maxWidth: 780 }}
            onClick={e => e.stopPropagation()}>

            {/* Portrait player */}
            <div className="shrink-0" style={{ width: 320 }}>
              <ReelPlayer
                youtubeId={openReel.youtube_id}
                reelId={openReel.id}
                durationSeconds={openReel.duration_seconds}
                initialCompleted={watched.has(openReel.id)}
              />
            </div>

            {/* Info panel */}
            <div className="flex-1 p-6 lg:p-8 overflow-y-auto"
              style={{ background: 'hsl(var(--card))', minWidth: 0, maxHeight: 'calc(9/16 * 320px)' }}>
              {(() => {
                const meta = DOMAIN_META[openReel.domain] ?? DOMAIN_META.rema;
                return (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mb-4"
                      style={{ background: meta.bg, color: meta.color }}>
                      {meta.label}
                    </span>

                    <h2 className="font-display text-lg font-bold mb-3 leading-snug"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {openReel.title}
                    </h2>

                    {openReel.description && (
                      <p className="font-serif text-sm leading-relaxed mb-4"
                        style={{ color: 'hsl(var(--foreground-muted))' }}>
                        {openReel.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" style={{ color: '#facc15' }} />
                        {openReel.duration_seconds}s · Quick Bite
                      </span>
                      {watched.has(openReel.id) && (
                        <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
                          <CheckCircle2 className="w-3 h-3" /> Watched · +5 pts earned
                        </span>
                      )}
                    </div>

                    {openReel.topic_slug && (
                      <a href={`/articles/${openReel.topic_slug}`}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
                        style={{ color: 'hsl(var(--primary))' }}
                        onClick={() => setOpenReel(null)}>
                        Read the full article →
                      </a>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
