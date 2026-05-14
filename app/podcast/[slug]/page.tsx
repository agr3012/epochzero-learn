// app/podcast/[slug]/page.tsx  — SERVER COMPONENT

import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import EpisodeView from './EpisodeView';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data: ep } = await supabase
    .from('podcasts')
    .select('title, description')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();
  if (!ep) return { title: 'Episode not found' };
  return { title: ep.title, description: ep.description };
}

export async function generateStaticParams() {
  // Uses browser client — no cookies(), safe at build time
  const supabase = createBrowserClient();
  const { data } = await supabase
    .from('podcasts')
    .select('slug')
    .eq('is_published', true);
  return (data ?? []).map((ep: { slug: string }) => ({ slug: ep.slug }));
}

export default async function EpisodePage({ params }: Props) {
  const supabase = createClient();

  const { data: ep } = await supabase
    .from('podcasts')
    .select('*')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!ep) notFound();

  // Fetch all episodes for sidebar + prev/next
  const { data: allEps } = await supabase
    .from('podcasts')
    .select('episode_number, slug, title, cover_image, topic_tag, duration_seconds')
    .eq('is_published', true)
    .order('episode_number', { ascending: true });

  const eps = allEps ?? [];
  const idx = eps.findIndex((e: { slug: string }) => e.slug === ep.slug);
  const prev = idx > 0 ? eps[idx - 1] : null;
  const next = idx < eps.length - 1 ? eps[idx + 1] : null;

  return (
    <EpisodeView
      ep={ep}
      prev={prev}
      next={next}
      allEpisodes={eps}
    />
  );
}
