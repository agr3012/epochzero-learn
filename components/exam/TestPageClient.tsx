// components/exam/TestPageClient.tsx
'use client';

import { useState } from 'react';
import { ProctorGate } from './ProctorGate';
import { ProctorShell } from './ProctorShell';
import { TestEngine } from '@/components/test-engine';

type Phase = 'gate' | 'exam';

interface Props {
  testId:    string;
  testTitle: string;
}

export function TestPageClient({ testId, testTitle }: Props) {
  const [phase,     setPhase]     = useState<Phase>('gate');
  const [attemptId, setAttemptId] = useState<string | null>(null);

  if (phase === 'gate') {
    return (
      <ProctorGate onReady={() => setPhase('exam')} />
    );
  }

  return (
    <ProctorShell attemptId={attemptId} testId={testId}>
      <TestEngine
        testId={testId}
        testTitle={testTitle}
        onAttemptCreated={(id: string) => setAttemptId(id)}
      />
    </ProctorShell>
  );
}
