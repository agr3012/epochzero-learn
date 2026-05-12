import {
  FileText,
  Download,
  BookOpen,
  ListChecks,
  FileSpreadsheet,
  Beaker,
  GraduationCap,
  FileSearch,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatBytes } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Resources' };

interface Props {
  searchParams: { domain?: string; type?: string };
}

const ICON_MAP: Record<string, any> = {
  'eBook': BookOpen,
  'Question Bank': ListChecks,
  'Cheatsheet': FileSpreadsheet,
  'MCQ Bank': GraduationCap,
  'Lab Manual': Beaker,
  'Article': FileText,
  'Research Paper': FileSearch,
  'Presentation': FileText,
};

function isDriveFileId(value: string): boolean {
  // Drive file IDs are 25–44 chars, alphanumeric plus _-
  return /^[A-Za-z0-9_-]{20,60}$/.test(value);
}

function buildDriveUrls(fileUrl: string) {
  // If file_url is just a Drive ID, derive preview + download URLs
  if (isDriveFileId(fileUrl)) {
    return {
      preview: `https://drive.google.com/file/d/${fileUrl}/preview`,
      download: `https://drive.google.com/uc?export=download&id=${fileUrl}`,
    };
  }
  // Otherwise treat it as a direct URL (e.g., Supabase Storage later)
  return { preview: fileUrl, download: fileUrl };
}

export default async function ResourcesPage({ searchParams }: Props) {
  const supabase = createClient();
  const activeDomain = searchParams.domain ?? null;
  const activeType = searchParams.type ?? null;

  let query = supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  if (activeDomain) {
    query = query.eq('domain', activeDomain);
  }

  const { data: allResources } = await query;
  const resources = allResources ?? [];

  // Derive unique types from the filtered set (dynamic chips)
  const types = Array.from(
    new Set(resources.map((r) => r.type).filter((t): t is string => !!t))
  ).sort();

  // Apply type filter in-memory (so type chips stay visible after filtering)
  const filtered = activeType
    ? resources.filter((r) => r.type === activeType)
    : resources;

  // Build URL preserving the domain param when switching types
  const buildHref = (typeParam: string | null) => {
    const params = new URLSearchParams();
    if (activeDomain) params.set('domain', activeDomain);
    if (typeParam) params.set('type', typeParam);
    const qs = params.toString();
    return qs ? `/resources?${qs}` : '/resources';
  };

  return (
    <div className="container py-16 lg:py-24">
      {/* Header */}
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Reference materials
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Resources
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-8">
        Downloadable reference material across cybersecurity, cloud, machine
        learning, and other corners of modern technology. All free to download
        and read online.
      </p>

      {/* Chips filter */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-10">
          <Link
            href={buildHref(null)}
            className={`font-mono text-xs uppercase tracking-wider px-4 py-1.5 border transition-colors ${
              !activeType
                ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                : 'border-navy-700 text-bone-300 hover:border-navy-600 hover:text-bone-100'
            }`}
          >
            All
          </Link>
          {types.map((t) => (
            <Link
              key={t}
              href={buildHref(t)}
              className={`font-mono text-xs uppercase tracking-wider px-4 py-1.5 border transition-colors ${
                activeType === t
                  ? 'border-gold-500 bg-gold-500/10 text-gold-500'
                  : 'border-navy-700 text-bone-300 hover:border-navy-600 hover:text-bone-100'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <FileText className="w-10 h-10 text-gold-500/60 mx-auto mb-4" />
          <p className="font-mono text-sm text-bone-300">
            {activeType
              ? `No "${activeType}" resources published yet.`
              : 'No resources published yet. Check back shortly.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((r) => {
            const Icon = ICON_MAP[r.type] ?? FileText;
            const { download } = buildDriveUrls(r.file_url);
            return (
              <article
                key={r.id}
                className="card-forensic p-6 flex flex-col hover:border-gold-500/40 transition-colors"
              >
                {/* Type badge + icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 border border-gold-500/40 flex items-center justify-center shrink-0 bg-navy-950">
                    <Icon className="w-5 h-5 text-gold-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-gold-500">
                      {r.type}
                    </span>
                    <h3 className="font-mono text-base text-bone-50 mt-0.5 leading-tight">
                      {r.title}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                {r.description && (
                  <p className="font-serif text-sm text-bone-200 leading-relaxed mb-4 line-clamp-4">
                    {r.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4 font-mono text-[10px] text-bone-300">
                  {r.version && <span>v{r.version}</span>}
                  {r.page_count && <span>{r.page_count} pages</span>}
                  {r.file_size_bytes && (
                    <span>{formatBytes(r.file_size_bytes)}</span>
                  )}
                  {typeof r.download_count === 'number' &&
                    r.download_count > 0 && (
                      <span>{r.download_count.toLocaleString()} downloads</span>
                    )}
                </div>

                {/* Spacer pushes action buttons to bottom */}
                <div className="flex-1" />

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Link
                    href={`/resources/${r.slug}`}
                    className="btn-primary flex-1 justify-center text-sm py-2"
                  >
                    <Eye className="w-4 h-4" />
                    Read Online
                  </Link>
                  <a
                    href={download}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost px-3 py-2"
                    title="Download PDF"
                    aria-label="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
