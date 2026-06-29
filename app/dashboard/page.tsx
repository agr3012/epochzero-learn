// app/dashboard/page.tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getCurrentAccount, checkIsAdmin } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEnrolledCourses, getCourseProgressSummary } from '@/lib/progress';
import { getCertificateChainStatus } from '@/lib/certificates';
import { getLeaderboard, getMyRank, maskEmail } from '@/lib/points';
import {
  Award, BookOpen, Shield, ChevronRight,
  CheckCircle, XCircle, Clock, Download,
  MessageSquare, ExternalLink, Users, GraduationCap, Settings, Lock, Trophy,
} from 'lucide-react';
import { ProfileNameForm } from './ProfileNameForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { EnrollCodeForm } from './EnrollCodeForm';
import { VerifyEmailGate } from './VerifyEmailBanner';
import { SignOutButton }   from './SignOutButton';
import { ProgressDonut } from '@/components/dashboard/ProgressDonut';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const account = await getCurrentAccount();
  if (!account) redirect('/dashboard/login');

  const isAdmin = await checkIsAdmin(account.email);
  const admin = createAdminClient();

  const enrolledCourses = await getEnrolledCourses(account.id);
  const courseProgress = await Promise.all(
    enrolledCourses.map((c) => getCourseProgressSummary(account.id, c.courseId))
  );
  const certificateChains = await Promise.all(
    enrolledCourses.map((c) => getCertificateChainStatus(account.email, c.courseId))
  );

  const [leaderboardTop5, myRank] = await Promise.all([
    getLeaderboard(5),
    getMyRank(account.id),
  ]);

  const [certsRes, attemptsRes, clubsRes, accountRes, forumRes] = await Promise.all([
    admin.from('certificates').select('id, cert_uid, test_title, score, domain, club_name, issued_at, pdf_url')
      .eq('email', account.email).order('issued_at', { ascending: false }),
    admin.from('attempts').select('id, score, passed, created_at, tests(title, slug)')
      .eq('email', account.email).order('created_at', { ascending: false }),
    admin.from('club_registrations').select('id, status, created_at, clubs(name, logo_url)')
      .eq('email', account.email).order('created_at', { ascending: false }),
    admin.from('student_accounts').select('display_name').eq('id', account.id).single(),
    admin.from('forum_threads').select('*', { count: 'exact', head: true })
      .eq('author_email', account.email).eq('status', 'published'),
  ]);

  const certs        = certsRes.data    ?? [];
  const attempts     = attemptsRes.data ?? [];
  const clubs        = clubsRes.data    ?? [];
  const displayName  = accountRes.data?.display_name ?? null;
  const forumCount   = forumRes.count ?? 0;
  const passedCount  = attempts.filter((a: any) => a.passed).length;
  const totalAttempts = attempts.length;

  const initials = displayName
    ? displayName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : account.email.charAt(0).toUpperCase();

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Stat cards — each with a unique accent color on bottom border
  const stats = [
    { icon: Award,        label: 'Certificates Earned',  value: certs.length,    sub: 'with PDF download',     color: '#E8A020' },
    { icon: BookOpen,     label: 'Tests Passed',         value: `${passedCount}/${totalAttempts}`, sub: 'of total attempts', color: '#22c55e' },
    { icon: MessageSquare,label: 'Forum Posts',          value: forumCount,      sub: 'published threads',     color: '#1B5FA8' },
    { icon: Users,        label: 'Club Applications',   value: clubs.length,    sub: 'submitted',             color: '#6B3AD4' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'hsl(var(--background))' }}>
      <div className="container py-10 lg:py-14 max-w-5xl">

        {!account.email_verified && <VerifyEmailGate email={account.email} />}


        {/* Profile header card */}
        <div className="rounded-2xl overflow-hidden mb-8" style={{
          backgroundColor: '#101825',
          backgroundImage: 'linear-gradient(135deg, rgba(139,94,26,0.55) 0%, rgba(27,95,168,0.30) 55%, rgba(8,14,28,0.92) 100%)',
          border: '1px solid rgba(232,160,32,0.25)',
        }}>
          <div className="p-7 flex items-center justify-between flex-wrap gap-5">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-xl font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #8B5E1A 0%, #1B5FA8 100%)' }}>
                {initials}
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white mb-0.5">
                  {displayName ?? <span style={{ color: 'rgba(207,215,226,0.55)', fontStyle: 'italic', fontSize: '0.95rem' }}>Name not set</span>}
                </div>
                <div className="text-sm mb-2" style={{ color: 'rgba(207,215,226,0.65)' }}>{account.email}</div>
                <span className="font-sans text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(232,160,32,0.18)', color: '#E8A020', border: '1px solid rgba(232,160,32,0.35)' }}>
                  Student
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <>
                  <Link href="/dashboard/admin/batches" className="btn-ghost py-1.5 px-3 text-xs">
                    <Settings className="w-3.5 h-3.5" /> Manage batches
                  </Link>
                  <Link href="/dashboard/admin/certificates" className="btn-ghost py-1.5 px-3 text-xs">
                    <Award className="w-3.5 h-3.5" /> Issue certificates
                  </Link>
                </>
              )}
              <SignOutButton />
            </div>
          </div>
        </div>

        {/* 4 stat cards with colored bottom accents */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="card p-5 relative overflow-hidden flex flex-col"
              style={{ borderBottom: `3px solid ${color}` }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] font-sans font-semibold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--foreground-subtle))' }}>
                  {label}
                </div>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="font-display text-3xl font-bold mt-auto" style={{ color: 'hsl(var(--foreground))' }}>
                {value}
              </div>
              <div className="text-xs mt-1" style={{ color: 'hsl(var(--foreground-subtle))' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Profile */}
        <div className="card p-6 rounded-xl mb-8 space-y-5">
          <p className="eyebrow">Profile</p>
          <ProfileNameForm accountId={account.id} currentName={displayName} email={account.email} />
          <div className="pt-1" style={{ borderTop: '1px solid hsl(var(--border))' }} />
          <ChangePasswordForm />
          <div className="pt-1" style={{ borderTop: '1px solid hsl(var(--border))' }} />
          <EnrollCodeForm />
        </div>

        {/* My Courses — progress per enrolled course */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              My Courses
            </h2>
            <span className="text-sm" style={{ color: 'hsl(var(--foreground-subtle))' }}>
              {enrolledCourses.length} enrolled
            </span>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="card p-10 text-center rounded-xl">
              <GraduationCap className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
              <p className="text-sm mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>Not enrolled in any course yet.</p>
              <p className="text-xs mb-4" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                Open a course and click "Enroll" to add it here — or use the "Add code" button above if your instructor gave you a batch code.
              </p>
              <Link href="/learn" className="btn-primary inline-flex">Browse courses</Link>
            </div>
          ) : (
            <div className="space-y-5">
              {enrolledCourses.map((c, i) => {
                const progress = courseProgress[i];
                return (
                  <div key={c.courseId} className="card p-6 rounded-xl">
                    <div className="flex items-start gap-6 flex-wrap">
                      <ProgressDonut percent={progress.overallPercent} label="Overall" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
                          <h3 className="font-display text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                            {c.courseTitle}
                          </h3>
                          <Link href={`/learn/${c.courseSlug}`}
                            className="text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                            style={{ color: 'hsl(var(--primary))' }}>
                            Continue <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        {c.batchLabel && (
                          <p className="text-xs mb-4" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                            Batch: {c.batchLabel}
                          </p>
                        )}
                        {progress.units.length > 0 && (
                          <div className="flex flex-wrap gap-4">
                            {progress.units.map((u) => (
                              <div key={u.unitId} className="flex flex-col items-center gap-1.5">
                                <ProgressDonut percent={u.percent} size={56} strokeWidth={5} color="#1B5FA8" />
                                <span className="text-[10px] text-center max-w-[80px] leading-tight"
                                  style={{ color: 'hsl(var(--foreground-subtle))' }}>
                                  {u.unitTitle}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Certificate Chain — 6 modules + practical + oral -> overall */}
        {enrolledCourses.length > 0 && (
          <section className="mb-8 space-y-5">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Certificate Chain
            </h2>
            {enrolledCourses.map((c, i) => {
              const chain = certificateChains[i];
              const totalSlots = chain.modules.length + 2;
              const earnedSlots = chain.modules.filter((m) => m.earned).length
                + (chain.practical.earned ? 1 : 0) + (chain.oral.earned ? 1 : 0);
              const slots = [...chain.modules, chain.practical, chain.oral];
              return (
                <div key={c.courseId} className="card p-6 rounded-xl">
                  <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                    <h3 className="font-display text-base font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {chain.courseTitle}
                    </h3>
                    <span className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      {earnedSlots}/{totalSlots} earned
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    {slots.map((s) => (
                      <div key={s.key} className="flex flex-col items-center gap-2 p-3 rounded-lg text-center"
                        style={{ background: s.earned ? 'rgba(232,160,32,0.08)' : 'hsl(var(--muted))', border: `1px solid ${s.earned ? 'rgba(232,160,32,0.30)' : 'hsl(var(--border))'}` }}>
                        {s.earned
                          ? <Award className="w-5 h-5" style={{ color: '#E8A020' }} />
                          : <Lock className="w-5 h-5" style={{ color: 'hsl(var(--foreground-subtle))' }} />}
                        <span className="text-[11px] leading-tight" style={{ color: s.earned ? 'hsl(var(--foreground))' : 'hsl(var(--foreground-subtle))' }}>
                          {s.label}
                        </span>
                        {s.earned && s.pdfUrl && (
                          <a href={s.pdfUrl} target="_blank" rel="noopener noreferrer"
                            className="text-[10px] font-medium hover:underline" style={{ color: 'hsl(var(--primary))' }}>
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg p-4 flex items-center gap-4"
                    style={{
                      background: chain.overall.earned ? 'rgba(107,58,212,0.10)' : 'hsl(var(--muted))',
                      border: `1px solid ${chain.overall.earned ? 'rgba(107,58,212,0.35)' : 'hsl(var(--border))'}`,
                    }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: chain.overall.earned ? '#6B3AD4' : 'hsl(var(--border))' }}>
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                        Overall {chain.courseTitle} Certification
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        {chain.overall.earned
                          ? `Issued — ${chain.overall.certUid}`
                          : `Unlocks once all ${totalSlots} certificates above are earned`}
                      </div>
                    </div>
                    {chain.overall.earned && chain.overall.pdfUrl && (
                      <a href={chain.overall.pdfUrl} target="_blank" rel="noopener noreferrer"
                        className="btn-primary py-1.5 px-3 text-xs shrink-0">
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Leaderboard */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Leaderboard
            </h2>
            <Link href="/leaderboard"
              className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
              style={{ color: 'hsl(var(--primary))' }}>
              Full leaderboard <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card p-6 rounded-xl">
            <div className="flex items-center gap-5 mb-5 pb-5 flex-wrap" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E8A020' }}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                {myRank ? (
                  <>
                    <p className="font-display text-lg font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      Rank #{myRank.rank} · {myRank.total_points} pts
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      Video {myRank.video_points} · Article {myRank.article_points} · Exam {myRank.exam_points} · Forum {myRank.forum_points}
                    </p>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
                    No points yet — watch a video or read an article to get on the board.
                  </p>
                )}
              </div>
            </div>
            {leaderboardTop5.length > 0 && (
              <div className="space-y-2">
                {leaderboardTop5.map((r) => (
                  <div key={r.account_id} className="flex items-center gap-3 text-sm">
                    <span className="w-5 font-display font-bold shrink-0" style={{ color: r.rank <= 3 ? '#E8A020' : 'hsl(var(--foreground-subtle))' }}>
                      {r.rank}
                    </span>
                    <span className="flex-1 min-w-0 truncate" style={{ color: r.account_id === account.id ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}>
                      {r.display_name?.trim() || maskEmail(r.email)}
                    </span>
                    <span className="font-semibold shrink-0" style={{ color: 'hsl(var(--foreground-subtle))' }}>{r.total_points} pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Certificates */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Certificates
            </h2>
            <span className="text-sm" style={{ color: 'hsl(var(--foreground-subtle))' }}>
              {certs.length} earned
            </span>
          </div>

          {certs.length === 0 ? (
            <div className="card p-10 text-center rounded-xl">
              <Award className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
              <p className="text-sm mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>No certificates yet.</p>
              <p className="text-xs mb-4" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                Pass a test using <span style={{ color: 'hsl(var(--primary))' }}>{account.email}</span> to earn one.
              </p>
              <Link href="/tests" className="btn-primary inline-flex">Browse tests</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {certs.map((c: any) => (
                <div key={c.id} className="card p-5 rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: '#8B5E1A' }}>
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm font-semibold mb-1 truncate"
                      style={{ color: 'hsl(var(--foreground))' }}>{c.test_title}</div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>{c.cert_uid}</span>
                      <span>Score: {c.score}%</span>
                      {c.club_name && <span style={{ color: 'hsl(var(--primary))' }}>{c.club_name}</span>}
                      <span>{fmtDate(c.issued_at)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/verify/${c.cert_uid}`}
                      className="btn-ghost py-1.5 px-3 text-xs">
                      <ExternalLink className="w-3.5 h-3.5" /> Verify
                    </Link>
                    <a href={c.pdf_url} target="_blank" rel="noopener noreferrer"
                      className="btn-primary py-1.5 px-3 text-xs">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Test history */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Test history
            </h2>
            <span className="text-sm" style={{ color: 'hsl(var(--foreground-subtle))' }}>
              {totalAttempts} attempt{totalAttempts !== 1 ? 's' : ''}
            </span>
          </div>

          {attempts.length === 0 ? (
            <div className="card p-10 text-center rounded-xl">
              <BookOpen className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
              <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>No tests attempted yet.</p>
              <Link href="/tests" className="btn-primary inline-flex">Browse tests</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {attempts.map((a: any) => (
                <div key={a.id} className="card p-4 rounded-xl flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: a.passed ? 'rgba(27,124,62,0.15)' : 'rgba(199,62,58,0.12)' }}>
                    {a.passed
                      ? <CheckCircle className="w-4.5 h-4.5" style={{ color: '#22c55e' }} />
                      : <XCircle    className="w-4.5 h-4.5" style={{ color: '#ef4444' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-sans text-sm font-medium truncate"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {(a.tests as any)?.title ?? 'Unknown test'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs mt-0.5"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      <Clock className="w-3 h-3" /> {fmtDate(a.created_at)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-lg font-bold" style={{ color: a.passed ? '#22c55e' : '#ef4444' }}>
                      {a.score}%
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: a.passed ? '#22c55e' : '#ef4444' }}>
                      {a.passed ? 'Passed' : 'Failed'}
                    </div>
                  </div>
                  {!a.passed && (a.tests as any)?.slug && (
                    <Link href={`/tests/${(a.tests as any).slug}`} className="btn-ghost py-1.5 px-3 text-xs shrink-0">
                      Retry
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Club applications */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Club applications
            </h2>
            <Link href="/clubs"
              className="inline-flex items-center gap-1 text-sm font-medium hover:gap-2 transition-all"
              style={{ color: 'hsl(var(--primary))' }}>
              Explore clubs <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {clubs.length === 0 ? (
            <div className="card p-10 text-center rounded-xl">
              <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: 'hsl(var(--foreground-subtle))' }} />
              <p className="text-sm mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>No club applications yet.</p>
              <Link href="/clubs" className="btn-primary inline-flex">Explore clubs</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {clubs.map((c: any) => (
                <div key={c.id} className="card p-5 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-sans text-sm font-semibold mb-0.5"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {c.clubs?.name ?? 'Unknown club'}
                    </div>
                    <div className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      Applied {fmtDate(c.created_at)}
                    </div>
                  </div>
                  <span className="font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      background: c.status === 'approved' ? 'rgba(27,124,62,0.12)' : c.status === 'rejected' ? 'rgba(199,62,58,0.10)' : 'rgba(232,160,32,0.10)',
                      color:      c.status === 'approved' ? '#22c55e' : c.status === 'rejected' ? '#ef4444' : '#E8A020',
                      border: `1px solid ${c.status === 'approved' ? 'rgba(27,124,62,0.30)' : c.status === 'rejected' ? 'rgba(199,62,58,0.25)' : 'rgba(232,160,32,0.30)'}`,
                    }}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
