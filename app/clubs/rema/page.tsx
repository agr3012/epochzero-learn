// app/clubs/rema/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Shield, Users, Trophy, Code2, ChevronRight, Calendar, MapPin, ExternalLink, Swords, FlaskConical, Network, Cpu } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ClubRegistrationForm } from './RegistrationForm';

export const revalidate = 3600;
export const metadata = { title: 'REMA Club — Reverse. Reveal. Respond.' };

const COLOR = '#8B5E1A';

export default async function REMAClubPage() {
  const supabase = createClient();
  const [clubRes, membersRes, eventsRes, projectsRes] = await Promise.all([
    supabase.from('clubs').select('*').eq('slug', 'rema').single(),
    supabase.from('club_members').select('*').eq('club_id', (await supabase.from('clubs').select('id').eq('slug', 'rema').single()).data?.id).order('order_index'),
    supabase.from('club_events').select('*').eq('club_id', (await supabase.from('clubs').select('id').eq('slug', 'rema').single()).data?.id).eq('is_published', true).order('event_date', { ascending: false }),
    supabase.from('club_projects').select('*').eq('club_id', (await supabase.from('clubs').select('id').eq('slug', 'rema').single()).data?.id).eq('is_published', true).order('order_index'),
  ]);
  const club     = clubRes.data;
  const members  = membersRes.data  ?? [];
  const events   = eventsRes.data   ?? [];
  const projects = projectsRes.data ?? [];
  const current  = members.filter(m => m.status === 'current');
  const alumni   = members.filter(m => m.status === 'alumni');
  if (!club) return null;

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* HERO */}
      <section style={{ background: 'hsl(var(--surface))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div className="container py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-6"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                <Link href="/clubs" className="hover:text-[hsl(var(--foreground))] transition-colors">Tech Clubs</Link>
                <ChevronRight className="w-3.5 h-3.5" />
                <span style={{ color: COLOR }}>REMA Club</span>
              </nav>
              <p className="eyebrow mb-3">SITAICS · Rashtriya Raksha University</p>
              <h1 className="font-display font-bold leading-tight mb-3"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: 'hsl(var(--foreground))' }}>
                REMA<br /><span style={{ color: COLOR }}>Club</span>
              </h1>
              <p className="font-sans text-lg tracking-wide mb-5" style={{ color: COLOR }}>
                Reverse. Reveal. Respond.
              </p>
              <p className="font-serif text-lg leading-relaxed max-w-lg mb-8"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                {club.description}
              </p>
              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#register" className="btn-primary"><Shield className="w-4 h-4" /> Join the Club</a>
                <a href="#events"   className="btn-ghost"><Trophy className="w-4 h-4" /> Our CTFs</a>
              </div>
              <div className="flex gap-8">
                {[{ v: members.length, l: 'Members' }, { v: events.length, l: 'CTF Events' }, { v: club.founded_year, l: 'Founded' }].map(({ v, l }) => (
                  <div key={l} className="pl-4" style={{ borderLeft: `2px solid ${COLOR}` }}>
                    <div className="font-display text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>{v}</div>
                    <div className="text-xs uppercase tracking-wider" style={{ color: 'hsl(var(--foreground-muted))' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Image src="https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/REMA_Club_Logo.png"
                alt="REMA Club Logo" width={280} height={280} className="drop-shadow-2xl" priority />
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT + ACTIVITIES */}
      <SectionDivider />
      <section className="container py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-3">Charter</p>
            <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'hsl(var(--foreground))' }}>About the club</h2>
            <div className="font-serif text-sm leading-relaxed space-y-4 pl-5"
              style={{ color: 'hsl(var(--foreground-muted))', borderLeft: `2px solid ${COLOR}40` }}>
              <p>{club.charter}</p>
              <p>Mentored by <span className="font-semibold" style={{ color: COLOR }}>{club.mentor_name}</span>, {club.mentor_title}.</p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-3">Activities</p>
            <h2 className="font-display text-2xl font-semibold mb-6" style={{ color: 'hsl(var(--foreground))' }}>What we do</h2>
            <div className="space-y-2">
              {[
                { icon: Swords,       label: 'Capture The Flag (CTF) competitions' },
                { icon: Shield,       label: 'Static and dynamic malware analysis labs' },
                { icon: Code2,        label: 'YARA and Sigma detection rule writing' },
                { icon: Cpu,          label: 'Tool development and scripting for automation' },
                { icon: Network,      label: 'OSINT for threat hunting' },
                { icon: FlaskConical, label: 'Machine learning for polymorphic malware detection' },
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

      {/* MEMBERS */}
      <SectionDivider />
      <section className="container py-16">
        <p className="eyebrow mb-3">Active</p>
        <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>Current members</h2>
        {current.length === 0 ? (
          <p className="text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>No members listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {current.map(m => <MemberCard key={m.id} m={m} color={COLOR} active />)}
          </div>
        )}
      </section>

      {alumni.length > 0 && (
        <>
          <SectionDivider />
          <section className="container py-16">
            <p className="eyebrow mb-3">Past members</p>
            <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>Alumni</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {alumni.map(m => <MemberCard key={m.id} m={m} color={COLOR} />)}
            </div>
          </section>
        </>
      )}

      {/* EVENTS */}
      <SectionDivider />
      <section id="events" className="container py-16 scroll-mt-20">
        <p className="eyebrow mb-3">Competitions</p>
        <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>CTF events</h2>
        <div className="space-y-4">
          {events.map((ev, i) => <EventCard key={ev.id} ev={ev} color={COLOR} index={events.length - i} />)}
        </div>
      </section>

      {/* PROJECTS */}
      {projects.length > 0 && (
        <>
          <SectionDivider />
          <section className="container py-16">
            <p className="eyebrow mb-3">Research & Development</p>
            <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>Projects</h2>
            <div className="grid lg:grid-cols-2 gap-4">
              {projects.map(p => <ProjectCard key={p.id} p={p} color={COLOR} />)}
            </div>
          </section>
        </>
      )}

      {/* MENTOR */}
      <SectionDivider />
      <section style={{ background: 'hsl(var(--surface))', borderTop: '1px solid hsl(var(--border))' }}>
        <div className="container py-16">
          <p className="eyebrow mb-3">Leadership</p>
          <h2 className="font-display text-2xl font-semibold mb-8" style={{ color: 'hsl(var(--foreground))' }}>Club mentor</h2>
          <MentorCard club={club} color={COLOR}
            roles={['Researcher · ML & Malware Analysis', 'Club Founder & Mentor']}
            bio="Founder and mentor of the REMA Club at SITAICS, RRU. Active researcher in ML and malware analysis with a focus on automated detection and cloud security. Teaches Reverse Engineering and Malware Analysis across B.Tech, M.Sc., and M.Tech programmes."
            highlights={[
              { label: 'Research interests',   value: 'Machine Learning, Malware Analysis, Cloud Security' },
              { label: 'Training engagements', value: 'Bharat NCX, SEBI, MHA, Gujarat Police, Nepal Police (ITEC)' },
              { label: 'Teaching domains',     value: 'Malware Analysis, Cloud Security, Cryptography, Web Dev' },
            ]}
          />
        </div>
      </section>

      {/* REGISTRATION */}
      <section id="register" className="container py-16 scroll-mt-20">
        <p className="eyebrow mb-3">Membership</p>
        <h2 className="font-display text-2xl font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>Join the REMA Club</h2>
        <p className="font-serif text-base leading-relaxed max-w-2xl mb-10"
          style={{ color: 'hsl(var(--foreground-muted))' }}>
          Open to all RRU students. Use your official RRU email (<span className="font-mono text-sm" style={{ color: COLOR }}>@student.rru.ac.in</span> or <span className="font-mono text-sm" style={{ color: COLOR }}>@rru.ac.in</span>). Registrations are reviewed by the club mentor.
        </p>
        <ClubRegistrationForm clubId={club.id} clubName={club.name} />
        <RegistrationInfo color={COLOR}
          benefits={['Access to exclusive CTF challenges','Hands-on malware analysis labs','Mentorship from faculty and researchers','Participation in REMA CTF events','Certificate of membership and participation','Networking with cybersecurity professionals']}
        />
      </section>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function SectionDivider() {
  return <div style={{ borderTop: '1px solid hsl(var(--border))' }} />;
}

function MemberCard({ m, color, active }: { m: any; color: string; active?: boolean }) {
  const initials = m.name.replace(/Mr\.|Ms\./, '').trim().charAt(0);
  return (
    <div className="card p-6">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 font-display text-lg font-bold text-white"
        style={{ background: active ? color : 'hsl(var(--border-strong))' }}>
        {initials}
      </div>
      <div className="font-sans font-semibold text-sm mb-0.5" style={{ color: 'hsl(var(--foreground))' }}>{m.name}</div>
      <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-1" style={{ color }}>{m.role}</div>
      <div className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{m.program}</div>
      <div className="text-xs" style={{ color: 'hsl(var(--foreground-muted))' }}>{m.batch_year}</div>
      {active && (
        <div className="mt-3 inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full"
          style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
          Active
        </div>
      )}
    </div>
  );
}

function EventCard({ ev, color, index }: { ev: any; color: string; index: number }) {
  return (
    <div className="card p-6 lg:p-8">
      <div className="grid lg:grid-cols-[1fr_200px] gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: `${color}18`, color, border: `1px solid ${color}40` }}>
              {ev.event_type?.toUpperCase()}
            </span>
            <span className={`font-sans text-xs font-medium px-2.5 py-0.5 rounded-full ${ev.status === 'upcoming' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : ''}`}
              style={ev.status !== 'upcoming' ? { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' } : {}}>
              {ev.status}
            </span>
          </div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>{ev.title}</h3>
          {ev.subtitle   && <p className="font-sans text-sm mb-3" style={{ color }}>{ev.subtitle}</p>}
          {ev.description && <p className="font-serif text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground-muted))' }}>{ev.description}</p>}
          {ev.results_summary && (
            <div className="mt-4 pl-4 font-serif text-sm italic" style={{ borderLeft: `2px solid ${color}40`, color: 'hsl(var(--foreground-muted))' }}>
              {ev.results_summary}
            </div>
          )}
        </div>
        <div className="card p-4 flex flex-col gap-3 text-xs self-start" style={{ borderLeft: `3px solid ${color}` }}>
          {ev.event_date && (
            <div className="flex items-center gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color }} />
              {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
          {ev.venue && (
            <div className="flex items-start gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
              <span className="leading-snug">{ev.venue}</span>
            </div>
          )}
          {(ev.registrations_count || ev.participants_count) && (
            <div className="flex items-start gap-2" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <Users className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color }} />
              <div className="flex flex-col gap-0.5">
                {ev.registrations_count && <span><span style={{ color: 'hsl(var(--foreground))' }} className="font-bold">{ev.registrations_count}</span> registered</span>}
                {ev.participants_count  && <span><span style={{ color: 'hsl(var(--foreground))' }} className="font-bold">{ev.participants_count}+</span> attended</span>}
              </div>
            </div>
          )}
          {ev.report_url && (
            <a href={ev.report_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:underline"
              style={{ color }}>
              <ExternalLink className="w-3 h-3 shrink-0" /> View report
            </a>
          )}
          <div className="font-display text-3xl font-bold pt-3 mt-1"
            style={{ borderTop: '1px solid hsl(var(--border))', color: 'hsl(var(--border-strong))' }}>
            #{String(index).padStart(2, '0')}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p, color }: { p: any; color: string }) {
  return (
    <div className="card p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-4">
        <span className="font-sans text-xs font-medium px-2.5 py-0.5 rounded-full"
          style={p.status === 'active'
            ? { background: `${color}18`, color, border: `1px solid ${color}40` }
            : { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
          {p.status}
        </span>
        {p.github_url && (
          <a href={p.github_url} target="_blank" rel="noopener noreferrer"
            className="hover:text-[hsl(var(--primary))] transition-colors"
            style={{ color: 'hsl(var(--foreground-muted))' }}>
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>{p.title}</h3>
      <p className="font-serif text-sm leading-relaxed mb-5" style={{ color: 'hsl(var(--foreground-muted))' }}>{p.description}</p>
      {Array.isArray(p.tech_stack) && p.tech_stack.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {p.tech_stack.map((t: string) => (
            <span key={t} className="font-mono text-xs px-2 py-0.5 rounded"
              style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MentorCard({ club, color, roles, bio, highlights }: { club: any; color: string; roles: string[]; bio: string; highlights: { label: string; value: string }[] }) {
  return (
    <div className="card rounded-xl overflow-hidden grid lg:grid-cols-[260px_1fr]">
      {/* Left identity panel */}
      <div className="p-10 flex flex-col items-center justify-center text-center"
        style={{ background: `${color}12`, borderRight: '1px solid hsl(var(--border))' }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-display text-3xl font-bold text-white mb-5"
          style={{ background: color }}>
          AR
        </div>
        <div className="font-display text-lg font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>{club.mentor_name}</div>
        <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-4" style={{ color }}>{club.mentor_title}</div>
        <div className="flex flex-col gap-2 w-full">
          {roles.map(r => (
            <span key={r} className="text-xs px-3 py-1.5 rounded-lg"
              style={{ background: 'hsl(var(--card))', color: 'hsl(var(--foreground-muted))', border: '1px solid hsl(var(--border))' }}>
              {r}
            </span>
          ))}
        </div>
      </div>
      {/* Right details */}
      <div className="p-10">
        <p className="eyebrow mb-5">About the mentor</p>
        <p className="font-serif text-base leading-relaxed mb-6" style={{ color: 'hsl(var(--foreground-muted))' }}>{bio}</p>
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {highlights.map(({ label, value }) => (
            <div key={label} className="pl-4" style={{ borderLeft: `2px solid ${color}40` }}>
              <div className="font-sans text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--foreground-muted))' }}>{label}</div>
              <div className="font-serif text-sm" style={{ color: 'hsl(var(--foreground))' }}>{value}</div>
            </div>
          ))}
        </div>
        <Link href="/about" className="btn-ghost inline-flex items-center gap-2">
          Full profile <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function RegistrationInfo({ color, benefits }: { color: string; benefits: string[] }) {
  return (
    <div className="grid md:grid-cols-3 gap-5 mt-14 pt-12"
      style={{ borderTop: '1px solid hsl(var(--border))' }}>
      <div className="card p-6">
        <h4 className="font-sans font-semibold text-sm mb-4" style={{ color }}>What happens next</h4>
        <ol className="space-y-3">
          {[
            'Submit the form with your RRU email address.',
            'The club mentor reviews within 1-2 working days.',
            'You receive an approval email on your RRU address.',
            'Approved members are added to the club group.',
          ].map((text, n) => (
            <li key={n} className="flex gap-3">
              <span className="font-display font-bold text-sm shrink-0" style={{ color: `${color}60` }}>0{n+1}</span>
              <span className="font-serif text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>{text}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="card p-6">
        <h4 className="font-sans font-semibold text-sm mb-4" style={{ color }}>As a member you get</h4>
        <ul className="space-y-2">
          {benefits.map(item => (
            <li key={item} className="flex gap-2 font-serif text-sm" style={{ color: 'hsl(var(--foreground-muted))' }}>
              <span style={{ color }} className="shrink-0">·</span>{item}
            </li>
          ))}
        </ul>
      </div>
      <div className="card p-6">
        <h4 className="font-sans font-semibold text-sm mb-4" style={{ color }}>Questions?</h4>
        <p className="font-serif text-sm leading-relaxed mb-4" style={{ color: 'hsl(var(--foreground-muted))' }}>
          Contact the club mentor directly at SITAICS, RRU Gandhinagar, or reach out through the EpochZero platform.
        </p>
        <Link href="/about" className="inline-flex items-center gap-1.5 text-sm font-medium hover:gap-2 transition-all" style={{ color }}>
          Contact <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
