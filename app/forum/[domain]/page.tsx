// app/forum/[domain]/page.tsx
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Pin, Lock, MessageSquare, ChevronRight } from 'lucide-react';
import { ForumComposeButton } from '@/components/forum/ForumComposeButton';

export const revalidate = 60;

const DOMAIN_META: Record<string, { label: string; full: string; color: string }> = {
  rema:   { label: 'REMA',          full: 'Reverse Engineering & Malware Analysis', color: 'text-gold-500'   },
  cloud:  { label: 'Cloud',         full: 'Cloud Security',                         color: 'text-blue-400'   },
  crypto: { label: 'Cryptography',  full: 'Cryptography',                           color: 'text-purple-400' },
  webdev: { label: 'Web Dev',       full: 'Full Stack Web Development',              color: 'text-green-400'  },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export async function generateMetadata({ params }: { params: { domain: string } }) {
  const meta = DOMAIN_META[params.domain];
  if (!meta) return {};
  return {
    title: `${meta.label} Forum — EpochZero Learn`,
    description: `Discussion forum for ${meta.full}. Ask questions, share knowledge, and collaborate.`,
  };
}

export default async function ForumDomainPage({
  params,
}: {
  params: { domain: string };
}) {
  const meta = DOMAIN_META[params.domain];
  if (!meta) notFound();

  const supabase = createClient();

  const { data: threads, error } = await supabase
    .from('forum_threads')
    .select('id, title, body, author_name, is_pinned, is_locked, reply_count, view_count, created_at')
    .eq('domain', params.domain)
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at',  { ascending: false })
    .limit(50);

  const list = threads ?? [];

  return (
    <div className="min-h-screen">

      {/* Header */}
      <section className="border-b border-navy-700 bg-navy-950">
        <div className="container py-10">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 mb-4">
            <Link href="/forum" className="hover:text-gold-500 transition-colors">Forum</Link>
            <ChevronRight className="w-3 h-3" />
            <span className={meta.color}>{meta.label}</span>
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-mono text-3xl font-bold text-bone-50 mb-1">
                {meta.label} —{' '}
                <span className={meta.color}>{meta.full}</span>
              </h1>
              <p className="font-mono text-sm text-bone-400">
                {list.length} thread{list.length !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Client component handles auth check + form */}
            <ForumComposeButton domain={params.domain} />
          </div>
        </div>
      </section>

      <div className="container py-10">
        {list.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-16 text-center">
            <MessageSquare className="w-10 h-10 text-gold-500/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-bone-400 mb-3">No threads yet in this domain.</p>
            <Link href="/dashboard/login"
              className="font-mono text-xs text-gold-500 hover:text-gold-400 transition-colors">
              Sign in to start the first discussion →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {list.map(t => (
              <Link key={t.id} href={`/forum/${params.domain}/${t.id}`}
                className="block border border-navy-700 hover:border-gold-500/40 p-5 transition-colors group">
                <div className="grid lg:grid-cols-[1fr_160px] gap-4 items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {t.is_pinned && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-gold-500/40 text-gold-500">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {t.is_locked && (
                        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 border border-navy-600 text-bone-500">
                          <Lock className="w-2.5 h-2.5" /> Locked
                        </span>
                      )}
                    </div>
                    <h3 className="font-mono text-base font-bold text-bone-50 group-hover:text-gold-500 transition-colors leading-snug mb-1">
                      {t.title}
                    </h3>
                    <p className="font-serif text-sm text-bone-300 line-clamp-2 leading-relaxed">
                      {t.body}
                    </p>
                  </div>

                  <div className="flex lg:flex-col items-center lg:items-end gap-4 lg:gap-1.5 font-mono text-xs text-bone-400 shrink-0">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3 h-3" />
                      {t.reply_count} {t.reply_count === 1 ? 'reply' : 'replies'}
                    </span>
                    <span className="text-bone-300">{t.author_name}</span>
                    <span>{timeAgo(t.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
