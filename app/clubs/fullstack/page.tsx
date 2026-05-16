import Image from 'next/image';
import Link from 'next/link';
import {
  Shield,
  Users,
  Trophy,
  Code2,
  ChevronRight,
  Calendar,
  MapPin,
  ExternalLink,
  Database,
  Cloud,
  Layers,
  Cpu,
  Lock,
  Paintbrush,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { FSDRegistrationForm } from './FSDRegistrationForm';

export const revalidate = 3600;

export const metadata = {
  title: 'Full Stack Development Club — Build. Deploy. Scale.',
  description:
    'The Full Stack Development Club at SITAICS, RRU — mastering end-to-end web and application development through hackathons, workshops, and real-world project sprints.',
};

const FSD_LOGO = 'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/FSD_Club_Logo.png';

export default async function FSDClubPage() {
  const supabase = createClient();

  const clubRes = await supabase.from('clubs').select('*').eq('slug', 'fullstack').single();
  const club = clubRes.data;
  if (!club) return null;

  const [membersRes, eventsRes, projectsRes] = await Promise.all([
    supabase.from('club_members').select('*').eq('club_id', club.id).order('order_index'),
    supabase.from('club_events').select('*').eq('club_id', club.id).eq('is_published', true).order('event_date', { ascending: false }),
    supabase.from('club_projects').select('*').eq('club_id', club.id).eq('is_published', true).order('order_index'),
  ]);

  const members = membersRes.data ?? [];
  const events  = eventsRes.data  ?? [];
  const projects = projectsRes.data ?? [];
  const currentMembers = members.filter(m => m.status === 'current');
  const alumni         = members.filter(m => m.status === 'alumni');

  return (
    <div className="min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-navy-700 bg-navy-950">
        <div className="absolute inset-0 border-grid opacity-30" aria-hidden />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(900px circle at 60% 50%, rgba(255,200,87,0.07), transparent 55%)' }}
          aria-hidden />
        <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-30" aria-hidden />

        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-400 mb-8">
                <Link href="/clubs" className="hover:text-gold-500 transition-colors">Tech Clubs</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gold-500">Full Stack Development Club</span>
              </div>

              <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
                // SITAICS · Rashtriya Raksha University
              </div>

              <h1 className="font-mono text-5xl lg:text-6xl font-bold text-bone-50 leading-[0.95] mb-4">
                Full Stack<br />
                <span className="text-gold-500">Dev Club</span>
              </h1>

              <p className="font-mono text-lg text-bone-300 tracking-[0.2em] uppercase mb-6">
                Build. Deploy. Scale.
              </p>

              <p className="font-serif text-lg text-bone-200 leading-relaxed max-w-lg mb-10">
                {club.description}
              </p>

              <div className="flex flex-wrap gap-4">
                <a href="#register" className="btn-primary">
                  <Code2 className="w-4 h-4" />
                  Join the Club
                </a>
                <a href="#events" className="btn-ghost">
                  <Trophy className="w-4 h-4" />
                  Our Hackathons
                </a>
              </div>

              <div className="mt-12 flex gap-8 font-mono">
                <div className="border-l-2 border-gold-500 pl-4">
                  <div className="text-2xl font-bold text-bone-50">{members.length}</div>
                  <div className="text-xs uppercase tracking-wider text-bone-400">Members</div>
                </div>
                <div className="border-l-2 border-gold-500 pl-4">
                  <div className="text-2xl font-bold text-bone-50">{events.length || '—'}</div>
                  <div className="text-xs uppercase tracking-wider text-bone-400">Events</div>
                </div>
                <div className="border-l-2 border-gold-500 pl-4">
                  <div className="text-2xl font-bold text-bone-50">{club.founded_year}</div>
                  <div className="text-xs uppercase tracking-wider text-bone-400">Founded</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute inset-0 rounded-full blur-3xl opacity-20 bg-gold-500"
                  style={{ transform: 'scale(1.2)' }} />
                <Image src={FSD_LOGO} alt="Full Stack Development Club Logo"
                  width={320} height={320} className="relative drop-shadow-2xl" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT + ACTIVITIES ────────────────────────────────────────── */}
      <section className="container py-20 border-b border-navy-700">
        <div className="grid lg:grid-cols-2 gap-16">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Charter</div>
            <h2 className="font-mono text-3xl font-bold text-bone-50 mb-6">About the club</h2>
            <div className="border-l-2 border-gold-500/40 pl-6 font-serif text-bone-200 leading-relaxed space-y-4">
              <p>{club.charter}</p>
              <p>
                The club is mentored by{' '}
                <span className="text-gold-500 font-mono">{club.mentor_name}</span>,{' '}
                {club.mentor_title}, and operates under the School of Information
                Technology, Artificial Intelligence and Cyber Security (SITAICS).
              </p>
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Activities</div>
            <h2 className="font-mono text-3xl font-bold text-bone-50 mb-6">What we do</h2>
            <div className="space-y-3">
              {[
                { icon: Trophy,     label: 'Code-to-Cloud hackathons and 24-hour sprint competitions'                   },
                { icon: Layers,     label: 'Workshops on modern stacks — MERN, Python/Django, Next.js'                  },
                { icon: Database,   label: 'Database design and API architecture deep dives'                            },
                { icon: Cloud,      label: 'DevOps, Docker/Kubernetes, and cloud deployment training'                   },
                { icon: Paintbrush, label: 'UI/UX design principles and responsive web development'                     },
                { icon: Lock,       label: 'Secure coding practices and web application security'                       },
                { icon: Cpu,        label: 'Architecture teardowns — dissecting platforms like Netflix and Uber'        },
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

      {/* ── CURRENT MEMBERS ───────────────────────────────────────────── */}
      <section className="container py-20 border-b border-navy-700">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Active</div>
        <h2 className="font-mono text-3xl font-bold text-bone-50 mb-10">Current members</h2>

        {currentMembers.length === 0 ? (
          <p className="font-mono text-sm text-bone-400">No current members listed yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentMembers.map(m => (
              <div key={m.id} className="card-forensic p-6 border-gold-500/20 hover:border-gold-500/50 transition-colors">
                <div className="w-14 h-14 border-2 border-gold-500/40 bg-navy-800 flex items-center justify-center mb-4 font-mono text-xl text-gold-500 font-bold">
                  {m.name.replace(/Mr\.|Ms\./, '').trim().charAt(0)}
                </div>
                <div className="font-mono text-base text-bone-50 mb-1">{m.name}</div>
                <div className="font-mono text-xs text-gold-500 uppercase tracking-wider mb-1">{m.role}</div>
                <div className="font-mono text-xs text-bone-400">{m.program}</div>
                <div className="font-mono text-xs text-bone-400">{m.batch_year}</div>
                <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 border border-gold-500/30 bg-gold-500/5">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gold-500">Active</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── ALUMNI (only shown if any exist) ──────────────────────────── */}
      {alumni.length > 0 && (
        <section className="container py-20 border-b border-navy-700">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Past members</div>
          <h2 className="font-mono text-3xl font-bold text-bone-50 mb-10">Alumni</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {alumni.map(m => (
              <div key={m.id} className="p-5 border border-navy-700 hover:border-navy-600 transition-colors">
                <div className="w-10 h-10 border border-navy-600 bg-navy-800 flex items-center justify-center mb-3 font-mono text-base text-bone-300 font-bold">
                  {m.name.replace(/Mr\.|Ms\./, '').trim().charAt(0)}
                </div>
                <div className="font-mono text-sm text-bone-100 mb-1">{m.name}</div>
                <div className="font-mono text-xs text-bone-400">{m.program}</div>
                <div className="font-mono text-xs text-bone-400">{m.batch_year}</div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-bone-500">Alumni</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── EVENTS ────────────────────────────────────────────────────── */}
      <section id="events" className="container py-20 border-b border-navy-700 scroll-mt-20">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Competitions</div>
        <h2 className="font-mono text-3xl font-bold text-bone-50 mb-10">Hackathons & Events</h2>

        {events.length === 0 ? (
          <div className="border border-dashed border-navy-700 p-12 text-center">
            <Trophy className="w-10 h-10 text-gold-500/30 mx-auto mb-4" />
            <p className="font-mono text-sm text-bone-300">
              Our first hackathon is being planned. Watch this space.
            </p>
            <p className="font-mono text-xs text-bone-400 mt-2">
              Code-to-Cloud Sprint — coming soon
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((ev, i) => (
              <div key={ev.id} className="card-forensic p-8 hover:border-gold-500/40 transition-colors">
                <div className="grid lg:grid-cols-[1fr_200px] gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-gold-500/60 text-gold-500 bg-gold-500/5">
                        {ev.event_type?.toUpperCase()}
                      </span>
                      <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                        ev.status === 'upcoming'
                          ? 'border-green-500/60 text-green-400 bg-green-500/5'
                          : 'border-navy-600 text-bone-400'
                      }`}>{ev.status}</span>
                    </div>
                    <h3 className="font-mono text-2xl font-bold text-bone-50 mb-1">{ev.title}</h3>
                    {ev.subtitle && <p className="font-mono text-sm text-gold-500/80 mb-4">{ev.subtitle}</p>}
                    {ev.description && <p className="font-serif text-bone-200 leading-relaxed">{ev.description}</p>}
                  </div>
                  <div className="flex flex-col gap-3 font-mono text-xs text-bone-400 lg:text-right">
                    {ev.event_date && (
                      <span className="inline-flex items-center gap-1.5 lg:justify-end">
                        <Calendar className="w-3 h-3 text-gold-500" />
                        {new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                    {ev.venue && (
                      <span className="inline-flex items-center gap-1.5 lg:justify-end">
                        <MapPin className="w-3 h-3 text-gold-500" />
                        {ev.venue}
                      </span>
                    )}
                    {ev.report_url && (
                      <a href={ev.report_url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 lg:justify-end text-gold-500 hover:text-gold-400 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        View report
                      </a>
                    )}
                    <div className="font-mono text-4xl font-bold text-navy-700 lg:text-right mt-auto">
                      #{String(events.length - i).padStart(2, '0')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── PROJECTS ──────────────────────────────────────────────────── */}
      <section className="container py-20 border-b border-navy-700">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Research & Development</div>
        <h2 className="font-mono text-3xl font-bold text-bone-50 mb-10">Projects</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {projects.map(p => (
            <div key={p.id} className="card-forensic p-8 hover:border-gold-500/40 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className={`font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border ${
                  p.status === 'active'
                    ? 'border-gold-500/60 text-gold-500 bg-gold-500/5'
                    : 'border-navy-600 text-bone-400'
                }`}>{p.status}</span>
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                    className="text-bone-400 hover:text-gold-500 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <h3 className="font-mono text-xl font-bold text-bone-50 mb-3">{p.title}</h3>
              <p className="font-serif text-bone-200 leading-relaxed mb-6">{p.description}</p>
              {Array.isArray(p.tech_stack) && p.tech_stack.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {p.tech_stack.map((t: string) => (
                    <span key={t} className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-navy-600 text-bone-400 bg-navy-800">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── MENTOR ────────────────────────────────────────────────────── */}
      <section className="border-b border-navy-700 bg-navy-950/60">
        <div className="container py-20">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Leadership</div>
          <h2 className="font-mono text-3xl font-bold text-bone-50 mb-10">Club mentor</h2>

          <div className="border border-gold-500/30 bg-navy-900 grid lg:grid-cols-[280px_1fr] overflow-hidden">
            <div className="bg-navy-800 border-b lg:border-b-0 lg:border-r border-gold-500/20 p-10 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 border-2 border-gold-500 bg-navy-950 flex items-center justify-center font-mono text-4xl text-gold-500 font-bold mb-6">
                AR
              </div>
              <div className="font-mono text-xl font-bold text-bone-50 mb-1">{club.mentor_name}</div>
              <div className="font-mono text-xs text-gold-500 uppercase tracking-wider mb-4">{club.mentor_title}</div>
              <div className="flex flex-col gap-1.5 font-mono text-[10px] uppercase tracking-wider text-bone-400">
                <span className="px-2 py-0.5 border border-navy-600 bg-navy-900">Researcher · ML &amp; Malware Analysis</span>
                <span className="px-2 py-0.5 border border-navy-600 bg-navy-900">Club Founder &amp; Mentor</span>
              </div>
            </div>
            <div className="p-10">
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-6">// About the mentor</div>
              <p className="font-serif text-bone-200 leading-relaxed mb-6 text-lg">
                Founder and mentor of the Full Stack Development Club at SITAICS, Rashtriya Raksha University.
                An active researcher in machine learning and cybersecurity, with extensive experience teaching
                and building full-stack applications. Brings industry-grade development practices directly into
                the classroom through the club's hands-on, project-first approach.
              </p>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {[
                  { label: 'Teaching domains',     value: 'Malware Analysis, Cloud Security, Cryptography, Web Dev' },
                  { label: 'Training engagements', value: 'Bharat NCX, SEBI, MHA, Gujarat Police, Nepal Police (ITEC)' },
                  { label: 'Club focus',           value: 'Full-stack development, secure coding, cloud deployment' },
                  { label: 'Institution',          value: 'SITAICS, Rashtriya Raksha University, Gandhinagar' },
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

      {/* ── REGISTRATION ──────────────────────────────────────────────── */}
      <section id="register" className="container py-20 scroll-mt-20">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-3">// Membership</div>
        <h2 className="font-mono text-3xl font-bold text-bone-50 mb-3">Join the Full Stack Development Club</h2>
        <p className="font-serif text-bone-200 max-w-2xl mb-12 leading-relaxed">
          Registration is open to all students of Rashtriya Raksha University. You must use your
          official RRU email address (<span className="font-mono text-gold-500 text-sm">@student.rru.ac.in</span>{' '}
          or <span className="font-mono text-gold-500 text-sm">@rru.ac.in</span>) to register.
          Registrations are reviewed by the club mentor and you will be notified on your RRU email once approved.
        </p>

        <FSDRegistrationForm clubId={club.id} clubName={club.name} />

        <div className="grid md:grid-cols-3 gap-6 mt-16 pt-12 border-t border-navy-700">
          <div className="border border-navy-700 bg-navy-900 p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-gold-500 mb-4">What happens next</div>
            <ol className="space-y-4">
              {[
                { n: '01', text: 'Submit the form with your RRU email address.' },
                { n: '02', text: 'The club mentor reviews your application within 1-2 working days.' },
                { n: '03', text: 'You receive an approval email on your RRU address.' },
                { n: '04', text: 'Approved members are added to the club group and invited to the next session.' },
              ].map(({ n, text }) => (
                <li key={n} className="flex gap-3">
                  <span className="font-mono text-base text-gold-500/40 font-bold shrink-0 leading-tight">{n}</span>
                  <span className="font-serif text-sm text-bone-200 leading-relaxed">{text}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="border border-navy-700 bg-navy-900 p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-gold-500 mb-4">As a member you get</div>
            <ul className="space-y-2 font-serif text-sm text-bone-200">
              {[
                'Access to exclusive hackathon challenges',
                'Hands-on full-stack project sprints',
                'Mentorship from faculty and industry professionals',
                'Architecture teardown and briefing sessions',
                'Certificate of membership and participation',
                'Portfolio-ready real-world projects',
              ].map(item => (
                <li key={item} className="flex gap-2">
                  <span className="text-gold-500 shrink-0">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-navy-700 bg-navy-900 p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-gold-500 mb-4">Questions?</div>
            <p className="font-serif text-sm text-bone-200 leading-relaxed mb-4">
              Contact the club mentor directly at SITAICS, RRU Gandhinagar, or reach out through the EpochZero platform.
            </p>
            <Link href="/about"
              className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-gold-500 hover:text-gold-400 transition-colors">
              Contact <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
