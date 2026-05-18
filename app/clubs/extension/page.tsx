import Image from 'next/image';
import Link from 'next/link';
import {
  Globe,
  Users,
  ChevronRight,
  Calendar,
  MapPin,
  ExternalLink,
  Heart,
  Wifi,
  Shield,
  BookOpen,
  Megaphone,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;

export const metadata = {
  title: 'Extension Activity — Outreach. Awareness. Impact.',
  description:
    'Extension Activity unit of SITAICS, RRU — coordinating public outreach, cyber awareness campaigns, and community engagement initiatives in collaboration with EDLD.',
};

const EXT_LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/Extension_Activity_Logo.png';

export default async function ExtensionClubPage() {
  const supabase = createClient();

  const clubRes = await supabase
    .from('clubs')
    .select('*')
    .eq('slug', 'extension')
    .single();

  const club = clubRes.data;
  if (!club) return null;

  const [eventsRes, projectsRes] = await Promise.all([
    supabase
      .from('club_events')
      .select('*')
      .eq('club_id', club.id)
      .eq('is_published', true)
      .order('event_date', { ascending: false }),
    supabase
      .from('club_projects')
      .select('*')
      .eq('club_id', club.id)
      .eq('is_published', true)
      .order('order_index'),
  ]);

  const events   = eventsRes.data   ?? [];
  const projects = projectsRes.data ?? [];

  // Total participants across all extension events
  const totalParticipants = events.reduce(
    (s, e) => s + (e.participants_count ?? 0), 0
  );

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950">
        <div className="absolute inset-0 border-grid opacity-30" aria-hidden />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(900px circle at 60% 50%, rgba(255,200,87,0.06), transparent 55%)' }}
          aria-hidden />
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-30" aria-hidden />

        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 mb-8">
                <Link href="/clubs" className="hover:text-gold-500 transition-colors">Tech Clubs</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gold-500">Extension Activity</span>
              </div>

              <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
                // SITAICS × EDLD · Rashtriya Raksha University
              </div>

              <h1 className="font-mono text-5xl lg:text-6xl font-bold text-bone-50 leading-[0.95] mb-4">
                Extension<br />
                <span className="text-gold-500">Activity</span>
              </h1>

              <p className="font-mono text-lg text-bone-300 tracking-[0.2em] uppercase mb-6">
                Outreach. Awareness. Impact.
              </p>

              <p className="font-serif text-lg text-bone-200 leading-relaxed max-w-lg mb-10">
                The Extension Activity unit of SITAICS coordinates public outreach,
                social awareness campaigns, and community engagement initiatives in
                collaboration with the Extension and Distance Learning Directorate (EDLD)
                of Rashtriya Raksha University.
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#activities" className="btn-primary">
                  <Globe className="w-4 h-4" />
                  Our Activities
                </a>
                <Link href="/events?type=extension" className="btn-ghost">
                  <Calendar className="w-4 h-4" />
                  View Events
                </Link>
              </div>

              <div className="mt-12 flex gap-8 font-mono">
                <div className="border-l-2 border-gold-500 pl-4">
                  <div className="text-2xl font-bold text-bone-50">{events.length}</div>
                  <div className="text-xs uppercase tracking-wider text-bone-400">Activities</div>
                </div>
                <div className="border-l-2 border-gold-500 pl-4">
                  <div className="text-2xl font-bold text-bone-50">{totalParticipants > 0 ? `${totalParticipants}+` : '500+'}</div>
                  <div className="text-xs uppercase tracking-wider text-bone-400">Lives reached</div>
                </div>
                <div className="border-l-2 border-gold-500 pl-4">
                  <div className="text-2xl font-bold text-bone-50">{club.founded_year}</div>
                  <div className="text-xs uppercase tracking-wider text-bone-400">Since</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-15 bg-gold-500"
                  style={{ transform: 'scale(1.2)' }} />
                <Image src={EXT_LOGO} alt="Extension Activity Logo"
                  width={300} height={300} className="relative drop-shadow-2xl" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT + WHAT WE DO ────────────────────────────────────────── */}
      <section id="activities" className="container py-20 border-b border-navy-700">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// About</div>
            <h2 className="font-mono text-3xl font-bold text-bone-50 mb-6">About the unit</h2>
            <div className="border-l-2 border-gold-500/40 pl-6 font-serif text-bone-200 leading-relaxed space-y-4">
              <p>
                The Extension Activity unit operates under SITAICS in collaboration with the
                Extension and Distance Learning Directorate (EDLD) of Rashtriya Raksha University.
                The unit is coordinated by{' '}
                <span className="text-gold-500 font-mono">{club.mentor_name}</span>,
                {' '}{club.mentor_title}, who serves as Extension Coordinator from SITAICS.
              </p>
              <p>
                All activities are aligned with Government of India initiatives including
                Digital India, Cyber Surakshit Bharat, Swachh Bharat Mission, and NEP 2020 —
                bridging the gap between technical cybersecurity education and civic responsibility.
              </p>
              <p>
                The unit engages students, faculty, staff, and the general public through
                awareness drives, street theatre, digital hygiene programmes, and community
                outreach — extending the impact of SITAICS beyond the campus.
              </p>
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Focus areas</div>
            <h2 className="font-mono text-3xl font-bold text-bone-50 mb-6">What we do</h2>
            <div className="space-y-3">
              {[
                { icon: Shield,    label: 'Cyber safety and digital fraud awareness for the general public' },
                { icon: Wifi,      label: 'Digital hygiene drives across RRU schools and administrative units' },
                { icon: Megaphone, label: 'Street theatre (Nukkad Natak) on civic and cyber topics' },
                { icon: BookOpen,  label: 'Online assessment and certification for outreach programme participants' },
                { icon: Heart,     label: 'Community engagement at public venues, residential societies, and institutions' },
                { icon: Users,     label: 'Collaboration with EDLD for campus-wide awareness campaigns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-start gap-3 p-4 border border-navy-700 hover:border-gold-500/40 transition-colors">
                  <Icon className="w-4 h-4 text-gold-500 mt-0.5 shrink-0" />
                  <span className="font-mono text-sm text-bone-100">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GOVERNMENT ALIGNMENT ──────────────────────────────────────── */}
      <section className="border-b border-navy-700 bg-navy-950/40">
        <div className="container py-16">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Policy alignment</div>
          <h2 className="font-mono text-3xl font-bold text-bone-50 mb-8">Aligned with national initiatives</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Digital India Mission', year: '2015', desc: 'Strengthening digital literacy and responsible digital usage among citizens.' },
              { title: 'Cyber Surakshit Bharat', year: '2018 · MeitY', desc: 'Promoting cybersecurity awareness and cyber hygiene across institutions.' },
              { title: 'Swachh Bharat Mission', year: '2014', desc: 'Extending the concept of cleanliness into digital behaviour and secure device usage.' },
              { title: 'NEP 2020', year: 'Govt. of India', desc: 'Integrating digital skills, cyber awareness, and experiential learning in higher education.' },
            ].map(({ title, year, desc }) => (
              <div key={title} className="border border-navy-700 bg-navy-900 p-5 hover:border-gold-500/40 transition-colors">
                <div className="font-mono text-[10px] uppercase tracking-wider text-gold-500 mb-2">{year}</div>
                <div className="font-mono text-sm font-bold text-bone-50 mb-2">{title}</div>
                <p className="font-serif text-xs text-bone-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVENTS ────────────────────────────────────────────────────── */}
      <section className="container py-20 border-b border-navy-700">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Outreach</div>
            <h2 className="font-mono text-3xl font-bold text-bone-50">Activities & events</h2>
          </div>
          <Link href="/events?type=extension"
            className="hidden md:inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors border border-gold-500/40 hover:border-gold-500 px-4 py-2">
            All extension events <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-12 text-center">
            <Globe className="w-10 h-10 text-gold-500/20 mx-auto mb-4" />
            <p className="font-mono text-sm text-bone-400">No events listed yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((ev, i) => (
              <div key={ev.id} className="card-forensic p-8 hover:border-gold-500/40 transition-colors">
                <div className="grid lg:grid-cols-[1fr_200px] gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-green-500/60 text-green-400 bg-green-500/5">
                        {ev.event_type}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-navy-600 text-bone-400">
                        {ev.status}
                      </span>
                    </div>
                    <h3 className="font-mono text-2xl font-bold text-bone-50 mb-1">{ev.title}</h3>
                    {ev.subtitle && (
                      <p className="font-mono text-sm text-gold-500/80 mb-4">{ev.subtitle}</p>
                    )}
                    {ev.description && (
                      <p className="font-serif text-bone-200 leading-relaxed">{ev.description}</p>
                    )}
                  </div>

                  {/* Meta box */}
                  <div className="border border-navy-700 bg-navy-950/60 p-4 flex flex-col gap-3 font-mono text-xs text-bone-300 self-start">
                    {ev.event_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gold-500 shrink-0" />
                        <span>{new Date(ev.event_date).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}</span>
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
                            <span><span className="text-bone-50 font-bold">{ev.participants_count}+</span> reached</span>
                          )}
                        </div>
                      </div>
                    )}
                    {ev.report_url && (
                      <a href={ev.report_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-gold-500 hover:text-gold-400 transition-colors mt-1">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        View report
                      </a>
                    )}
                    <div className="font-mono text-3xl font-bold text-navy-700 mt-2 pt-2 border-t border-navy-700">
                      #{String(events.length - i).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── COORDINATOR ───────────────────────────────────────────────── */}
      <section className="border-b border-navy-700 bg-navy-950/60">
        <div className="container py-20">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Leadership</div>
          <h2 className="font-mono text-3xl font-bold text-bone-50 mb-10">Extension coordinator</h2>

          <div className="border border-gold-500/30 bg-navy-900 grid lg:grid-cols-[280px_1fr] overflow-hidden">
            <div className="bg-navy-800 border-b lg:border-b-0 lg:border-r border-gold-500/20 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 border-2 border-gold-500 bg-navy-950 flex items-center justify-center font-mono text-4xl text-gold-500 font-bold mb-6">
                AR
              </div>
              <div className="font-mono text-xl font-bold text-bone-50 mb-1">{club.mentor_name}</div>
              <div className="font-mono text-xs text-gold-500 uppercase tracking-wider mb-4">{club.mentor_title}</div>
              <div className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-wider text-bone-400">
                <span className="px-2 py-0.5 border border-navy-600 bg-navy-900">Extension Coordinator, SITAICS</span>
                <span className="px-2 py-0.5 border border-navy-600 bg-navy-900">Member, EDLD — RRU</span>
              </div>
            </div>
            <div className="p-10">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-6">// About the coordinator</div>
              <p className="font-serif text-bone-200 leading-relaxed mb-6 text-lg">
                Extension Coordinator from SITAICS and active member of the Extension and Distance
                Learning Directorate (EDLD), Rashtriya Raksha University. Coordinates all outreach
                and social engagement activities under the Extension Activity unit, bridging
                technical cybersecurity expertise with public awareness and civic responsibility.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Role',               value: 'Extension Coordinator, SITAICS' },
                  { label: 'Directorate',         value: 'EDLD, Rashtriya Raksha University' },
                  { label: 'Focus areas',         value: 'Cyber awareness, Digital hygiene, Public outreach' },
                  { label: 'Teaching domains',    value: 'Malware Analysis, Cloud Security, Cryptography' },
                ].map(({ label, value }) => (
                  <div key={label} className="border-l-2 border-gold-500/30 pl-4">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-bone-400 mb-1">{label}</div>
                    <div className="font-serif text-sm text-bone-200 leading-snug">{value}</div>
                  </div>
                ))}
              </div>
              <Link href="/about"
                className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors border border-gold-500/40 hover:border-gold-500 px-4 py-2">
                Full profile <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLLABORATE ───────────────────────────────────────────────── */}
      <section className="container py-20">
        <div className="border border-gold-500/20 bg-navy-900/60 p-10 lg:p-14 text-center">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">// Partner with us</div>
          <h2 className="font-mono text-3xl font-bold text-bone-50 mb-4">
            Want to collaborate on an outreach activity?
          </h2>
          <p className="font-serif text-bone-200 max-w-2xl mx-auto leading-relaxed mb-8">
            We welcome collaborations with schools, residential societies, government departments,
            and community groups for cyber awareness drives, digital hygiene programmes, and
            public education initiatives.
          </p>
          <Link href="/about"
            className="btn-primary inline-flex">
            <Megaphone className="w-4 h-4" />
            Get in touch
          </Link>
        </div>
      </section>
    </div>
  );
}
