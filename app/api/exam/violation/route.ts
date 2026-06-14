// app/api/exam/violation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const schema = z.object({
  attempt_id:      z.string().uuid(),
  type:            z.enum([
    'fullscreen_exit', 'tab_switch', 'copy_attempt',
    'no_face', 'multiple_faces', 'webcam_lost',
  ]),
  detail:          z.string().optional(),
  snapshot_base64: z.string().optional(), // JPEG, only on face violations
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

    const { attempt_id, type, detail, snapshot_base64 } = parsed.data;
    const admin = createAdminClient();

    // ── Upload snapshot on face violations (Option B: only on violation) ──
    let snapshot_path: string | null = null;
    if (snapshot_base64) {
      const buf  = Buffer.from(snapshot_base64, 'base64');
      const path = `${attempt_id}/${Date.now()}.jpg`;
      const { error: uploadErr } = await admin.storage
        .from('exam-snapshots')
        .upload(path, buf, { contentType: 'image/jpeg', upsert: false });
      if (!uploadErr) snapshot_path = path;
    }

    // ── Log violation ──
    await admin.from('exam_violations').insert({
      attempt_id,
      type,
      detail:       detail ?? null,
      snapshot_url: snapshot_path,
    });

    // ── Increment counter + update status ──
    const { data: row } = await admin
      .from('attempts')
      .select('violation_count')
      .eq('id', attempt_id)
      .single();

    const newCount = (row?.violation_count ?? 0) + 1;
    const cancelled = newCount >= 3;

    await admin.from('attempts').update({
      violation_count: newCount,
      proctor_status:  cancelled ? 'cancelled' : 'warned',
      ...(cancelled
        ? { cancelled_reason: type, submitted_at: new Date().toISOString() }
        : {}),
    }).eq('id', attempt_id);

    return NextResponse.json({ violation_count: newCount, cancelled });
  } catch (err) {
    console.error('[exam/violation]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
