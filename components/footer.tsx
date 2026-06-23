// components/footer.tsx
// Server component — NO event handlers allowed
// All hover effects use Tailwind hover: classes (static CSS, no JS)
import Link from 'next/link';
import Image from 'next/image';
import { Youtube, Mail, Github } from 'lucide-react';

const LOGO =
  'https://nqyruorkiqaomqzgixgo.supabase.co/storage/v1/object/public/club/EpochZeroLogo.png';

const LINKS = {
  Learn: [
    { label: 'Learning Path',   href: '/learn'                          },
    { label: 'All Articles',    href: '/articles'                       },
    { label: 'Video Lessons',   href: '/videos'                         },
    { label: 'Podcast',         href: '/podcast'                        },
    { label: 'eBooks & PDFs',   href: '/resources?type=ebook'           },
    { label: 'Question Banks',  href: '/resources?type=question-bank'   },
    { label: 'Cheatsheets',     href: '/resources?type=cheatsheet'      },
    { label: 'MCQ Banks',       href: '/resources?type=mcq-bank'        },
  ],
  'Tests & Forum': [
    { label: 'All Tests',       href: '/tests'                          },
    { label: 'REMA Tests',      href: '/tests?domain=rema'              },
    { label: 'Cloud Tests',     href: '/tests?domain=cloud'             },
    { label: 'Forum',           href: '/forum'                          },
    { label: 'REMA Forum',      href: '/forum/rema'                     },
    { label: 'Cloud Forum',     href: '/forum/cloud'                    },
  ],
  Campus: [
    { label: 'REMA Club',           href: '/clubs/rema'                     },
    { label: 'Full Stack Dev Club', href: '/clubs/fullstack'                },
    { label: 'Events',              href: '/events'                         },
    { label: 'CTF Competitions',    href: '/events?type=ctf'                },
    { label: 'Workshops',           href: '/events?type=workshop'           },
    { label: 'Industrial Visits',   href: '/events?type=industry'           },
  ],
  Platform: [
    { label: 'Dashboard',          href: '/dashboard'                       },
    { label: 'About',              href: '/about'                           },
    { label: 'Verify Certificate', href: '/verify-certificate'              },
  ],
};

const SOCIALS = [
  { icon: Youtube, href: 'https://youtube.com/@EpochZeroNet', label: 'YouTube' },
  { icon: Mail,    href: 'mailto:epochzero.net@gmail.com',     label: 'Email'   },
  { icon: Github,  href: 'https://github.com/agr3012',         label: 'GitHub'  },
];

export function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: 'hsl(var(--surface))',
        borderTop:  '1px solid hsl(var(--border))',
      }}
    >
      <div className="container py-12 lg:py-14">

        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <Image src={LOGO} alt="EpochZero" width={34} height={34} className="rounded-md" />
              <div className="leading-none">
                <div className="font-sans text-sm font-bold"
                  style={{ color: 'hsl(var(--foreground))' }}>
                  EpochZero Learn
                </div>
                <div className="text-[11px] mt-0.5"
                  style={{ color: 'hsl(var(--foreground-muted))' }}>
                  Multi-Domain Tech Learning Hub
                </div>
              </div>
            </Link>

            <p className="text-sm leading-relaxed mb-6 max-w-xs"
              style={{ color: 'hsl(var(--foreground-muted))' }}>
              Structured learning for Reverse Engineering, Cloud Security,
              Cryptography, and Web Development. Articles, videos, tests,
              and peer discussion.
            </p>

            {/* Social icons — hover via Tailwind class only, no JS */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="w-8 h-8 flex items-center justify-center rounded-md
                    transition-colors
                    hover:text-[hsl(var(--foreground))]
                    hover:border-[hsl(var(--border-strong))]"
                  style={{
                    color:      'hsl(var(--foreground-muted))',
                    background: 'hsl(var(--card))',
                    border:     '1px solid hsl(var(--border))',
                  }}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* ── Link columns ── */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="font-sans font-semibold text-xs uppercase tracking-wide mb-4"
                style={{ color: 'hsl(var(--foreground-muted))' }}>
                {heading}
              </h3>
              <ul className="space-y-2.5">
                {links.map(link => (
                  <li key={link.href}>
                    {/* hover:text uses Tailwind — static CSS, no event handlers */}
                    <Link
                      href={link.href}
                      className="text-sm transition-colors
                        hover:text-[hsl(var(--foreground))]"
                      style={{ color: 'hsl(var(--foreground-muted))' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="pt-6 flex flex-col md:flex-row items-start md:items-center
            justify-between gap-2"
          style={{ borderTop: '1px solid hsl(var(--border))' }}
        >
          <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            © {new Date().getFullYear()} EpochZero Learn.
            Educational content for learning purposes.
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--foreground-subtle))' }}>
            Course Instructor: Ashish Revar
          </p>
        </div>
      </div>
    </footer>
  );
}
