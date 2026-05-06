import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'About',
  description:
    'About REMA Club — a learning hub for Reverse Engineering and Malware Analysis.',
};

export default function AboutPage() {
  return (
    <div className="container py-16 lg:py-24 max-w-4xl">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // About
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-8 leading-tight">
        Built for serious students of malware.
      </h1>

      <div className="prose-rema">
        <p>
          <strong className="text-bone-50">REMA Club</strong> is an independent
          educational initiative for Reverse Engineering and Malware Analysis. The hub
          combines written articles, video walkthroughs, an eBook, a 360-question
          bank, and validated MCQ assessments — designed for learners moving from
          theory into hands-on analysis of real samples.
        </p>

        <h2>What you get</h2>
        <ul>
          <li>
            <strong>REMA eBook 2026</strong> — six-unit, ~135-page reference covering
            static and dynamic analysis fundamentals through advanced unpacking.
          </li>
          <li>
            <strong>Question Bank (360 questions)</strong> and{' '}
            <strong>MCQ Bank (120 questions)</strong>, mapped to Course Outcomes and
            Bloom's Taxonomy levels.
          </li>
          <li>
            <strong>Cheatsheet</strong> — concise quick-reference for analysts.
          </li>
          <li>
            <strong>Video walkthroughs</strong> of real samples: njRAT, Jigsaw,
            Qakbot and others — embedded with synchronized step-by-step notes.
          </li>
          <li>
            <strong>MCQ tests with verifiable certificates</strong>. Pass once, get a
            unique cert ID and a public verification URL.
          </li>
        </ul>

        <h2>Course Instructor</h2>
        <p>
          <strong className="text-bone-50">Ashish Gahlot</strong> teaches Reverse
          Engineering and Malware Analysis (REMA) across postgraduate and undergraduate
          programmes and delivers training to law-enforcement and government agencies.
          Areas of work include malware analysis, cloud security, and ML-based
          detection. PhD research focuses on automatic YARA rule generation for cloud
          malware detection.
        </p>

        <h2>Connect</h2>
        <ul>
          <li>
            <a href="https://epochzero.net" target="_blank" rel="noopener noreferrer">
              EpochZero — research blog & media{' '}
              <ExternalLink className="inline w-3 h-3" />
            </a>
          </li>
          <li>
            <a
              href="https://www.youtube.com/@epochzero"
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
        </ul>

        <h2>A note on certificates</h2>
        <p>
          REMA Club is an independent learning initiative. Certificates issued by this
          portal are credentials of completion for our publicly available assessments
          and reflect the knowledge tested by those assessments. They are not
          institutional academic credentials and do not represent any specific
          university or government body. Each certificate carries a unique
          identifier and a public verification URL so anyone can validate authenticity.
        </p>
      </div>
    </div>
  );
}
