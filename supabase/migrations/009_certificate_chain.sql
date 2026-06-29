-- =====================================================================
-- Phase 3: Certificate Chain
-- Run AFTER 008_course_enrollments.sql
--
-- Today `certificates` is one shape: an auto-issued cert per first-pass
-- MCQ test attempt. This adds a `cert_type` so the same table can also
-- hold:
--   - 'module'    — auto-issued once a student has passed every Q4 test
--                   in a unit (one per unit, six for REMA)
--   - 'practical' — manually issued by an admin (no MCQ test exists for this)
--   - 'oral'      — manually issued by an admin
--   - 'overall'   — auto-issued once a student holds all 6 module certs
--                   + practical + oral for a course
-- 'mcq' is the default, preserving every existing row's meaning exactly.
--
-- Also backfills `domain` / `club_*` / `platform_logo_url` columns that
-- app/api/certificates/generate/route.ts has always written but which
-- were never captured in a migration (the same kind of ad-hoc drift
-- 004/006 already document and backfill for other tables).
-- =====================================================================

alter table public.certificates
  add column if not exists cert_type text not null default 'mcq';

alter table public.certificates
  drop constraint if exists certificates_cert_type_check;
alter table public.certificates
  add constraint certificates_cert_type_check
  check (cert_type in ('mcq', 'module', 'practical', 'oral', 'overall'));

alter table public.certificates
  add column if not exists unit_id   uuid references public.units(id) on delete set null,
  add column if not exists course_id uuid references public.courses(id) on delete set null,
  add column if not exists awarded_by citext,   -- admin email, for manually-issued 'practical'/'oral' certs
  add column if not exists notes      text;

-- Schema-drift backfill — these have been written by generate/route.ts
-- since it was first deployed but never lived in a migration.
alter table public.certificates
  add column if not exists domain            text,
  add column if not exists club_slug         text,
  add column if not exists club_name         text,
  add column if not exists club_logo_url     text,
  add column if not exists platform_logo_url text;

-- module/practical/oral/overall certs have no single MCQ test, attempt,
-- or percentage score behind them.
alter table public.certificates alter column test_id    drop not null;
alter table public.certificates alter column attempt_id drop not null;
alter table public.certificates alter column score      drop not null;

-- One cert per (student, unit) for module certs; one per (student, course)
-- for practical/oral/overall. Partial indexes — 'mcq' rows are unaffected
-- and keep relying on the existing unique attempt_id constraint.
create unique index if not exists uniq_cert_module
  on public.certificates (email, unit_id) where cert_type = 'module';
create unique index if not exists uniq_cert_practical
  on public.certificates (email, course_id) where cert_type = 'practical';
create unique index if not exists uniq_cert_oral
  on public.certificates (email, course_id) where cert_type = 'oral';
create unique index if not exists uniq_cert_overall
  on public.certificates (email, course_id) where cert_type = 'overall';

create index if not exists idx_certificates_email_type on public.certificates(email, cert_type);
