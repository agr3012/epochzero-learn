import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { awardPoints } from '@/lib/points';

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { threadId, body } = await req.json();
  if (!threadId || !body?.trim() || body.trim().length < 5)
    return NextResponse.json({ error: 'Reply too short' }, { status: 400 });

  const { data: thread } = await supabase
    .from('forum_threads')
    .select('id, reply_count, is_locked')
    .eq('id', threadId)
    .eq('status', 'published')
    .single();

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  if (thread.is_locked) return NextResponse.json({ error: 'Thread is locked' }, { status: 403 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const authorName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Member';

  const { data: reply, error } = await admin
    .from('forum_replies')
    .insert({
      thread_id: threadId,
      body: body.trim(),
      author_id: user.id,
      author_name: authorName,
      status: 'published',
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });

  await admin.from('forum_threads')
    .update({ reply_count: (thread.reply_count ?? 0) + 1 })
    .eq('id', threadId);

  // The forum runs on Supabase Auth identity, separate from the
  // student_accounts system the rest of the platform (and the points
  // ledger) uses. Bridge via email — if this poster also has a
  // student_accounts row, credit them; otherwise skip silently.
  if (user.email) {
    const { data: account } = await admin
      .from('student_accounts')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();
    if (account) await awardPoints(account.id, 'forum', reply.id);
  }

  return NextResponse.json({ id: reply.id, status: 'published', message: 'Reply posted.' });
}
