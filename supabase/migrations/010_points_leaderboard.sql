-- =====================================================================
-- Phase 4: Leaderboard
-- Run AFTER 009_certificate_chain.sql
--
-- A simple append-only points ledger. Every awarding code path
-- (lib/points.ts) upserts with ON CONFLICT DO NOTHING on
-- (account_id, reason, ref_id) — so "watched a video for the first time"
-- / "marked an article read" / "passed a test" / "posted a forum reply"
-- can each only ever award once per (student, item), no matter how many
-- times the underlying action re-fires (re-reading an article, a second
-- heartbeat after already-completed, a retried request, etc).
--
-- Points formula: video +10, article +5, exam +20, forum +3.
-- =====================================================================

create table if not exists public.points_ledger (
  id          uuid primary key default uuid_generate_v4(),
  account_id  uuid not null references public.student_accounts(id) on delete cascade,
  reason      text not null check (reason in ('video', 'article', 'exam', 'forum')),
  points      integer not null,
  ref_id      uuid not null,   -- video_id / article_id / test_id / forum reply id
  created_at  timestamptz not null default now(),
  unique (account_id, reason, ref_id)
);

create index if not exists idx_points_ledger_account on public.points_ledger(account_id);

alter table public.points_ledger enable row level security;

-- Leaderboard aggregation. SECURITY DEFINER + a fixed search_path so it can
-- be called via the service-role client like every other RPC in this app
-- (see generate_cert_uid in 001_initial_schema.sql for the same pattern).
create or replace function public.get_leaderboard(limit_n int default 100)
returns table (
  account_id      uuid,
  display_name    text,
  email           citext,
  total_points    bigint,
  video_points    bigint,
  article_points  bigint,
  exam_points     bigint,
  forum_points    bigint,
  rank            bigint
)
language sql
stable
as $$
  select
    sa.id as account_id,
    sa.display_name,
    sa.email,
    sum(pl.points) as total_points,
    coalesce(sum(pl.points) filter (where pl.reason = 'video'), 0)   as video_points,
    coalesce(sum(pl.points) filter (where pl.reason = 'article'), 0) as article_points,
    coalesce(sum(pl.points) filter (where pl.reason = 'exam'), 0)    as exam_points,
    coalesce(sum(pl.points) filter (where pl.reason = 'forum'), 0)   as forum_points,
    rank() over (order by sum(pl.points) desc) as rank
  from public.points_ledger pl
  join public.student_accounts sa on sa.id = pl.account_id
  group by sa.id, sa.display_name, sa.email
  order by total_points desc
  limit limit_n;
$$;
