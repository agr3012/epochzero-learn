-- =====================================================================
-- Self-service course enrollment (distinct from the RRU batch/code system)
-- Run AFTER 007_fix_student_accounts_trigger.sql
--
-- batch_enrollments ties a student to a specific cohort via an RRU
-- enrollment code — optional, for cohort tracking only. course_enrollments
-- is the opt-in click any student makes ("I'm taking this course") that
-- decides whether it shows up in their dashboard's "My Courses" list.
-- Progress tracking itself (video_progress, article_progress) is never
-- gated by either — only what shows up in the dashboard summary is.
-- =====================================================================

create table if not exists public.course_enrollments (
  id          uuid primary key default uuid_generate_v4(),
  account_id  uuid not null references public.student_accounts(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (account_id, course_id)
);

create index if not exists idx_course_enrollments_account on public.course_enrollments(account_id);

alter table public.course_enrollments enable row level security;
