'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Plus, X, Clock, Trophy } from 'lucide-react';

type User = {
  id: string; email: string; display_name: string | null;
  role: string; is_active: boolean; email_verified: boolean;
  last_login_at: string | null; created_at: string;
};

type Enrollment = {
  batch_id: string; enrolled_at: string;
  batches: { id: string; enrollment_code: string; batch_label: string; semester: string; year: number; courses: { title: string; slug: string } | null } | null;
};

type Batch = {
  id: string; enrollment_code: string; batch_label: string; semester: string; year: number;
  courses: { title: string; slug: string } | null;
};

type VideoRow = {
  watched_seconds: number; completed: boolean;
  videos: { title: string; courses: { title: string } | null } | null;
};

type PointRow = { points: number; reason: string; created_at: string };

export function UserDetailClient({ user: init, enrollments: initEnroll, allBatches, videoProgress, pointsLedger }: {
  user: User; enrollments: Enrollment[]; allBatches: Batch[]; videoProgress: VideoRow[]; pointsLedger: PointRow[];
}) {
  const [user, setUser]           = useState(init);
  const [enrollments, setEnroll]  = useState(initEnroll);
  const [name, setName]           = useState(init.display_name ?? '');
  const [role, setRole]           = useState(init.role);
  const [active, setActive]       = useState(init.is_active);
  const [newPw, setNewPw]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [saveErr, setSaveErr]     = useState('');
  const [addBatch, setAddBatch]   = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignErr, setAssignErr] = useState('');

  const totalSec  = videoProgress.reduce((s, r) => s + (r.watched_seconds ?? 0), 0);
  const totalPts  = pointsLedger.reduce((s, r) => s + (r.points ?? 0), 0);
  const completed = videoProgress.filter(r => r.completed).length;

  // Group video progress by course
  const byCourse: Record<string, { title: string; total: number; done: number; secs: number }> = {};
  for (const row of videoProgress) {
    const ct = row.videos?.courses?.title ?? 'Unknown';
    if (!byCourse[ct]) byCourse[ct] = { title: ct, total: 0, done: 0, secs: 0 };
    byCourse[ct].total += 1;
    if (row.completed) byCourse[ct].done += 1;
    byCourse[ct].secs += row.watched_seconds ?? 0;
  }

  async function saveUser() {
    setSaving(true); setSaveMsg(''); setSaveErr('');
    const body: Record<string, unknown> = { display_name: name, role, is_active: active };
    if (newPw) body.password = newPw;
    const res  = await fetch(`/api/admin/users/${user.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setSaveErr(data.error ?? 'Failed'); return; }
    setUser(data.user); setSaveMsg('Saved!'); setNewPw('');
  }

  async function assignBatch() {
    if (!addBatch) return;
    setAssigning(true); setAssignErr('');
    const res = await fetch(`/api/admin/users/${user.id}/batches`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ batch_id: addBatch }) });
    const data = await res.json();
    setAssigning(false);
    if (!res.ok) { setAssignErr(data.error ?? 'Failed'); return; }
    const batch = allBatches.find(b => b.id === addBatch);
    if (batch) setEnroll(prev => [...prev, { batch_id: batch.id, enrolled_at: new Date().toISOString(), batches: batch }]);
    setAddBatch('');
  }

  async function removeBatch(batchId: string) {
    const res = await fetch(`/api/admin/users/${user.id}/batches?batch_id=${batchId}`, { method: 'DELETE' });
    if (res.ok) setEnroll(prev => prev.filter(e => e.batch_id !== batchId));
  }

  const inp = 'w-full px-3 py-2 rounded-lg border text-sm outline-none';
  const inpStyle = { background: 'hsl(var(--surface-elevated))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' };
  const card = 'rounded-xl border p-5 mb-5';
  const cardStyle = { background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' };

  const notEnrolled = allBatches.filter(b => !enrollments.some(e => e.batch_id === b.id));
  const fmtSec = (s: number) => {
    const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div>
      <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm mb-6"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold" style={{ color: 'hsl(var(--foreground))' }}>{user.display_name ?? user.email}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--foreground-muted))' }}>{user.email} · Joined {new Date(user.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center px-4 py-2 rounded-xl border" style={cardStyle}>
            <div className="flex items-center gap-1.5 justify-center mb-0.5"><Trophy className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} /><span className="font-bold font-mono text-lg" style={{ color: 'hsl(var(--foreground))' }}>{totalPts}</span></div>
            <p className="text-[10px]" style={{ color: 'hsl(var(--foreground-muted))' }}>Points</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl border" style={cardStyle}>
            <div className="flex items-center gap-1.5 justify-center mb-0.5"><Clock className="w-3.5 h-3.5" style={{ color: '#6366f1' }} /><span className="font-bold font-mono text-lg" style={{ color: 'hsl(var(--foreground))' }}>{fmtSec(totalSec)}</span></div>
            <p className="text-[10px]" style={{ color: 'hsl(var(--foreground-muted))' }}>Watch time</p>
          </div>
          <div className="text-center px-4 py-2 rounded-xl border" style={cardStyle}>
            <span className="font-bold font-mono text-lg block" style={{ color: 'hsl(var(--foreground))' }}>{completed}</span>
            <p className="text-[10px]" style={{ color: 'hsl(var(--foreground-muted))' }}>Videos done</p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className={card} style={cardStyle}>
        <p className="font-semibold text-sm mb-4" style={{ color: 'hsl(var(--foreground))' }}>Account Settings</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>Display Name</label>
            <input className={inp} style={inpStyle} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>Role</label>
            <select className={inp} style={inpStyle} value={role} onChange={e => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>New Password (leave blank to keep)</label>
            <input type="password" className={inp} style={inpStyle} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>Status</label>
            <select className={inp} style={inpStyle} value={active ? 'active' : 'inactive'} onChange={e => setActive(e.target.value === 'active')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        {saveErr && <p className="text-xs mb-2" style={{ color: '#ef4444' }}>{saveErr}</p>}
        {saveMsg && <p className="text-xs mb-2" style={{ color: '#10b981' }}>{saveMsg}</p>}
        <button onClick={saveUser} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: 'hsl(var(--primary))' }}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      {/* Batch enrollment */}
      <div className={card} style={cardStyle}>
        <p className="font-semibold text-sm mb-4" style={{ color: 'hsl(var(--foreground))' }}>Batch Enrollment</p>
        <div className="space-y-2 mb-4">
          {enrollments.length === 0 && <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>Not enrolled in any batch</p>}
          {enrollments.map(e => (
            <div key={e.batch_id} className="flex items-center justify-between px-3 py-2 rounded-lg border"
              style={{ borderColor: 'hsl(var(--border))' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{e.batches?.batch_label}</p>
                <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                  {e.batches?.courses?.title} · {e.batches?.enrollment_code} · {e.batches?.semester} {e.batches?.year}
                </p>
              </div>
              <button onClick={() => removeBatch(e.batch_id)} className="p-1 rounded hover:bg-red-500/10">
                <X className="w-4 h-4" style={{ color: '#ef4444' }} />
              </button>
            </div>
          ))}
        </div>
        {notEnrolled.length > 0 && (
          <div className="flex gap-2">
            <select className={inp} style={inpStyle} value={addBatch} onChange={e => setAddBatch(e.target.value)}>
              <option value="">Select batch…</option>
              {notEnrolled.map(b => (
                <option key={b.id} value={b.id}>{b.batch_label} — {b.courses?.title} ({b.enrollment_code})</option>
              ))}
            </select>
            <button onClick={assignBatch} disabled={assigning || !addBatch}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white shrink-0 disabled:opacity-60"
              style={{ background: 'hsl(var(--primary))' }}>
              <Plus className="w-4 h-4" /> {assigning ? '…' : 'Add'}
            </button>
          </div>
        )}
        {assignErr && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{assignErr}</p>}
      </div>

      {/* Course progress */}
      {Object.keys(byCourse).length > 0 && (
        <div className={card} style={cardStyle}>
          <p className="font-semibold text-sm mb-4" style={{ color: 'hsl(var(--foreground))' }}>Progress by Course</p>
          <div className="space-y-3">
            {Object.values(byCourse).map(c => (
              <div key={c.title}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{c.title}</span>
                  <span className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {c.done}/{c.total} videos · {fmtSec(c.secs)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--border))' }}>
                  <div className="h-full rounded-full" style={{ width: `${c.total > 0 ? (c.done / c.total) * 100 : 0}%`, background: 'hsl(var(--primary))' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
