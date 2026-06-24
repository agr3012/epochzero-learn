// components/exam/ProctorGate.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Maximize, CheckCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';

interface Props { onReady: () => void }
type Step      = 'camera' | 'fullscreen' | 'ready';
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

  useEffect(() => {
    const onFSChange = () => { if (document.fullscreenElement) setFSStatus('ok'); };
    document.addEventListener('fullscreenchange', onFSChange);
    return () => document.removeEventListener('fullscreenchange', onFSChange);
  }, []);

  useEffect(() => {
    return () => {
      if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startFaceCheckLoop = useCallback(() => {
    if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
    faceCheckTimer.current = setInterval(async () => {
      const faceapi = faceapiRef.current;
      const video   = videoRef.current;
      if (!faceapi || !video || video.readyState < 2) return;
      const track = streamRef.current?.getVideoTracks()[0];
      if (track && (track.muted || !track.enabled || track.readyState === 'ended')) {
        setCamStatus('no_face'); return;
      }
      try {
        const detections = await faceapi.detectAllFaces(
          video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );
        setCamStatus(detections.length >= 1 ? 'ok' : 'no_face');
      } catch { setCamStatus('no_face'); }
    }, 1000);
  }, []);

  async function checkCamera() {
    setCamStatus('starting'); setCamError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); }
    } catch (err: any) {
      setCamStatus('error');
      setCamError(err.name === 'NotAllowedError'
        ? 'Camera permission denied. Click Allow when your browser asks.'
        : 'No camera found. Please connect a webcam and try again.');
      return;
    }
    try {
      if (!faceapiRef.current) {
        const mod: any = await import('@vladmandic/face-api');
        const faceapi = mod?.nets ? mod : mod?.default;
        if (!faceapi?.nets?.tinyFaceDetector) throw new Error('face-api module shape unexpected');
        if (faceapi.tf?.setBackend) await faceapi.tf.setBackend('cpu');
        if (faceapi.tf?.ready)      await faceapi.tf.ready();
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        faceapiRef.current = faceapi;
      }
    } catch {
      setCamStatus('error');
      setCamError('Failed to load face detection. Refresh and try again.'); return;
    }
    setCamStatus('no_face');
    startFaceCheckLoop();
  }

  async function enterFullscreen() {
    try { await document.documentElement.requestFullscreen(); setFSStatus('ok'); setStep('ready'); } catch {}
  }
  function confirmFaceAndContinue() {
    if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
    setStep('fullscreen');
  }
  function startExam() {
    if (faceCheckTimer.current) clearInterval(faceCheckTimer.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    onReady();
  }

  return (
    <div className="card rounded-2xl overflow-hidden" style={{
      borderTop: '3px solid hsl(var(--primary))',
    }}>
      <div className="p-8 lg:p-12">

        {/* Header */}
        <div className="mb-8">
          <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.15em] mb-2"
            style={{ color: 'hsl(var(--primary))' }}>
            Proctored Exam
          </p>
          <h2 className="font-display text-2xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Pre-Exam Setup
          </h2>
          <p className="font-sans text-sm leading-relaxed"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            This exam requires a webcam and fullscreen mode. Complete both steps to begin.
          </p>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-2 gap-4 mb-8">

          {/* Step 1 */}
          <div className="rounded-xl p-6 transition-all" style={{
            background: step === 'camera'
              ? 'hsl(var(--card-hover))' : camStatus === 'ok'
              ? 'rgba(27,124,62,0.12)' : 'hsl(var(--muted))',
            border: step === 'camera'
              ? '1px solid hsl(var(--primary)/0.5)' : camStatus === 'ok'
              ? '1px solid rgba(74,222,128,0.30)' : '1px solid hsl(var(--border))',

          }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
                background: camStatus === 'ok' ? '#1B7C3E' : camStatus === 'error' ? '#991b1b' : '#8B5E1A',
              }}>
                {camStatus === 'starting' ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                 : camStatus === 'ok'     ? <CheckCircle className="w-5 h-5 text-white" />
                 : camStatus === 'error'  ? <AlertCircle className="w-5 h-5 text-white" />
                 : camStatus === 'no_face'? <AlertCircle className="w-5 h-5 text-white" />
                 : <Camera className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-base mb-1" style={{ color: "hsl(var(--foreground))" }}>
                  Step 1 — Enable Webcam
                </div>
                <p className="font-sans text-xs leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>
                  Your webcam will monitor for face presence throughout the exam.
                  Snapshots are only captured on violations.
                </p>
                {camError && (
                  <p className="font-sans text-xs mt-2" style={{ color: '#ef4444' }}>{camError}</p>
                )}
              </div>
            </div>

            {/* Camera preview */}
            <div className={`overflow-hidden rounded-lg ${(camStatus === 'no_face' || camStatus === 'ok') ? '' : 'hidden'}`}
              style={{ border: '1px solid hsl(var(--border))' }}>
              <video ref={videoRef} autoPlay playsInline muted
                className="w-full h-36 object-cover bg-black scale-x-[-1]" />
              <p className="font-sans text-[10px] text-center py-2" style={{
                background: 'rgba(0,0,0,0.4)',
                color: camStatus === 'ok' ? '#4ADE80' : '#E8A020',
              }}>
                {camStatus === 'ok' ? 'Face detected — camera active' : 'Position your face in the frame'}
              </p>
            </div>

            {/* Step 1 actions */}
            {step === 'camera' && camStatus === 'idle' && (
              <button onClick={checkCamera} className="btn-primary mt-4 w-full justify-center">
                <Camera className="w-4 h-4" /> Allow Camera
              </button>
            )}
            {step === 'camera' && camStatus === 'error' && (
              <button onClick={checkCamera} className="btn-primary mt-4 w-full justify-center">
                Retry
              </button>
            )}
            {step === 'camera' && camStatus === 'ok' && (
              <button onClick={confirmFaceAndContinue} className="btn-primary mt-4 w-full justify-center">
                <CheckCircle className="w-4 h-4" /> Continue to Step 2
              </button>
            )}
          </div>

          {/* Step 2 */}
          <div className="rounded-xl p-6 transition-all" style={{
            background: step === 'fullscreen'
              ? 'hsl(var(--primary)/0.08)' : fsStatus === 'ok'
              ? 'rgba(27,124,62,0.12)' : 'hsl(var(--muted))',
            border: step === 'fullscreen'
              ? '1px solid hsl(var(--primary)/0.45)' : fsStatus === 'ok'
              ? '1px solid rgba(74,222,128,0.40)' : '1px solid hsl(var(--border))',
            pointerEvents: step === 'camera' ? 'none' : 'auto',
          }}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{
                background: fsStatus === 'ok' ? '#1B7C3E' : '#8B5E1A',
              }}>
                {fsStatus === 'ok'
                  ? <CheckCircle className="w-5 h-5 text-white" />
                  : <Maximize className="w-5 h-5 text-white" />}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-base mb-1"
                  style={{ color: step === 'camera' ? 'hsl(var(--foreground-subtle))' : 'hsl(var(--foreground))' }}>
                  Step 2 — Enter Fullscreen
                </div>
                <p className="font-sans text-xs leading-relaxed"
                  style={{ color: step === 'camera' ? 'hsl(var(--foreground-subtle))' : 'hsl(var(--foreground-muted))' }}>
                  The exam runs in fullscreen only. Exiting counts as a violation.
                  You have 3 warnings before auto-cancellation.
                </p>
              </div>
            </div>
            {step === 'fullscreen' && (
              <button onClick={enterFullscreen} className="btn-primary mt-4 w-full justify-center">
                <Maximize className="w-4 h-4" /> Enter Fullscreen
              </button>
            )}
          </div>
        </div>

        {/* Start exam button */}
        {step === 'ready' && (
          <button onClick={startExam} className="btn-primary w-full justify-center py-4 text-base font-bold mb-8">
            <ShieldCheck className="w-5 h-5" /> Begin Exam
          </button>
        )}

        {/* Exam rules */}
        <div className="rounded-xl p-5" style={{
          background: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
        }}>
          <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.15em] mb-3"
            style={{ color: 'hsl(var(--primary))' }}>
            Exam Rules
          </p>
          <ul className="space-y-2">
            {[
              'Stay in fullscreen at all times',
              'Do not switch tabs or applications',
              'Keep your face visible on camera',
              'No copying or sharing of questions',
              '3 violations triggers automatic cancellation',
            ].map(rule => (
              <li key={rule} className="flex items-center gap-2.5 font-sans text-xs"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'hsl(var(--primary))' }} />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
