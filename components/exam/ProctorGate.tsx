// components/exam/ProctorGate.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Maximize, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  onReady: () => void; // called when camera + face + fullscreen confirmed
}

type Step = 'camera' | 'fullscreen' | 'ready';
type CamStatus = 'idle' | 'starting' | 'no_face' | 'ok' | 'error';

const MODEL_URL = '/models';

export function ProctorGate({ onReady }: Props) {
  const [step,      setStep]      = useState<Step>('camera');
  const [camStatus, setCamStatus] = useState<CamStatus>('idle');
  const [camError,  setCamError]  = useState<string | null>(null);
  const [fsStatus,  setFSStatus]  = useState<'idle' | 'ok'>('idle');

  const videoRef       = useRef<HTMLVideoElement>(null);
  const streamRef      = useRef<MediaStream | null>(null);
  const faceapiRef     = useRef<any>(null);
  const faceCheckTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fullscreen tracking ─────────────────────────────────────────────────
  useEffect(() => {
    function onFSChange() {
      if (document.fullscreenElement) setFSStatus('ok');
    }
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  // ── Cleanup on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ── Continuous face check loop (runs while on Step 1) ──────────────────
  const startFaceCheckLoop = useCallback(() => {
    if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);

    faceCheckTimer.current = setInterval(async () => {
      const faceapi = faceapiRef.current;
      const video   = videoRef.current;

      if (!faceapi || !video) return;

      if (video.readyState < 2) {
        // eslint-disable-next-line no-console
        console.log('[ProctorGate] video not ready, readyState=', video.readyState);
        return;
      }

      // Also catch shutter-closed / black-feed cases where readyState
      // is fine but track is muted/disabled
      const track = streamRef.current?.getVideoTracks()[0];
      if (track && (track.muted || !track.enabled || track.readyState === 'ended')) {
        setCamStatus('no_face');
        return;
      }

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );
        // eslint-disable-next-line no-console
        console.log('[ProctorGate] detections:', detections.length,
          'video size:', video.videoWidth, 'x', video.videoHeight);
        if (detections.length >= 1) {
          setCamStatus('ok');
        } else {
          setCamStatus('no_face');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[ProctorGate] detectAllFaces error:', err);
        setCamStatus('no_face');
      }
    }, 1000);
  }, []);

  // ── Step 1: start camera + load model + begin checking ──────────────────
  async function checkCamera() {
    setCamStatus('starting');
    setCamError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setCamStatus('error');
      setCamError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Click "Allow" when your browser asks.'
          : 'No camera found. Please connect a webcam and try again.'
      );
      return;
    }

    // Load face detection model
    try {
      if (!faceapiRef.current) {
        const mod: any = await import('@vladmandic/face-api');
        // Some bundlers wrap the module as { default: faceapi }
        const faceapi = mod?.nets ? mod : mod?.default;

        if (!faceapi?.nets?.tinyFaceDetector) {
          throw new Error('face-api module shape unexpected — nets.tinyFaceDetector missing');
        }

        // Force CPU backend — WebGL unsupported in some environments and
        // WASM binary isn't served by Next.js without extra config.
        // CPU is plenty fast for TinyFaceDetector at 1-3s intervals.
        if (faceapi.tf?.setBackend) {
          await faceapi.tf.setBackend('cpu');
        }
        if (faceapi.tf?.ready) {
          await faceapi.tf.ready();
        }

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        faceapiRef.current = faceapi;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[ProctorGate] face-api load failed:', err);
      setCamStatus('error');
      setCamError('Failed to load face detection. Refresh and try again.');
      return;
    }

    // Begin checking for a face on the live feed
    setCamStatus('no_face');
    startFaceCheckLoop();
  }

  // ── Step 2: fullscreen ────────────────────────────────────────────────
  async function enterFullscreen() {
    try {
      await document.documentElement.requestFullscreen();
      setFSStatus('ok');
      setStep('ready');
    } catch {
      // User blocked fullscreen — advise them
    }
  }

  // Move to Step 2 only once a real face has been confirmed
  function confirmFaceAndContinue() {
    if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
    setStep('fullscreen');
  }

  function startExam() {
    // Stop preview stream — ProctorShell starts its own
    if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
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

          {/* Step 1 — Camera + Face check */}
          <div className={`border p-5 transition-colors
            ${step === 'camera'
              ? 'border-gold-500/60 bg-gold-500/5'
              : camStatus === 'ok'
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-navy-700 bg-navy-800/40'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 flex items-center justify-center shrink-0
                border ${camStatus === 'ok' ? 'border-emerald-500/40' : 'border-navy-700'}`}>
                {(camStatus === 'starting')
                  ? <Loader2 className="w-5 h-5 text-gold-500 animate-spin" />
                  : camStatus === 'ok'
                  ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                  : camStatus === 'error'
                  ? <AlertCircle className="w-5 h-5 text-crimson-400" />
                  : camStatus === 'no_face'
                  ? <AlertCircle className="w-5 h-5 text-gold-500" />
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
                {step === 'camera' && camStatus === 'idle' && (
                  <button
                    onClick={checkCamera}
                    className="mt-3 px-4 py-2 font-mono text-xs uppercase tracking-wider
                      bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors">
                    Allow Camera
                  </button>
                )}
                {step === 'camera' && camStatus === 'error' && (
                  <button
                    onClick={checkCamera}
                    className="mt-3 px-4 py-2 font-mono text-xs uppercase tracking-wider
                      bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors">
                    Retry
                  </button>
                )}
                {step === 'camera' && camStatus === 'ok' && (
                  <button
                    onClick={confirmFaceAndContinue}
                    className="mt-3 px-4 py-2 font-mono text-xs uppercase tracking-wider
                      bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors">
                    Continue
                  </button>
                )}
              </div>
            </div>

            {/* Camera preview — ONE element, always mounted (ref stable from
                first render). Visibility/label toggled by CSS only. */}
            <div className={`mt-4 border border-navy-700 overflow-hidden
              ${(camStatus === 'no_face' || camStatus === 'ok') ? '' : 'hidden'}`}>
              <video
                ref={videoRef}
                autoPlay playsInline muted
                className="w-full h-32 object-cover bg-black scale-x-[-1]"
              />
              <p className={`font-mono text-[9px] uppercase tracking-widest
                text-center py-1.5 bg-navy-900/60
                ${camStatus === 'ok' ? 'text-emerald-400' : 'text-gold-500'}`}>
                {camStatus === 'ok'
                  ? '✓ Camera active — face detected'
                  : 'Position your face in the frame…'}
              </p>
            </div>
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
