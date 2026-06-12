// components/PdfViewer.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc =
  `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MIN  = 0.5;
const MAX  = 3.0;
const STEP = 0.15;

interface Props { fileId: string; title: string }

export function PdfViewer({ fileId, title }: Props) {
  const [numPages,    setNumPages]    = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(false);
  const [scale,       setScale]       = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput,   setJumpInput]   = useState('1');

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs     = useRef<(HTMLDivElement | null)[]>([]);

  // ── Track current page by scroll position ──────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el || numPages === 0) return;

    function onScroll() {
      const scrollTop = el!.scrollTop + 80; // offset for controls bar
      let closest = 1;
      let minDist = Infinity;
      pageRefs.current.forEach((ref, i) => {
        if (!ref) return;
        const dist = Math.abs(ref.offsetTop - scrollTop);
        if (dist < minDist) { minDist = dist; closest = i + 1; }
      });
      setCurrentPage(closest);
      setJumpInput(String(closest));
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [numPages, scale]);

  function onLoad({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
    pageRefs.current = new Array(numPages).fill(null);
  }

  // ── Zoom ───────────────────────────────────────────────────────────────────
  const zoomIn    = () => setScale(s => Math.min(MAX, +((s + STEP).toFixed(2))));
  const zoomOut   = () => setScale(s => Math.max(MIN, +((s - STEP).toFixed(2))));
  const zoomReset = () => setScale(1.0);

  // ── Page jump ──────────────────────────────────────────────────────────────
  function jumpToPage(e?: React.FormEvent) {
    e?.preventDefault();
    const n = parseInt(jumpInput);
    if (n >= 1 && n <= numPages) {
      pageRefs.current[n - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      setJumpInput(String(currentPage));
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 65px)' }}>

      {/* ── Controls bar ───────────────────────────────────────────────────── */}
      {numPages > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 shrink-0
          bg-navy-900 border-b border-navy-700">

          {/* Zoom out */}
          <button onClick={zoomOut} disabled={scale <= MIN}
            title="Zoom out"
            className="p-1.5 border border-navy-700 text-bone-300
              hover:text-gold-500 hover:border-gold-500/50 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed">
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Scale % — click to reset */}
          <button onClick={zoomReset}
            title="Reset to 100%"
            className="px-2.5 py-1 border border-navy-700 font-mono text-xs
              text-bone-300 hover:text-gold-500 hover:border-gold-500/50
              transition-colors min-w-[52px] text-center">
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom in */}
          <button onClick={zoomIn} disabled={scale >= MAX}
            title="Zoom in"
            className="p-1.5 border border-navy-700 text-bone-300
              hover:text-gold-500 hover:border-gold-500/50 transition-colors
              disabled:opacity-30 disabled:cursor-not-allowed">
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-5 bg-navy-700" />

          {/* Page jump */}
          <form onSubmit={jumpToPage}
            className="flex items-center gap-1.5">
            <span className="font-mono text-xs text-bone-500">Page</span>
            <input
              type="number"
              value={jumpInput}
              min={1} max={numPages}
              onChange={e => setJumpInput(e.target.value)}
              onBlur={() => jumpToPage()}
              className="w-14 px-2 py-1 font-mono text-xs text-center
                text-bone-100 bg-navy-800 border border-navy-600
                focus:border-gold-500/60 focus:outline-none
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="font-mono text-xs text-bone-500">
              / {numPages}
            </span>
          </form>

          {/* Title — right side */}
          <div className="ml-auto font-mono text-[10px] text-bone-500
            uppercase tracking-widest hidden lg:block truncate max-w-xs">
            {title}
          </div>
        </div>
      )}

      {/* ── PDF scrollable area ─────────────────────────────────────────────── */}
      <div ref={containerRef}
        className="flex-1 overflow-y-auto scrollbar-themed
          flex flex-col items-center bg-[#1e1e2e]">

        {/* Loading spinner */}
        {loading && !error && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="w-8 h-8 border-2 border-gold-500/30
              border-t-gold-500 rounded-full animate-spin" />
            <p className="font-mono text-xs uppercase tracking-widest text-bone-400">
              Loading PDF…
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="font-mono text-sm text-bone-400">
              Could not load PDF inline.
            </p>
            <a href={`/api/pdf/${fileId}`} target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs px-4 py-2">
              Download PDF instead
            </a>
          </div>
        )}

        {/* Document */}
        <Document
          file={`/api/pdf/${fileId}`}
          onLoadSuccess={onLoad}
          onLoadError={() => { setError(true); setLoading(false); }}
          loading={null} error={null}
          className="flex flex-col items-center gap-3 py-6 w-full">
          {Array.from({ length: numPages }, (_, i) => (
            <div key={i + 1}
              ref={el => { pageRefs.current[i] = el; }}
              data-page={i + 1}
              className="relative">

              {/* Page number badge */}
              <div className="absolute -left-1 top-2 z-10
                font-mono text-[9px] text-bone-500 bg-navy-950/80
                px-1.5 py-0.5 border border-navy-700 leading-none">
                {i + 1}
              </div>

              <Page
                pageNumber={i + 1}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
                className="shadow-2xl"
                loading={
                  <div className="bg-white animate-pulse"
                    style={{ width: 794 * scale, height: 1123 * scale }} />
                }
              />
            </div>
          ))}
        </Document>

        {numPages > 0 && (
          <p className="py-5 font-mono text-xs text-bone-600
            uppercase tracking-widest">
            End of document — {numPages} pages
          </p>
        )}
      </div>
    </div>
  );
}
