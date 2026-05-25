// app/api/forum/reply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ruleFilter } from '@/lib/forum/ruleFilter';
import { aiScreen } from '@/lib/forum/aiScreen';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSession(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('ez_session')?.value;
  if (!token) return null;
  try {
    const [payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    if (!payload?.userId || !payload?.email) return null;
    const { data } = await supabaseAdmin
      .from('student_accounts')
      .select('id, display_name, email, is_active')
      .eq('id', payload.userId)
      .single();
    if (!data || !data.is_active) return null;
    return data;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  // 1. Auth
  const user = await getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to reply.' }, { status: 401 });
  }

  // 2. Parse
  let body: { threadId: string; body: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { threadId, body: replyBody } = body;

  if (!threadId) {
    return NextResponse.json({ error: 'Thread ID required.' }, { status: 400 });
  }
  if (!replyBody || replyBody.trim().length < 5 || replyBody.trim().length > 3000) {
    return NextResponse.json({ error: 'Reply must be between 5 and 3000 characters.' }, { status: 400 });
  }

  // 3. Verify thread exists and is not locked
  const { data: thread } = await supabaseAdmin
    .from('forum_threads')
    .select('id, is_locked, title, status')
    .eq('id', threadId)
    .single();

  if (!thread || thread.status !== 'published') {
    return NextResponse.json({ error: 'Thread not found.' }, { status: 404 });
  }
  if (thread.is_locked) {
    return NextResponse.json({ error: 'This thread is locked and no longer accepting replies.' }, { status: 403 });
  }

  const cleanBody = replyBody.trim();

  // 4. Layer 1 — rule filter (use thread title as context title)
  const ruleResult = ruleFilter(thread.title, cleanBody);
  if (ruleResult.decision === 'reject') {
    return NextResponse.json({ error: ruleResult.reason }, { status: 422 });
  }

  // 5. Layer 2 — AI screen
  const aiResult = await aiScreen(thread.title, cleanBody);

  const status =
    aiResult.decision === 'approve' ? 'published' :
    aiResult.decision === 'reject'  ? 'rejected'  : 'held';

  if (status === 'rejected') {
    return NextResponse.json(
      { error: aiResult.reason ?? 'Your reply was not approved.' },
      { status: 422 }
    );
  }

  // 6. Insert reply
  const { data: reply, error } = await supabaseAdmin
    .from('forum_replies')
    .insert({
      thread_id:   threadId,
      body:        cleanBody,
      author_id:   user.id,
      author_name: user.display_name ?? user.email.split('@')[0],
      status,
      moderation_reason: aiResult.reason ?? null,
    })
    .select('id, status')
    .single();

  if (error || !reply) {
    return NextResponse.json({ error: 'Failed to save reply.' }, { status: 500 });
  }

  // 7. Log
  await supabaseAdmin.from('forum_moderation_log').insert([
    { content_type: 'reply', content_id: reply.id, layer: 'rule', decision: 'approve', reason: 'passed rule filter' },
    { content_type: 'reply', content_id: reply.id, layer: 'ai',   decision: aiResult.decision, reason: aiResult.reason ?? null },
  ]);

  return NextResponse.json({
    id:      reply.id,
    status:  reply.status,
    message:
      reply.status === 'published'
        ? 'Reply posted.'
        : 'Your reply is under review.',
  });
}
