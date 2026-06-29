// lib/enrollment.ts
// Server-side only — gates /learn/[course]/... behind an enrollment code.
import { createAdminClient } from '@/lib/supabase/admin';

export async function isEnrolledInCourse(accountId: string, courseId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('batch_enrollments')
    .select('id, batches!inner(course_id, is_active)')
    .eq('student_account_id', accountId)
    .eq('batches.course_id', courseId)
    .eq('batches.is_active', true)
    .limit(1)
    .maybeSingle();
  return !!data;
}

export type RedeemResult =
  | { ok: true; batch_label: string; course_title: string }
  | { ok: false; error: string };

/**
 * Redeems a batch-wide enrollment code (e.g. "REMA-ODD2025") for a student
 * account. Codes are looked up case-insensitively (enrollment_code is citext).
 */
export async function redeemEnrollmentCode(
  accountId: string,
  rawCode: string
): Promise<RedeemResult> {
  const code = rawCode.trim();
  if (!code) return { ok: false, error: 'Enter an enrollment code.' };

  const admin = createAdminClient();

  const { data: batch } = await admin
    .from('batches')
    .select('id, batch_label, is_active, courses(title)')
    .eq('enrollment_code', code)
    .maybeSingle();

  if (!batch || !batch.is_active)
    return { ok: false, error: 'Invalid or inactive enrollment code.' };

  const { error: insertErr } = await admin
    .from('batch_enrollments')
    .upsert(
      { batch_id: batch.id, student_account_id: accountId },
      { onConflict: 'batch_id,student_account_id', ignoreDuplicates: true }
    );
  if (insertErr) return { ok: false, error: 'Server error. Please try again.' };

  return {
    ok: true,
    batch_label: batch.batch_label,
    course_title: (batch.courses as unknown as { title: string } | null)?.title ?? 'course',
  };
}
