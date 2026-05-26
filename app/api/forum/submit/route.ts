import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

const admin = createAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_DOMAINS = ['rema', 'cloud', 'crypto', 'webdev'];

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { domain, title, body } = await req.json();

  if (!VALID_DOMAINS.includes(domain))
    return NextResponse.json({ error: 'Invalid domain' }, { status: 400 });
  if (!title?.trim() || title.trim().length < 10)
    return NextResponse.json({ error: 'Title must be at least 10 characters' }, { status: 400 });
  if (!body?.trim() || body.trim().length < 20)
    return NextResponse.json({ error: 'Body must be at least 20 characters' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();

  const authorName = profile?.full_name ?? user.email?.split('@')[0] ?? 'Member';

  const { data: thread, error } = await admin
    .from('forum_threads')
    .insert({
      domain,
      title: title.trim(),
      body: body.trim(),
      author_id: user.id,
      author_name: authorName,
      status: 'published',
      reply_count: 0,
      view_count: 0,
      is_pinned: false,
      is_locked: false,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'Failed to post' }, { status: 500 });

  return NextResponse.json({ id: thread.id, status: 'published', message: 'Thread posted.' });
}
