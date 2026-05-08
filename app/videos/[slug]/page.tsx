import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  Calendar,
  Clock,
  ShieldAlert,
  Award,
  ExternalLink,
  Globe,
  BookOpen,
  ListChecks,
  Beaker,
  ArrowRight,
} from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate, formatDuration, getYouTubeThumbnail } from '@/lib/utils';
import { VideoPlayer } from '@/components/video-player';
import { VideoLessonTabs } from '@/components/video-lesson-tabs';

export const revalidate = 60;

interface Props {
  params: { slug: string };
  searchParams: { tab?: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from('videos')
    .select('title, description, lesson_summary')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!data) return { title: 'Video Not Found' };
  return {
    title: data.title,
    description: data.lesson_summary ?? data.description,
  };
}

export default async function VideoDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data: video } = await supabase
    .from('videos')
    .select('*, tests(slug, title, total_questions, duration_minutes, passing_score)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!video) notFound();

  const { data: sidebarVideos } = await supabase
    .from('videos')
    .select('id, slug, youtube_id, title, duration_seconds, episode_label, category')
    .eq('is_published', true)
    .neq('id', video.id)
    .order('order_index', { ascending: true })
    .limit(8);

  createAdminClient()
    .rpc('increment_video_views', { p_slug: params.slug })
    .then(
      () => {},
      () => {}
    );

  const steps = (Array.isArray(video.steps) ? video.steps : []) as Array<{
    title: string;
    description?: string;
    timestamp_seconds?: number;
  }>;

  const referencesList = (Array.isArray(video.references_list)
    ? video.references_list
    : []) as Array<{ title: string; url: string; source_type?: string; note?: string }>;

  const exercises = (Array.isArray(video.exercises) ? video.exercises : []) as Array<{
    title: string;
    description: string;
    difficulty?: string;
  }>;

  const linkedTest = video.tests as any;

  return (
    <div className="container py-6 lg:py-8">
      <Link
        href="/videos"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 mb-4 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> All videos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        <div className="min-w-0">
          <VideoPlayer youtubeId={video.youtube_id} steps={steps} />

          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {video.episode_label && (
                <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-500 border border-gold-500/40 px-2 py-1">
                  {video.episode_label}
                </span>
              )}
              {video.malware_family && (
                <span className="badge-malware">
                  <ShieldAlert className="w-3 h-3" />
                  {video.malware_family}
                </span>
              )}
              {video.category && <span className="badge-tag">{video.category}</span>}
            </div>
            <h1 className="font-mono text-xl lg:text-2xl font-bold text-bone-50 leading-tight">
              {video.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-bone-300 mt-3">
              {video.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-gold-500" />
                  {formatDate(video.published_at)}
                </span>
              )}
              {video.duration_seconds && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-gold-500" />
                  {formatDuration(video.duration_seconds)}
                </span>
              )}
              {typeof video.view_count === 'number' && (
                <span>{video.view_count.toLocaleString()} views</span>
              )}
            </div>

            {video.lesson_summary && (
              <p className="font-serif text-base text-bone-100 leading-relaxed mt-4 pb-4 border-b border-navy-700">
                {video.lesson_summary}
              </p>
            )}
          </div>

          <div className="mt-6">
            <VideoLessonTabs
              lessonContent={video.lesson_content ?? ''}
              steps={steps}
              referencesList={referencesList}
              exercises={exercises}
              youtubeId={video.youtube_id}
            />
          </div>

          {video.lesson_content && (
            <div className="prose-rema mt-6" id="lesson-content-mdx">
              <MDXRemote
                source={video.lesson_content}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug, rehypeHighlight],
                  },
                }}
              />
            </div>
          )}

          {steps.length > 0 && (
            <section className="mt-12 scroll-mt-32" id="lab-notes">
              <header className="mb-5 pb-3 border-b border-navy-700 flex items-start gap-3">
                <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center bg-navy-950 shrink-0">
                  <Beaker className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-500">
                    Section 02
                  </div>
                  <h2 className="font-mono text-xl text-bone-50 mt-0.5">Lab Notes</h2>
                </div>
              </header>
              <ol className="space-y-3">
                {steps.map((s, i) => (
                  <li key={i} className="card-forensic p-4 flex gap-3">
                    <span className="shrink-0 w-8 h-8 border border-gold-500 flex items-center justify-center font-mono text-xs text-gold-500">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm text-bone-50 leading-tight mb-1">
                        {s.title}
                      </div>
                      {s.description && (
                        <p className="font-serif text-sm text-bone-200 leading-relaxed mb-2">
                          {s.description}
                        </p>
                      )}
                      {typeof s.timestamp_seconds === 'number' && (
                        <a
                          href={`https://www.youtube.com/watch?v=${video.youtube_id}&t=${s.timestamp_seconds}s`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-xs text-gold-500 hover:text-gold-400 underline decoration-dotted underline-offset-4"
                        >
                          Watch from {formatDuration(s.timestamp_seconds)}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {referencesList.length > 0 && (
            <section className="mt-12 scroll-mt-32" id="references">
              <header className="mb-5 pb-3 border-b border-navy-700 flex items-start gap-3">
                <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center bg-navy-950 shrink-0">
                  <Globe className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-500">
                    Section 03
                  </div>
                  <h2 className="font-mono text-xl text-bone-50 mt-0.5">References</h2>
                </div>
              </header>
              <div className="grid sm:grid-cols-2 gap-3">
                {referencesList.map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 border border-navy-700 hover:border-gold-500 transition-colors group"
                  >
                    <Globe className="w-4 h-4 text-gold-500 mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-mono text-sm text-bone-50 group-hover:text-gold-500 transition-colors leading-tight">
                          {r.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-bone-300 shrink-0 mt-0.5" />
                      </div>
                      {r.note && (
                        <p className="font-serif text-xs text-bone-200 leading-relaxed mb-1">
                          {r.note}
                        </p>
                      )}
                      {r.source_type && (
                        <span className="badge-tag text-[10px]">{r.source_type}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {exercises.length > 0 && (
            <section className="mt-12 scroll-mt-32" id="exercises">
              <header className="mb-5 pb-3 border-b border-navy-700 flex items-start gap-3">
                <div className="w-10 h-10 border-2 border-gold-500 flex items-center justify-center bg-navy-950 shrink-0">
                  <BookOpen className="w-4 h-4 text-gold-500" />
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-500">
                    Section 04
                  </div>
                  <h2 className="font-mono text-xl text-bone-50 mt-0.5">Exercises</h2>
                </div>
              </header>
              <div className="space-y-3">
                {exercises.map((e, i) => (
                  <div key={i} className="card-forensic p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs text-gold-500">
                        EX.{String(i + 1).padStart(2, '0')}
                      </span>
                      {e.difficulty && (
                        <span className="badge-tag text-[10px] uppercase">{e.difficulty}</span>
                      )}
                    </div>
                    <h3 className="font-mono text-sm text-bone-50 mb-1.5 leading-tight">
                      {e.title}
                    </h3>
                    <p className="font-serif text-sm text-bone-200 leading-relaxed">
                      {e.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {linkedTest && (
            <section className="mt-12 card-forensic p-6 lg:p-8 border-2">
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-12 h-12 border-2 border-gold-500 bg-gold-500/10 flex items-center justify-center">
                  <ListChecks className="w-5 h-5 text-gold-500" />
                </div>
                <div className="flex-1">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-500 mb-1">
                    Self-Assessment
                  </div>
                  <h3 className="font-mono text-lg lg:text-xl text-bone-50 mb-2">
                    Test your knowledge
                  </h3>
                  <p className="font-serif text-sm text-bone-200 mb-4 leading-relaxed">
                    Take the assessment for this lesson. Pass — receive a verifiable PDF
                    certificate by email.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-xs text-bone-300">
                    <span>{linkedTest.total_questions} questions</span>
                    <span>·</span>
                    <span>{linkedTest.duration_minutes} min</span>
                    <span>·</span>
                    <span>Pass: {linkedTest.passing_score}%</span>
                  </div>
                  <Link href={`/tests/${linkedTest.slug}`} className="btn-primary">
                    <Award className="w-4 h-4" />
                    Begin assessment <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
        
        <aside className="lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1 scrollbar-themed">
          <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-4">
            // Up Next
          </h2>
          <div className="space-y-3">
            {sidebarVideos?.map((r) => (
              <Link
                key={r.id}
                href={`/videos/${r.slug}`}
                className="flex gap-3 group items-start"
              >
                <div className="relative aspect-video w-40 shrink-0 overflow-hidden border border-navy-700 group-hover:border-gold-500 transition-colors">
                  <Image
                    src={getYouTubeThumbnail(r.youtube_id, 'hq')}
                    alt={r.title}
                    fill
                    sizes="160px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {r.duration_seconds && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-navy-950/90 border border-navy-700 font-mono text-[9px] text-bone-100">
                      {formatDuration(r.duration_seconds)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {r.episode_label && (
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-gold-500 mb-0.5">
                      {r.episode_label}
                    </div>
                  )}
                  <div className="font-mono text-xs text-bone-50 group-hover:text-gold-500 transition-colors leading-snug line-clamp-3">
                    {r.title}
                  </div>
                  {r.category && (
                    <div className="font-mono text-[10px] text-bone-300 mt-1 uppercase tracking-wide">
                      {r.category}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
