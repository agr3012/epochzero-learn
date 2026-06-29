import Link from 'next/link';
import { LogIn } from 'lucide-react';

export function SignInBanner({ next, message }: { next: string; message?: string }) {
  return (
    <div className="rounded-lg p-3 mb-6 flex items-center justify-between gap-4 flex-wrap"
      style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.30)' }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <LogIn className="w-4 h-4 shrink-0" style={{ color: '#E8A020' }} />
        <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
          {message ?? 'This content is open to everyone — sign in to save your progress, earn points, and unlock module exams.'}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Link href={`/dashboard/login?next=${encodeURIComponent(next)}`} className="btn-ghost py-1.5 px-3 text-xs">
          Sign in
        </Link>
        <Link href={`/dashboard/register?next=${encodeURIComponent(next)}`} className="btn-primary py-1.5 px-3 text-xs">
          Create account
        </Link>
      </div>
    </div>
  );
}
