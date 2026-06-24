// app/tests/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Clock, ListChecks, ShieldAlert, Award,
  ChevronLeft, RotateCcw, BadgeCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { TestPageClient } from '@/components/exam/TestPageClient';

export const revalidate = 60;
interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: test } = await supabase
    .from('tests').select('title, description')
    .eq('slug', params.slug).eq('is_published', true).single();
  if (!test) return { title: 'Test Not Found' };
  return { title: test.title, description: test.description };
}

// Domain colour based on category
const DOMAIN_COLOR: Record<string, string> = {
  'REMA':           '#8B5E1A',
  'Cloud Security': '#1B5FA8',
  'Cryptography':   '#6B3AD4',
  'Web Dev':        '#1B7C3E',
  'Knowledge Check':'#6B3AD4',
};

export default async function TestDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: test } = await supabase
    .from('tests').select('*')
    .eq('slug', params.slug).eq('is_published', true).single();
  if (!test) notFound();

  const accentColor = DOMAIN_COLOR[test.category ?? ''] ?? '#6B3AD4';

  return (
    <div className="container py-10 lg:py-14 max-w-3xl">

      {/* -- Back -- */}
      <Link href="/tests"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-7 transition-colors
          hover:text-[hsl(var(--foreground))]"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" /> All tests
      </Link>

      {/* -- Hero card  -  gradient matches domain colour -- */}
      <div className="rounded-2xl overflow-hidden mb-8"
        style={{
          background: `linear-gradient(135deg, ${accentColor}cc 0%, ${accentColor}55 50%, hsl(222 47% 8%) 100%)`,
          border: `1px solid ${accentColor}55`,
        }}>
        <div className="p-8 lg:p-10">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {test.malware_family && (
              <span className="badge-malware">
                <ShieldAlert className="w-3 h-3" />{test.malware_family}
              </span>
            )}
            {test.category && (
              <span className="font-sans text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: `${accentColor}30`, color: 'rgba(255,255,255,0.85)', border: `1px solid ${accentColor}60` }}>
                {test.category}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-display text-2xl lg:text-3xl font-bold leading-tight mb-4 text-white">
            {test.title}
          </h1>

          {/* Description */}
          {test.description && (
            <p className="font-serif text-base leading-relaxed mb-8"
              style={{ color: 'rgba(207,215,226,0.85)' }}>
              {test.description}
            </p>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ListChecks, label: 'Questions',  value: String(test.total_questions) },
              { icon: Clock,      label: 'Duration',   value: `${test.duration_minutes} min` },
              { icon: Award,      label: 'Pass mark',  value: `${test.passing_score}%` },
              { icon: RotateCcw,  label: 'Attempts',   value: 'Unlimited' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl p-4"
                style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: 'rgba(232,160,32,0.9)' }} />
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-wide"
                    style={{ color: 'rgba(207,215,226,0.6)' }}>
                    {label}
                  </span>
                </div>
                <div className="font-display text-xl font-bold text-white">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate note */}
        <div className="px-8 lg:px-10 py-4 flex items-center gap-3"
          style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: '#4ADE80' }} />
          <p className="font-sans text-xs" style={{ color: 'rgba(207,215,226,0.7)' }}>
            Pass on your first attempt and receive a verifiable PDF certificate by email.
            Unlimited retakes allowed after that.
          </p>
        </div>
      </div>

      {/* -- Proctored exam flow -- */}
      <TestPageClient testId={test.id} testTitle={test.title} />
    </div>
  );
}
