// hooks/useWebcam.ts
'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { ViolationType } from './useProctor';

// TinyFaceDetector model served from public/models/
// Download from: https://github.com/vladmandic/face-api/tree/master/model
// Files needed in /public/models/:
//   tiny_face_detector_model-weights_manifest.json
//   tiny_face_detector_model-shard1
const MODEL_URL = '/models';

const NO_FACE_GRACE_MS  = 10_000; // 10s before flagging no face
const DETECT_INTERVAL   =  3_000; // check every 3s

interface Options {
  enabled:     boolean;
  videoRef:    React.RefObject<HTMLVideoElement>;
  attemptId:   string | null;
  onViolation: (type: ViolationType, snapshot?: string) => void;
}

export function useWebcam({ enabled, videoRef, attemptId, onViolation }: Options) {
  const [camReady,      setCamReady]      = useState(false);
  const [modelLoaded,   setModelLoaded]   = useState(false);
  const [permissionErr, setPermissionErr] = useState<string | null>(null);

  const streamRef       = useRef<MediaStream | null>(null);
  const detectionTimer  = useRef<ReturnType<typeof setInterval> | null>(null);
  const noFaceStart     = useRef<number | null>(null);
  const faceapiRef      = useRef<any>(null);

  // ── Snapshot helper ────────────────────────────────────────────────────
  const captureSnapshot = useCallback((): string | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    // Downscale for storage efficiency
    canvas.width  = Math.min(video.videoWidth,  640);
    canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Remove the data:image/jpeg;base64, prefix
    return canvas.toDataURL('image/jpeg', 0.6).split(',')[1] ?? null;
  }, [videoRef]);

  // ── Start camera ───────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
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
      setCamReady(true);
      setPermissionErr(null);
    } catch (err: any) {
      setPermissionErr(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Allow camera access to start the exam.'
          : 'Camera not found. Connect a webcam to continue.'
      );
    }
  }, [videoRef]);

  // ── Load face model ────────────────────────────────────────────────────
  const loadModel = useCallback(async () => {
    try {
      const faceapi = await import('@vladmandic/face-api');
      faceapiRef.current = faceapi;
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setModelLoaded(true);
    } catch (err) {
      console.error('[useWebcam] model load failed:', err);
      // Fail silently — face detection won't run but camera still records
      setModelLoaded(false);
    }
  }, []);

  // ── Face detection loop ────────────────────────────────────────────────
  const startDetection = useCallback(() => {
    const faceapi = faceapiRef.current;
    if (!faceapi || !videoRef.current) return;

    detectionTimer.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
        );

        if (detections.length === 0) {
          // Start no-face timer
          if (!noFaceStart.current) noFaceStart.current = Date.now();
          else if (Date.now() - noFaceStart.current > NO_FACE_GRACE_MS) {
            noFaceStart.current = null; // reset after flagging
            const snap = captureSnapshot();
            onViolation('no_face', snap ?? undefined);
          }
        } else {
          noFaceStart.current = null; // face back — reset timer

          if (detections.length >= 2) {
            const snap = captureSnapshot();
            onViolation('multiple_faces', snap ?? undefined);
          }
        }
      } catch { /* detection frame error — ignore */ }
    }, DETECT_INTERVAL);
  }, [videoRef, captureSnapshot, onViolation]);

  // ── Stop everything ────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (detectionTimer.current) {
      clearInterval(detectionTimer.current);
      detectionTimer.current = null;
    }
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    noFaceStart.current = null;
  }, []);

  // ── Watch for camera disconnect ────────────────────────────────────────
  // 'ended' event doesn't always fire when user disables camera via OS/browser
  // controls mid-session, so poll readyState + enabled + muted as backup.
  useEffect(() => {
    if (!camReady || !streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    let firedLost = false;
    const flagLost = () => {
      if (firedLost) return;
      firedLost = true;
      onViolation('webcam_lost');
    };

    const onEnded = () => flagLost();
    track.addEventListener('ended', onEnded);
    track.addEventListener('mute',  () => flagLost());

    // Poll every 2s as a backup for browsers that don't emit events reliably
    const poll = setInterval(() => {
      if (
        track.readyState === 'ended' ||
        !track.enabled ||
        track.muted
      ) {
        flagLost();
      }
    }, 2000);

    return () => {
      track.removeEventListener('ended', onEnded);
      clearInterval(poll);
    };
  }, [camReady, onViolation]);

  // ── Start detection when both camera + model ready ─────────────────────
  useEffect(() => {
    if (enabled && camReady && modelLoaded) startDetection();
    return () => {
      if (detectionTimer.current) clearInterval(detectionTimer.current);
    };
  }, [enabled, camReady, modelLoaded, startDetection]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => () => stopCamera(), [stopCamera]);

  return {
    camReady,
    modelLoaded,
    permissionErr,
    startCamera,
    loadModel,
    stopCamera,
    captureSnapshot,
  };
}
