// components/footer.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Youtube, Mail, Github } from 'lucide-react';

const LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

const LINKS = {
  Learn: [
    { label: 'Learning Path',   href: '/learn' },
    { label: 'All Articles',    href: '/articles' },
    { label: 'Video Lessons',   href: '/videos' },
    { label: 'Podcast',         href: '/podcast' },
    { label: 'eBooks & PDFs',   href: '/resources?type=ebook' },
    { label: 'Question Banks',  href: '/resources?type=question-bank' },
    { label: 'Cheatsheets',     href: '/resources?type=cheatsheet' },
    { label: 'MCQ Banks',       href: '/resources?type=mcq-bank' },
    { label: 'Research Papers', href: '/resources?type=research-paper' },
  ],
  'Tests & Forum': [
    { label: 'All Tests',       href: '/tests' },
    { label: 'REMA Tests',      href: '/tests?domain=rema' },
    { label: 'Cloud Tests',     href: '/tests?domain=cloud' },
    { label: 'Forum',           href: '/forum' },
    { label: 'REMA Forum',      href: '/forum/rema' },
    { label: 'Cloud Forum',     href: '/forum/cloud' },
  ],
  Campus: [
    { label: 'REMA Club',           href: '/clubs/rema' },
    { label: 'Full Stack Dev Club', href: '/clubs/fullstack' },
    { label: 'Events',              href: '/events' },
    { label: 'CTF Competitions',    href: '/events?type=ctf' },
    { label: 'Workshops',           href: '/events?type=workshop' },
    { label: 'Industrial Visits',   href: '/events?type=industry' },
  ],
  Platform: [
    { label: 'Dashboard',           href: '/dashboard' },
    { label: 'About',               href: '/about' },
    { label: 'Verify Certificate',  href: '/verify-certificate' },
  ],
};

const SOCIALS = [
  { icon: Youtube, href: 'https://youtube.com/@EpochZeroNet',    label: 'YouTube' },
  { icon: Mail,    href: 'mailto:epochzero.net@gmail.com',        label: 'Email' },
  { icon: Github,  href: 'https://github.com/agr3012',            label: 'GitHub' },
];

export function Footer() {
  return (
    <footer className="bg-navy-950 border-t border-navy-800 mt-auto">
      <div className="container py-12">

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">

          {/* Brand — spans 2 cols on lg */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src={LOGO} alt="EpochZero" width={36} height={36} className="rounded" />
              <div className="leading-none">
                <div className="font-mono text-sm font-bold text-bone-50">EpochZero Learn</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-500 mt-0.5">
                  Multi-Domain Tech Learning Hub
                </div>
              </div>
            </Link>
            <p className="font-mono text-xs text-bone-400 leading-relaxed mb-5 max-w-xs">
              Structured learning for Reverse Engineering, Cloud Security, Cryptography,
              and Web Development. Articles, videos, tests, and peer discussion.
            </p>
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="p-2 border border-navy-700 text-bone-400
                    hover:border-gold-500/50 hover:text-gold-500 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em]
                text-gold-500 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="font-mono text-xs text-bone-400
                        hover:text-bone-100 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-navy-800 flex flex-col md:flex-row
          items-start md:items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-bone-500">
            © {new Date().getFullYear()} EpochZero Learn. Educational content for learning purposes.
          </p>
          <p className="font-mono text-[11px] text-bone-500">
            Course Instructor: Ashish Revar
          </p>
        </div>
      </div>
    </footer>
  );
}
