import { createClient } from '@/lib/supabase/server';
import { TestsClient } from './TestsClient';

export const revalidate = 60;
export const metadata = { title: 'MCQ Tests' };

export default async function TestsPage() {
  const supabase = createClient();
  const { data: tests } = await supabase
    .from('tests')
    .select('id, slug, title, description, malware_family, category, total_questions, duration_minutes, passing_score')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  return <TestsClient tests={tests ?? []} />;
}
