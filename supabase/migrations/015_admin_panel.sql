-- =====================================================================
-- 015: Admin panel support
-- • Fix points_ledger check constraint to include 'reel'
-- • Add email_verified column to student_accounts if missing
-- =====================================================================

-- Fix: points_ledger allowed reason values (adds 'reel' that lib/points.ts already uses)
alter table public.points_ledger
  drop constraint if exists points_ledger_reason_check;

alter table public.points_ledger
  add constraint points_ledger_reason_check
  check (reason in ('video', 'article', 'exam', 'forum', 'reel'));

-- Ensure email_verified column exists (added in 006 but guard it)
alter table public.student_accounts
  add column if not exists email_verified boolean not null default false;
