-- =====================================================================
-- Phase 1: Auth & Access Reform — Enrollment Code System
-- Run AFTER 003_four_quadrant.sql
--
-- Backfills tables that already exist in production (student_accounts,
-- password_reset_tokens, admin_actions — created ad hoc via the SQL
-- Editor before migrations were tracked; `if not exists` makes this
-- safe to run against that live schema) and adds the batch /
-- enrollment-code system: Ashish generates a code like REMA-ODD2025
-- carrying course_id + semester + year + batch_label, students enter
-- it once to join that cohort.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ── Student accounts (custom email/password auth — see lib/auth.ts) ───────
create table if not exists public.student_accounts (
  id            uuid primary key default uuid_generate_v4(),
  email         citext unique not null,
  password_hash text not null,
  role          text not null default 'student', -- 'student' | 'admin' | 'super_admin'
  display_name  text,
  is_active     boolean not null default true,
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists idx_student_accounts_email on public.student_accounts(email);

alter table public.attempts
  add column if not exists account_id uuid references public.student_accounts(id) on delete set null;

create index if not exists idx_attempts_account on public.attempts(account_id);

-- ── Password reset tokens ──────────────────────────────────────────────────
create table if not exists public.password_reset_tokens (
  id          uuid primary key default uuid_generate_v4(),
  account_id  uuid not null references public.student_accounts(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_password_reset_account on public.password_reset_tokens(account_id);

-- ── Admin action audit log ─────────────────────────────────────────────────
create table if not exists public.admin_actions (
  id           uuid primary key default uuid_generate_v4(),
  admin_email  citext not null,
  action       text not null,
  target_table text,
  target_id    text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- =====================================================================
-- BATCHES — a cohort taking a course in a given term, joined via a single
-- shared enrollment code (e.g. REMA-ODD2025).
-- =====================================================================
create table if not exists public.batches (
  id              uuid primary key default uuid_generate_v4(),
  course_id       uuid not null references public.courses(id) on delete cascade,
  enrollment_code citext not null unique,
  batch_label     text not null,             -- e.g. "B.Tech CSE 5th Sem"
  semester        text not null check (semester in ('odd', 'even')),
  year            int  not null,
  is_active       boolean not null default true,
  created_by      citext,
  created_at      timestamptz not null default now()
);

create index if not exists idx_batches_course on public.batches(course_id);

create table if not exists public.batch_enrollments (
  id                  uuid primary key default uuid_generate_v4(),
  batch_id            uuid not null references public.batches(id) on delete cascade,
  student_account_id  uuid not null references public.student_accounts(id) on delete cascade,
  enrolled_at         timestamptz not null default now(),
  unique (batch_id, student_account_id)
);

create index if not exists idx_batch_enrollments_account on public.batch_enrollments(student_account_id);

-- =====================================================================
-- RLS — deny-by-default. The application talks to every table above
-- exclusively through the service-role client (see lib/auth.ts,
-- lib/enrollment.ts); no anon/authenticated policies are needed because
-- this app's session is a custom cookie, not Supabase Auth.
-- =====================================================================
alter table public.student_accounts      enable row level security;
alter table public.password_reset_tokens enable row level security;
alter table public.admin_actions         enable row level security;
alter table public.batches               enable row level security;
alter table public.batch_enrollments     enable row level security;
