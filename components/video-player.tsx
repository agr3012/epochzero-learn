// components/video-player.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

declare global {
  interface Window {
    YT?: {
      Player: new (elementId: string, options: Record<string, unknown>) => YTPlayer;
      PlayerState: { PLAYING: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  getCurrentTime: () => number;
  destroy: () => void;
}

interface Props {
  youtubeId: string;
  steps?: Array<{ title: string; description?: string; timestamp_seconds?: number }>;
  /** Phase 2 progress tracking — omit any of these to render a plain, untracked player. */
  videoId?: string;
  initialPositionSeconds?: number;
  initialCompleted?: boolean;
}

let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT) return Promise.resolve();
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

const HEARTBEAT_FLUSH_SECONDS = 5;

export function VideoPlayer({ youtubeId, videoId, initialPositionSeconds = 0, initialCompleted = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementId = useRef(`yt-player-${youtubeId}-${Math.random().toString(36).slice(2)}`);
  const playerRef = useRef<YTPlayer | null>(null);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingSecondsRef = useRef(0);
  const [completed, setCompleted] = useState(initialCompleted);

  function flush(sync = false) {
    const pending = pendingSecondsRef.current;
    if (pending <= 0 || !videoId || !playerRef.current) return;
    pendingSecondsRef.current = 0;
    const position = Math.floor(playerRef.current.getCurrentTime());
    const body = JSON.stringify({ video_id: videoId, delta_seconds: pending, position_seconds: position });
    if (sync && navigator.sendBeacon) {
      navigator.sendBeacon('/api/progress/video/heartbeat', new Blob([body], { type: 'application/json' }));
      return;
    }
    fetch('/api/progress/video/heartbeat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
    }).then((res) => res.ok ? res.json() : null).then((data) => {
      if (data?.completed) setCompleted(true);
    }).catch(() => {});
  }

  useEffect(() => {
    let destroyed = false;

    loadYouTubeApi().then(() => {
      if (destroyed || !window.YT) return;
      playerRef.current = new window.YT.Player(elementId.current, {
        videoId: youtubeId,
        playerVars: { rel: 0, modestbranding: 1, color: 'white', start: Math.floor(initialPositionSeconds) },
        events: {
          onStateChange: (e: { data: number }) => {
            const isPlaying = e.data === window.YT?.PlayerState.PLAYING;
            if (isPlaying && !tickIntervalRef.current) {
              tickIntervalRef.current = setInterval(() => {
                pendingSecondsRef.current += 1;
                if (pendingSecondsRef.current >= HEARTBEAT_FLUSH_SECONDS) flush();
              }, 1000);
            } else if (!isPlaying && tickIntervalRef.current) {
              clearInterval(tickIntervalRef.current);
              tickIntervalRef.current = null;
              flush();
            }
          },
        },
      });
    });

    const handleUnload = () => flush(true);
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      destroyed = true;
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      flush(true);
      window.removeEventListener('beforeunload', handleUnload);
      playerRef.current?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId]);

  return (
    <div className="relative">
      <div className="relative aspect-video rounded-xl overflow-hidden"
        style={{ border: '1px solid hsl(var(--border))', background: '#000' }}>
        <div ref={containerRef} id={elementId.current} className="absolute inset-0 w-full h-full" />
      </div>
      {videoId && completed && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(27,124,62,0.85)', color: 'white' }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Watched
        </div>
      )}
    </div>
  );
}
