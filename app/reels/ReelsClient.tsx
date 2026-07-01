'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Play, Zap, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [domain, setDomain]     = useState<string>(initialDomain);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [watched, setWatched]   = useState<Set<string>>(watchedIds);

  const filtered = useMemo(() =>
    domain === 'all' ? reels : reels.filter(r => r.domain === domain),
    [reels, domain]
  );

  const openReel = openIndex !== null ? (filtered[openIndex] ?? null) : null;
  const hasPrev  = openIndex !== null && openIndex > 0;
  const hasNext  = openIndex !== null && openIndex < filtered.length - 1;

  const goNext = useCallback(() => setOpenIndex(i => (i !== null && i < filtered.length - 1 ? i + 1 : i)), [filtered.length]);
  const goPrev = useCallback(() => setOpenIndex(i => (i !== null && i > 0 ? i - 1 : i)), []);
  const close  = useCallback(() => setOpenIndex(null), []);

  // Keyboard nav + scroll lock
  useEffect(() => {
    if (openIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      close();
      if (e.key === 'ArrowRight')  goNext();
      if (e.key === 'ArrowLeft')   goPrev();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [openIndex, close, goNext, goPrev]);

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
          Each Quick Bite is a punchy 20–30 second masterclass paired to a full article.
          Watch them all — each one earns +5 points on the leaderboard.
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

      {/* ── Portrait grid ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Zap className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
            No Quick Bites for this domain yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((r, idx) => {
            const meta = DOMAIN_META[r.domain] ?? DOMAIN_META.rema;
            const isWatched = watched.has(r.id);
            return (
              <button key={r.id} onClick={() => setOpenIndex(idx)}
                className="group relative text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] focus:outline-none"
                style={{ aspectRatio: '9/16', background: '#111', border: '1px solid hsl(var(--border))' }}>
                <Image
                  src={`https://i.ytimg.com/vi/${r.youtube_id}/hqdefault.jpg`}
                  alt={r.title} fill
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                    <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                  </div>
                </div>
                {isWatched && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
                    style={{ background: 'rgba(27,124,62,0.85)' }}>
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: meta.bg, color: meta.color }}>
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
      )}

      {/* ── Modal ── */}
      {openReel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={close}>

          {/* Close */}
          <button onClick={close}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <X className="w-5 h-5" />
          </button>

          {/* Prev / Next — desktop side arrows */}
          {hasPrev && (
            <button onClick={e => { e.stopPropagation(); goPrev(); }}
              className="hidden sm:flex absolute left-4 z-10 w-10 h-10 rounded-full items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasNext && (
            <button onClick={e => { e.stopPropagation(); goNext(); }}
              className="hidden sm:flex absolute right-4 z-10 w-10 h-10 rounded-full items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/*
            Desktop: two equal 360×640 panels, rounded-2xl outer box, centred.
            Mobile: stacked full-screen (player fills width at 9:16, info scrolls below).
          */}
          <div
            onClick={e => e.stopPropagation()}
            className="relative flex flex-col sm:flex-row overflow-hidden rounded-none sm:rounded-2xl w-full sm:w-auto"
            style={{ background: '#000' }}
          >
            {/* ── Mobile: portrait player at top ── */}
            <div className="sm:hidden w-full" style={{ aspectRatio: '9/16', maxHeight: '55dvh', background: '#000', position: 'relative' }}>
              <ReelPlayer
                youtubeId={openReel.youtube_id}
                reelId={openReel.id}
                durationSeconds={openReel.duration_seconds}
                initialCompleted={watched.has(openReel.id)}
                layout="portrait"
              />
            </div>

            {/* ── Desktop: two 360×640 panels ── */}
            {/* Left: 9:16 player */}
            <div className="hidden sm:block shrink-0" style={{ width: 360, height: 640, position: 'relative', background: '#000' }}>
              <ReelPlayer
                youtubeId={openReel.youtube_id}
                reelId={openReel.id}
                durationSeconds={openReel.duration_seconds}
                initialCompleted={watched.has(openReel.id)}
                layout="portrait"
              />
            </div>

            {/* Right: Info panel — 360×640 on desktop, full-width scrollable on mobile */}
            <div className="flex flex-col overflow-y-auto p-6 gap-4 sm:shrink-0 sm:w-[360px] sm:h-[640px]"
              style={{ background: 'hsl(var(--card))' }}
            >
              <div className="flex flex-col gap-4 h-full">

                {(() => {
                  const meta = DOMAIN_META[openReel.domain] ?? DOMAIN_META.rema;
                  return (
                    <>
                      {/* Domain badge */}
                      <span className="self-start inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>

                      {/* Title */}
                      <h2 className="font-display text-xl font-bold leading-snug"
                        style={{ color: 'hsl(var(--foreground))' }}>
                        {openReel.title}
                      </h2>

                      {/* Description */}
                      {openReel.description && (
                        <p className="font-serif text-sm leading-relaxed"
                          style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {openReel.description}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" style={{ color: '#facc15' }} />
                          {openReel.duration_seconds}s · Quick Bite
                        </span>
                        {watched.has(openReel.id) && (
                          <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
                            <CheckCircle2 className="w-3 h-3" /> Watched · +5 pts
                          </span>
                        )}
                      </div>

                      {/* Article link */}
                      {openReel.topic_slug && (
                        <a href={`/articles/${openReel.topic_slug}`}
                          onClick={close}
                          className="text-sm font-medium transition-colors hover:underline"
                          style={{ color: 'hsl(var(--primary))' }}>
                          Read the full article →
                        </a>
                      )}

                      {/* Spacer pushes nav to bottom */}
                      <div className="flex-1" />

                      {/* Prev / Next — inside info panel (visible on all sizes) */}
                      <div className="flex items-center gap-3 pt-4"
                        style={{ borderTop: '1px solid hsl(var(--border))' }}>
                        <button
                          disabled={!hasPrev}
                          onClick={goPrev}
                          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                          style={{
                            background: hasPrev ? 'hsl(var(--muted))' : 'transparent',
                            color: 'hsl(var(--foreground-muted))',
                          }}>
                          <ChevronLeft className="w-4 h-4" /> Prev
                        </button>
                        <span className="text-xs flex-1 text-center"
                          style={{ color: 'hsl(var(--foreground-subtle))' }}>
                          {(openIndex ?? 0) + 1} / {filtered.length}
                        </span>
                        <button
                          disabled={!hasNext}
                          onClick={goNext}
                          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-30"
                          style={{
                            background: hasNext ? 'hsl(var(--muted))' : 'transparent',
                            color: 'hsl(var(--foreground-muted))',
                          }}>
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
