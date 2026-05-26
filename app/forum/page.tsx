// app/forum/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { MessageSquare, Shield, Cloud, Lock, Code2, ChevronRight } from 'lucide-react';

export const revalidate = 60;

export const metadata = {
  title: 'Discussion Forum — EpochZero Learn',
  description: 'Ask questions, share knowledge, and discuss cybersecurity topics with fellow students. UGC Quadrant IV.',
};

const DOMAINS = [
  {
    slug:    'rema',
    label:   'REMA',
    full:    'Reverse Engineering & Malware Analysis',
    icon:    Shield,
    color:   'text-gold-500 border-gold-500/40 hover:border-gold-500',
    bg:      'bg-gold-500/5',
    topics:  ['Static analysis', 'Dynamic analysis', 'YARA rules', 'Unpacking', 'IOC extraction'],
  },
  {
    slug:    'cloud',
    label:   'Cloud',
    full:    'Cloud Security',
    icon:    Cloud,
    color:   'text-blue-400 border-blue-400/40 hover:border-blue-400',
    bg:      'bg-blue-400/5',
    topics:  ['IaaS/PaaS/SaaS', 'Cloud threats', 'IAM', 'Data protection', 'Cloud forensics'],
  },
  {
    slug:    'crypto',
    label:   'Cryptography',
    full:    'Cryptography & Applied Security',
    icon:    Lock,
    color:   'text-purple-400 border-purple-400/40 hover:border-purple-400',
    bg:      'bg-purple-400/5',
    topics:  ['Symmetric/Asymmetric', 'PKI', 'Hash functions', 'TLS/SSL', 'Cryptanalysis'],
  },
  {
    slug:    'webdev',
    label:   'Web Dev',
    full:    'Full Stack Web Development',
    icon:    Code2,
    color:   'text-green-400 border-green-400/40 hover:border-green-400',
    bg:      'bg-green-400/5',
    topics:  ['React / Next.js', 'Node.js', 'Databases', 'APIs', 'Deployment'],
  },
];

export default async function ForumPage() {
  const supabase = createClient();

  // Get thread counts per domain
  const { data: counts } = await supabase
    .from('forum_threads')
    .select('domain')
    .eq('status', 'published');

  const countMap: Record<string, number> = {};
  for (const row of counts ?? []) {
    countMap[row.domain] = (countMap[row.domain] ?? 0) + 1;
  }

  const total = Object.values(countMap).reduce((s, v) => s + v, 0);

  // Recent threads across all domains
  const { data: recent } = await supabase
    .from('forum_threads')
    .select('id, title, domain, author_name, reply_count, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="min-h-screen">

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="border-b border-navy-700 bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 border-grid opacity-20" aria-hidden />
        <div className="container py-14 relative">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">
            // UGC Quadrant IV — Discussion Forum
          </div>
          <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4">
            Forum
          </h1>
          <p className="font-serif text-lg text-bone-200 max-w-xl leading-relaxed mb-6">
            Ask questions, share knowledge, and discuss with peers across all four domains.
            Anyone can read — sign in to post.
          </p>
          <div className="flex gap-6 font-mono text-sm">
            <div className="border-l-2 border-gold-500 pl-3">
              <span className="text-2xl font-bold text-bone-50">{total}</span>
              <span className="text-bone-400 ml-2 text-xs uppercase tracking-wider">Threads</span>
            </div>
            <div className="border-l-2 border-gold-500 pl-3">
              <span className="text-2xl font-bold text-bone-50">4</span>
              <span className="text-bone-400 ml-2 text-xs uppercase tracking-wider">Domains</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12 grid lg:grid-cols-[1fr_320px] gap-10">

        {/* ── Domain cards ──────────────────────────────────────────── */}
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-6">// Choose a domain</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {DOMAINS.map(({ slug, label, full, icon: Icon, color, bg, topics }) => (
              <Link key={slug} href={`/forum/${slug}`}
                className={`border ${color} ${bg} p-6 group transition-all block`}>
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-7 h-7 ${color.split(' ')[0]}`} />
                  <span className="font-mono text-xs text-bone-400">
                    {countMap[slug] ?? 0} thread{(countMap[slug] ?? 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="font-mono text-xl font-bold text-bone-50 mb-1 group-hover:text-gold-500 transition-colors">
                  {label}
                </div>
                <div className="font-mono text-xs text-bone-400 mb-4">{full}</div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {topics.map(t => (
                    <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 border border-navy-600 text-bone-400">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="font-mono text-xs uppercase tracking-wider text-gold-500 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  Enter forum <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────────── */}
<div className="space-y-6">

  {/* Forum rules — top */}
  <div className="border border-navy-700 bg-navy-950/60 p-5">
    <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Forum rules</div>
    <ul className="space-y-2 font-mono text-[11px] text-bone-300 leading-relaxed">
      {[
        'Be respectful to all members',
        'Stay on-topic within each domain',
        'No piracy, illegal content, or spam',
        'No abusive or hateful language',
        'Share knowledge, help others learn',
        'Posts are reviewed before publishing',
      ].map(r => (
        <li key={r} className="flex items-start gap-2">
          <span className="text-gold-500 mt-0.5">›</span>
          {r}
        </li>
      ))}
    </ul>
  </div>

  {/* Recent activity */}
  <div>
    <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">// Recent activity</div>
    {(!recent || recent.length === 0) ? (
      <div className="border border-dashed border-navy-700 p-8 text-center">
        <MessageSquare className="w-8 h-8 text-gold-500/20 mx-auto mb-3" />
        <p className="font-mono text-sm text-bone-400">No threads yet. Be the first to post.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {recent.map(t => {
          const d = DOMAINS.find(d => d.slug === t.domain);
          return (
            <Link key={t.id} href={`/forum/${t.domain}/${t.id}`}
              className="block border border-navy-700 hover:border-gold-500/40 p-4 transition-colors group">
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border ${d?.color ?? ''}`}>
                  {t.domain}
                </span>
                <span className="font-mono text-[10px] text-bone-400">{t.author_name}</span>
              </div>
              <div className="font-mono text-sm text-bone-100 group-hover:text-gold-500 transition-colors leading-snug line-clamp-2">
                {t.title}
              </div>
              <div className="font-mono text-[10px] text-bone-400 mt-2 flex items-center gap-2">
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
          )}

          {/* Forum rules */}
          <div className="mt-6 border border-navy-700 bg-navy-950/60 p-5">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Forum rules</div>
            <ul className="space-y-2 font-mono text-[11px] text-bone-300 leading-relaxed">
              {[
                'Be respectful to all members',
                'Stay on-topic within each domain',
                'No piracy, illegal content, or spam',
                'No abusive or hateful language',
                'Share knowledge, help others learn',
                'Posts are reviewed before publishing',
              ].map(r => (
                <li key={r} className="flex items-start gap-2">
                  <span className="text-gold-500 mt-0.5">›</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
