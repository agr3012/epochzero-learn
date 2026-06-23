import Link from 'next/link';
import { Clock, ListChecks, ShieldAlert, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;
export const metadata = { title: 'MCQ Tests' };

export default async function TestsPage() {
  const supabase = createClient();
  const { data: tests } = await supabase
    .from('tests')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return (
    <div className="container py-16 lg:py-24">

      {/* ── Header ── */}
      <div className="mb-12">
        <p className="eyebrow mb-3">Assessments</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold
          text-[hsl(var(--foreground))] mb-4 leading-tight">
          Take a test. Earn a certificate.
        </h1>
        <p className="font-serif text-lg text-[hsl(var(--foreground-muted))]
          max-w-2xl leading-relaxed">
          Each test issues a verifiable PDF certificate on first pass. Unlimited
          retake attempts allowed. The certificate is sent to your email and to
          your dashboard.
        </p>
      </div>

      {/* ── Empty state ── */}
      {!tests || tests.length === 0 ? (
        <div className="card p-12 text-center">
          <Award className="w-10 h-10 text-[hsl(var(--foreground-subtle))] mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            No tests are published yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {tests.map((t) => (
            <Link
              key={t.id}
              href={`/tests/${t.slug}`}
              className="card card-interactive p-7 group"
            >
              {/* ── Badges ── */}
              {(t.malware_family || t.category) && (
                <div className="flex items-center gap-2 mb-5">
                  {t.malware_family && (
                    <span className="badge-malware">
                      <ShieldAlert className="w-3 h-3" />
                      {t.malware_family}
                    </span>
                  )}
                  {t.category && (
                    <span className="badge badge-tag">{t.category}</span>
                  )}
                </div>
              )}

              {/* ── Title ── */}
              <h3 className="font-display text-xl font-semibold
                text-[hsl(var(--foreground))] mb-3
                group-hover:text-[hsl(var(--primary))] transition-colors
                leading-snug">
                {t.title}
              </h3>

              {/* ── Description ── */}
              {t.description && (
                <p className="font-serif text-sm text-[hsl(var(--foreground-muted))]
                  leading-relaxed mb-6 line-clamp-3">
                  {t.description}
                </p>
              )}

              {/* ── Metadata row ── */}
              <div className="flex items-center gap-6 text-xs
                text-[hsl(var(--foreground-subtle))]
                pt-4 border-t border-[hsl(var(--border))]">
                <span className="inline-flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                  {t.total_questions} questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                  {t.duration_minutes} min
                </span>
                <span>Pass: {t.passing_score}%</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
