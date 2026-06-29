-- =====================================================================
-- Fix: updating student_accounts (e.g. display_name) fails with
-- "record \"new\" has no field \"updated_at\"" — a set_updated_at()
-- trigger was attached to this table ad hoc without the column it needs.
-- =====================================================================

alter table public.student_accounts
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_student_accounts_updated on public.student_accounts;
create trigger trg_student_accounts_updated before update on public.student_accounts
  for each row execute function public.set_updated_at();
