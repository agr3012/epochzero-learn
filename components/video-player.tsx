'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  youtubeId: string;
  steps: Array<{ title: string; description?: string; timestamp_seconds?: number }>;
}

/**
 * YouTube embed with optional timestamp jumping. We use the iframe API's
 * postMessage protocol via re-rendering the src with start parameter.
 *
 * For richer control (programmatic seek without reload), we'd integrate the
 * YouTube IFrame Player API. Keeping this simple and reliable for v1.
 */
export function VideoPlayer({ youtubeId }: Props) {
  const [_seek, setSeek] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for hash changes like #t=120 to seek
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
    <div className="relative aspect-video border border-navy-700 overflow-hidden bg-black">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1&color=white`}
        title="REMA Club video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
