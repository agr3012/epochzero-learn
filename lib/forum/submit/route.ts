// app/api/forum/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ruleFilter } from '@/lib/forum/ruleFilter';
import { aiScreen } from '@/lib/forum/aiScreen';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_DOMAINS = ['rema', 'cloud', 'crypto', 'webdev'];

// ── session verification (same logic as dashboard routes) ──────────────
async function getSession(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('ez_session')?.value;
  if (!token) return null;
  try {
    const [payloadB64] = token.split('.');
    if (!payloadB64) return null;
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    if (!payload?.userId || !payload?.email) return null;
    // Verify user still exists
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
  // 1. Auth check
  const user = await getSession(req);
  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to post.' }, { status: 401 });
  }

  // 2. Parse body
  let body: { domain: string; title: string; body: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { domain, title, body: postBody } = body;

  // 3. Validate inputs
  if (!VALID_DOMAINS.includes(domain)) {
    return NextResponse.json({ error: 'Invalid domain.' }, { status: 400 });
  }
  if (!title || title.trim().length < 5 || title.trim().length > 200) {
    return NextResponse.json({ error: 'Title must be between 5 and 200 characters.' }, { status: 400 });
  }
  if (!postBody || postBody.trim().length < 10 || postBody.trim().length > 5000) {
    return NextResponse.json({ error: 'Body must be between 10 and 5000 characters.' }, { status: 400 });
  }

  const cleanTitle = title.trim();
  const cleanBody  = postBody.trim();

  // 4. Layer 1 — rule filter
  const ruleResult = ruleFilter(cleanTitle, cleanBody);
  if (ruleResult.decision === 'reject') {
    return NextResponse.json({ error: ruleResult.reason }, { status: 422 });
  }

  // 5. Layer 2 — AI screen (Gemini)
  const aiResult = await aiScreen(cleanTitle, cleanBody);

  // 6. Determine final status
  const status =
    aiResult.decision === 'approve' ? 'published' :
    aiResult.decision === 'reject'  ? 'rejected'  : 'held';

  if (status === 'rejected') {
    return NextResponse.json(
      { error: aiResult.reason ?? 'Your post was not approved. Please review your content and try again.' },
      { status: 422 }
    );
  }

  // 7. Insert thread
  const { data: thread, error } = await supabaseAdmin
    .from('forum_threads')
    .insert({
      domain,
      title:        cleanTitle,
      body:         cleanBody,
      author_id:    user.id,
      author_name:  user.display_name ?? user.email.split('@')[0],
      status,
      moderation_reason: aiResult.reason ?? null,
    })
    .select('id, status')
    .single();

  if (error || !thread) {
    return NextResponse.json({ error: 'Failed to save post. Please try again.' }, { status: 500 });
  }

  // 8. Log moderation decision
  await supabaseAdmin.from('forum_moderation_log').insert([
    { content_type: 'thread', content_id: thread.id, layer: 'rule', decision: 'approve', reason: 'passed rule filter' },
    { content_type: 'thread', content_id: thread.id, layer: 'ai',   decision: aiResult.decision, reason: aiResult.reason ?? null },
  ]);

  return NextResponse.json({
    id:     thread.id,
    status: thread.status,
    message:
      thread.status === 'published'
        ? 'Your post is live.'
        : 'Your post is under review and will appear once approved.',
  });
}
