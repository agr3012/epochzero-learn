// app/tests/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Clock, ListChecks, ShieldAlert, Award } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TestPageClient } from '@/components/exam/TestPageClient';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: test } = await supabase
    .from('tests')
    .select('title, description')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!test) return { title: 'Test Not Found' };
  return { title: test.title, description: test.description };
}

export default async function TestDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: test } = await supabase
    .from('tests')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!test) notFound();

  return (
    <div className="container py-12 lg:py-16 max-w-4xl">

      {/* ── Test info header ── */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          {test.malware_family && (
            <span className="badge-malware">
              <ShieldAlert className="w-3 h-3" />
              {test.malware_family}
            </span>
          )}
          {test.category && <span className="badge-tag">{test.category}</span>}
        </div>
        <h1 className="font-mono text-3xl lg:text-4xl font-bold text-bone-50 mb-4 leading-tight">
          {test.title}
        </h1>
        {test.description && (
          <p className="font-serif text-lg text-bone-200 leading-relaxed">
            {test.description}
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-navy-700 p-4">
            <div className="flex items-center gap-2 text-gold-500 mb-2">
              <ListChecks className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Questions</span>
            </div>
            <div className="font-mono text-2xl text-bone-50">{test.total_questions}</div>
          </div>
          <div className="border border-navy-700 p-4">
            <div className="flex items-center gap-2 text-gold-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Duration</span>
            </div>
            <div className="font-mono text-2xl text-bone-50">{test.duration_minutes} min</div>
          </div>
          <div className="border border-navy-700 p-4">
            <div className="flex items-center gap-2 text-gold-500 mb-2">
              <Award className="w-4 h-4" />
              <span className="font-mono text-xs uppercase tracking-wider">Pass Mark</span>
            </div>
            <div className="font-mono text-2xl text-bone-50">{test.passing_score}%</div>
          </div>
          <div className="border border-navy-700 p-4">
            <div className="flex items-center gap-2 text-gold-500 mb-2">
              <span className="font-mono text-xs uppercase tracking-wider">Attempts</span>
            </div>
            <div className="font-mono text-sm text-bone-50 leading-tight">
              Unlimited<br />
              <span className="text-bone-300 text-xs">Cert on first pass</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Proctored exam flow ── */}
      <TestPageClient testId={test.id} testTitle={test.title} />
    </div>
  );
}
