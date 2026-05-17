// app/dashboard/page.tsx — SERVER COMPONENT
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAccount } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { Award, BookOpen, Shield, ChevronRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { ProfileNameForm } from './ProfileNameForm';
import { SignOutButton } from './SignOutButton';

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  if (!account) redirect('/dashboard/login');

  const admin = createAdminClient();

  const [certsRes, attemptsRes, clubsRes, accountRes] = await Promise.all([
    admin
      .from('certificates')
      .select('id, cert_uid, test_title, score, domain, club_name, issued_at, pdf_url')
      .eq('email', account.email)
      .order('issued_at', { ascending: false }),
    admin
      .from('attempts')
      .select('id, score, passed, created_at, tests(title, slug)')
      .eq('email', account.email)
      .order('created_at', { ascending: false }),
    admin
      .from('club_registrations')
      .select('id, status, created_at, clubs(name, logo_url)')
      .eq('email', account.email)
      .order('created_at', { ascending: false }),
    admin
      .from('student_accounts')
      .select('display_name')
      .eq('id', account.id)
      .single(),
  ]);

  const certs    = certsRes.data    ?? [];
  const attempts = attemptsRes.data ?? [];
  const clubs    = clubsRes.data    ?? [];
  const displayName = accountRes.data?.display_name ?? null;

  const passedCount  = attempts.filter((a: any) => a.passed).length;
  const totalAttempts = attempts.length;

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  }

  return (
    <div className="container py-12 lg:py-16 max-w-5xl">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
            // Student Dashboard
          </div>
          <h1 className="font-mono text-3xl font-bold text-bone-50">
            Welcome back{displayName ? `, ${displayName.split(' ')[0]}` : ''}
          </h1>
          <p className="font-mono text-sm text-bone-400 mt-1">{account.email}</p>
        </div>
        <SignOutButton />
      </div>

      {/* ── Profile name ────────────────────────────────────────────── */}
      <div className="mb-10 p-6 border border-navy-700 bg-navy-900/40">
        <div className="font-mono text-xs uppercase tracking-wider text-gold-500 mb-4">
          // Profile
        </div>
        <ProfileNameForm
          accountId={account.id}
          currentName={displayName}
          email={account.email}
        />
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="card-forensic p-6">
          <Award className="w-6 h-6 text-gold-500 mb-3" />
          <div className="font-mono text-3xl font-bold text-bone-50 mb-1">{certs.length}</div>
          <div className="font-mono text-xs uppercase tracking-wider text-bone-400">Certificates earned</div>
        </div>
        <div className="card-forensic p-6">
          <BookOpen className="w-6 h-6 text-gold-500 mb-3" />
          <div className="font-mono text-3xl font-bold text-bone-50 mb-1">
            {passedCount}
            <span className="text-base text-bone-400 font-normal"> / {totalAttempts}</span>
          </div>
          <div className="font-mono text-xs uppercase tracking-wider text-bone-400">Tests passed</div>
        </div>
        <div className="card-forensic p-6">
          <Shield className="w-6 h-6 text-gold-500 mb-3" />
          <div className="font-mono text-3xl font-bold text-bone-50 mb-1">{clubs.length}</div>
          <div className="font-mono text-xs uppercase tracking-wider text-bone-400">Club applications</div>
        </div>
      </div>

      {/* ── Certificates ────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-lg font-bold text-bone-50">Certificates</h2>
        </div>
        {certs.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-8 text-center">
            <Award className="w-8 h-8 text-gold-500/30 mx-auto mb-3" />
            <p className="font-mono text-sm text-bone-400 mb-2">No certificates yet.</p>
            <p className="font-serif text-xs text-bone-500 mb-4">
              Pass a test using <span className="text-gold-500 font-mono">{account.email}</span> to earn one.
            </p>
            <Link href="/tests" className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">
              Browse tests →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {certs.map((c: any) => (
              <div key={c.id}
                className="flex items-center justify-between p-4 border border-navy-700 hover:border-gold-500/40 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-bone-50 mb-1 truncate">{c.test_title}</div>
                  <div className="font-mono text-xs text-bone-400 flex flex-wrap gap-2">
                    <span className="text-gold-500">{c.cert_uid}</span>
                    <span>·</span>
                    <span>{c.score}%</span>
                    {c.club_name && <><span>·</span><span className="text-gold-500">{c.club_name}</span></>}
                    <span>·</span>
                    <span>{fmtDate(c.issued_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  <Link
                    href={`/verify/${c.cert_uid}`}
                    className="font-mono text-xs uppercase tracking-wider text-bone-400 hover:text-gold-500 transition-colors"
                  >
                    Verify
                  </Link>
                  <a href={c.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 border border-gold-500/40 hover:border-gold-500 px-3 py-1.5 transition-colors">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Test history ────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-lg font-bold text-bone-50">Test history</h2>
          <span className="font-mono text-xs text-bone-400">
            {totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''}
          </span>
        </div>
        {attempts.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-8 text-center">
            <p className="font-mono text-sm text-bone-400 mb-3">No tests attempted yet.</p>
            <Link href="/tests" className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">
              Browse tests →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {attempts.map((a: any) => (
              <div key={a.id}
                className="flex items-center gap-4 p-4 border border-navy-700 hover:border-navy-600 transition-colors">
                {/* Pass/fail icon */}
                <div className="shrink-0">
                  {a.passed
                    ? <CheckCircle className="w-5 h-5 text-green-400" />
                    : <XCircle className="w-5 h-5 text-red-400" />
                  }
                </div>
                {/* Test name */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-bone-100 truncate">
                    {(a.tests as any)?.title ?? 'Unknown test'}
                  </div>
                  <div className="font-mono text-xs text-bone-400 mt-0.5 inline-flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {fmtDate(a.created_at)}
                  </div>
                </div>
                {/* Score */}
                <div className="shrink-0 text-right">
                  <div className={`font-mono text-lg font-bold ${a.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {a.score}%
                  </div>
                  <div className={`font-mono text-[10px] uppercase tracking-wider ${a.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {a.passed ? 'Passed' : 'Failed'}
                  </div>
                </div>
                {/* Retry link if failed */}
                {!a.passed && (a.tests as any)?.slug && (
                  <Link
                    href={`/tests/${(a.tests as any).slug}`}
                    className="shrink-0 font-mono text-xs uppercase tracking-wider text-bone-400 hover:text-gold-500 border border-navy-700 hover:border-gold-500/40 px-3 py-1.5 transition-colors">
                    Retry
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Club applications ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-lg font-bold text-bone-50">Club applications</h2>
          <Link href="/clubs"
            className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors inline-flex items-center gap-1">
            Explore clubs <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {clubs.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-8 text-center">
            <Shield className="w-8 h-8 text-gold-500/30 mx-auto mb-3" />
            <p className="font-mono text-sm text-bone-400 mb-3">No club applications yet.</p>
            <Link href="/clubs" className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">
              Explore clubs →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {clubs.map((c: any) => (
              <div key={c.id}
                className="flex items-center justify-between p-4 border border-navy-700">
                <div>
                  <div className="font-mono text-sm text-bone-50 mb-1">
                    {c.clubs?.name ?? 'Unknown club'}
                  </div>
                  <div className="font-mono text-xs text-bone-400">{fmtDate(c.created_at)}</div>
                </div>
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
