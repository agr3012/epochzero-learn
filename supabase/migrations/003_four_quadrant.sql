-- =====================================================================
-- REMA Club — UGC 4Q (Four Quadrant) Schema
-- Run AFTER 002_rls_policies.sql
-- =====================================================================
--
-- Architecture:
--   courses → units → topics → (Q1 videos, Q2 articles+resources,
--                                Q3 web links, Q4 tests)
--
-- Existing content tables (videos, articles, resources, tests) are
-- linked to topics via M:N tables. Content not linked to any topic
-- still appears in the horizontal browse views (/articles etc).
-- =====================================================================

-- =====================================================================
-- COURSES (top-level grouping; v1 has only REMA)
-- =====================================================================
create table if not exists public.courses (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  short_title   text,                       -- for breadcrumbs
  description   text,
  cover_image   text,
  instructor    text default 'Ashish Gahlot',
  is_published  boolean default false,
  order_index   integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_courses_published on public.courses(is_published, order_index);

-- =====================================================================
-- UNITS (course chapters)
-- =====================================================================
create table if not exists public.units (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  slug          text not null,
  title         text not null,
  unit_number   integer not null,
  description   text,
  learning_outcomes text[] default '{}',    -- bullet list
  is_published  boolean default false,
  order_index   integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  unique (course_id, slug),
  unique (course_id, unit_number)
);

create index if not exists idx_units_course on public.units(course_id, order_index);

-- =====================================================================
-- TOPICS (the 4Q-bearing leaf node)
-- =====================================================================
create table if not exists public.topics (
  id                uuid primary key default uuid_generate_v4(),
  unit_id           uuid not null references public.units(id) on delete cascade,
  slug              text not null,
  title             text not null,
  topic_number      integer not null,         -- e.g. 2.3 → unit 2, topic 3
  description       text,
  learning_objectives text[] default '{}',    -- "After this topic you will..."
  estimated_minutes integer,                  -- total Q1-Q4 time
  is_published      boolean default false,
  order_index       integer default 0,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now(),
  unique (unit_id, slug),
  unique (unit_id, topic_number)
);

create index if not exists idx_topics_unit on public.topics(unit_id, order_index);

-- =====================================================================
-- LINKAGE TABLES (M:N between topics and content)
-- =====================================================================

-- Q1 — videos
create table if not exists public.topic_videos (
  topic_id    uuid not null references public.topics(id) on delete cascade,
  video_id    uuid not null references public.videos(id) on delete cascade,
  order_index integer default 0,
  primary key (topic_id, video_id)
);
create index if not exists idx_topic_videos_topic on public.topic_videos(topic_id, order_index);

-- Q2 (text content) — articles
create table if not exists public.topic_articles (
  topic_id    uuid not null references public.topics(id) on delete cascade,
  article_id  uuid not null references public.articles(id) on delete cascade,
  order_index integer default 0,
  primary key (topic_id, article_id)
);
create index if not exists idx_topic_articles_topic on public.topic_articles(topic_id, order_index);

-- Q2 (downloads) — resource PDFs / eBook chapters
create table if not exists public.topic_resources (
  topic_id    uuid not null references public.topics(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  order_index integer default 0,
  primary key (topic_id, resource_id)
);
create index if not exists idx_topic_resources_topic on public.topic_resources(topic_id, order_index);

-- Q3 — curated external web resources (no FK; admin enters them inline)
create table if not exists public.topic_web_links (
  id          uuid primary key default uuid_generate_v4(),
  topic_id    uuid not null references public.topics(id) on delete cascade,
  title       text not null,
  url         text not null,
  description text,
  source_type text,                           -- 'mitre', 'wiki', 'tool', 'paper', 'blog', 'cve'
  order_index integer default 0,
  created_at  timestamptz default now()
);
create index if not exists idx_topic_links_topic on public.topic_web_links(topic_id, order_index);

-- Q4 — MCQ tests
create table if not exists public.topic_tests (
  topic_id    uuid not null references public.topics(id) on delete cascade,
  test_id     uuid not null references public.tests(id) on delete cascade,
  order_index integer default 0,
  primary key (topic_id, test_id)
);
create index if not exists idx_topic_tests_topic on public.topic_tests(topic_id, order_index);

-- =====================================================================
-- PROGRESS — Q4 completion only (per spec)
-- A topic is "completed" when the email has passed any test linked to it.
-- =====================================================================
create table if not exists public.topic_progress (
  id            uuid primary key default uuid_generate_v4(),
  email         citext not null,
  topic_id      uuid not null references public.topics(id) on delete cascade,
  test_id       uuid references public.tests(id) on delete set null,
  attempt_id    uuid references public.attempts(id) on delete set null,
  passed_at     timestamptz default now(),
  score         integer,
  unique (email, topic_id)
);
create index if not exists idx_progress_email on public.topic_progress(email);
create index if not exists idx_progress_topic on public.topic_progress(topic_id);

-- =====================================================================
-- TRIGGERS
-- =====================================================================
drop trigger if exists trg_courses_updated on public.courses;
create trigger trg_courses_updated before update on public.courses
  for each row execute function public.set_updated_at();

drop trigger if exists trg_units_updated on public.units;
create trigger trg_units_updated before update on public.units
  for each row execute function public.set_updated_at();

drop trigger if exists trg_topics_updated on public.topics;
create trigger trg_topics_updated before update on public.topics
  for each row execute function public.set_updated_at();

-- Auto-record topic_progress when an attempt is marked is_first_pass=true
-- AND that attempt's test is linked to one or more topics.
create or replace function public.record_topic_progress_on_pass()
returns trigger as $$
begin
  if new.is_first_pass = true and (old.is_first_pass is null or old.is_first_pass = false) then
    insert into public.topic_progress (email, topic_id, test_id, attempt_id, score, passed_at)
    select new.email, tt.topic_id, new.test_id, new.id, new.score, now()
    from public.topic_tests tt
    where tt.test_id = new.test_id
    on conflict (email, topic_id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_topic_progress on public.attempts;
create trigger trg_topic_progress
  after update on public.attempts
  for each row execute function public.record_topic_progress_on_pass();

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table public.courses           enable row level security;
alter table public.units             enable row level security;
alter table public.topics            enable row level security;
alter table public.topic_videos      enable row level security;
alter table public.topic_articles    enable row level security;
alter table public.topic_resources   enable row level security;
alter table public.topic_web_links   enable row level security;
alter table public.topic_tests       enable row level security;
alter table public.topic_progress    enable row level security;

-- Public read on published hierarchy
create policy "courses_public_read" on public.courses for select using (is_published = true);
create policy "courses_admin_all" on public.courses for all using (public.is_admin()) with check (public.is_admin());

create policy "units_public_read" on public.units for select using (is_published = true);
create policy "units_admin_all" on public.units for all using (public.is_admin()) with check (public.is_admin());

create policy "topics_public_read" on public.topics for select using (is_published = true);
create policy "topics_admin_all" on public.topics for all using (public.is_admin()) with check (public.is_admin());

-- Linkage tables — public read; admin write
create policy "topic_videos_public_read" on public.topic_videos for select using (true);
create policy "topic_videos_admin_all" on public.topic_videos for all using (public.is_admin()) with check (public.is_admin());

create policy "topic_articles_public_read" on public.topic_articles for select using (true);
create policy "topic_articles_admin_all" on public.topic_articles for all using (public.is_admin()) with check (public.is_admin());

create policy "topic_resources_public_read" on public.topic_resources for select using (true);
create policy "topic_resources_admin_all" on public.topic_resources for all using (public.is_admin()) with check (public.is_admin());

create policy "topic_web_links_public_read" on public.topic_web_links for select using (true);
create policy "topic_web_links_admin_all" on public.topic_web_links for all using (public.is_admin()) with check (public.is_admin());

create policy "topic_tests_public_read" on public.topic_tests for select using (true);
create policy "topic_tests_admin_all" on public.topic_tests for all using (public.is_admin()) with check (public.is_admin());

-- Progress: admin reads all; service role inserts via trigger (bypasses RLS)
create policy "topic_progress_admin_read" on public.topic_progress for select using (public.is_admin());

-- =====================================================================
-- SEED DATA — REMA course with 6 units
-- =====================================================================
-- Idempotent: only inserts if not present.
insert into public.courses (slug, title, short_title, description, instructor, is_published, order_index)
values (
  'rema',
  'Reverse Engineering and Malware Analysis',
  'REMA',
  'A complete learning track covering static and dynamic malware analysis, reverse engineering of binaries, and incident response — built around real samples and case studies.',
  'Ashish Gahlot',
  true,
  1
)
on conflict (slug) do nothing;

-- Insert 6 units (placeholder titles — admin can edit)
do $$
declare course_uuid uuid;
begin
  select id into course_uuid from public.courses where slug = 'rema';
  if course_uuid is null then return; end if;

  insert into public.units (course_id, slug, title, unit_number, description, is_published, order_index)
  values
    (course_uuid, 'unit-1-foundations', 'Foundations of Malware Analysis', 1,
     'Threat landscape, malware classification, analysis methodology, and lab setup.', true, 1),
    (course_uuid, 'unit-2-static-analysis', 'Static Analysis Techniques', 2,
     'PE structure, strings, imports, hashing, signatures, and YARA rule writing.', true, 2),
    (course_uuid, 'unit-3-dynamic-analysis', 'Dynamic Analysis & Sandboxing', 3,
     'Behavioral analysis, sandboxes, process and network monitoring, evasion detection.', true, 3),
    (course_uuid, 'unit-4-reverse-engineering', 'Reverse Engineering Internals', 4,
     'Disassembly, debugging, control flow, packers, anti-analysis, and unpacking.', true, 4),
    (course_uuid, 'unit-5-advanced-malware', 'Advanced Malware Techniques', 5,
     'Process injection, persistence, C2 protocols, RATs, ransomware, and rootkits.', true, 5),
    (course_uuid, 'unit-6-incident-response', 'Detection & Incident Response', 6,
     'Indicators of compromise, threat hunting, MITRE ATT&CK mapping, and reporting.', true, 6)
  on conflict (course_id, unit_number) do nothing;
end $$;
