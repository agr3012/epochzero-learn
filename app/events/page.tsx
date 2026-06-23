// app/events/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, MapPin, Users, Trophy, Cpu, Building2, Globe } from 'lucide-react';

export const revalidate = 3600;
export const metadata = {
  title: 'Events — EpochZero Learn',
  description: 'CTF competitions, hackathons, workshops, industrial visits, and expert talks organised by SITAICS, RRU.',
};

const EVENT_META: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  ctf:       { label: 'CTF Competition',    icon: Trophy,    color: '#8B5E1A', bg: 'rgba(139,94,26,0.1)'  },
  hackathon: { label: 'Hackathon',          icon: Cpu,       color: '#1B5FA8', bg: 'rgba(27,95,168,0.1)'  },
  workshop:  { label: 'Workshop',           icon: Globe,     color: '#1B7C3E', bg: 'rgba(27,124,62,0.1)'  },
  industry:  { label: 'Industrial Visit',   icon: Building2, color: '#6B3AD4', bg: 'rgba(107,58,212,0.1)' },
  extension: { label: 'Extension Activity', icon: Globe,     color: '#1B7C3E', bg: 'rgba(27,124,62,0.1)'  },
};

function getMeta(type: string) {
  return EVENT_META[type] ?? { label: type, icon: Globe, color: 'hsl(var(--foreground-muted))', bg: 'hsl(var(--muted))' };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const TYPE_FILTERS = [
  { value: null,        label: 'All Events'         },
  { value: 'ctf',       label: 'CTF Competitions'   },
  { value: 'workshop',  label: 'Workshops & Talks'  },
  { value: 'industry',  label: 'Industrial Visits'  },
  { value: 'extension', label: 'Extension Activity' },
  { value: 'hackathon', label: 'Hackathons'         },
];

export default async function EventsPage({ searchParams }: { searchParams: { type?: string } }) {
  const supabase = createClient();
  const typeFilter = searchParams.type ?? null;

  let query = supabase.from('club_events')
    .select('*, clubs(name, short_name, slug, logo_url)')
    .eq('is_published', true).order('event_date', { ascending: false });
  if (typeFilter) query = (query as any).eq('event_type', typeFilter);

  const { data: events } = await query;
  const all      = events ?? [];
  const upcoming = all.filter(e => e.status === 'upcoming');
  const past     = all.filter(e => e.status !== 'upcoming');

  const totalParticipants  = all.reduce((s, e) => s + (e.participants_count  ?? 0), 0);
  const totalRegistrations = all.reduce((s, e) => s + (e.registrations_count ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Header ── */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-14 lg:py-16">
          <p className="eyebrow mb-3">SITAICS · Rashtriya Raksha University</p>
          <h1 className="font-display text-4xl lg:text-5xl font-bold mb-4 leading-tight"
            style={{ color: 'hsl(var(--foreground))' }}>
            Events & Activities
          </h1>
          <p className="font-serif text-lg leading-relaxed mb-8 max-w-2xl"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            CTF competitions, industrial visits, expert talks, and hackathons organised
            by SITAICS and its student clubs at Rashtriya Raksha University.
          </p>
          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { val: all.length,           label: 'Total events'    },
              { val: `${totalParticipants}+`,  label: 'Participants'    },
              { val: `${totalRegistrations}+`, label: 'Registrations'   },
            ].map(({ val, label }) => (
              <div key={label} className="pl-4" style={{ borderLeft: '2px solid hsl(var(--primary))' }}>
                <div className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{val}</div>
                <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'hsl(var(--foreground-muted))' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-12">
        {/* ── Type filter pills ── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TYPE_FILTERS.map(f => {
            const active = typeFilter === f.value;
            const meta = f.value ? getMeta(f.value) : null;
            return (
              <Link key={f.label}
                href={f.value ? `/events?type=${f.value}` : '/events'}
                className="font-sans text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
                style={{
                  background: active ? (meta ? meta.bg : 'hsl(var(--primary)/0.1)') : 'hsl(var(--card))',
                  color:      active ? (meta ? meta.color : 'hsl(var(--primary))') : 'hsl(var(--foreground-muted))',
                  border:     `1px solid ${active ? (meta ? meta.color + '60' : 'hsl(var(--primary)/0.4)') : 'hsl(var(--border))'}`,
                }}>
                {f.label}
              </Link>
            );
          })}
        </div>

        {upcoming.length > 0 && (
          <div className="mb-12">
            <p className="eyebrow mb-5">Upcoming</p>
            <div className="space-y-4">
              {upcoming.map(ev => <EventCard key={ev.id} ev={ev} highlight />)}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <p className="eyebrow mb-5">{upcoming.length > 0 ? 'Past events' : 'All events'}</p>
            <div className="space-y-4">
              {past.map((ev, i) => <EventCard key={ev.id} ev={ev} index={past.length - i} />)}
            </div>
          </div>
        )}

        {all.length === 0 && (
          <div className="card p-16 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-4" style={{ color: 'hsl(var(--foreground-subtle))' }} />
            <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ ev, highlight, index }: { ev: any; highlight?: boolean; index?: number }) {
  const meta = getMeta(ev.event_type);
  const Icon = meta.icon;

  return (
    <div className={`card p-6 lg:p-8 ${highlight ? 'ring-1 ring-[hsl(var(--primary)/0.3)]' : ''}`}>
      <div className="grid lg:grid-cols-[1fr_210px] gap-6 items-start">
        <div>
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}40` }}>
              {meta.label}
            </span>
            <span className={`font-sans text-xs font-medium px-2.5 py-0.5 rounded-full ${
              ev.status === 'upcoming'
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : ''
            }`}
              style={ev.status !== 'upcoming' ? {
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground-muted))',
                border: '1px solid hsl(var(--border))',
              } : {}}>
              {ev.status}
            </span>
            {ev.clubs && (
              <Link href={`/clubs/${ev.clubs.slug}`}
                className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-full
                  hover:text-[hsl(var(--primary))] transition-colors"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                {ev.clubs.short_name ?? ev.clubs.name}
              </Link>
            )}
          </div>

          <h2 className="font-display text-xl lg:text-2xl font-bold mb-2"
            style={{ color: 'hsl(var(--foreground))' }}>
            {ev.title}
          </h2>
          {ev.subtitle && (
            <p className="font-sans text-sm font-medium mb-3" style={{ color: 'hsl(var(--primary))' }}>
              {ev.subtitle}
            </p>
          )}
          {ev.description && (
            <p className="font-serif text-sm leading-relaxed line-clamp-3"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              {ev.description}
            </p>
          )}
        </div>

        {/* Meta sidebar */}
        <div className="card p-4 flex flex-col gap-3 text-xs self-start"
          style={{ borderLeft: `3px solid ${meta.color}` }}>
          {ev.event_date && (
            <div className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: meta.color }} />
              <span>{fmtDate(ev.event_date)}</span>
            </div>
          )}
          {ev.venue && (
            <div className="flex items-start gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: meta.color }} />
              <span className="leading-snug">{ev.venue}</span>
            </div>
          )}
          {(ev.registrations_count || ev.participants_count) && (
            <div className="flex items-start gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <Users className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: meta.color }} />
              <div className="flex flex-col gap-0.5">
                {ev.registrations_count && (
                  <span><span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>{ev.registrations_count}</span> registered</span>
                )}
                {ev.participants_count && (
                  <span><span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>{ev.participants_count}+</span> attended</span>
                )}
              </div>
            </div>
          )}
          {index !== undefined && (
            <div className="font-display text-3xl font-bold pt-3 mt-1"
              style={{ borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--border-strong))' }}>
              #{String(index).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
