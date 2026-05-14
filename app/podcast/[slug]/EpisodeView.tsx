'use client';

// app/podcast/[slug]/EpisodeView.tsx — CLIENT COMPONENT

import Link from 'next/link';
import Image from 'next/image';
import { useRef, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Headphones,
  Calendar,
  AudioLines,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';

interface Episode {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  audio_url: string;
  episode_number: number | null;
  cover_image: string | null;
  show_notes: string | null;
  transcript: string | null;
  topic_tag: string | null;
  published_at: string | null;
  duration_seconds: number | null;
}

interface NavEp {
  episode_number: number;
  slug: string;
  title: string;
  cover_image?: string | null;
  topic_tag?: string | null;
  duration_seconds?: number | null;
}

interface Props {
  ep: Episode;
  prev: NavEp | null;
  next: NavEp | null;
  allEpisodes: NavEp[];
}

// ── Transcript parser ──────────────────────────────────────────────────────
function parseTranscript(raw: string): { speaker: string; text: string }[] {
  return raw
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(':');
      if (colon === -1) return null;
      const speaker = line.slice(0, colon).trim();
      const text = line.slice(colon + 1).trim();
      if (!text) return null;
      return { speaker, text };
    })
    .filter((x): x is { speaker: string; text: string } => x !== null);
}

function fmtTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function EpisodeView({ ep, prev, next, allEpisodes }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    };
    const onLoad = () => setDuration(audio.duration);
    const onEnd = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onLoad);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onLoad);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    playing ? a.pause() : a.play();
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !muted;
    setMuted(!muted);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };

  const lines = ep.transcript ? parseTranscript(ep.transcript) : [];
  const speakers = Array.from(new Set(lines.map((l) => l.speaker)));
  const speakerA = speakers[0] ?? 'Alex';
  const speakerB = speakers[1] ?? 'Maya';

  // Other episodes for sidebar (exclude current)
  const otherEpisodes = allEpisodes.filter((e) => e.slug !== ep.slug);

  return (
    <div className="container py-12 lg:py-16">

      {/* Breadcrumb */}
      <nav className="mb-8 font-mono text-xs uppercase tracking-wider text-bone-300 flex items-center gap-2">
        <Link
          href="/podcast"
          className="hover:text-gold-500 transition-colors inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" />
          Podcast
        </Link>
        <span>/</span>
        <span className="text-gold-500">
          EP {String(ep.episode_number ?? '').padStart(2, '0')}
        </span>
      </nav>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

        {/* ── LEFT: Main content ─────────────────────────────────────── */}
        <div className="min-w-0">

          {/* Cover image — natural size, no letterboxing */}
          {ep.cover_image && (
            <div className="relative w-full border border-navy-700 mb-8 overflow-hidden">
              {/*
                Use next/image with width+height=0 and style width/height auto
                so the image renders at its natural aspect ratio with no padding trick.
                This eliminates all empty space above/below.
              */}
              <Image
                src={ep.cover_image}
                alt={`${ep.title} cover art`}
                width={0}
                height={0}
                sizes="(max-width: 1024px) 100vw, calc(100vw - 360px)"
                className="w-full h-auto"
                priority
              />
              {/* Badges — positioned over the image bottom-left */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                {ep.topic_tag && (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-navy-900/90 border border-gold-500/60 text-gold-500">
                    {ep.topic_tag}
                  </span>
                )}
                {ep.episode_number != null && (
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 bg-navy-900/90 border border-navy-600 text-bone-300">
                    EP {String(ep.episode_number).padStart(2, '0')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Title + meta */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-bone-300 mb-3">
              {ep.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gold-500" />
                  {fmtDate(ep.published_at)}
                </span>
              )}
              {ep.duration_seconds != null && (
                <span className="inline-flex items-center gap-1.5">
                  <AudioLines className="w-3 h-3 text-gold-500" />
                  {fmtDuration(ep.duration_seconds)}
                </span>
              )}
            </div>

            <h1 className="font-mono text-3xl lg:text-4xl font-bold text-bone-50 leading-tight mb-4">
              {ep.title}
            </h1>

            {ep.description && (
              <p className="font-serif text-lg text-bone-200 leading-relaxed">
                {ep.description}
              </p>
            )}
          </div>

          {/* ── Audio Player ──────────────────────────────────────────── */}
          <div className="mb-12">
            <audio ref={audioRef} src={ep.audio_url} preload="metadata" />

            <div className="bg-navy-950 border border-navy-700 p-4 lg:p-5">
              <div className="flex items-center gap-4 mb-3">
                <button
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className="w-10 h-10 shrink-0 border border-gold-500 bg-gold-500/10 hover:bg-gold-500/25 flex items-center justify-center transition-colors text-gold-500"
                >
                  {playing
                    ? <Pause className="w-4 h-4" fill="currentColor" />
                    : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                  }
                </button>

                <span className="font-mono text-xs text-bone-300 shrink-0 tabular-nums w-24">
                  {fmtTime(currentTime)} / {fmtTime(duration)}
                </span>

                <div
                  className="flex-1 h-1.5 bg-navy-700 cursor-pointer relative group"
                  onClick={seek}
                  role="slider"
                  aria-label="Seek"
                  aria-valuenow={Math.round(progress)}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-gold-500"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gold-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                    style={{ left: `calc(${progress}% - 6px)` }}
                  />
                </div>

                <button
                  onClick={toggleMute}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  className="text-bone-300 hover:text-gold-500 transition-colors shrink-0"
                >
                  {muted
                    ? <VolumeX className="w-4 h-4" />
                    : <Volume2 className="w-4 h-4" />
                  }
                </button>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-bone-400">
                <Headphones className="w-3 h-3 text-gold-500/60" />
                <span>EpochZero Tech Talks — {ep.title}</span>
              </div>
            </div>
          </div>

          {/* ── Transcript ────────────────────────────────────────────── */}
          <div className="mb-12">
            <h2 className="font-mono text-xl text-bone-50 mb-1">Transcript</h2>
            <p className="font-mono text-xs uppercase tracking-wider text-bone-400 mb-5">
              // Conversation between {speakerA} and {speakerB}
            </p>

            {lines.length > 0 ? (
              <>
                <div className="flex gap-6 mb-4 font-mono text-xs text-bone-300">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 inline-block bg-navy-700 border border-navy-500" />
                    {speakerA} — left
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 inline-block bg-navy-900 border border-gold-500/40" />
                    {speakerB} — right
                  </span>
                </div>

                <style>{`
                  .transcript-scroll::-webkit-scrollbar { width: 5px; }
                  .transcript-scroll::-webkit-scrollbar-track { background: #060b14; }
                  .transcript-scroll::-webkit-scrollbar-thumb { background: #b8922a; border-radius: 0; }
                  .transcript-scroll::-webkit-scrollbar-thumb:hover { background: #d4a93c; }
                  .transcript-scroll { scrollbar-width: thin; scrollbar-color: #b8922a #060b14; }
                `}</style>

                <div className="transcript-scroll border border-navy-700 bg-navy-950/60 p-4 lg:p-6 h-[580px] overflow-y-auto">
                  <div className="space-y-1.5">
                    {lines.map((line, i) => {
                      const isA = line.speaker === speakerA;
                      const showName = i === 0 || lines[i - 1].speaker !== line.speaker;
                      return (
                        <div key={i} className={`flex w-full ${isA ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] flex flex-col ${isA ? 'items-start' : 'items-end'}`}>
                            {showName && (
                              <span className="font-mono text-[10px] uppercase tracking-wider text-gold-500/80 mb-1 px-1">
                                {line.speaker}
                              </span>
                            )}
                            <div className={`px-4 py-2.5 font-serif text-sm leading-relaxed text-bone-100 ${
                              isA
                                ? 'bg-navy-800 border border-navy-600 rounded-tr-xl rounded-br-xl rounded-bl-xl'
                                : 'bg-navy-900 border border-gold-500/25 rounded-tl-xl rounded-bl-xl rounded-br-xl'
                            }`}>
                              {line.text}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="border border-dashed border-navy-700 p-8 text-center">
                <p className="font-mono text-sm text-bone-300">Transcript coming soon.</p>
              </div>
            )}
          </div>

          {/* ── Show Notes ────────────────────────────────────────────── */}
          {ep.show_notes && (
            <div className="mb-12">
              <h2 className="font-mono text-xl text-bone-50 mb-6">Show Notes</h2>
              <div className="border-l-2 border-gold-500/40 pl-6 font-serif text-bone-200 leading-relaxed whitespace-pre-line">
                {ep.show_notes}
              </div>
            </div>
          )}

          {/* ── Prev / Next ───────────────────────────────────────────── */}
          <div className="pt-8 border-t border-navy-700 grid md:grid-cols-2 gap-4">
            {prev ? (
              <Link href={`/podcast/${prev.slug}`} className="card-forensic p-5 group">
                <div className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1 inline-flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3" />
                  Previous episode
                </div>
                <div className="font-mono text-base text-bone-50 group-hover:text-gold-500 transition-colors leading-tight">
                  EP {String(prev.episode_number).padStart(2, '0')} · {prev.title}
                </div>
              </Link>
            ) : <div />}

            {next ? (
              <Link href={`/podcast/${next.slug}`} className="card-forensic p-5 group md:text-right">
                <div className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1 inline-flex items-center gap-1 md:justify-end">
                  Next episode
                  <ChevronRight className="w-3 h-3" />
                </div>
                <div className="font-mono text-base text-bone-50 group-hover:text-gold-500 transition-colors leading-tight">
                  EP {String(next.episode_number).padStart(2, '0')} · {next.title}
                </div>
              </Link>
            ) : <div />}
          </div>
        </div>

        {/* ── RIGHT: Sidebar — other episodes ───────────────────────── */}
        <aside className="lg:sticky lg:top-24 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-4 h-4 text-gold-500" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500">
              // More Episodes
            </span>
          </div>

          {otherEpisodes.length === 0 ? (
            <p className="font-mono text-xs text-bone-400">No other episodes yet.</p>
          ) : (
            otherEpisodes.map((other) => (
              <Link
                key={other.slug}
                href={`/podcast/${other.slug}`}
                className="flex gap-3 p-3 border border-navy-700 hover:border-gold-500/40 transition-colors group bg-navy-900/40"
              >
                {/* Thumbnail */}
                <div className="relative w-20 h-14 shrink-0 overflow-hidden bg-navy-950 border border-navy-700">
                  {other.cover_image ? (
                    <Image
                      src={other.cover_image}
                      alt={other.title}
                      fill
                      sizes="80px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-gold-500/40" />
                    </div>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-gold-500">
                      EP {String(other.episode_number).padStart(2, '0')}
                    </span>
                    {other.topic_tag && (
                      <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-navy-600 text-bone-400">
                        {other.topic_tag}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-xs text-bone-100 leading-tight group-hover:text-gold-500 transition-colors line-clamp-2">
                    {other.title}
                  </p>
                  {other.duration_seconds != null && (
                    <span className="font-mono text-[10px] text-bone-400 mt-1 inline-flex items-center gap-1">
                      <AudioLines className="w-2.5 h-2.5" />
                      {fmtDuration(other.duration_seconds)}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}

          {/* Link to full podcast listing */}
          <Link
            href="/podcast"
            className="block w-full text-center font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 transition-colors py-3 border border-navy-700 hover:border-gold-500/40 mt-2"
          >
            View all episodes →
          </Link>
        </aside>
      </div>
    </div>
  );
}
