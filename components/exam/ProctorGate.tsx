// components/exam/ProctorGate.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Maximize, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onReady: () => void; // called when camera + fullscreen confirmed
}

type Step = 'camera' | 'fullscreen' | 'ready';

export function ProctorGate({ onReady }: Props) {
  const [step,         setStep]         = useState<Step>('camera');
  const [camStatus,    setCamStatus]    = useState<'idle'|'checking'|'ok'|'error'>('idle');
  const [camError,     setCamError]     = useState<string | null>(null);
  const [fsStatus,     setFSStatus]     = useState<'idle'|'ok'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check fullscreen
  useEffect(() => {
    function onFSChange() {
      if (document.fullscreenElement) setFSStatus('ok');
    }
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  async function checkCamera() {
    setCamStatus('checking');
    setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamStatus('ok');
      setStep('fullscreen');
    } catch (err: any) {
      setCamStatus('error');
      setCamError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Click "Allow" when your browser asks.'
          : 'No camera found. Please connect a webcam and try again.'
      );
    }
  }

  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      setFSStatus('ok');
      setStep('ready');
    } catch {
      // User blocked fullscreen — advise them
    }
  }

  function startExam() {
    // Stop the preview stream — ProctorShell will restart it
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    onReady();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="w-full max-w-lg mx-4">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
            // Proctored Exam
          </div>
          <h1 className="font-mono text-2xl font-bold text-bone-50">
            Pre-Exam Setup
          </h1>
          <p className="font-mono text-xs text-bone-400 mt-2 leading-relaxed">
            This exam requires a webcam and fullscreen mode.
            Complete both steps to begin.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">

          {/* Step 1 — Camera */}
          <div className={`border p-5 transition-colors
            ${step === 'camera'
              ? 'border-gold-500/60 bg-gold-500/5'
              : camStatus === 'ok'
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-navy-700 bg-navy-800/40'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 flex items-center justify-center shrink-0
                border ${camStatus === 'ok' ? 'border-emerald-500/40' : 'border-navy-700'}`}>
                {camStatus === 'checking'
                  ? <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
                  : camStatus === 'ok'
                  ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                  : camStatus === 'error'
                  ? <AlertCircle className="w-5 h-5 text-crimson-400" />
                  : <Camera className="w-5 h-5 text-bone-400" />
                }
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold text-bone-100 mb-1">
                  Step 1 — Enable Webcam
                </div>
                <p className="font-mono text-xs text-bone-400 leading-relaxed">
                  Your webcam will monitor for face presence throughout the exam.
                  Snapshots are only captured on violations.
                </p>
                {camError && (
                  <p className="font-mono text-xs text-crimson-400 mt-2">{camError}</p>
                )}
                {step === 'camera' && (
                  <button
                    onClick={checkCamera}
                    disabled={camStatus === 'checking'}
                    className="mt-3 px-4 py-2 font-mono text-xs uppercase tracking-wider
                      bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors
                      disabled:opacity-50 disabled:cursor-not-allowed">
                    {camStatus === 'checking' ? 'Checking…' : 'Allow Camera'}
                  </button>
                )}
              </div>
            </div>

            {/* Camera preview */}
            {camStatus === 'ok' && (
              <div className="mt-4 border border-navy-700 overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay playsInline muted
                  className="w-full h-32 object-cover bg-black"
                />
                <p className="font-mono text-[9px] uppercase tracking-widest
                  text-emerald-400 text-center py-1.5 bg-navy-900/60">
                  ✓ Camera active — face visible
                </p>
              </div>
            )}
          </div>

          {/* Step 2 — Fullscreen */}
          <div className={`border p-5 transition-colors
            ${step === 'fullscreen'
              ? 'border-gold-500/60 bg-gold-500/5'
              : fsStatus === 'ok'
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-navy-700 bg-navy-800/40 opacity-60'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 flex items-center justify-center shrink-0
                border ${fsStatus === 'ok' ? 'border-emerald-500/40' : 'border-navy-700'}`}>
                {fsStatus === 'ok'
                  ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                  : <Maximize className="w-5 h-5 text-bone-400" />
                }
              </div>
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold text-bone-100 mb-1">
                  Step 2 — Enter Fullscreen
                </div>
                <p className="font-mono text-xs text-bone-400 leading-relaxed">
                  The exam runs in fullscreen only. Exiting fullscreen counts as
                  a violation. You have 3 warnings before auto-cancellation.
                </p>
                {step === 'fullscreen' && (
                  <button
                    onClick={enterFullscreen}
                    className="mt-3 px-4 py-2 font-mono text-xs uppercase tracking-wider
                      bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors">
                    Enter Fullscreen
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Start button — only after both steps done */}
        {step === 'ready' && (
          <button
            onClick={startExam}
            className="w-full py-4 font-mono text-sm uppercase tracking-wider
              font-bold bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors">
            Start Exam →
          </button>
        )}

        {/* Rules reminder */}
        <div className="mt-6 border border-navy-800 p-4">
          <div className="font-mono text-[9px] uppercase tracking-widest text-gold-500 mb-2">
            // Exam Rules
          </div>
          <ul className="font-mono text-[11px] text-bone-400 space-y-1">
            {[
              'Stay in fullscreen at all times',
              'Do not switch tabs or applications',
              'Keep your face visible on camera',
              'No copying or sharing of questions',
              '3 violations = automatic cancellation',
            ].map(r => (
              <li key={r} className="flex items-center gap-2">
                <span className="text-gold-500">›</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
