// components/exam/ViolationModal.tsx
'use client';

import { AlertTriangle, X } from 'lucide-react';
import type { ViolationType } from '@/hooks/useProctor';

const MESSAGES: Record<ViolationType, { title: string; desc: string }> = {
  fullscreen_exit: {
    title: 'Fullscreen Exited',
    desc:  'You left fullscreen mode. Return immediately.',
  },
  tab_switch: {
    title: 'Tab Switch Detected',
    desc:  'You switched tabs or windows during the exam.',
  },
  copy_attempt: {
    title: 'Copy Attempt Blocked',
    desc:  'Copying exam content is not permitted.',
  },
  no_face: {
    title: 'No Face Detected',
    desc:  'Your face is not visible on the webcam. Stay in frame.',
  },
  multiple_faces: {
    title: 'Multiple Faces Detected',
    desc:  'Only one person is permitted during the exam.',
  },
  webcam_lost: {
    title: 'Webcam Disconnected',
    desc:  'Your camera feed was lost. Reconnect immediately.',
  },
};

interface Props {
  violation:       ViolationType;
  count:           number;          // 1, 2, or 3
  onDismiss:       () => void;
  onEnterFullscreen: () => void;
}

export function ViolationModal({
  violation, count, onDismiss, onEnterFullscreen,
}: Props) {
  const msg       = MESSAGES[violation];
  const isFinal   = count >= 3;
  const remaining = 3 - count;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center
      bg-navy-950/90 backdrop-blur-sm">
      <div className="bg-navy-900 border border-crimson-500/60
        w-full max-w-md mx-4 shadow-2xl">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5
          border-b border-navy-800">
          <div className={`w-10 h-10 flex items-center justify-center shrink-0
            ${isFinal ? 'bg-crimson-500/20 border border-crimson-500/50' : 'bg-gold-500/10 border border-gold-500/40'}`}>
            <AlertTriangle className={`w-5 h-5 ${isFinal ? 'text-crimson-400' : 'text-gold-500'}`} />
          </div>
          <div>
            <div className={`font-mono text-[10px] uppercase tracking-widest mb-0.5
              ${isFinal ? 'text-crimson-400' : 'text-gold-500'}`}>
              {isFinal ? '⚠ Exam Cancelled' : `Warning ${count} of 3`}
            </div>
            <h2 className="font-mono text-base font-bold text-bone-50">
              {msg.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="font-mono text-sm text-bone-200 leading-relaxed">
            {msg.desc}
          </p>

          {isFinal ? (
            <div className="border border-crimson-500/30 bg-crimson-500/5 p-4">
              <p className="font-mono text-sm text-crimson-300 leading-relaxed">
                You have received 3 violations. This exam attempt has been
                automatically cancelled and recorded. Contact your instructor
                if you believe this was an error.
              </p>
            </div>
          ) : (
            <div className="border border-gold-500/20 bg-gold-500/5 p-4">
              <p className="font-mono text-xs text-bone-300 leading-relaxed">
                <span className="text-gold-500 font-semibold">
                  {remaining} warning{remaining !== 1 ? 's' : ''} remaining.
                </span>{' '}
                A third violation will automatically cancel this exam.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          {isFinal ? (
            <button
              onClick={onDismiss}
              className="flex-1 py-3 font-mono text-sm uppercase tracking-wider
                bg-navy-800 text-bone-200 border border-navy-700
                hover:border-navy-600 transition-colors">
              Back to Tests
            </button>
          ) : (
            <>
              {violation === 'fullscreen_exit' && (
                <button
                  onClick={() => { onEnterFullscreen(); onDismiss(); }}
                  className="flex-1 py-3 font-mono text-sm uppercase tracking-wider
                    bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors font-semibold">
                  Re-enter Fullscreen
                </button>
              )}
              {violation !== 'fullscreen_exit' && (
                <button
                  onClick={onDismiss}
                  className="flex-1 py-3 font-mono text-sm uppercase tracking-wider
                    bg-gold-500 text-navy-950 hover:bg-gold-400 transition-colors font-semibold">
                  I Understand — Continue
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
