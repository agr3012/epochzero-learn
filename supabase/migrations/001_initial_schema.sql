-- =====================================================================
-- REMA Club Learning Portal — Initial Schema
-- Run this in Supabase SQL Editor: Project → SQL Editor → New Query
-- =====================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- =====================================================================
-- CONTENT TABLES
-- =====================================================================

-- Articles (MDX-based blog posts / writeups)
create table if not exists public.articles (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  mdx_content   text not null,
  cover_image   text,
  pdf_url       text,                       -- optional downloadable PDF
  category      text,                       -- 'malware-analysis', 'cloud-security', etc.
  tags          text[] default '{}',
  author        text default 'Ashish Gahlot',
  reading_time  integer,                    -- minutes
  is_published  boolean default false,
  view_count    integer default 0,
  published_at  timestamptz,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_articles_published on public.articles(is_published, published_at desc);
create index if not exists idx_articles_category on public.articles(category);
create index if not exists idx_articles_slug on public.articles(slug);

-- Videos (YouTube-embedded with step-by-step analysis)
create table if not exists public.videos (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  youtube_id      text not null,            -- e.g. "dQw4w9WgXcQ"
  title           text not null,
  description     text,
  malware_family  text,                     -- 'njRAT', 'Jigsaw', 'Qakbot', 'Emotet', etc.
  category        text,                     -- 'static-analysis', 'dynamic-analysis', 'unpacking'
  thumbnail_url   text,
  steps           jsonb default '[]'::jsonb, -- [{title, description, timestamp_seconds, screenshot_url}]
  duration_seconds integer,
  difficulty      text default 'intermediate', -- 'beginner', 'intermediate', 'advanced'
  prerequisites   text[],
  related_pdfs    text[],                   -- references to resource PDFs
  view_count      integer default 0,
  is_published    boolean default false,
  order_index     integer default 0,
  published_at    timestamptz,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_videos_published on public.videos(is_published, published_at desc);
create index if not exists idx_videos_malware on public.videos(malware_family);
create index if not exists idx_videos_category on public.videos(category);

-- Resources (PDFs: eBook, Question Bank, Cheatsheet, etc.)
create table if not exists public.resources (
  id              uuid primary key default uuid_generate_v4(),
  type            text not null,            -- 'ebook', 'question-bank', 'cheatsheet', 'mcq-bank', 'lab-manual'
  title           text not null,
  description     text,
  file_url        text not null,            -- Supabase Storage URL
  file_size_bytes bigint,
  page_count      integer,
  version         text default '1.0',
  cover_image     text,
  download_count  integer default 0,
  is_published    boolean default true,
  order_index     integer default 0,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index if not exists idx_resources_type on public.resources(type, is_published);

-- Podcast episodes
create table if not exists public.podcasts (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  title           text not null,
  description     text,
  audio_url       text not null,
  duration_seconds integer,
  episode_number  integer,
  cover_image     text,
  show_notes      text,                     -- markdown
  is_published    boolean default false,
  published_at    timestamptz,
  created_at      timestamptz default now()
);

create index if not exists idx_podcasts_published on public.podcasts(is_published, episode_number desc);

-- Instagram reels
create table if not exists public.reels (
  id              uuid primary key default uuid_generate_v4(),
  instagram_url   text not null,
  caption         text,
  thumbnail_url   text,
  is_published    boolean default true,
  order_index     integer default 0,
  created_at      timestamptz default now()
);

-- =====================================================================
-- TEST ENGINE
-- =====================================================================

-- MCQ Tests (a test = collection of questions on a topic)
create table if not exists public.tests (
  id                uuid primary key default uuid_generate_v4(),
  slug              text unique not null,
  title             text not null,
  description       text,
  malware_family    text,
  category          text,
  duration_minutes  integer not null default 30,
  passing_score     integer not null default 60,  -- percentage
  total_questions   integer not null default 10,  -- how many to draw per attempt
  shuffle_questions boolean default true,
  shuffle_options   boolean default true,
  is_published      boolean default false,
  attempt_count     integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_tests_published on public.tests(is_published);
create index if not exists idx_tests_slug on public.tests(slug);

-- Test questions (the question bank, linked to a test)
create table if not exists public.test_questions (
  id              uuid primary key default uuid_generate_v4(),
  test_id         uuid not null references public.tests(id) on delete cascade,
  question_text   text not null,
  options         jsonb not null,           -- ["Option A", "Option B", "Option C", "Option D"]
  correct_index   integer not null,         -- 0-based index
  explanation     text,
  difficulty      text default 'medium',    -- 'easy', 'medium', 'hard'
  btl_level       integer,                  -- Bloom's Taxonomy Level 1-6
  co_mapping      text,                     -- Course Outcome mapping (e.g., 'CO1', 'CO2')
  topic_tag       text,
  order_index     integer default 0,
  created_at      timestamptz default now()
);

create index if not exists idx_test_questions_test on public.test_questions(test_id);

-- Email OTP tracking (for verification before test attempt)
create table if not exists public.email_otps (
  id          uuid primary key default uuid_generate_v4(),
  email       citext not null,
  otp_hash    text not null,              -- bcrypt/sha256 of OTP
  purpose     text not null,              -- 'test_attempt', 'student_login'
  test_id     uuid references public.tests(id) on delete cascade,
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  ip_address  inet,
  attempts    integer default 0,
  created_at  timestamptz default now()
);

create index if not exists idx_email_otps_email on public.email_otps(email, purpose, expires_at);

-- Test attempts (every submission)
create table if not exists public.attempts (
  id              uuid primary key default uuid_generate_v4(),
  test_id         uuid not null references public.tests(id) on delete cascade,
  email           citext not null,
  full_name       text not null,
  score           integer,                  -- percentage 0-100
  correct_count   integer,
  total_count     integer,
  passed          boolean,
  is_first_pass   boolean default false,    -- true only on the first passing attempt for this email+test
  answers         jsonb,                    -- {question_id: selected_option_index}
  question_ids    uuid[],                   -- which questions were drawn
  started_at      timestamptz default now(),
  submitted_at    timestamptz,
  duration_seconds integer,
  ip_address      inet,
  user_agent      text,
  otp_verified    boolean default false,
  created_at      timestamptz default now()
);

create index if not exists idx_attempts_email_test on public.attempts(email, test_id);
create index if not exists idx_attempts_test on public.attempts(test_id, submitted_at desc);
create index if not exists idx_attempts_passed on public.attempts(passed, is_first_pass);

-- Certificates (issued only on first passing attempt per email per test)
create table if not exists public.certificates (
  id              uuid primary key default uuid_generate_v4(),
  attempt_id      uuid not null unique references public.attempts(id) on delete cascade,
  cert_uid        text unique not null,     -- e.g. 'REMA-2026-A7F3K9'
  email           citext not null,
  student_name    text not null,
  test_id         uuid not null references public.tests(id) on delete cascade,
  test_title      text not null,
  score           integer not null,
  pdf_url         text,                     -- Supabase Storage URL
  issued_at       timestamptz default now(),
  email_sent_at   timestamptz,
  email_send_attempts integer default 0,
  is_revoked      boolean default false,
  revoke_reason   text,
  created_at      timestamptz default now()
);

create index if not exists idx_certificates_uid on public.certificates(cert_uid);
create index if not exists idx_certificates_email on public.certificates(email);

-- =====================================================================
-- ADMIN
-- =====================================================================

-- Admin users (linked to Supabase auth.users)
create table if not exists public.admin_users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       citext unique not null,
  role        text not null default 'admin',  -- 'admin', 'editor', 'super_admin'
  full_name   text,
  created_at  timestamptz default now()
);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_videos_updated on public.videos;
create trigger trg_videos_updated before update on public.videos
  for each row execute function public.set_updated_at();

drop trigger if exists trg_resources_updated on public.resources;
create trigger trg_resources_updated before update on public.resources
  for each row execute function public.set_updated_at();

drop trigger if exists trg_tests_updated on public.tests;
create trigger trg_tests_updated before update on public.tests
  for each row execute function public.set_updated_at();

-- Generate certificate UID (format: REMA-YYYY-XXXXXX)
create or replace function public.generate_cert_uid()
returns text as $$
declare
  random_part text;
begin
  random_part := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  return 'REMA-' || extract(year from now())::text || '-' || random_part;
end;
$$ language plpgsql;

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Check if email has already passed a given test (for is_first_pass logic)
create or replace function public.has_email_passed_test(p_email citext, p_test_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.attempts
    where email = p_email and test_id = p_test_id and passed = true and is_first_pass = true
  );
end;
$$ language plpgsql security definer;

-- Increment article view count atomically
create or replace function public.increment_article_views(p_slug text)
returns void as $$
begin
  update public.articles set view_count = view_count + 1 where slug = p_slug;
end;
$$ language plpgsql security definer;

-- Increment video view count atomically
create or replace function public.increment_video_views(p_slug text)
returns void as $$
begin
  update public.videos set view_count = view_count + 1 where slug = p_slug;
end;
$$ language plpgsql security definer;

-- Increment resource download count atomically
create or replace function public.increment_resource_downloads(p_id uuid)
returns void as $$
begin
  update public.resources set download_count = download_count + 1 where id = p_id;
end;
$$ language plpgsql security definer;
