import { notFound } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Download, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

interface Props {
  params: { uid: string };
}

export const revalidate = 30;

export async function generateMetadata({ params }: Props) {
  return {
    title: `Verify ${params.uid}`,
    description: 'Verify a REMA Club certificate',
  };
}

export default async function VerifyPage({ params }: Props) {
  const supabase = createClient();
  const { data: cert } = await supabase
    .from('certificates')
    .select('*, tests(title, description)')
    .eq('cert_uid', params.uid.toUpperCase())
    .maybeSingle();

  if (!cert) notFound();

  const revoked = cert.is_revoked;

  return (
    <div className="container py-16 lg:py-24 max-w-3xl">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Certificate verification
      </div>

      <div
        className={`flex items-center gap-3 mb-8 p-4 border-2 ${
          revoked
            ? 'border-crimson-500 bg-crimson-500/10'
            : 'border-gold-500 bg-gold-500/5'
        }`}
      >
        {revoked ? (
          <AlertTriangle className="w-6 h-6 text-crimson-500 shrink-0" />
        ) : (
          <ShieldCheck className="w-6 h-6 text-gold-500 shrink-0" />
        )}
        <div>
          <div
            className={`font-mono text-sm uppercase tracking-wider ${
              revoked ? 'text-crimson-400' : 'text-gold-500'
            }`}
          >
            {revoked ? 'Certificate revoked' : 'Verified authentic'}
          </div>
          {revoked && cert.revoke_reason && (
            <div className="font-serif text-sm text-bone-200 mt-1">
              Reason: {cert.revoke_reason}
            </div>
          )}
        </div>
      </div>

      <div className="card-forensic p-8 lg:p-10">
        <div className="flex items-start gap-6 mb-8">
          <div className="relative w-16 h-16 shrink-0">
            <Image src="/logo.png" alt="REMA Club" fill className="object-contain" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-1">
              REMA Club
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone-300">
              Reverse · Reveal · Respond
            </div>
          </div>
        </div>

        <h1 className="font-mono text-2xl text-bone-50 mb-1">Certificate of Completion</h1>
        <p className="font-serif text-bone-300 mb-8">
          Issued by REMA Club — independent learning initiative
        </p>

        <dl className="space-y-6">
          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1">
              Recipient
            </dt>
            <dd className="font-serif text-2xl text-bone-50">{cert.student_name}</dd>
          </div>

          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1">
              Assessment
            </dt>
            <dd className="font-mono text-base text-bone-50">{cert.test_title}</dd>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1">
                Score
              </dt>
              <dd className="font-mono text-2xl text-gold-500">{cert.score}%</dd>
            </div>
            <div>
              <dt className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1">
                Issued on
              </dt>
              <dd className="font-mono text-base text-bone-50">
                {formatDate(cert.issued_at)}
              </dd>
            </div>
          </div>

          <div>
            <dt className="font-mono text-xs uppercase tracking-wider text-bone-300 mb-1">
              Certificate ID
            </dt>
            <dd className="font-mono text-base text-gold-500">{cert.cert_uid}</dd>
          </div>
        </dl>

        {!revoked && cert.pdf_url && (
          <div className="mt-10 pt-8 border-t border-navy-700">
            <a
              href={cert.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </a>
          </div>
        )}
      </div>

      <p className="font-mono text-xs text-bone-300 mt-6 text-center">
        This page serves as a public record. Anyone with the certificate ID can
        verify its authenticity at this URL.
      </p>
    </div>
  );
}
