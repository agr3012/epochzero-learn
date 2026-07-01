'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Play, CheckCircle2 } from 'lucide-react';
import { formatDuration } from '@/lib/utils';
import { VideoPlayer } from '@/components/video-player';

interface Props {
  videoId: string;
  youtubeId: string;
  title: string;
  durationSeconds: number | null;
  initialCompleted: boolean;
  initialWatchedSeconds: number;
  initialPositionSeconds: number;
}

export function VideoTheaterCard({
  videoId, youtubeId, title, durationSeconds,
  initialCompleted, initialWatchedSeconds, initialPositionSeconds,
}: Props) {
  const [open, setOpen] = useState(false);

  // Scroll lock + Escape key
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      {/* ── Thumbnail card (button — no navigation) ── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] rounded-lg"
      >
        <div className="relative aspect-video overflow-hidden rounded-lg"
          style={{ border: '1px solid hsl(var(--border))' }}>
          <Image
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt={title} fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.92)' }}>
              <Play className="w-6 h-6 ml-0.5" style={{ color: '#111' }} fill="#111" />
            </div>
          </div>
          {/* Duration badge */}
          {durationSeconds && (
            <span className="absolute bottom-2 right-2 font-mono text-[10px] px-1.5 py-0.5 rounded text-white"
              style={{ background: 'rgba(0,0,0,0.75)' }}>
              {formatDuration(durationSeconds)}
            </span>
          )}
          {/* Watched badge */}
          {initialCompleted && (
            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
              style={{ background: 'rgba(27,124,62,0.85)' }}>
              <CheckCircle2 className="w-3 h-3" /> Watched
            </span>
          )}
        </div>
        <p className="mt-3 text-sm font-medium leading-snug line-clamp-2 transition-colors group-hover:text-[hsl(var(--primary))]"
          style={{ color: 'hsl(var(--foreground))' }}>
          {title}
        </p>
      </button>

      {/* ── Theater overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}
          onClick={() => setOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Player (stops click propagation so overlay click closes but player click doesn't) */}
          <div
            className="w-full"
            style={{ maxWidth: 900 }}
            onClick={e => e.stopPropagation()}
          >
            {/* VideoPlayer mounts here → its useEffect fires → YT player creates */}
            <VideoPlayer
              youtubeId={youtubeId}
              videoId={videoId}
              durationSeconds={durationSeconds ?? undefined}
              initialPositionSeconds={initialPositionSeconds}
              initialWatchedSeconds={initialWatchedSeconds}
              initialCompleted={initialCompleted}
            />
          </div>

          {/* Title below player */}
          <div
            className="w-full flex items-center gap-3"
            style={{ maxWidth: 900 }}
            onClick={e => e.stopPropagation()}
          >
            <p className="font-display font-semibold text-white leading-snug flex-1">{title}</p>
            {durationSeconds && (
              <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {formatDuration(durationSeconds)}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
