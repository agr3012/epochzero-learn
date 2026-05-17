// app/events/page.tsx
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Calendar, MapPin, Users, Trophy, Cpu, Building2, Globe, ChevronRight } from 'lucide-react';

export const revalidate = 3600;

export const metadata = {
  title: 'Events — EpochZero Learn',
  description: 'CTF competitions, hackathons, workshops, industrial visits, and expert talks organised by SITAICS, RRU.',
};

const EVENT_TYPE_META: Record<string, { label: string; icon: any; color: string }> = {
  ctf:       { label: 'CTF Competition',    icon: Trophy,    color: 'text-gold-500 border-gold-500/60 bg-gold-500/5'     },
  hackathon: { label: 'Hackathon',          icon: Cpu,       color: 'text-blue-400 border-blue-400/60 bg-blue-400/5'     },
  workshop:  { label: 'Workshop',           icon: Globe,     color: 'text-green-400 border-green-400/60 bg-green-400/5'  },
  industry:  { label: 'Industrial Visit',   icon: Building2, color: 'text-purple-400 border-purple-400/60 bg-purple-400/5'},
  extension: { label: 'Extension Activity', icon: Globe,     color: 'text-orange-400 border-orange-400/60 bg-orange-400/5'},
};

function getTypeMeta(type: string) {
  return EVENT_TYPE_META[type] ?? { label: type, icon: Globe, color: 'text-bone-400 border-navy-600 bg-navy-800' };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const supabase = createClient();
  const typeFilter = searchParams.type ?? null;

  let query = supabase
    .from('club_events')
    .select('*, clubs(name, short_name, slug, logo_url)')
    .eq('is_published', true)
    .order('event_date', { ascending: false });

  if (typeFilter) query = query.eq('event_type', typeFilter);

  const { data: events } = await query;
  const allEvents = events ?? [];

  const upcoming = allEvents.filter(e => e.status === 'upcoming');
  const past     = allEvents.filter(e => e.status !== 'upcoming');

  const TYPE_FILTERS = [
    { value: null,        label: 'All Events'         },
    { value: 'ctf',       label: 'CTF Competitions'   },
    { value: 'workshop',  label: 'Workshops & Talks'  },
    { value: 'industry',  label: 'Industrial Visits'  },
    { value: 'extension', label: 'Extension Activity' },
    { value: 'hackathon', label: 'Hackathons'         },
  ];

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-700 bg-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 border-grid opacity-20" aria-hidden />
        <div className="container py-16 lg:py-20 relative">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">
            // SITAICS · Rashtriya Raksha University
          </div>
          <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4">
            Events
          </h1>
          <p className="font-serif text-lg text-bone-200 max-w-2xl leading-relaxed mb-8">
            CTF competitions, industrial visits, expert talks, and hackathons organised by
            SITAICS and its student clubs at Rashtriya Raksha University.
          </p>
          {/* Stats row */}
          <div className="flex flex-wrap gap-6 font-mono text-sm">
            <div className="border-l-2 border-gold-500 pl-3">
              <span className="text-2xl font-bold text-bone-50">{allEvents.length}</span>
              <span className="text-bone-400 ml-2 text-xs uppercase tracking-wider">Total events</span>
            </div>
            <div className="border-l-2 border-gold-500 pl-3">
              <span className="text-2xl font-bold text-bone-50">
                {allEvents.reduce((s, e) => s + (e.participants_count ?? 0), 0)}+
              </span>
              <span className="text-bone-400 ml-2 text-xs uppercase tracking-wider">Participants</span>
            </div>
            <div className="border-l-2 border-gold-500 pl-3">
              <span className="text-2xl font-bold text-bone-50">
                {allEvents.reduce((s, e) => s + (e.registrations_count ?? 0), 0)}+
              </span>
              <span className="text-bone-400 ml-2 text-xs uppercase tracking-wider">Registrations</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-12">

        {/* ── Type filter chips ─────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-10">
          {TYPE_FILTERS.map(f => {
            const active = typeFilter === f.value;
            return (
              <Link
                key={f.label}
                href={f.value ? `/events?type=${f.value}` : '/events'}
                className={`font-mono text-xs uppercase tracking-wider px-4 py-2 border transition-colors ${
                  active
                    ? 'border-gold-500 text-gold-500 bg-gold-500/10'
                    : 'border-navy-700 text-bone-300 hover:border-gold-500/40 hover:text-gold-500'
                }`}>
                {f.label}
              </Link>
            );
          })}
        </div>

        {/* ── Upcoming events ───────────────────────────────────────── */}
        {upcoming.length > 0 && (
          <div className="mb-12">
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">// Upcoming</div>
            <div className="space-y-4">
              {upcoming.map(ev => <EventCard key={ev.id} ev={ev} highlight />)}
            </div>
          </div>
        )}

        {/* ── Past events ───────────────────────────────────────────── */}
        {past.length > 0 && (
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
              {upcoming.length > 0 ? '// Past events' : '// All events'}
            </div>
            <div className="space-y-4">
              {past.map((ev, i) => <EventCard key={ev.id} ev={ev} index={past.length - i} />)}
            </div>
          </div>
        )}

        {allEvents.length === 0 && (
          <div className="border border-dashed border-navy-700 p-16 text-center">
            <Trophy className="w-10 h-10 text-gold-500/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-bone-400">No events found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ ev, highlight, index }: { ev: any; highlight?: boolean; index?: number }) {
  const meta   = getTypeMeta(ev.event_type);
  const Icon   = meta.icon;

  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  return (
    <div className={`border transition-colors p-6 lg:p-8 ${
      highlight ? 'border-gold-500/40 bg-navy-900' : 'border-navy-700 hover:border-gold-500/30'
    }`}>
      <div className="grid lg:grid-cols-[1fr_220px] gap-6 items-start">
        <div>
          {/* Type + status badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${meta.color}`}>
              {meta.label}
            </span>
            <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
              ev.status === 'upcoming'
                ? 'border-green-500/60 text-green-400 bg-green-500/5'
                : 'border-navy-600 text-bone-400'
            }`}>{ev.status}</span>
            {ev.clubs && (
              <Link href={`/clubs/${ev.clubs.slug}`}
                className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-navy-600 text-bone-400 hover:text-gold-500 hover:border-gold-500/40 transition-colors">
                {ev.clubs.short_name ?? ev.clubs.name}
              </Link>
            )}
            {!ev.clubs && (
              <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-navy-600 text-bone-400">
                University
              </span>
            )}
          </div>

          <h2 className="font-mono text-xl lg:text-2xl font-bold text-bone-50 mb-1">
            {ev.title}
          </h2>
          {ev.subtitle && (
            <p className="font-mono text-sm text-gold-500/80 mb-4">{ev.subtitle}</p>
          )}
          {ev.description && (
            <p className="font-serif text-bone-200 leading-relaxed line-clamp-3">{ev.description}</p>
          )}
        </div>

        {/* Meta sidebar — clean bordered box */}
        <div className="border border-navy-700 bg-navy-950/60 p-4 flex flex-col gap-3 font-mono text-xs text-bone-300 min-w-[190px] self-start">
          {ev.event_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <span>{fmtDate(ev.event_date)}</span>
            </div>
          )}
          {ev.venue && (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
              <span className="leading-snug">{ev.venue}</span>
            </div>
          )}
          {(ev.registrations_count || ev.participants_count) && (
            <div className="flex items-start gap-2">
              <Users className="w-3.5 h-3.5 text-gold-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                {ev.registrations_count && (
                  <span><span className="text-bone-50 font-bold">{ev.registrations_count}</span> registered</span>
                )}
                {ev.participants_count && (
                  <span><span className="text-bone-50 font-bold">{ev.participants_count}+</span> attended</span>
                )}
              </div>
            </div>
          )}
          {index !== undefined && (
            <div className="font-mono text-3xl font-bold text-navy-700 mt-2 pt-2 border-t border-navy-700">
              #{String(index).padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
