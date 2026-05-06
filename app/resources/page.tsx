import { FileText, Download, BookOpen, ListChecks, FileSpreadsheet, Beaker } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatBytes } from '@/lib/utils';

export const revalidate = 60;
export const metadata = { title: 'Resources' };

const ICON_MAP: Record<string, any> = {
  ebook: BookOpen,
  'question-bank': ListChecks,
  cheatsheet: FileSpreadsheet,
  'mcq-bank': ListChecks,
  'lab-manual': Beaker,
};

const TYPE_LABEL: Record<string, string> = {
  ebook: 'eBook',
  'question-bank': 'Question Bank',
  cheatsheet: 'Cheatsheet',
  'mcq-bank': 'MCQ Bank',
  'lab-manual': 'Lab Manual',
};

export default async function ResourcesPage() {
  const supabase = createClient();
  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true });

  return (
    <div className="container py-16 lg:py-24">
      <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
        // Reference materials
      </div>
      <h1 className="font-mono text-4xl lg:text-5xl font-bold text-bone-50 mb-4 leading-tight">
        Resources
      </h1>
      <p className="font-serif text-xl text-bone-200 max-w-3xl leading-relaxed mb-12">
        Downloadable reference material — REMA eBook, Question Bank, Cheatsheet,
        and lab manuals. All free to download.
      </p>

      {!resources || resources.length === 0 ? (
        <div className="card-forensic p-12 text-center">
          <p className="font-mono text-sm text-bone-300">
            Resources coming soon. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {resources.map((r) => {
            const Icon = ICON_MAP[r.type] ?? FileText;
            return (
              <div key={r.id} className="card-forensic p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 border border-gold-500/40 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-gold-500" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-gold-500">
                      {TYPE_LABEL[r.type] ?? r.type}
                    </span>
                    <h3 className="font-mono text-lg text-bone-50 mt-1 leading-tight">
                      {r.title}
                    </h3>
                  </div>
                </div>

                {r.description && (
                  <p className="font-serif text-bone-200 leading-relaxed mb-6">
                    {r.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 font-mono text-xs text-bone-300">
                  {r.version && <span>v{r.version}</span>}
                  {r.page_count && <span>{r.page_count} pages</span>}
                  {r.file_size_bytes && <span>{formatBytes(r.file_size_bytes)}</span>}
                  {typeof r.download_count === 'number' && (
                    <span>{r.download_count.toLocaleString()} downloads</span>
                  )}
                </div>

                <a
                  href={r.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
