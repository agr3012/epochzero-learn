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
