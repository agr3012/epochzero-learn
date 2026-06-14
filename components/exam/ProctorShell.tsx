// components/exam/ProctorShell.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProctor, type ViolationType } from '@/hooks/useProctor';
import { useWebcam } from '@/hooks/useWebcam';
import { ViolationModal } from './ViolationModal';

interface Props {
  children:  React.ReactNode;
  attemptId: string | null; // set once TestEngine creates the attempt
  testId:    string;
}

interface PendingViolation {
  type:      ViolationType;
  snapshot?: string;
}

export function ProctorShell({ children, attemptId, testId }: Props) {
  const router = useRouter();

  // ── Violation state ────────────────────────────────────────────────────
  const [violationCount,   setViolationCount]   = useState(0);
  const [pendingViolation, setPendingViolation] = useState<PendingViolation | null>(null);
  const [cancelled,        setCancelled]        = useState(false);

  // Debounce: ignore additional violations while modal is showing
  const modalVisible = pendingViolation !== null;
  const lastViolationTime = useRef(0);

  // ── Handle violation ───────────────────────────────────────────────────
  const handleViolation = useCallback(async (
    type: ViolationType,
    snapshot?: string
  ) => {
    // Debounce — max one violation per 3s
    const now = Date.now();
    if (now - lastViolationTime.current < 3000) return;
    lastViolationTime.current = now;

    // Determine new count optimistically
    const newCount = violationCount + 1;
    setViolationCount(newCount);
    setPendingViolation({ type, snapshot });

    // Log to backend if we have an attempt_id
    if (attemptId) {
      try {
        await fetch('/api/exam/violation', {
          method:  'POST',
          headers: { 'content-type': 'application/json' },
          body:    JSON.stringify({
            attempt_id:      attemptId,
            type,
            detail:          `Violation ${newCount}/3`,
            snapshot_base64: snapshot ?? undefined,
          }),
        });
      } catch { /* best-effort */ }
    }

    if (newCount >= 3) setCancelled(true);
  }, [violationCount, attemptId]);

  // ── Webcam ─────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const { startCamera, loadModel } = useWebcam({
    enabled:     !cancelled,
    videoRef,
    attemptId,
    onViolation: handleViolation,
  });

  // Start camera + model when shell mounts
  useEffect(() => {
    startCamera();
    loadModel();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard/FS/tab proctor ────────────────────────────────────────────
  const { requestFullscreen } = useProctor({
    enabled:     !cancelled && !modalVisible,
    onViolation: handleViolation,
  });

  // ── Dismiss modal ──────────────────────────────────────────────────────
  function dismissModal() {
    if (cancelled) {
      router.push('/tests');
    } else {
      setPendingViolation(null);
    }
  }

  return (
    <>
      {/* Hidden webcam video (monitoring only, not shown to student) */}
      <video
        ref={videoRef}
        autoPlay playsInline muted
        className="fixed bottom-4 right-4 w-32 h-24 object-cover z-50
          border border-gold-500/30 opacity-50 hover:opacity-100 transition-opacity"
        title="Webcam monitoring active"
      />

      {/* Exam content */}
      <div className={cancelled ? 'pointer-events-none opacity-30' : ''}>
        {children}
      </div>

      {/* Violation modal */}
      {pendingViolation && (
        <ViolationModal
          violation={pendingViolation.type}
          count={violationCount}
          onDismiss={dismissModal}
          onEnterFullscreen={requestFullscreen}
        />
      )}
    </>
  );
}
