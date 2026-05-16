// app/dashboard/page.tsx — SERVER COMPONENT
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAccount } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { Award, BookOpen, Shield, LogOut, ChevronRight } from 'lucide-react';

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  if (!account) redirect('/dashboard/login');

  const admin = createAdminClient();

  const [certsRes, attemptsRes, clubsRes] = await Promise.all([
    admin
      .from('certificates')
      .select('id, cert_uid, test_title, score, domain, club_name, issued_at, pdf_url')
      .eq('email', account.email)
      .order('issued_at', { ascending: false }),
    admin
      .from('attempts')
      .select('id, score, passed, created_at, tests(title)')
      .eq('email', account.email)
      .order('created_at', { ascending: false })
      .limit(5),
    admin
      .from('club_registrations')
      .select('id, status, created_at, clubs(name, logo_url)')
      .eq('email', account.email)
      .order('created_at', { ascending: false }),
  ]);

  const certs    = certsRes.data    ?? [];
  const attempts = attemptsRes.data ?? [];
  const clubs    = clubsRes.data    ?? [];

  const passedCount = attempts.filter((a: any) => a.passed).length;

  return (
    <div className="container py-12 lg:py-16 max-w-5xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
            // Student Dashboard
          </div>
          <h1 className="font-mono text-3xl font-bold text-bone-50">
            Welcome back
          </h1>
          <p className="font-mono text-sm text-bone-400 mt-1">{account.email}</p>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button type="submit"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 hover:text-gold-500 border border-navy-700 hover:border-gold-500/40 px-4 py-2 transition-colors">
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </form>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <div className="card-forensic p-6">
          <Award className="w-6 h-6 text-gold-500 mb-3" />
          <div className="font-mono text-3xl font-bold text-bone-50 mb-1">{certs.length}</div>
          <div className="font-mono text-xs uppercase tracking-wider text-bone-400">Certificates</div>
        </div>
        <div className="card-forensic p-6">
          <BookOpen className="w-6 h-6 text-gold-500 mb-3" />
          <div className="font-mono text-3xl font-bold text-bone-50 mb-1">{passedCount}</div>
          <div className="font-mono text-xs uppercase tracking-wider text-bone-400">Tests passed</div>
        </div>
        <div className="card-forensic p-6">
          <Shield className="w-6 h-6 text-gold-500 mb-3" />
          <div className="font-mono text-3xl font-bold text-bone-50 mb-1">{clubs.length}</div>
          <div className="font-mono text-xs uppercase tracking-wider text-bone-400">Club applications</div>
        </div>
      </div>

      {/* Certificates preview */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-lg font-bold text-bone-50">Recent certificates</h2>
          {certs.length > 3 && (
            <Link href="/dashboard/certificates"
              className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors inline-flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {certs.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-8 text-center">
            <p className="font-mono text-sm text-bone-400">No certificates yet. Pass a test to earn one.</p>
            <Link href="/tests" className="font-mono text-xs text-gold-500 hover:text-gold-400 mt-3 inline-block transition-colors">
              Browse tests →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {certs.slice(0, 3).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4 border border-navy-700 hover:border-gold-500/40 transition-colors">
                <div>
                  <div className="font-mono text-sm text-bone-50 mb-1">{c.test_title}</div>
                  <div className="font-mono text-xs text-bone-400">
                    {c.cert_uid} · {c.score}%
                    {c.club_name && <span className="text-gold-500 ml-2">· {c.club_name}</span>}
                  </div>
                </div>
                <a href={c.pdf_url} target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 border border-gold-500/40 hover:border-gold-500 px-3 py-1.5 transition-colors">
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Club memberships */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-lg font-bold text-bone-50">Club applications</h2>
        </div>
        {clubs.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-8 text-center">
            <p className="font-mono text-sm text-bone-400">No club applications yet.</p>
            <Link href="/clubs" className="font-mono text-xs text-gold-500 hover:text-gold-400 mt-3 inline-block transition-colors">
              Explore clubs →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clubs.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-4 border border-navy-700">
                <div className="font-mono text-sm text-bone-50">{c.clubs?.name}</div>
                <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                  c.status === 'approved'
                    ? 'border-green-500/60 text-green-400 bg-green-500/5'
                    : c.status === 'rejected'
                    ? 'border-red-500/60 text-red-400 bg-red-500/5'
                    : 'border-gold-500/40 text-gold-500 bg-gold-500/5'
                }`}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
