import { ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'About',
  description:
    'About EpochZero Learn — a multi-domain learning and event platform for Reverse Engineering, Cloud, Cryptography, and Web Development.',
};

export default function AboutPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-4xl">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // About
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-8 leading-tight">
        A multi-domain learning and event platform.
      </h1>

      <div className="prose-rema">
        <p>
          <strong className="text-bone-50">EpochZero Learn</strong> is an independent
          educational platform covering technical learning, assessments, and student
          events. The platform brings together articles, video lessons, podcasts,
          downloadable resources, MCQ assessments with verifiable certificates, and
          internal CTF events &mdash; all under a single roof.
        </p>

        <h2>Domains we cover</h2>
        <ul>
          <li>
            <strong>Reverse Engineering &amp; Malware Analysis (REMA)</strong> &mdash;
            static and dynamic analysis, unpacking, anti-debugging, memory forensics.
          </li>
          <li>
            <strong>Cloud</strong> &mdash; cloud security, architecture, DevOps,
            container and Kubernetes operations.
          </li>
          <li>
            <strong>Cryptography</strong> &mdash; symmetric and asymmetric
            cryptography, protocols, applied cryptanalysis.
          </li>
          <li>
            <strong>Web Development</strong> &mdash; modern full-stack development,
            frontend frameworks, backend systems, AI integration.
          </li>
          <li>
            More domains will be added as the platform grows.
          </li>
        </ul>

        <h2>What you get</h2>
        <ul>
          <li>
            <strong>Articles &amp; writeups</strong> &mdash; technical deep-dives
            across every domain.
          </li>
          <li>
            <strong>Video lessons</strong> &mdash; YouTube-embedded lessons paired
            with synchronised lab notes, references, and exercises.
          </li>
          <li>
            <strong>Podcast</strong> &mdash; on-the-go audio discussions on each
            domain&apos;s tradecraft and current developments.
          </li>
          <li>
            <strong>Downloadable resources</strong> &mdash; eBooks, cheatsheets,
            question banks. Free.
          </li>
          <li>
            <strong>MCQ tests with verifiable certificates</strong> &mdash; pass an
            assessment, receive a PDF certificate by email with a unique verification
            URL. Open to anyone.
          </li>
          <li>
            <strong>CTF events</strong> &mdash; internal Capture-the-Flag events for
            our students with participation and winner certificates.
          </li>
        </ul>

        <h2>Founder &amp; Course Instructor</h2>
        <p>
          <strong className="text-bone-50">Ashish Revar</strong> is an Assistant
          Professor of Computer Science and Cyber Security with over fifteen years
          across teaching, research, and applied cybersecurity practice. He teaches
          Reverse Engineering, Malware Analysis, Cloud, and Cybersecurity courses to
          undergraduate and postgraduate students, and delivers training to
          law-enforcement, defence, and government agencies. PhD research focuses on
          machine-learning-based automatic YARA rule generation for cloud malware
          detection.
        </p>

        <h2>Open vs. internal access</h2>
        <p>
          Articles, video lessons, podcasts, downloadable resources, and MCQ tests on
          this platform are <strong className="text-bone-50">open to anyone</strong>{' '}
          &mdash; no registration paywall. CTF events and certain instructor-led
          activities are reserved for our institutional students.
        </p>

        <h2>Connect</h2>
        <ul>
          <li>
            <a
              href="https://www.youtube.com/@EpochZeroNet"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube channel <ExternalLink className="inline w-3 h-3" />
            </a>
          </li>
          <li>
            <a
              href="https://www.instagram.com/epochzero.net"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram <ExternalLink className="inline w-3 h-3" />
            </a>
          </li>
          <li>
            <a
              href="mailto:epochzero.net@gmail.com"
            >
              Email <ExternalLink className="inline w-3 h-3" />
            </a>
          </li>
        </ul>

        <h2>A note on certificates</h2>
        <p>
          EpochZero Learn is an independent learning platform. Certificates issued by
          this portal are credentials of completion for our publicly available
          assessments and CTF events &mdash; they reflect the knowledge tested or the
          participation recognised, but they are not institutional academic
          credentials and do not represent any specific university or government
          body. Each certificate carries a unique identifier and a public
          verification URL so anyone can validate authenticity.
        </p>
      </div>
    </div>
  );
}
