// =====================================================================
// app/api/forum/threads/route.ts  — fetch published threads by domain
// =====================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const domain = req.nextUrl.searchParams.get('domain');
  if (!domain) return NextResponse.json({ threads: [] });

  const supabase = createClient();
  const { data } = await supabase
    .from('forum_threads')
    .select('id, title, body, author_name, is_pinned, is_locked, reply_count, view_count, created_at')
    .eq('domain', domain)
    .eq('status', 'published')
    .order('is_pinned', { ascending: false })
    .order('created_at',  { ascending: false })
    .limit(50);

  return NextResponse.json({ threads: data ?? [] });
}


// =====================================================================
// SAVE AS: app/api/forum/thread/route.ts  — fetch single thread + replies
// =====================================================================
// NOTE: Create this as a separate file at app/api/forum/thread/route.ts
// Contents:
//
// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
// import { createClient as createAdmin } from '@supabase/supabase-js';
//
// const admin = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.SUPABASE_SERVICE_ROLE_KEY!
// );
//
// export async function GET(req: NextRequest) {
//   const id = req.nextUrl.searchParams.get('id');
//   if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
//
//   const supabase = createClient();
//   const { data: thread } = await supabase
//     .from('forum_threads')
//     .select('*')
//     .eq('id', id)
//     .eq('status', 'published')
//     .single();
//
//   if (!thread) return NextResponse.json({ error: 'Not found' }, { status: 404 });
//
//   // bump view count (fire and forget)
//   admin.from('forum_threads').update({ view_count: thread.view_count + 1 }).eq('id', id);
//
//   const { data: replies } = await supabase
//     .from('forum_replies')
//     .select('id, body, author_name, created_at')
//     .eq('thread_id', id)
//     .eq('status', 'published')
//     .order('created_at', { ascending: true });
//
//   return NextResponse.json({ thread, replies: replies ?? [] });
// }
