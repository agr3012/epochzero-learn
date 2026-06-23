// app/clubs/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Users, Trophy, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;
export const metadata = { title: 'Tech Clubs — EpochZero Learn' };

const CLUB_COLOR: Record<string, string> = {
  rema:      '#8B5E1A',
  fullstack: '#1B5FA8',
  extension: '#1B7C3E',
};

export default async function ClubsIndexPage() {
  const supabase = createClient();
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, club_members(count), club_events(count)')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  return (
    <div className="container py-16 lg:py-20">

      {/* ── Header ── */}
      <div className="mb-12 max-w-3xl">
        <p className="eyebrow mb-3">Student communities</p>
        <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          Tech Clubs at SITAICS
        </h1>
        <p className="font-serif text-lg leading-relaxed"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Hands-on technical communities at SITAICS, RRU — CTF competitions,
          research projects, hackathons, and outreach activities led by faculty mentors.
        </p>
      </div>

      {/* ── Club cards ── */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(clubs ?? []).map((club: any) => {
          const c = CLUB_COLOR[club.slug] ?? '#1B5FA8';
          const memberCount = club.club_members?.[0]?.count ?? 0;
          const eventCount  = club.club_events?.[0]?.count  ?? 0;
          return (
            <Link key={club.id} href={`/clubs/${club.slug}`}
              className="card card-interactive group flex flex-col overflow-hidden">
              {/* Colour accent bar */}
              <div className="h-1.5 w-full shrink-0" style={{ background: c }} />
              <div className="p-7 flex flex-col flex-1">
                {/* Logo + name */}
                <div className="flex items-start gap-4 mb-5">
                  {club.logo_url ? (
                    <Image src={club.logo_url} alt={club.name} width={52} height={52}
                      className="rounded-xl shrink-0" />
                  ) : (
                    <div className="w-13 h-13 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: c, width: 52, height: 52 }}>
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.1em] mb-0.5"
                      style={{ color: c }}>
                      Student Club · SITAICS
                    </p>
                    <h2 className="font-display text-lg font-semibold leading-snug
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {club.name}
                    </h2>
                  </div>
                </div>

                {/* Tagline */}
                <p className="font-sans text-sm italic mb-3"
                  style={{ color: 'hsl(var(--primary))' }}>
                  {club.tagline}
                </p>

                {/* Description */}
                {club.description && (
                  <p className="font-serif text-sm leading-relaxed mb-5 flex-1 line-clamp-3"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {club.description}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-4 flex items-center justify-between"
                  style={{ borderTop: '1px solid hsl(var(--border))' }}>
                  <div className="flex items-center gap-4 text-xs"
                    style={{ color: 'hsl(var(--foreground-muted))' }}>
                    {memberCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="w-3 h-3" /> {memberCount}
                      </span>
                    )}
                    {eventCount > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> {eventCount}
                      </span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                    style={{ color: 'hsl(var(--primary))' }} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
