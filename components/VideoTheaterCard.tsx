'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { X, Play, CheckCircle2, Clock } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

declare global {
  interface Window {
    YT?: {
      Player: new (id: string, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}
interface YTPlayer {
  getCurrentTime: () => number;
  destroy: () => void;
}

let ytApiPromise: Promise<void> | null = null;
function loadYTApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return ytApiPromise;
}

interface Props {
  videoId: string;
  youtubeId: string;
  title: string;
  durationSeconds: number | null;
  initialCompleted: boolean;
}

export function VideoTheaterCard({ videoId, youtubeId, title, durationSeconds, initialCompleted }: Props) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState(initialCompleted);
  const uid = useRef(`vt-${youtubeId}-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef<YTPlayer | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPosRef = useRef(0);

  function sendHeartbeat(delta: number, position: number) {
    if (delta <= 0) return;
    fetch('/api/progress/video/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id: videoId, delta_seconds: delta, position_seconds: position }),
    })
      .then(r => r.json())
      .then((data: { completed?: boolean }) => { if (data.completed) setCompleted(true); })
      .catch(() => {});
  }

  // Build player once modal opens
  useEffect(() => {
    if (!open) return;
    let destroyed = false;

    loadYTApi().then(() => {
      if (destroyed || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(uid.current, {
        videoId: youtubeId,
        playerVars: { rel: 0, modestbranding: 1, color: 'white', autoplay: 1 },
        events: {
          onStateChange: (e: { data: number }) => {
            const playing = e.data === window.YT?.PlayerState.PLAYING;
            if (playing && !tickRef.current) {
              tickRef.current = setInterval(() => {
                const pos = playerRef.current?.getCurrentTime() ?? 0;
                const delta = Math.round(pos - lastPosRef.current);
                lastPosRef.current = pos;
                sendHeartbeat(Math.min(delta, 15), pos);
              }, 10_000);
            } else if (!playing && tickRef.current) {
              clearInterval(tickRef.current);
              tickRef.current = null;
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
      playerRef.current?.destroy();
      playerRef.current = null;
      lastPosRef.current = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, youtubeId]);

  // Scroll lock + keyboard
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <>
      {/* ── Thumbnail card ── */}
      <button
        onClick={() => setOpen(true)}
        className="group relative text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]"
        aria-label={`Watch: ${title}`}
      >
        <div className="relative aspect-video overflow-hidden rounded-lg"
          style={{ border: '1px solid hsl(var(--border))' }}>
          <Image
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt={title} fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.25)' }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform group-hover:scale-110"
              style={{ background: 'rgba(255,255,255,0.9)' }}>
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
          {completed && (
            <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white"
              style={{ background: 'rgba(27,124,62,0.85)' }}>
              <CheckCircle2 className="w-3 h-3" /> Watched
            </span>
          )}
        </div>
        <p className="mt-3 text-sm font-medium leading-snug line-clamp-2 text-left transition-colors group-hover:text-[hsl(var(--primary))]"
          style={{ color: 'hsl(var(--foreground))' }}>
          {title}
        </p>
      </button>

      {/* ── Theater modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 p-4"
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)' }}
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

          {/* 16:9 player — max 900px wide */}
          <div
            className="w-full overflow-hidden rounded-xl shadow-2xl"
            style={{ maxWidth: 900 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="relative aspect-video" style={{ background: '#000' }}>
              <div id={uid.current} className="absolute inset-0 w-full h-full" />
            </div>
          </div>

          {/* Title bar below player */}
          <div className="w-full flex items-start gap-3" style={{ maxWidth: 900 }}
            onClick={e => e.stopPropagation()}>
            {completed && (
              <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(27,124,62,0.85)', color: '#fff' }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Watched
              </span>
            )}
            <p className="font-display font-semibold text-white leading-snug">{title}</p>
            {durationSeconds && (
              <span className="ml-auto shrink-0 flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(durationSeconds)}
              </span>
            )}
          </div>
        </div>
      )}
    </>
  );
}
