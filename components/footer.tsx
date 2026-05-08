import Link from 'next/link';
import Image from 'next/image';
import { Github, Youtube, Instagram, Mail, Globe } from 'lucide-react';

const FOOTER_LINKS = {
  Learn: [
    { href: '/learn', label: '4Q Course View' },
    { href: '/articles', label: 'Articles' },
    { href: '/videos', label: 'Video Walkthroughs' },
    { href: '/tests', label: 'MCQ Tests' },
    { href: '/resources', label: 'Resources' },
  ],
  Connect: [
    { href: '/podcast', label: 'Podcast' },
    { href: '/about', label: 'About' },
    { href: '/verify', label: 'Verify Certificate' },
  ],
};

const SOCIALS = [
  { href: 'https://www.youtube.com/@EpochZeroNet', icon: Youtube, label: 'YouTube' },
  { href: 'https://www.instagram.com/epochzero.net', icon: Instagram, label: 'Instagram' },
  { href: 'https://github.com/agr3012', icon: Github, label: 'GitHub' },
  { href: 'mailto:epochzero.net@gmail.com', icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-navy-700 bg-navy-950 mt-24">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image src="/logo.png" alt="EpochZero Learn" width={48} height={48} />
              <div>
                <div className="font-mono text-lg font-bold text-bone-50">EpochZero Learn</div>
                <div className="font-mono text-xs tracking-[0.3em] text-gold-500 uppercase">
                  Multi-Domain Tech Learning Hub
                </div>
              </div>
            </Link>
            <p className="font-serif text-bone-200 max-w-sm leading-relaxed">
              A learning and event platform for Reverse Engineering, Malware Analysis,
              Cloud, Cryptography, and Web Development. Articles, video lessons, tests
              with verifiable certificates, and student events.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="p-2 border border-navy-700 hover:border-gold-500 text-bone-200 hover:text-gold-500 transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-gold-500 mb-4">
                {heading}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-mono text-sm text-bone-200 hover:text-gold-500 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 border-t border-navy-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-xs text-bone-300">
            © {new Date().getFullYear()} EpochZero Learn. Educational content for learning purposes.
          </p>
          <p className="font-mono text-xs text-bone-300">
            Course Instructor: Ashish Revar · v1.0
          </p>
        </div>
      </div>
    </footer>
  );
}
