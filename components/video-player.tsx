// components/video-player.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  youtubeId: string;
  steps: Array<{ title: string; description?: string; timestamp_seconds?: number }>;
}

export function VideoPlayer({ youtubeId }: Props) {
  const [_seek, setSeek] = useState(0);
  const iframeRef        = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handle = () => {
      const m = window.location.hash.match(/t=(\d+)/);
      if (m) setSeek(parseInt(m[1], 10));
    };
    handle();
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  }, []);

  return (
    <div className="relative aspect-video rounded-xl overflow-hidden"
      style={{ border: '1px solid hsl(var(--border))', background: '#000' }}>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&color=white`}
        title="Video lesson"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
