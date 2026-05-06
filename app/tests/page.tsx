import Link from 'next/link';
import { Clock, ListChecks, ShieldAlert } from 'lucide-react';
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
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Assessments
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Take a test. Earn a certificate.
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Each test issues a verifiable PDF certificate on first pass. Unlimited
        retake attempts allowed. The certificate is sent to your email and to
        your dashboard.
      </p>

      {!tests || tests.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            No tests are published yet. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {tests.map((t) => (
            <Link
              key={t.id}
              href={`/tests/${t.slug}`}
              className="card-forensic p-8 group"
            >
              <div className="flex items-start justify-between mb-4">
                {t.malware_family && (
                  <span className="badge-malware">
                    <ShieldAlert className="w-3 h-3" />
                    {t.malware_family}
                  </span>
                )}
                {t.category && <span className="badge-tag">{t.category}</span>}
              </div>

              <h3 className="font-mono text-2xl text-bone-50 mb-3 group-hover:text-gold-500 transition-colors">
                {t.title}
              </h3>
              {t.description && (
                <p className="font-serif text-bone-200 leading-relaxed mb-6 line-clamp-3">
                  {t.description}
                </p>
              )}

              <div className="flex items-center gap-6 font-mono text-xs text-bone-300 pt-4 border-t border-navy-700">
                <span className="inline-flex items-center gap-1.5">
                  <ListChecks className="w-3.5 h-3.5 text-gold-500" />
                  {t.total_questions} questions
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gold-500" />
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
