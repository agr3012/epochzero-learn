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

  const { data: related } = await supabase
    .from('videos')
    .select('id, slug, youtube_id, title, duration_seconds, malware_family, episode_label')
    .eq('is_published', true)
    .neq('id', video.id)
    .or(
      `malware_family.eq.${video.malware_family ?? '__none__'},category.eq.${video.category ?? '__none__'}`
    )
    .limit(4);

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
    <div className="container py-8 lg:py-12">
      <Link
        href="/videos"
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-bone-300 hover:text-gold-500 mb-6 transition-colors"
      >
        <ChevronLeft className="w-3 h-3" /> All videos
      </Link>

      {/* Episode label + title */}
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-3">
          {video.episode_label && (
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 border border-gold-500/40 px-3 py-1">
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
        <h1 className="font-mono text-2xl lg:text-4xl font-bold text-bone-50 leading-tight">
          {video.title}
        </h1>
      </div>

      {/* Video player — full width, top */}
      <div className="max-w-6xl mx-auto mb-8">
        <VideoPlayer youtubeId={video.youtube_id} steps={steps} />

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs text-bone-300 mt-4">
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
          <p className="font-serif text-lg text-bone-100 leading-relaxed mt-6">
            {video.lesson_summary}
          </p>
        )}
      </div>

      {/* Tabbed content */}
      <div className="max-w-5xl">
        <VideoLessonTabs
          lessonContent={video.lesson_content ?? ''}
          steps={steps}
          referencesList={referencesList}
          exercises={exercises}
          youtubeId={video.youtube_id}
        />

        {video.lesson_content && (
          <div className="prose-rema mt-8" id="lesson-content-mdx">
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

        {/* Lab notes block - shown after lesson */}
        {steps.length > 0 && (
          <section className="mt-16 scroll-mt-32" id="lab-notes">
            <header className="mb-6 pb-4 border-b border-navy-700 flex items-start gap-4">
              <div className="w-12 h-12 border-2 border-gold-500 flex items-center justify-center bg-navy-950">
                <Beaker className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                  Section 02
                </div>
                <h2 className="font-mono text-2xl text-bone-50 mt-1">Lab Notes</h2>
                <p className="font-serif text-bone-200 mt-1">
                  Step-by-step walkthrough — jump to a moment in the video
                </p>
              </div>
            </header>
            <ol className="space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="card-forensic p-5 flex gap-4">
                  <span className="shrink-0 w-9 h-9 border border-gold-500 flex items-center justify-center font-mono text-xs text-gold-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-base text-bone-50 leading-tight mb-1">
                      {s.title}
                    </div>
                    {s.description && (
                      <p className="font-serif text-bone-200 leading-relaxed mb-2">
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

        {/* References block */}
        {referencesList.length > 0 && (
          <section className="mt-16 scroll-mt-32" id="references">
            <header className="mb-6 pb-4 border-b border-navy-700 flex items-start gap-4">
              <div className="w-12 h-12 border-2 border-gold-500 flex items-center justify-center bg-navy-950">
                <Globe className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                  Section 03
                </div>
                <h2 className="font-mono text-2xl text-bone-50 mt-1">References</h2>
                <p className="font-serif text-bone-200 mt-1">
                  External resources to deepen the topic
                </p>
              </div>
            </header>
            <div className="grid md:grid-cols-2 gap-3">
              {referencesList.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 border border-navy-700 hover:border-gold-500 transition-colors group"
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
                      <p className="font-serif text-sm text-bone-200 leading-relaxed mb-2">
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

        {/* Exercises block */}
        {exercises.length > 0 && (
          <section className="mt-16 scroll-mt-32" id="exercises">
            <header className="mb-6 pb-4 border-b border-navy-700 flex items-start gap-4">
              <div className="w-12 h-12 border-2 border-gold-500 flex items-center justify-center bg-navy-950">
                <BookOpen className="w-5 h-5 text-gold-500" />
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
                  Section 04
                </div>
                <h2 className="font-mono text-2xl text-bone-50 mt-1">Exercises</h2>
                <p className="font-serif text-bone-200 mt-1">
                  Hands-on practice. Try each in your analysis VM.
                </p>
              </div>
            </header>
            <div className="space-y-3">
              {exercises.map((e, i) => (
                <div key={i} className="card-forensic p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-xs text-gold-500">
                      EX.{String(i + 1).padStart(2, '0')}
                    </span>
                    {e.difficulty && (
                      <span className="badge-tag text-[10px] uppercase">{e.difficulty}</span>
                    )}
                  </div>
                  <h3 className="font-mono text-base text-bone-50 mb-2 leading-tight">
                    {e.title}
                  </h3>
                  <p className="font-serif text-bone-200 leading-relaxed">{e.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Test your knowledge CTA */}
        {linkedTest && (
          <section className="mt-16 card-forensic p-8 lg:p-10 border-2">
            <div className="flex items-start gap-5">
              <div className="shrink-0 w-14 h-14 border-2 border-gold-500 bg-gold-500/10 flex items-center justify-center">
                <ListChecks className="w-6 h-6 text-gold-500" />
              </div>
              <div className="flex-1">
                <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500 mb-2">
                  Quadrant 4 · Self-Assessment
                </div>
                <h3 className="font-mono text-xl lg:text-2xl text-bone-50 mb-2">
                  Test your knowledge
                </h3>
                <p className="font-serif text-bone-200 mb-5 leading-relaxed">
                  Take the assessment for this lesson. Pass the bar — receive a verifiable
                  PDF certificate by email.
                </p>
                <div className="flex flex-wrap items-center gap-4 mb-6 font-mono text-xs text-bone-300">
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

        {/* Related videos */}
        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-mono text-xl uppercase tracking-wider text-bone-50 mb-6">
              Continue learning
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <Link key={r.id} href={`/videos/${r.slug}`} className="group">
                  <div className="relative aspect-video overflow-hidden border border-navy-700 group-hover:border-gold-500 transition-colors">
                    <Image
                      src={getYouTubeThumbnail(r.youtube_id, 'maxres')}
                      alt={r.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {r.duration_seconds && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-navy-950/90 border border-navy-700 font-mono text-[10px] text-bone-100">
                        {formatDuration(r.duration_seconds)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    {r.episode_label && (
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold-500 mb-1">
                        {r.episode_label}
                      </div>
                    )}
                    <div className="font-mono text-sm text-bone-50 group-hover:text-gold-500 transition-colors leading-tight line-clamp-2">
                      {r.title}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
