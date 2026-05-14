
'use client';

// app/podcast/[slug]/EpisodeView.tsx — CLIENT COMPONENT
// Handles audio player state and renders the transcript chat UI.

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
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
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
}

interface Props {
  ep: Episode;
  prev: NavEp | null;
  next: NavEp | null;
}

// ── Transcript parser ──────────────────────────────────────────────────────
// Parses "Alex: text\n\nMaya: text\n\n..." into structured lines.
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

// ── Utility ────────────────────────────────────────────────────────────────
function fmtTime(s: number) {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

// ── Main component ─────────────────────────────────────────────────────────
export default function EpisodeView({ ep, prev, next }: Props) {
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

  // Transcript
  const lines = ep.transcript ? parseTranscript(ep.transcript) : [];
  const speakers = Array.from(new Set(lines.map((l) => l.speaker)));
  const speakerA = speakers[0] ?? 'Alex';
  const speakerB = speakers[1] ?? 'Maya';

  return (
    <div className="container py-12 lg:py-16">

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
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

      {/* ── Cover image ─────────────────────────────────────────────── */}
      {ep.cover_image && (
        <div className="relative w-full h-64 lg:h-[420px] mb-8 overflow-hidden border border-navy-700">
          <Image
            src={ep.cover_image}
            alt={`${ep.title} cover art`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/20 to-transparent" />
          <div className="absolute bottom-6 left-6 flex gap-2">
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

      {/* ── Title block ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mb-8">
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

      {/* ── Audio Player ─────────────────────────────────────────────── */}
      <div className="max-w-4xl mb-12">
        <audio ref={audioRef} src={ep.audio_url} preload="metadata" />

        <div className="bg-navy-950 border border-navy-700 p-4 lg:p-5">
          <div className="flex items-center gap-4 mb-3">
            {/* Play / Pause */}
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

            {/* Time display */}
            <span className="font-mono text-xs text-bone-300 shrink-0 tabular-nums w-24">
              {fmtTime(currentTime)} / {fmtTime(duration)}
            </span>

            {/* Progress bar */}
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

            {/* Mute */}
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

      {/* ── Transcript ───────────────────────────────────────────────── */}
      <div className="max-w-4xl mb-12">
        <h2 className="font-mono text-xl text-bone-50 mb-1">Transcript</h2>
        <p className="font-mono text-xs uppercase tracking-wider text-bone-400 mb-5">
          // Conversation between {speakerA} and {speakerB}
        </p>

        {lines.length > 0 ? (
          <>
            {/* Speaker legend */}
            <div className="flex gap-6 mb-4 font-mono text-xs text-bone-300">
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 inline-block bg-navy-700 border border-navy-500" />
                {speakerA}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="w-3 h-3 inline-block bg-navy-900 border border-gold-500/40" />
                {speakerB}
              </span>
            </div>

            {/* Scrollable chat window */}
            <div className="border border-navy-700 bg-navy-950/60 p-4 lg:p-6 max-h-[640px] overflow-y-auto space-y-1.5">
              {lines.map((line, i) => {
                const isA = line.speaker === speakerA;
                const prevSpeaker = i > 0 ? lines[i - 1].speaker : null;
                const showName = prevSpeaker !== line.speaker;

                return (
                  <div
                    key={i}
                    className={`flex ${isA ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-[78%] flex flex-col ${isA ? 'items-start' : 'items-end'}`}>
                      {/* Speaker name — only on first bubble in a run */}
                      {showName && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-gold-500/80 mb-1 px-1">
                          {line.speaker}
                        </span>
                      )}
                      {/* Bubble */}
                      <div
                        className={`px-4 py-2.5 font-serif text-sm leading-relaxed text-bone-100 ${
                          isA
                            ? 'bg-navy-800 border border-navy-600 rounded-tr-xl rounded-br-xl rounded-bl-xl'
                            : 'bg-navy-900 border border-gold-500/25 rounded-tl-xl rounded-bl-xl rounded-br-xl'
                        }`}
                      >
                        {line.text}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="border border-dashed border-navy-700 p-8 text-center">
            <p className="font-mono text-sm text-bone-300">
              Transcript coming soon.
            </p>
          </div>
        )}
      </div>

      {/* ── Show Notes ───────────────────────────────────────────────── */}
      {ep.show_notes && (
        <div className="max-w-4xl mb-12">
          <h2 className="font-mono text-xl text-bone-50 mb-6">Show Notes</h2>
          <div className="border-l-2 border-gold-500/40 pl-6 font-serif text-bone-200 leading-relaxed whitespace-pre-line">
            {ep.show_notes}
          </div>
        </div>
      )}

      {/* ── Prev / Next ───────────────────────────────────────────────── */}
      <div className="max-w-4xl pt-8 border-t border-navy-700 grid md:grid-cols-2 gap-4">
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
  );
}
