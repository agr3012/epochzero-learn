// app/videos/[slug]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft, Calendar, Clock, ShieldAlert, Award,
  ExternalLink, Globe, BookOpen, ListChecks, Beaker, ArrowRight,
} from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCurrentAccount } from '@/lib/auth';
import { getVideoProgress } from '@/lib/progress';
import { formatDate, formatDuration, getYouTubeThumbnail } from '@/lib/utils';
import { DOMAIN_COLOR, SECTION_COLORS } from '@/lib/colors';
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
  return { title: data.title, description: data.lesson_summary ?? data.description };
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

  const account = await getCurrentAccount();
  const videoProgress = account ? (await getVideoProgress(account.id, [video.id]))[video.id] : undefined;

  const { data: sidebarVideos } = await supabase
    .from('videos')
    .select('id, slug, youtube_id, title, duration_seconds, episode_label, category, domain')
    .eq('is_published', true)
    .neq('id', video.id)
    .order('order_index', { ascending: true })
    .limit(12);

  createAdminClient()
    .rpc('increment_video_views', { p_slug: params.slug })
    .then(() => {}, () => {});

  const steps         = (Array.isArray(video.steps)          ? video.steps          : []) as Array<{ title: string; description?: string; timestamp_seconds?: number }>;
  const referencesList= (Array.isArray(video.references_list) ? video.references_list : []) as Array<{ title: string; url: string; source_type?: string; note?: string }>;
  const exercises     = (Array.isArray(video.exercises)       ? video.exercises       : []) as Array<{ title: string; description: string; difficulty?: string }>;
  const linkedTest    = video.tests as any;
  const domainColor   = DOMAIN_COLOR[video.domain ?? ''] ?? 'hsl(var(--primary))';

  return (
    <div className="container py-6 lg:py-8">

      {/* ── Back link ── */}
      <Link href="/videos"
        className="inline-flex items-center gap-1.5 text-sm font-medium mb-5 transition-colors
          hover:text-[hsl(var(--foreground))]"
        style={{ color: 'hsl(var(--foreground-muted))' }}>
        <ChevronLeft className="w-4 h-4" /> All videos
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">

        {/* ── Main column ── */}
        <div className="min-w-0">
          <VideoPlayer
            youtubeId={video.youtube_id}
            steps={steps}
            videoId={account ? video.id : undefined}
            initialPositionSeconds={videoProgress?.last_position_seconds ?? 0}
            initialCompleted={videoProgress?.completed ?? false}
          />
          {!account && (
            <p className="text-xs mt-2" style={{ color: 'hsl(var(--foreground-subtle))' }}>
              <Link href="/dashboard/login" className="hover:underline" style={{ color: 'hsl(var(--primary))' }}>Sign in</Link>{' '}
              to track your watch progress.
            </p>
          )}

          {/* ── Video meta ── */}
          <div className="mt-5">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {video.episode_label && (
                <span className="font-mono text-[9px] uppercase tracking-wider
                  px-2.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: `${domainColor}18`,
                    color:  domainColor,
                    border: `1px solid ${domainColor}40`,
                  }}>
                  {video.episode_label}
                </span>
              )}
              {video.malware_family && (
                <span className="badge-malware">
                  <ShieldAlert className="w-3 h-3" />
                  {video.malware_family}
                </span>
              )}
              {video.category && (
                <span className="badge badge-tag self-start">{video.category}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-xl lg:text-2xl font-bold leading-tight mb-3"
              style={{ color: 'hsl(var(--foreground))' }}>
              {video.title}
            </h1>

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs mb-4"
              style={{ color: 'hsl(var(--foreground-subtle))' }}>
              {video.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" style={{ color: domainColor }} />
                  {formatDate(video.published_at)}
                </span>
              )}
              {video.duration_seconds && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-3 h-3" style={{ color: domainColor }} />
                  {formatDuration(video.duration_seconds)}
                </span>
              )}
              {typeof video.view_count === 'number' && video.view_count > 0 && (
                <span>{video.view_count.toLocaleString()} views</span>
              )}
            </div>

            {/* Summary */}
            {video.lesson_summary && (
              <p className="font-serif text-base leading-relaxed pb-5"
                style={{
                  color: 'hsl(var(--foreground-muted))',
                  borderBottom: '1px solid hsl(var(--border))',
                }}>
                {video.lesson_summary}
              </p>
            )}
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <VideoLessonTabs
              lessonContent={video.lesson_content ?? ''}
              steps={steps}
              referencesList={referencesList}
              exercises={exercises}
              youtubeId={video.youtube_id}
            />
          </div>

          {/* MDX lesson content */}
          {video.lesson_content && (
            <div className="prose-rema mt-6" id="lesson-content-mdx">
              <MDXRemote
                source={video.lesson_content}
                options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug, rehypeHighlight] } }}
              />
            </div>
          )}

          {/* ── Lab Notes ── */}
          {steps.length > 0 && (
            <section className="mt-14 scroll-mt-24" id="lab-notes">
              <SectionHeader icon={Beaker} n="02" title="Lab Notes" color={SECTION_COLORS.lab} />
              <ol className="space-y-2">
                {steps.map((s, i) => (
                  <li key={i} className="card flex gap-4 p-4">
                    {/* Step number — colored rounded tile */}
                    <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                      font-display font-bold text-xs text-white"
                      style={{ background: SECTION_COLORS.lab }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-sans font-semibold text-sm leading-tight mb-1"
                        style={{ color: 'hsl(var(--foreground))' }}>
                        {s.title}
                      </div>
                      {s.description && (
                        <p className="font-serif text-sm leading-relaxed mb-2"
                          style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {s.description}
                        </p>
                      )}
                      {typeof s.timestamp_seconds === 'number' && (
                        <a href={`https://www.youtube.com/watch?v=${video.youtube_id}&t=${s.timestamp_seconds}s`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-xs font-medium hover:underline"
                          style={{ color: SECTION_COLORS.lab }}>
                          ▶ Watch from {formatDuration(s.timestamp_seconds)}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ── References ── */}
          {referencesList.length > 0 && (
            <section className="mt-14 scroll-mt-24" id="references">
              <SectionHeader icon={Globe} n="03" title="References" color={SECTION_COLORS.refs} />
              <div className="grid sm:grid-cols-2 gap-3">
                {referencesList.map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="card card-interactive flex items-start gap-3 p-4 group">
                    <Globe className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: SECTION_COLORS.refs }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-sans text-sm font-medium leading-tight
                          group-hover:text-[hsl(var(--primary))] transition-colors"
                          style={{ color: 'hsl(var(--foreground))' }}>
                          {r.title}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 mt-0.5"
                          style={{ color: 'hsl(var(--foreground-subtle))' }} />
                      </div>
                      {r.note && (
                        <p className="font-serif text-xs leading-relaxed mb-1.5"
                          style={{ color: 'hsl(var(--foreground-muted))' }}>
                          {r.note}
                        </p>
                      )}
                      {r.source_type && (
                        <span className="badge badge-tag text-[10px] self-start">{r.source_type}</span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Exercises ── */}
          {exercises.length > 0 && (
            <section className="mt-14 scroll-mt-24" id="exercises">
              <SectionHeader icon={BookOpen} n="04" title="Exercises" color={SECTION_COLORS.exercises} />
              <div className="space-y-3">
                {exercises.map((e, i) => (
                  <div key={i} className="card p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs font-semibold"
                        style={{ color: SECTION_COLORS.exercises }}>
                        EX.{String(i + 1).padStart(2, '0')}
                      </span>
                      {e.difficulty && (
                        <span className="badge badge-tag text-[10px] capitalize">{e.difficulty}</span>
                      )}
                    </div>
                    <h3 className="font-display text-sm font-semibold mb-1.5 leading-tight"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {e.title}
                    </h3>
                    <p className="font-serif text-sm leading-relaxed"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      {e.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Self-Assessment CTA ── */}
          {linkedTest && (
            <section className="mt-14">
              <div className="card p-6 lg:p-8"
                style={{ borderLeft: `4px solid ${SECTION_COLORS.test}` }}>
                <div className="flex items-start gap-5">
                  <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: SECTION_COLORS.test }}>
                    <ListChecks className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.1em] mb-1"
                      style={{ color: SECTION_COLORS.test }}>
                      Self-Assessment
                    </p>
                    <h3 className="font-display text-lg font-semibold mb-2"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      Test your knowledge
                    </h3>
                    <p className="font-serif text-sm leading-relaxed mb-4"
                      style={{ color: 'hsl(var(--foreground-muted))' }}>
                      Take the assessment for this lesson. Pass — receive a verifiable PDF
                      certificate by email.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mb-5 text-xs"
                      style={{ color: 'hsl(var(--foreground-subtle))' }}>
                      <span>{linkedTest.total_questions} questions</span>
                      <span>·</span>
                      <span>{linkedTest.duration_minutes} min</span>
                      <span>·</span>
                      <span>Pass: {linkedTest.passing_score}%</span>
                    </div>
                    <Link href={`/tests/${linkedTest.slug}`} className="btn-primary">
                      <Award className="w-4 h-4" />
                      Begin assessment
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* ── Sidebar — Up Next ── */}
        <aside className="lg:sticky lg:top-20 lg:self-start
          lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto pr-1">
          <p className="eyebrow mb-4">Up Next</p>
          <div className="space-y-3">
            {sidebarVideos?.map((r) => {
              const epColor = DOMAIN_COLOR[r.domain ?? ''] ?? 'hsl(var(--primary))';
              return (
                <Link key={r.id} href={`/videos/${r.slug}`}
                  className="flex gap-3 group items-start">
                  {/* Thumbnail */}
                  <div className="relative w-[120px] aspect-video shrink-0 overflow-hidden rounded-md
                    border border-[hsl(var(--border))] group-hover:border-[hsl(var(--border-strong))]
                    transition-colors">
                    <Image
                      src={getYouTubeThumbnail(r.youtube_id, 'hq')}
                      alt={r.title}
                      fill
                      sizes="120px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {r.duration_seconds && (
                      <span className="absolute bottom-1 right-1 font-mono text-[9px] px-1 py-0.5 rounded
                        text-white"
                        style={{ background: 'rgba(0,0,0,0.75)' }}>
                        {formatDuration(r.duration_seconds)}
                      </span>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    {r.episode_label && (
                      <span className="font-mono text-[9px] font-semibold uppercase tracking-wider
                        px-1.5 py-0.5 rounded-full inline-block mb-1"
                        style={{
                          background: `${epColor}18`,
                          color:  epColor,
                          border: `1px solid ${epColor}40`,
                        }}>
                        {r.episode_label}
                      </span>
                    )}
                    <div className="font-sans text-xs font-medium leading-snug line-clamp-2
                      group-hover:text-[hsl(var(--primary))] transition-colors"
                      style={{ color: 'hsl(var(--foreground))' }}>
                      {r.title}
                    </div>
                    {r.category && (
                      <div className="text-[10px] mt-1 uppercase tracking-wide"
                        style={{ color: 'hsl(var(--foreground-subtle))' }}>
                        {r.category}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ── Section header component ───────────────────────────────────────────────

function SectionHeader({
  icon: Icon, n, title, color,
}: { icon: any; n: string; title: string; color: string }) {
  return (
    <header className="mb-5 pb-4 flex items-center gap-4"
      style={{ borderBottom: '1px solid hsl(var(--border))' }}>
      {/* Colored solid tile — same pattern as quadrant icons */}
      <div className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: color }}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-sans font-semibold text-[10px] uppercase tracking-[0.1em] mb-0.5"
          style={{ color }}>
          Section {n}
        </p>
        <h2 className="font-display text-xl font-semibold leading-tight"
          style={{ color: 'hsl(var(--foreground))' }}>
          {title}
        </h2>
      </div>
    </header>
  );
}
