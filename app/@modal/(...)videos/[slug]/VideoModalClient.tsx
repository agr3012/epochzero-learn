'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { VideoPlayer } from '@/components/video-player';
import { formatDuration } from '@/lib/utils';

interface VideoData {
  id: string;
  youtube_id: string;
  title: string;
  duration_seconds: number | null;
}

interface ProgressData {
  watched_seconds: number;
  last_position_seconds: number;
  completed: boolean;
}

export function VideoModalClient({
  video,
  progress,
}: {
  video: VideoData;
  progress: ProgressData | null;
}) {
  const router = useRouter();

  function close() {
    router.back();
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 p-4"
      style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)' }}
      onClick={close}
    >
      {/* Close */}
      <button
        type="button"
        onClick={close}
        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/20"
        style={{ background: 'rgba(255,255,255,0.12)', color: 'white' }}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 16:9 player — max 900px */}
      <div
        className="w-full"
        style={{ maxWidth: 900 }}
        onClick={e => e.stopPropagation()}
      >
        <VideoPlayer
          youtubeId={video.youtube_id}
          videoId={video.id}
          durationSeconds={video.duration_seconds ?? undefined}
          initialPositionSeconds={progress?.last_position_seconds ?? 0}
          initialWatchedSeconds={progress?.watched_seconds ?? 0}
          initialCompleted={progress?.completed ?? false}
        />
      </div>

      {/* Title + duration bar */}
      <div
        className="w-full flex items-center gap-3"
        style={{ maxWidth: 900 }}
        onClick={e => e.stopPropagation()}
      >
        <p className="font-display font-semibold text-white leading-snug flex-1">{video.title}</p>
        {video.duration_seconds && (
          <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>
    </div>
  );
}
