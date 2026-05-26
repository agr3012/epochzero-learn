import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const supabase = createClient();
  const { data: thread } = await supabase
    .from('forum_threads')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  admin.from('forum_threads')
    .update({ view_count: (thread.view_count ?? 0) + 1 })
    .eq('id', id);

  const { data: replies } = await supabase
    .from('forum_replies')
    .select('id, body, author_name, created_at')
    .eq('thread_id', id)
    .eq('status', 'published')
    .order('created_at', { ascending: true });

  return NextResponse.json({ thread, replies: replies ?? [] });
}
