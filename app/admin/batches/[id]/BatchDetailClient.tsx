'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trophy, Clock, Circle, Users } from 'lucide-react';

type Batch = {
  id: string; enrollment_code: string; batch_label: string;
  semester: string; year: number; is_active: boolean; created_at: string;
  courses: { id: string; title: string; slug: string } | null;
};

type Member = {
  id: string; email: string; display_name: string | null; last_login_at: string | null;
  enrolled_at: string; total_points: number; watched_seconds: number; videos_completed: number;
};

export function BatchDetailClient({ batch: init, members }: { batch: Batch; members: Member[] }) {
  const [batch, setBatch]   = useState(init);
  const [toggling, setTog]  = useState(false);

  async function toggleActive() {
    setTog(true);
    const res = await fetch(`/api/admin/batches/${batch.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !batch.is_active }) });
    if (res.ok) setBatch(b => ({ ...b, is_active: !b.is_active }));
    setTog(false);
  }

  const fmtSec = (s: number) => { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); return h > 0 ? `${h}h ${m}m` : `${m}m`; };

  const totalSec = members.reduce((s, m) => s + m.watched_seconds, 0);
  const totalPts = members.reduce((s, m) => s + m.total_points, 0);

  return (
    <div>
      <Link href="/admin/batches" className="inline-flex items-center gap-1.5 text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Batches
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: 'hsl(var(--foreground))' }}>{batch.batch_label}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--foreground-muted))' }}>
            {batch.courses?.title ?? '—'} · {batch.semester} {batch.year}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            {batch.enrollment_code}
          </span>
          <button onClick={toggleActive} disabled={toggling}
            className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all disabled:opacity-60"
            style={{ borderColor: batch.is_active ? '#ef4444' : '#10b981', color: batch.is_active ? '#ef4444' : '#10b981' }}>
            {toggling ? '…' : batch.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Users,  color: '#6366f1', val: members.length, label: 'Members'       },
          { icon: Trophy, color: '#f59e0b', val: totalPts,        label: 'Total Points'  },
          { icon: Clock,  color: '#10b981', val: fmtSec(totalSec), label: 'Total Watch Time' },
        ].map(({ icon: Icon, color, val, label }) => (
          <div key={label} className="rounded-xl border p-4 flex items-center gap-3"
            style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + '20' }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold font-mono" style={{ color: 'hsl(var(--foreground))' }}>{val}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
        <div className="grid text-xs font-semibold px-5 py-3 border-b"
          style={{ gridTemplateColumns: '1fr 120px 120px 100px 140px', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' }}>
          <span>Student</span><span>Points</span><span>Watch time</span><span>Videos</span><span>Last login</span>
        </div>
        {members.length === 0 && (
          <p className="px-5 py-6 text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>No members yet — share the enrollment code</p>
        )}
        {members.map(m => (
          <Link key={m.id} href={`/admin/users/${m.id}`}
            className="grid items-center px-5 py-3 border-b transition-colors hover:bg-white/5"
            style={{ gridTemplateColumns: '1fr 120px 120px 100px 140px', borderColor: 'hsl(var(--border))' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{m.display_name ?? '—'}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{m.email}</p>
            </div>
            <span className="text-sm font-mono font-medium" style={{ color: '#f59e0b' }}>{m.total_points}</span>
            <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{fmtSec(m.watched_seconds)}</span>
            <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{m.videos_completed}</span>
            <span className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
              {m.last_login_at ? new Date(m.last_login_at).toLocaleDateString() : 'Never'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
