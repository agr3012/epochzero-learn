// components/PdfViewer.tsx
'use client';

import { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Load worker from CDN — no webpack config needed
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  fileId: string;
  title:  string;
}

export function PdfViewer({ fileId, title }: Props) {
  const [numPages, setNumPages]   = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [pageWidth, setPageWidth] = useState(800);
  const containerRef              = useRef<HTMLDivElement>(null);

  function onDocumentLoad({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    // Fit page to container width
    if (containerRef.current) {
      setPageWidth(Math.min(containerRef.current.clientWidth - 32, 900));
    }
  }

  return (
    <div
      ref={containerRef}
      className="overflow-y-auto scrollbar-themed bg-[#1e1e2e] flex flex-col items-center"
      style={{ height: 'calc(100vh - 65px)' }}
    >
      {/* Loading state */}
      {loading && !error && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-8 h-8 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest text-bone-400">
            Loading PDF…
          </p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="font-mono text-sm text-bone-400">
            Could not load PDF inline.
          </p>
          <a
            href={`/api/pdf/${fileId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs px-4 py-2"
          >
            Download PDF instead
          </a>
        </div>
      )}

      {/* PDF document */}
      <Document
        file={`/api/pdf/${fileId}`}
        onLoadSuccess={onDocumentLoad}
        onLoadError={() => { setError(true); setLoading(false); }}
        loading={null}
        error={null}
        className="flex flex-col items-center gap-2 py-6 w-full"
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i + 1}
            pageNumber={i + 1}
            width={pageWidth}
            renderTextLayer
            renderAnnotationLayer
            className="shadow-2xl"
            loading={
              <div
                className="bg-white animate-pulse mx-auto"
                style={{ width: pageWidth, height: Math.round(pageWidth * 1.414) }}
              />
            }
          />
        ))}
      </Document>

      {/* Bottom padding */}
      {numPages > 0 && (
        <div className="py-4 font-mono text-xs text-bone-500 uppercase tracking-widest">
          {numPages} pages — {title}
        </div>
      )}
    </div>
  );
}
