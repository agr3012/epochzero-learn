import Link from 'next/link';
import Image from 'next/image';
import { Shield, ChevronRight, Users, Trophy } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 3600;
export const metadata = { title: 'Tech Clubs — EpochZero Learn' };

export default async function ClubsIndexPage() {
  const supabase = createClient();
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*, club_members(count), club_events(count)')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  return (
    <div className="container py-16 lg:py-24">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="w-5 h-5 text-gold-500" />
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
          // Student Communities
        </div>
      </div>

      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Tech Clubs
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Specialized technical clubs at SITAICS, RRU — hands-on communities for students
        who want to go beyond the classroom. CTF competitions, research projects, and
        workshops led by faculty mentors.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* REMA Club — live */}
        <Link
          href="/clubs/rema"
          className="card-forensic overflow-hidden group hover:border-gold-500/40 transition-colors"
        >
          <div className="p-8 flex items-start gap-6">
            <Image
              src="https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/REMA_Club_Logo.png"
              alt="REMA Club"
              width={80}
              height={80}
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-gold-500 mb-2">
                Active · SITAICS · RRU
              </div>
              <h2 className="font-mono text-2xl font-bold text-bone-50 mb-1 group-hover:text-gold-500 transition-colors">
                REMA Club
              </h2>
              <p className="font-mono text-sm text-bone-400 mb-3 italic">
                Reverse. Reveal. Respond.
              </p>
              <p className="font-serif text-sm text-bone-200 leading-relaxed mb-4 line-clamp-2">
                A specialized technical club for Reverse Engineering and Malware Analysis.
                CTF events, hands-on workshops, and research projects.
              </p>
              <div className="flex items-center gap-4 font-mono text-xs text-bone-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-gold-500" />
                  12 members
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Trophy className="w-3 h-3 text-gold-500" />
                  2 CTF events
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-bone-400 group-hover:text-gold-500 transition-colors shrink-0 mt-1" />
          </div>
        </Link>

        {/* Full Stack Club — coming soon */}
        <div className="card-forensic overflow-hidden opacity-60 border-navy-700">
          <div className="p-8 flex items-start gap-6">
            <div className="w-20 h-20 border-2 border-navy-600 bg-navy-800 flex items-center justify-center shrink-0 font-mono text-2xl text-navy-500 font-bold">
              FS
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-bone-500 mb-2">
                Coming soon · SITAICS · RRU
              </div>
              <h2 className="font-mono text-2xl font-bold text-bone-400 mb-1">
                Full Stack Development Club
              </h2>
              <p className="font-mono text-sm text-bone-500 mb-3 italic">
                Build. Ship. Scale.
              </p>
              <p className="font-serif text-sm text-bone-400 leading-relaxed line-clamp-2">
                A club for full-stack web development, AI tool integration, and modern
                software engineering. Projects, hackathons, and industry mentorship.
              </p>
              <div className="mt-4 inline-block font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 border border-navy-600 text-bone-500">
                Registration opening soon
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
