'use client';

// Instagram-style portrait (9:16) player for YouTube Shorts.
// Marks the reel as watched via /api/progress/reel/watch once the student
// has watched MIN_WATCH_SECONDS of actual playback time.

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Zap } from 'lucide-react';

declare global {
  interface Window {
    YT?: {
      Player: new (id: string, opts: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer { getCurrentTime: () => number; destroy: () => void; }

interface Props {
  youtubeId: string;
  reelId?: string;
  durationSeconds?: number;
  initialCompleted?: boolean;
  /** 'portrait' (default) renders the Instagram 9:16 container.
   *  'landscape' fills available width with a standard 16:9 ratio. */
  layout?: 'portrait' | 'landscape';
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

const MIN_WATCH_SECONDS = 15;

export function ReelPlayer({
  youtubeId, reelId, durationSeconds = 30, initialCompleted = false, layout = 'portrait',
}: Props) {
  const uid = useRef(`reel-${youtubeId}-${Math.random().toString(36).slice(2)}`);
  const playerRef  = useRef<YTPlayer | null>(null);
  const tickRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const playedRef  = useRef(0);
  const markedRef  = useRef(false);
  const [completed, setCompleted] = useState(initialCompleted);

  function markWatched() {
    if (markedRef.current || !reelId) return;
    markedRef.current = true;
    setCompleted(true);
    fetch('/api/progress/reel/watch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reel_id: reelId }),
    }).catch(() => {});
  }

  useEffect(() => {
    if (initialCompleted) markedRef.current = true;
    let destroyed = false;

    loadYTApi().then(() => {
      if (destroyed || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(uid.current, {
        videoId: youtubeId,
        playerVars: { rel: 0, modestbranding: 1, color: 'white' },
        events: {
          onStateChange: (e: { data: number }) => {
            const playing = e.data === window.YT?.PlayerState.PLAYING;
            if (playing && !tickRef.current) {
              tickRef.current = setInterval(() => {
                playedRef.current += 1;
                const threshold = Math.max(MIN_WATCH_SECONDS, Math.floor(durationSeconds * 0.75));
                if (playedRef.current >= threshold) {
                  markWatched();
                  if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null; }
                }
              }, 1000);
            } else if (!playing && tickRef.current) {
              clearInterval(tickRef.current); tickRef.current = null;
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (tickRef.current) clearInterval(tickRef.current);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  if (layout === 'landscape') {
    return (
      <div className="relative">
        <div className="relative aspect-video rounded-xl overflow-hidden"
          style={{ border: '1px solid hsl(var(--border))', background: '#000' }}>
          <div id={uid.current} className="absolute inset-0 w-full h-full" />
        </div>
        {completed && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(27,124,62,0.85)', color: 'white' }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Watched
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative mx-auto" style={{ maxWidth: 320, width: '100%' }}>
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '9/16',
          background: '#000',
          border: '1px solid hsl(var(--border))',
        }}>
        <div id={uid.current} className="absolute inset-0 w-full h-full" />

        {/* Watched badge */}
        {completed && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(27,124,62,0.85)', color: 'white' }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Watched
          </div>
        )}

        {/* Quick Bite label */}
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 font-sans text-xs font-bold text-white px-2.5 py-0.5 rounded-full"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
            <Zap className="w-3 h-3" style={{ color: '#facc15' }} /> Quick Bite
          </span>
        </div>
      </div>
    </div>
  );
}
