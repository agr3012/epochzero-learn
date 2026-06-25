// app/forum/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MessageSquare, Shield, Cloud, Lock, Code2, ArrowRight } from 'lucide-react';

export const revalidate = 60;
export const metadata = {
  title: 'Discussion Forum — EpochZero Learn',
  description: 'Ask questions, share knowledge, and discuss cybersecurity topics with fellow learners.',
};

const DOMAINS = [
  { slug: 'rema',   label: 'REMA',          full: 'Reverse Engineering & Malware Analysis', icon: Shield, color: '#8B5E1A',
    topics: ['Static analysis', 'Dynamic analysis', 'YARA rules', 'Unpacking', 'IOC extraction'] },
  { slug: 'cloud',  label: 'Cloud',          full: 'Cloud Security',                         icon: Cloud,  color: '#1B5FA8',
    topics: ['IaaS / PaaS / SaaS', 'Cloud threats', 'IAM', 'Data protection', 'Forensics'] },
  { slug: 'crypto', label: 'Cryptography',   full: 'Cryptography & Applied Security',        icon: Lock,   color: '#6B3AD4',
    topics: ['Symmetric / Asymmetric', 'PKI', 'Hash functions', 'TLS / SSL', 'Cryptanalysis'] },
  { slug: 'webdev', label: 'Web Dev',         full: 'Full Stack Web Development',             icon: Code2,  color: '#1B7C3E',
    topics: ['React / Next.js', 'Node.js', 'Databases', 'APIs', 'Deployment'] },
];

const RULES = [
  'Be respectful to all members',
  'Stay on-topic within each domain',
  'No piracy, illegal content, or spam',
  'No abusive or hateful language',
  'Share knowledge, help others learn',
  'Posts are reviewed before publishing',
];

export default async function ForumPage() {
  const supabase = createClient();

  const { data: counts } = await supabase.from('forum_threads')
    .select('domain').eq('status', 'published');

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) countMap[row.domain] = (countMap[row.domain] ?? 0) + 1;
  const total = Object.values(countMap).reduce((s, v) => s + v, 0);

  const { data: recent } = await supabase.from('forum_threads')
    .select('id, title, domain, author_name, reply_count, created_at')
    .eq('status', 'published').order('created_at', { ascending: false }).limit(6);

  return (
    <div>
      {/* Header */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-12">
          <p className="eyebrow mb-3">Community</p>
          <h1 className="font-display text-4xl font-bold mb-3"
            style={{ color: 'hsl(var(--foreground))' }}>
            Discussion Forum
          </h1>
          <p className="font-serif text-lg max-w-xl leading-relaxed mb-6"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            Ask questions, share knowledge, and discuss with peers across all four domains.
            Anyone can read — sign in with an RRU email to post.
          </p>
          <div className="flex gap-8">
            {[{ v: total, l: 'Threads' }, { v: 4, l: 'Domains' }].map(({ v, l }) => (
              <div key={l} className="pl-4" style={{ borderLeft: '2px solid hsl(var(--primary))' }}>
                <div className="font-display text-2xl font-bold"
                  style={{ color: 'hsl(var(--foreground))' }}>{v}</div>
                <div className="text-xs font-sans font-semibold uppercase tracking-wide"
                  style={{ color: 'hsl(var(--foreground-subtle))' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rules strip */}
      <section style={{ background: 'hsl(var(--muted))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-4">
          <div className="flex flex-wrap gap-x-8 gap-y-1.5">
            {RULES.map((r, i) => (
              <div key={r} className="flex items-center gap-2 text-xs font-sans"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {r}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main */}
      <div className="container py-10 grid lg:grid-cols-[1fr_300px] gap-10 items-start">

        {/* Domain cards */}
        <div>
          <p className="eyebrow mb-5">Choose a domain</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {DOMAINS.map(({ slug, label, full, icon: Icon, color, topics }) => (
              <Link key={slug} href={`/forum/${slug}`}
                className="card card-interactive p-6 group flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: color }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-sans font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
                    {countMap[slug] ?? 0} thread{(countMap[slug] ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold mb-1
                  group-hover:text-[hsl(var(--primary))] transition-colors"
                  style={{ color: 'hsl(var(--foreground))' }}>{label}</h3>
                <p className="text-xs mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>{full}</p>
                <div className="flex flex-wrap gap-1 mb-5">
                  {topics.map(t => (
                    <span key={t} className="badge badge-tag text-[10px]">{t}</span>
                  ))}
                </div>
                <div className="mt-auto flex items-center gap-1 text-xs font-semibold
                  group-hover:gap-2 transition-all" style={{ color }}>
                  Enter forum <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent threads sidebar */}
        <div className="lg:sticky lg:top-24">
          <p className="eyebrow mb-4">Recent activity</p>
          {(!recent || recent.length === 0) ? (
            <div className="card p-8 text-center">
              <MessageSquare className="w-8 h-8 mx-auto mb-3"
                style={{ color: 'hsl(var(--foreground-subtle))' }} />
              <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>No threads yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map(t => {
                const d = DOMAINS.find(d => d.slug === t.domain);
                return (
                  <Link key={t.id} href={`/forum/${t.domain}/${t.id}`}
                    className="card card-interactive block p-4 group">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: `${d?.color ?? '#1B5FA8'}18`,
                          color: d?.color ?? '#1B5FA8',
                          border: `1px solid ${d?.color ?? '#1B5FA8'}40`,
                        }}>
                        {t.domain}
                      </span>
                      <span className="text-[10px] truncate" style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        {t.author_name}
                      </span>
                    </div>
                    <div className="font-sans text-sm font-medium leading-snug line-clamp-2
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {t.title}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] mt-2"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      <MessageSquare className="w-3 h-3" />
                      {t.reply_count} {t.reply_count === 1 ? 'reply' : 'replies'}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
