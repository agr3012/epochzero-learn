// lib/enrollment.ts
// Server-side only — gates /learn/[course]/... behind an enrollment code.
import { createAdminClient } from '@/lib/supabase/admin';

/** RRU batch/cohort enrollment via a redeemed code — optional, cohort tracking only. */
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

/** Self-service opt-in ("I'm taking this course") — no code needed, decides
 *  whether the course shows in the dashboard's "My Courses" list. */
export async function isSelfEnrolledInCourse(accountId: string, courseId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('course_enrollments')
    .select('id')
    .eq('account_id', accountId)
    .eq('course_id', courseId)
    .maybeSingle();
  return !!data;
}

/** True if enrolled by either path — self opt-in or a redeemed batch code. */
export async function isEnrolledInCourseAny(accountId: string, courseId: string): Promise<boolean> {
  const [selfEnrolled, batchEnrolled] = await Promise.all([
    isSelfEnrolledInCourse(accountId, courseId),
    isEnrolledInCourse(accountId, courseId),
  ]);
  return selfEnrolled || batchEnrolled;
}

export async function selfEnrollInCourse(accountId: string, courseId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from('course_enrollments')
    .upsert(
      { account_id: accountId, course_id: courseId },
      { onConflict: 'account_id,course_id', ignoreDuplicates: true }
    );
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
