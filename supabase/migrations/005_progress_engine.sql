-- =====================================================================
-- Phase 2: Progress Tracking Engine
-- Run AFTER 004_enrollment_codes.sql
--
-- Video completion = cumulative watch-time (seconds the player was actually
-- in the "playing" state) >= video duration. Article completion = a single
-- "mark as read" click. Topic completion = every linked video watched +
-- every linked article read. Unit completion = every topic in it complete.
-- Module exams (tests linked to a topic) stay locked until their unit
-- is complete — enforced server-side in app/api/tests/start/route.ts via
-- lib/progress.ts.
-- =====================================================================

-- Defensive: an earlier partial run of this script may have created these
-- tables in a different shape (e.g. without account_id), which made
-- `create table if not exists` a no-op and the index/constraint creation
-- below fail with "column does not exist". Drop and rebuild cleanly —
-- safe because these tables are new and hold no real progress data yet.
drop table if exists public.video_progress;
drop table if exists public.article_progress;

create table if not exists public.video_progress (
  id                     uuid primary key default uuid_generate_v4(),
  account_id             uuid not null references public.student_accounts(id) on delete cascade,
  video_id               uuid not null references public.videos(id) on delete cascade,
  watched_seconds        integer not null default 0,  -- cumulative play-time, clamped to duration
  last_position_seconds  integer not null default 0,  -- for resume
  completed              boolean not null default false,
  completed_at           timestamptz,
  updated_at             timestamptz not null default now(),
  unique (account_id, video_id)
);

create index if not exists idx_video_progress_account on public.video_progress(account_id);

create table if not exists public.article_progress (
  id          uuid primary key default uuid_generate_v4(),
  account_id  uuid not null references public.student_accounts(id) on delete cascade,
  article_id  uuid not null references public.articles(id) on delete cascade,
  read_at     timestamptz not null default now(),
  unique (account_id, article_id)
);

create index if not exists idx_article_progress_account on public.article_progress(account_id);

-- RLS — deny-by-default; the app talks to these exclusively through the
-- service-role client (see lib/progress.ts), same pattern as every other
-- account-keyed table in this schema.
alter table public.video_progress   enable row level security;
alter table public.article_progress enable row level security;
