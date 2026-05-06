-- =====================================================================
-- REMA Club — Row Level Security Policies
-- Run AFTER 001_initial_schema.sql
-- =====================================================================

-- Enable RLS on all tables
alter table public.articles          enable row level security;
alter table public.videos            enable row level security;
alter table public.resources         enable row level security;
alter table public.podcasts          enable row level security;
alter table public.reels             enable row level security;
alter table public.tests             enable row level security;
alter table public.test_questions    enable row level security;
alter table public.email_otps        enable row level security;
alter table public.attempts          enable row level security;
alter table public.certificates      enable row level security;
alter table public.admin_users       enable row level security;

-- =====================================================================
-- HELPER: is_admin() function
-- =====================================================================
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.admin_users
    where id = auth.uid()
  );
end;
$$ language plpgsql security definer stable;

-- =====================================================================
-- PUBLIC READ POLICIES (anyone can read published content)
-- =====================================================================

-- Articles: public can read published only
create policy "articles_public_read"
  on public.articles for select
  using (is_published = true);

create policy "articles_admin_all"
  on public.articles for all
  using (public.is_admin())
  with check (public.is_admin());

-- Videos
create policy "videos_public_read"
  on public.videos for select
  using (is_published = true);

create policy "videos_admin_all"
  on public.videos for all
  using (public.is_admin())
  with check (public.is_admin());

-- Resources
create policy "resources_public_read"
  on public.resources for select
  using (is_published = true);

create policy "resources_admin_all"
  on public.resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- Podcasts
create policy "podcasts_public_read"
  on public.podcasts for select
  using (is_published = true);

create policy "podcasts_admin_all"
  on public.podcasts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Reels
create policy "reels_public_read"
  on public.reels for select
  using (is_published = true);

create policy "reels_admin_all"
  on public.reels for all
  using (public.is_admin())
  with check (public.is_admin());

-- Tests: public sees metadata; correct answers gated server-side
create policy "tests_public_read"
  on public.tests for select
  using (is_published = true);

create policy "tests_admin_all"
  on public.tests for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- TEST QUESTIONS — admin only via RLS
-- (Public access happens through Edge Functions / API routes using
--  the service role key; RLS protects against direct PostgREST queries.)
-- =====================================================================
create policy "test_questions_admin_all"
  on public.test_questions for all
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- ATTEMPTS, OTPs, CERTIFICATES — server-only writes (via service role)
-- Admin can read; no public direct access. The application layer uses
-- service_role key for inserts/reads.
-- =====================================================================

create policy "email_otps_admin_read"
  on public.email_otps for select
  using (public.is_admin());

create policy "attempts_admin_all"
  on public.attempts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Public can verify a certificate by cert_uid (read-only, no PII leak risk for verification)
create policy "certificates_public_verify"
  on public.certificates for select
  using (is_revoked = false);

create policy "certificates_admin_all"
  on public.certificates for all
  using (public.is_admin())
  with check (public.is_admin());

-- Admin users table — only super admins manage; any authenticated admin can read own row
create policy "admin_users_self_read"
  on public.admin_users for select
  using (id = auth.uid() or public.is_admin());

create policy "admin_users_super_admin_write"
  on public.admin_users for all
  using (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where id = auth.uid() and role = 'super_admin'
    )
  );

-- =====================================================================
-- STORAGE BUCKETS
-- (Run these in Supabase Dashboard → Storage, OR via SQL below)
-- =====================================================================

-- Public bucket for: logos, article cover images, video thumbnails, public PDFs
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

-- Resources bucket: PDFs (eBook, Question Bank, Cheatsheet) — public download
insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do nothing;

-- Audio bucket: podcasts
insert into storage.buckets (id, name, public)
values ('audio', 'audio', true)
on conflict (id) do nothing;

-- Certificates bucket: generated PDF certificates (public read for verification)
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- Storage policies
create policy "public_assets_read" on storage.objects for select
  using (bucket_id = 'public-assets');

create policy "resources_read" on storage.objects for select
  using (bucket_id = 'resources');

create policy "audio_read" on storage.objects for select
  using (bucket_id = 'audio');

create policy "certificates_read" on storage.objects for select
  using (bucket_id = 'certificates');

-- Only admins can upload to any bucket
create policy "admin_upload_public_assets" on storage.objects for insert
  with check (bucket_id = 'public-assets' and public.is_admin());

create policy "admin_upload_resources" on storage.objects for insert
  with check (bucket_id = 'resources' and public.is_admin());

create policy "admin_upload_audio" on storage.objects for insert
  with check (bucket_id = 'audio' and public.is_admin());

-- Certificates uploaded only by service role (no policy needed; service role bypasses RLS)
