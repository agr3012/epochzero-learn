import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Download, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from('resources')
    .select('title, description')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!data) return { title: 'Resource Not Found' };
  return { title: data.title, description: data.description };
}

function isDriveId(v: string) {
  return /^[A-Za-z0-9_-]{20,60}$/.test(v);
}

function urls(fileUrl: string) {
  if (isDriveId(fileUrl)) {
    return {
      preview: `https://drive.google.com/file/d/${fileUrl}/preview`,
      download: `https://drive.google.com/uc?export=download&id=${fileUrl}`,
      external: `https://drive.google.com/file/d/${fileUrl}/view`,
    };
  }
  return { preview: fileUrl, download: fileUrl, external: fileUrl };
}

export default async function ResourceReaderPage({ params }: Props) {
  const supabase = createClient();
  const { data: r } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!r) notFound();

  const { preview, download, external } = urls(r.file_url);

  return (
    <div className="min-h-screen flex flex-col scrollbar-themed">
      <div className="border-b border-navy-700 bg-navy-950 sticky top-0 z-10">
        <div className="container py-3 flex items-center gap-3 flex-wrap">
          <Link
            href="/resources"
            className="font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 transition-colors inline-flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="hidden md:block w-px h-5 bg-navy-700" />
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-wider text-gold-500">
              {r.type}
            </div>
            <div className="font-mono text-sm text-bone-50 truncate">{r.title}</div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={external}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open</span>
            </a>
            <a
              href={download}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-navy-950 overflow-y-auto scrollbar-themed">
        <iframe
          src={preview}
          title={r.title}
          className="w-full h-[calc(100vh-65px)]"
          allow="autoplay"
        />
      </div>
    </div>
  );
}
