// app/clubs/extension/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Globe, Users, ChevronRight, Calendar, MapPin, ExternalLink, Heart, Wifi, Shield, BookOpen, Megaphone, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;
export const metadata = { title: 'Extension Activity — Outreach. Awareness. Impact.' };

const COLOR = '#1B7C3E';
const EXT_LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/Extension_Activity_Logo.png';

export default async function ExtensionClubPage() {
  const supabase = createClient();
  const clubRes = await supabase.from('clubs').select('*').eq('slug', 'extension').single();
  const club = clubRes.data; if (!club) return null;

  const [eventsRes, projectsRes] = await Promise.all([
    supabase.from('club_events').select('*').eq('club_id', club.id).eq('is_published', true).order('event_date', { ascending: false }),
    supabase.from('club_projects').select('*').eq('club_id', club.id).eq('is_published', true).order('order_index'),
  ]);
  const events   = eventsRes.data   ?? [];
  const projects = projectsRes.data ?? [];
  const totalParticipants = events.reduce((s, e) => s + (e.participants_count ?? 0), 0);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
                <Link href="/clubs" className="hover:text-[hsl(var(--foreground))] transition-colors">Tech Clubs</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span style={{ color: COLOR }}>Extension Activity</span>
              </nav>
              <p className="eyebrow mb-3">SITAICS × EDLD · Rashtriya Raksha University</p>
              <h1 className="font-display font-bold leading-tight mb-3"
                style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', color: 'hsl(var(--foreground))' }}>
                Extension<br /><span style={{ color: COLOR }}>Activity</span>
              </h1>
              <p className="font-sans text-lg tracking-wide mb-5" style={{ color: COLOR }}>Outreach. Awareness. Impact.</p>
              <p className="font-serif text-lg leading-relaxed max-w-lg mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
                The Extension Activity unit of SITAICS coordinates public outreach, social awareness campaigns,
                and community engagement initiatives in collaboration with the Extension and Distance Learning
                Directorate (EDLD) of Rashtriya Raksha University.
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#activities" className="btn-primary"><Globe className="w-4 h-4" /> Our Activities</a>
                <Link href="/events?type=extension" className="btn-ghost"><Calendar className="w-4 h-4" /> View Events</Link>
              </div>
              <div className="flex gap-8">
                {[
                  { v: events.length, l: 'Activities' },
                  { v: totalParticipants > 0 ? `${totalParticipants}+` : '500+', l: 'Lives reached' },
                  { v: club.founded_year, l: 'Since' },
                ].map(({ v, l }) => (
                  <div key={l} className="pl-4" style={{ borderLeft: `2px solid ${COLOR}` }}>
                    <div className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{v}</div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: 'hsl(var(--foreground-muted))' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Image src={EXT_LOGO} alt="Extension Activity Logo" width={280} height={280} className="drop-shadow-2xl" priority />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT + WHAT WE DO */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />
      <section id="activities" className="container py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-3">About</p>
            <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'hsl(var(--foreground))' }}>About the unit</h2>
            <div className="font-serif text-sm leading-relaxed space-y-4 pl-5"
              style={{ color: 'hsl(var(--foreground-muted))', borderLeft: `2px solid ${COLOR}40` }}>
              <p>Extension Activity unit of SITAICS, in collaboration with EDLD of RRU. Coordinated by{' '}<span className="font-semibold" style={{ color: COLOR }}>{club.mentor_name}</span>, {club.mentor_title}.</p>
              <p>All activities align with Digital India, Cyber Surakshit Bharat, Swachh Bharat Mission, and NEP 2020 — bridging technical cybersecurity education with civic responsibility.</p>
              <p>The unit engages students, faculty, staff, and the general public through awareness drives, street theatre, digital hygiene programmes, and community outreach.</p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">Focus areas</p>
            <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'hsl(var(--foreground))' }}>What we do</h2>
            <div className="space-y-2">
              {[
                { icon: Shield,    label: 'Cyber safety and digital fraud awareness for the general public' },
                { icon: Wifi,      label: 'Digital hygiene drives across RRU schools and administrative units' },
                { icon: Megaphone, label: 'Street theatre (Nukkad Natak) on civic and cyber topics' },
                { icon: BookOpen,  label: 'Online assessment and certification for outreach participants' },
                { icon: Heart,     label: 'Community engagement at public venues, societies, and institutions' },
                { icon: Users,     label: 'Collaboration with EDLD for campus-wide awareness campaigns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="card card-interactive flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: COLOR }}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NATIONAL ALIGNMENT */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />
      <section style={{ background: 'hsl(var(--surface))' }}>
        <div className="container py-14">
          <p className="eyebrow mb-3">Policy alignment</p>
          <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>Aligned with national initiatives</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Digital India Mission',   year: '2015',        desc: 'Strengthening digital literacy and responsible digital usage.' },
              { title: 'Cyber Surakshit Bharat', year: '2018 · MeitY', desc: 'Promoting cybersecurity awareness and cyber hygiene.' },
              { title: 'Swachh Bharat Mission',  year: '2014',         desc: 'Extending cleanliness into digital behaviour and secure device usage.' },
              { title: 'NEP 2020',               year: 'Govt. of India',desc: 'Integrating digital skills and cyber awareness in higher education.' },
            ].map(({ title, year, desc }) => (
              <div key={title} className="card card-interactive p-5">
                <div className="font-sans text-xs font-semibold mb-1" style={{ color: COLOR }}>{year}</div>
                <div className="font-display text-sm font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{title}</div>
                <p className="font-serif text-xs leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EVENTS */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />
      <section className="container py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-2">Outreach</p>
            <h2 className="font-display text-2xl font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Activities & events</h2>
          </div>
          <Link href="/events?type=extension" className="hidden md:inline-flex items-center gap-2 font-sans text-sm font-medium hover:gap-3 transition-all" style={{ color: COLOR }}>
            All extension events <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {events.length === 0 ? (
          <div className="card p-12 text-center" style={{ border: '1px dashed hsl(var(--border))' }}>
            <Globe className="w-10 h-10 mx-auto mb-4" style={{ color: 'hsl(var(--foreground-subtle))' }} />
            <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>No events listed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((ev, i) => (
              <div key={ev.id} className="card p-6 lg:p-8">
                <div className="grid lg:grid-cols-[1fr_200px] gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
                        style={{ background: `${COLOR}18`, color: COLOR, border: `1px solid ${COLOR}40` }}>
                        {ev.event_type}
                      </span>
                      <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
                        style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
                        {ev.status}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{ev.title}</h3>
                    {ev.subtitle   && <p className="font-sans text-sm mb-3" style={{ color: COLOR }}>{ev.subtitle}</p>}
                    {ev.description && <p className="font-serif text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>{ev.description}</p>}
                  </div>
                  <div className="card p-4 flex flex-col gap-3 text-xs self-start" style={{ borderLeft: `3px solid ${COLOR}` }}>
                    {ev.event_date && <div className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}><Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: COLOR }} />{new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>}
                    {ev.venue      && <div className="flex items-start gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}><MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: COLOR }} /><span className="leading-snug">{ev.venue}</span></div>}
                    {ev.participants_count && <div className="flex items-start gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}><Users className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: COLOR }} /><span><span className="font-bold" style={{ color: 'hsl(var(--foreground))' }}>{ev.participants_count}+</span> reached</span></div>}
                    {ev.report_url && <a href={ev.report_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:underline" style={{ color: COLOR }}><ExternalLink className="w-3 h-3 shrink-0" />View report</a>}
                    <div className="font-display text-3xl font-bold pt-3 mt-1" style={{ borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--border-strong))' }}>#{String(events.length - i).padStart(2,'0')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* COORDINATOR */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }} />
      <section style={{ background: 'hsl(var(--surface))' }}>
        <div className="container py-16">
          <p className="eyebrow mb-3">Leadership</p>
          <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>Extension coordinator</h2>
          <div className="card rounded-xl overflow-hidden grid lg:grid-cols-[260px_1fr]">
            <div className="p-10 flex flex-col items-center justify-center text-center" style={{ background: `${COLOR}12`, borderRight: '1px solid hsl(var(--border))' }}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-display text-3xl font-bold text-white mb-5" style={{ background: COLOR }}>AR</div>
              <div className="font-display text-lg font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>{club.mentor_name}</div>
              <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: COLOR }}>{club.mentor_title}</div>
              <div className="flex flex-col gap-2 w-full">
                {['Extension Coordinator, SITAICS','Member, EDLD — RRU'].map(r => <span key={r} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>{r}</span>)}
              </div>
            </div>
            <div className="p-10">
              <p className="eyebrow mb-5">About the coordinator</p>
              <p className="font-serif text-base leading-relaxed mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>
                Extension Coordinator from SITAICS and active member of the EDLD, RRU. Coordinates all outreach and social engagement activities, bridging technical cybersecurity expertise with public awareness and civic responsibility.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Role',          value: 'Extension Coordinator, SITAICS' },
                  { label: 'Directorate',   value: 'EDLD, Rashtriya Raksha University' },
                  { label: 'Focus areas',   value: 'Cyber awareness, Digital hygiene, Public outreach' },
                  { label: 'Teaching',      value: 'Malware Analysis, Cloud Security, Cryptography' },
                ].map(({ label, value }) => (
                  <div key={label} className="pl-4" style={{ borderLeft: `2px solid ${COLOR}40` }}>
                    <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>{label}</div>
                    <div className="font-serif text-sm" style={{ color: 'hsl(var(--foreground))' }}>{value}</div>
                  </div>
                ))}
              </div>
              <Link href="/about" className="btn-ghost inline-flex items-center gap-2">Full profile <ChevronRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* COLLABORATE CTA */}
      <section className="container py-16">
        <div className="card relative overflow-hidden p-10 lg:p-14 text-center">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(600px circle at 50% 50%, ${COLOR}12, transparent 60%)` }} aria-hidden />
          <div className="relative">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5" style={{ background: COLOR }}>
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
              Want to collaborate on an outreach activity?
            </h2>
            <p className="font-serif text-base leading-relaxed max-w-xl mx-auto mb-8" style={{ color: 'hsl(var(--foreground-muted))' }}>
              We welcome collaborations with schools, residential societies, government departments, and community groups for cyber awareness drives, digital hygiene programmes, and public education initiatives.
            </p>
            <Link href="/about" className="btn-primary inline-flex">
              <Megaphone className="w-4 h-4" /> Get in touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
