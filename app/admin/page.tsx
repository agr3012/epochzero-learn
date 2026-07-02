import { createAdminClient } from '@/lib/supabase/admin';
import { Users, BookMarked, Trophy, Activity } from 'lucide-react';

async function getStats() {
  const db = createAdminClient();
  const [
    { count: totalUsers },
    { count: activeBatches },
    { data: points },
    { data: recentActions },
  ] = await Promise.all([
    db.from('student_accounts').select('*', { count: 'exact', head: true }),
    db.from('batches').select('*', { count: 'exact', head: true }).eq('is_active', true),
    db.from('points_ledger').select('points'),
    db.from('admin_actions').select('action, admin_email, created_at').order('created_at', { ascending: false }).limit(10),
  ]);
  const totalPoints = (points ?? []).reduce((s, r) => s + (r.points ?? 0), 0);
  return { totalUsers: totalUsers ?? 0, activeBatches: activeBatches ?? 0, totalPoints, recentActions: recentActions ?? [] };
}

export default async function AdminDashboard() {
  const { totalUsers, activeBatches, totalPoints, recentActions } = await getStats();

  const stats = [
    { label: 'Total Users',    value: totalUsers,   icon: Users,      color: '#6366f1' },
    { label: 'Active Batches', value: activeBatches, icon: BookMarked, color: '#10b981' },
    { label: 'Total Points',   value: totalPoints.toLocaleString(), icon: Trophy, color: '#f59e0b' },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-display font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Dashboard</h1>
      <p className="text-sm mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>Platform overview</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border p-5 flex items-center gap-4"
            style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color + '20' }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-2xl font-bold font-mono" style={{ color: 'hsl(var(--foreground))' }}>{value}</p>
              <p className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border" style={{ background: 'hsl(var(--surface))', borderColor: 'hsl(var(--border))' }}>
        <div className="flex items-center gap-2 px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <Activity className="w-4 h-4" style={{ color: 'hsl(var(--foreground-muted))' }} />
          <h2 className="font-semibold text-sm" style={{ color: 'hsl(var(--foreground))' }}>Recent Activity</h2>
        </div>
        <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
          {recentActions.length === 0 && (
            <p className="px-5 py-6 text-sm text-center" style={{ color: 'hsl(var(--foreground-muted))' }}>No activity yet</p>
          )}
          {recentActions.map((a, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div>
                <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                  {a.action}
                </span>
                <span className="ml-2 text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{a.admin_email}</span>
              </div>
              <span className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                {new Date(a.created_at as string).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
