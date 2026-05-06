'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight } from 'lucide-react';

export default function VerifyIndexPage() {
  const router = useRouter();
  const [uid, setUid] = useState('');

  return (
    <div className="container py-16 lg:py-24 max-w-2xl">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Verification
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Verify a certificate
      </h1>
      <p className="font-serif text-lg text-bone-200 leading-relaxed mb-12">
        Enter the certificate ID printed on the document. The format is{' '}
        <span className="font-mono text-gold-500">REMA-YYYY-XXXXXX</span>.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = uid.trim().toUpperCase();
          if (v) router.push(`/verify/${encodeURIComponent(v)}`);
        }}
        className="card-forensic p-8"
      >
        <label className="block mb-6">
          <span className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-2 block">
            Certificate ID
          </span>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bone-300" />
            <input
              type="text"
              value={uid}
              onChange={(e) => setUid(e.target.value.toUpperCase())}
              placeholder="REMA-2026-XXXXXX"
              className="w-full bg-navy-950 border border-navy-700 focus:border-gold-500 pl-10 pr-4 py-3 font-mono text-base text-bone-100 outline-none transition-colors uppercase tracking-wider"
              autoFocus
            />
          </div>
        </label>
        <button type="submit" className="btn-primary w-full justify-center">
          Verify <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
