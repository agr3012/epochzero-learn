// app/tests/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Clock, ListChecks, ShieldAlert, Award, ChevronLeft, RotateCcw, BadgeCheck, LogIn, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getCurrentAccount } from '@/lib/auth';
import { getExamLockStatus } from '@/lib/progress';
import { TestPageClient } from '@/components/exam/TestPageClient';
import { VerifyEmailGate } from '@/app/dashboard/VerifyEmailBanner';

export const dynamic = 'force-dynamic';
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: test } = await supabase.from('tests').select('title, description')
    .eq('slug', params.slug).eq('is_published', true).single();
  if (!test) return { title: 'Test Not Found' };
  return { title: test.title, description: test.description };
}

const DOMAIN_COLOR: Record<string, string> = {
  'REMA': '#8B5E1A', 'Cloud Security': '#1B5FA8',
  'Cryptography': '#6B3AD4', 'Web Dev': '#1B7C3E', 'Knowledge Check': '#8B5E1A',
};

export default async function TestDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: test } = await supabase.from('tests').select('*')
    .eq('slug', params.slug).eq('is_published', true).single();
  if (!test) notFound();

  const account = await getCurrentAccount();
  const lockStatus = account ? await getExamLockStatus(account.id, test.id) : { locked: false as const };
  const accentColor = DOMAIN_COLOR[test.category ?? ''] || '#8B5E1A';

  return (
    <div className="container py-10 lg:py-14">

      {/* Back link */}
      <Link href="/tests"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-7 transition-colors
          hover:text-[hsl(var(--foreground))]"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" /> All tests
      </Link>

      {/* Hero card -- always dark, gradient over dark base */}
      <div className="rounded-2xl overflow-hidden mb-8" style={{
        backgroundColor: '#101825',
        backgroundImage: `linear-gradient(135deg, ${accentColor}99 0%, rgba(27,95,168,0.35) 55%, rgba(10,16,34,0.92) 100%)`,
        border: `1px solid ${accentColor}50`,
      }}>
        <div className="p-8 lg:p-12">

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {test.malware_family && (
              <span className="badge-malware">
                <ShieldAlert className="w-3 h-3" />{test.malware_family}
              </span>
            )}
            {test.category && (
              <span className="font-sans text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: `${accentColor}28`, color: 'rgba(255,255,255,0.9)', border: `1px solid ${accentColor}55` }}>
                {test.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-3xl lg:text-4xl font-bold leading-tight mb-4 text-white">
            {test.title}
          </h1>

          {/* Description */}
          {test.description && (
            <p className="font-serif text-lg leading-relaxed mb-10 max-w-3xl"
              style={{ color: 'rgba(207,215,226,0.82)' }}>
              {test.description}
            </p>
          )}

          {/* Stats grid -- full width, 4 columns */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ListChecks, label: 'Questions', value: String(test.total_questions) },
              { icon: Clock,      label: 'Duration',  value: `${test.duration_minutes} min` },
              { icon: Award,      label: 'Pass mark', value: `${test.passing_score}%` },
              { icon: RotateCcw,  label: 'Attempts',  value: 'Unlimited' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl p-5"
                style={{ background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: 'rgba(232,160,32,0.85)' }} />
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: 'rgba(207,215,226,0.55)' }}>
                    {label}
                  </span>
                </div>
                <div className="font-display text-2xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate note */}
        <div className="px-8 lg:px-12 py-4 flex items-center gap-3"
          style={{ background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: '#4ADE80' }} />
          <p className="font-sans text-sm" style={{ color: 'rgba(207,215,226,0.65)' }}>
            Pass on your first attempt and receive a verifiable PDF certificate by email.
            Unlimited retakes allowed after that.
          </p>
        </div>
      </div>

      {/* Proctored exam flow -- full width */}
      {account && !account.email_verified ? (
        <VerifyEmailGate email={account.email} fullScreen={false} />
      ) : account && lockStatus.locked ? (
        <div className="card-forensic p-8 lg:p-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 mb-3">
            <Lock className="w-5 h-5" style={{ color: '#E8A020' }} />
            <h2 className="font-mono text-xl uppercase tracking-wider text-gold-500">
              Exam locked
            </h2>
          </div>
          <p className="font-serif text-bone-200 mb-2">{lockStatus.reason}</p>
          <p className="font-serif text-sm" style={{ color: 'rgba(207,215,226,0.65)' }}>
            Unit: <span style={{ color: '#E8A020' }}>{lockStatus.unitTitle}</span>
          </p>
        </div>
      ) : account ? (
        <TestPageClient testId={test.id} testTitle={test.title} studentEmail={account.email} />
      ) : (
        <div className="card-forensic p-8 lg:p-10 max-w-2xl">
          <h2 className="font-mono text-xl uppercase tracking-wider text-gold-500 mb-2">
            Sign in to begin
          </h2>
          <p className="font-serif text-bone-200 mb-8">
            An account is required to attempt this test — your certificate and attempt
            history are tied to it.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/dashboard/login?next=${encodeURIComponent(`/tests/${params.slug}`)}`} className="btn-primary">
              <LogIn className="w-4 h-4" /> Sign in
            </Link>
            <Link href={`/dashboard/register?next=${encodeURIComponent(`/tests/${params.slug}`)}`} className="btn-ghost">
              Create an account
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
