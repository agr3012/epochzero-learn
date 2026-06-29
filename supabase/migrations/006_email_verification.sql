-- =====================================================================
-- Email verification on registration
-- Run AFTER 005_progress_engine.sql
--
-- student_accounts.email_verified already exists on the live database
-- (added ad hoc, like several other columns in this schema) — this
-- migration only adds the token table the verify-email flow needs.
-- =====================================================================

alter table public.student_accounts
  add column if not exists email_verified boolean not null default false;

create table if not exists public.email_verification_tokens (
  id          uuid primary key default uuid_generate_v4(),
  account_id  uuid not null references public.student_accounts(id) on delete cascade,
  token_hash  text not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_email_verification_account on public.email_verification_tokens(account_id);

alter table public.email_verification_tokens enable row level security;
