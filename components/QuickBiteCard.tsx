'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Zap, Play, CheckCircle2 } from 'lucide-react';
import { ReelPlayer } from '@/components/ReelPlayer';

interface Props {
  youtubeId: string;
  reelId: string;
  title: string;
  description?: string | null;
  durationSeconds: number;
  initialWatched: boolean;
}

export function QuickBiteCard({ youtubeId, reelId, title, description, durationSeconds, initialWatched }: Props) {
  const [open, setOpen] = useState(false);

  // Scroll lock + keyboard close
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      {/* ── Portrait thumbnail card ── */}
      <button
        onClick={() => setOpen(true)}
        className="group relative text-left rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
        style={{ aspectRatio: '9/16', width: 180, background: '#111', border: '1px solid hsl(var(--border))' }}
        aria-label={`Watch Quick Bite: ${title}`}
      >
        <Image
          src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
          alt={title} fill
          sizes="180px"
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', border: '1.5px solid rgba(255,255,255,0.3)' }}>
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* Watched badge */}
        {initialWatched && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ background: 'rgba(27,124,62,0.85)' }}>
            <CheckCircle2 className="w-3 h-3" />
          </div>
        )}

        {/* Bottom labels */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(202,138,4,0.9)', color: '#fff' }}>
            <Zap className="w-2.5 h-2.5" /> Quick Bite
          </span>
          <p className="font-display text-xs font-semibold text-white leading-snug line-clamp-3">{title}</p>
          <p className="font-mono text-[10px] text-white/60">{durationSeconds}s</p>
        </div>
      </button>

      {/* ── Theater modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(10px)' }}
          onClick={() => setOpen(false)}
        >
          {/* Close */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content: player left + info right on desktop; stacked on mobile */}
          <div
            className="relative flex flex-col sm:flex-row overflow-hidden rounded-none sm:rounded-2xl w-full sm:w-auto"
            style={{ background: '#000' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Player — 9:16, 320px wide on desktop */}
            <div className="w-full sm:w-[320px] shrink-0 relative" style={{ aspectRatio: '9/16', maxHeight: '85dvh', background: '#000' }}>
              <ReelPlayer
                youtubeId={youtubeId}
                reelId={reelId}
                durationSeconds={durationSeconds}
                initialCompleted={initialWatched}
                layout="portrait"
              />
            </div>

            {/* Info panel — same height as player on desktop */}
            <div className="hidden sm:flex flex-col justify-between p-6 gap-4 sm:w-[260px] shrink-0"
              style={{ background: 'hsl(var(--card))', borderLeft: '1px solid hsl(var(--border))' }}>
              <div className="space-y-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(202,138,4,0.15)', color: '#ca8a04' }}>
                  <Zap className="w-3 h-3" /> Quick Bite · {durationSeconds}s
                </span>
                <h3 className="font-display text-base font-bold leading-snug" style={{ color: 'hsl(var(--foreground))' }}>
                  {title}
                </h3>
                {description && (
                  <p className="font-serif text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {description}
                  </p>
                )}
              </div>
              <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                This short recap counts toward your progress. +5 pts on completion.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
