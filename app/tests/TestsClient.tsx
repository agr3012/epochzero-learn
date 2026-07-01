'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, ListChecks, Award } from 'lucide-react';

type Test = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  malware_family: string | null;
  category: string | null;
  total_questions: number;
  duration_minutes: number;
  passing_score: number;
};

const DOMAIN_META: Record<string, { label: string; color: string; bg: string }> = {
  'cloud-security': { label: 'Cloud Security', color: '#1B5FA8', bg: 'rgba(27,95,168,0.12)' },
  rema:             { label: 'REMA',           color: '#8B5E1A', bg: 'rgba(139,94,26,0.12)' },
};

function getDomain(t: Test): 'cloud-security' | 'rema' {
  return t.malware_family === 'cloud-security' ? 'cloud-security' : 'rema';
}

// Returns the "type" badge text for a test, or null if no type badge should show.
// Excludes 'rema' because that value is a domain tag, not a type.
function getType(t: Test): string | null {
  if (t.malware_family === 'analyst-practice') return 'Analyst Practice';
  if (!t.category || t.category === 'rema') return null;
  return t.category;
}

const FILTER_BTN_BASE =
  'px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer';

const FILTER_CHIP_BASE =
  'px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer';

export function TestsClient({ tests }: { tests: Test[] }) {
  const [domain, setDomain] = useState<string>('all');
  const [type, setType]     = useState<string>('all');

  const typeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const t of tests) {
      const ty = getType(t);
      if (ty) set.add(ty);
    }
    return Array.from(set).sort();
  }, [tests]);

  const filtered = useMemo(() => {
    return tests.filter(t => {
      if (domain !== 'all' && getDomain(t) !== domain) return false;
      if (type   !== 'all' && getType(t)   !== type)   return false;
      return true;
    });
  }, [tests, domain, type]);

  function domainStyle(d: string): React.CSSProperties {
    const isActive = domain === d;
    if (!isActive) return { background: 'transparent', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' };
    if (d === 'all') return { background: 'hsl(var(--foreground))', color: 'hsl(var(--background))', borderColor: 'hsl(var(--foreground))' };
    const m = DOMAIN_META[d];
    return { background: m.bg, color: m.color, borderColor: m.color };
  }

  function typeStyle(ty: string): React.CSSProperties {
    const isActive = type === ty;
    if (!isActive) return { background: 'transparent', color: 'hsl(var(--foreground-muted))', borderColor: 'hsl(var(--border))' };
    return { background: 'hsl(var(--primary))', color: '#fff', borderColor: 'hsl(var(--primary))' };
  }

  return (
    <div className="container py-16 lg:py-24">

      {/* ── Header ── */}
      <div className="mb-10">
        <p className="eyebrow mb-3">Assessments</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold
          text-[hsl(var(--foreground))] mb-4 leading-tight">
          Take a test. Earn a certificate.
        </h1>
        <p className="font-serif text-lg text-[hsl(var(--foreground-muted))]
          max-w-2xl leading-relaxed">
          Each test issues a verifiable PDF certificate on first pass.
          Unlimited retakes. Certificate sent to your email and dashboard.
        </p>
      </div>

      {/* ── Domain filter ── */}
      <div className="flex flex-wrap gap-2 mb-3">
        {['all', 'rema', 'cloud-security'].map(d => (
          <button key={d} onClick={() => setDomain(d)}
            className={FILTER_BTN_BASE} style={domainStyle(d)}>
            {d === 'all' ? 'All Courses' : DOMAIN_META[d].label}
          </button>
        ))}
      </div>

      {/* ── Type filter ── */}
      {typeOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          {['all', ...typeOptions].map(ty => (
            <button key={ty} onClick={() => setType(ty)}
              className={FILTER_CHIP_BASE} style={typeStyle(ty)}>
              {ty === 'all' ? 'All Types' : ty}
            </button>
          ))}
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center" style={{ marginTop: typeOptions.length === 0 ? '2.5rem' : 0 }}>
          <Award className="w-10 h-10 text-[hsl(var(--foreground-subtle))] mx-auto mb-4" />
          <p className="text-sm text-[hsl(var(--foreground-muted))]">
            No tests match the selected filters.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4" style={{ marginTop: typeOptions.length === 0 ? '2.5rem' : 0 }}>
          {filtered.map(t => {
            const d    = getDomain(t);
            const meta = DOMAIN_META[d];
            const ty   = getType(t);
            return (
              <Link key={t.id} href={`/tests/${t.slug}`}
                className="card card-interactive p-7 group">

                {/* ── Badges ── */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                  {ty && (
                    <span className="badge badge-tag">{ty}</span>
                  )}
                </div>

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
            );
          })}
        </div>
      )}
    </div>
  );
}
