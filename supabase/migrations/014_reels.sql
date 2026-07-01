-- Phase 6: Quick Bites — short-form video content (YouTube Shorts)
-- Includes: reels table, reel_progress table, 14 seeded reels.
-- Run in Supabase SQL Editor.

-- ── Tables ────────────────────────────────────────────────────────────────────

create table if not exists public.reels (
  id               uuid        primary key default gen_random_uuid(),
  youtube_id       text        not null unique,
  title            text        not null,
  description      text,
  domain           text        not null default 'rema',   -- 'rema' | 'cloud-security'
  topic_slug       text,         -- article slug this reel supplements (nullable)
  duration_seconds integer     not null default 30,       -- approx, for completion threshold
  order_index      integer     not null default 0,
  is_published     boolean     not null default true,
  created_at       timestamptz not null default now()
);

-- One row per (account, reel), upserted as the student watches
create table if not exists public.reel_progress (
  id              uuid        primary key default gen_random_uuid(),
  account_id      uuid        not null references public.student_accounts(id) on delete cascade,
  reel_id         uuid        not null references public.reels(id) on delete cascade,
  watched_seconds integer     not null default 0,
  completed       boolean     not null default false,
  completed_at    timestamptz,
  updated_at      timestamptz not null default now(),
  unique(account_id, reel_id)
);

-- ── Seed: 14 reels ────────────────────────────────────────────────────────────

insert into public.reels
  (youtube_id, title, description, domain, topic_slug, duration_seconds, order_index)
values
  (
    'GR0cHkSwwBE',
    'x86 Architecture: The Analyst''s View',
    'The x86 architecture is the playground where all malware lives. Von Neumann model, sub-registers like AL and AH, and why controlling EIP is the end-game for exploits.',
    'rema', 'x86-architecture', 30, 1
  ),
  (
    'KflaHDNumsA',
    'Reverse Engineering Malware: The Hidden Keys',
    'When signatures fail, reverse engineering reveals the truth — decompilation, hardcoded encryption keys, and IOC extraction from raw assembly code.',
    'rema', 'intro-reverse-engineering', 30, 2
  ),
  (
    'P-vsqtF3Haw',
    'Malware Analysis: Static, Dynamic & Sandbox',
    'Three tiers of malware analysis — basic static, basic dynamic, and automated sandbox — building a robust detection pipeline.',
    'rema', 'approaches-malware-analysis', 30, 3
  ),
  (
    'jk4m3D8I2Lw',
    'How Stuxnet Worked: The First Cyber Weapon',
    'Air-gap bypass via USB, PLC infiltration, and physical sabotage — the anatomy of the world''s first true digital weapon.',
    'rema', 'malware-case-studies', 30, 4
  ),
  (
    'rCj7K9FWs1E',
    'Evasion at the Code Level: Malware''s Stealth Tactics',
    'Obfuscation, packing, and polymorphism — how malware constantly reshapes itself to stay invisible to signature-based detection tools.',
    'rema', 'evasion-code-level', 20, 5
  ),
  (
    '29kn4uNwpRs',
    'Types of Malware: From Viruses to Ransomware',
    'Viruses vs. worms, Trojans, ransomware — understanding spread mechanisms and data-lock tactics for modern cloud defence.',
    'rema', 'types-of-malware', 20, 6
  ),
  (
    'ZSkj7gx99gg',
    'Malware Explained: What You Need to Know',
    'What truly constitutes malicious software? Spyware, ransomware, and rootkits — classification as your first line of defence.',
    'rema', 'what-is-malware', 20, 7
  ),
  (
    'xaS5y2tmlyU',
    'Rootkit Explained: The Ultimate Stealth Malware',
    'Kernel-mode rootkits mask their presence from the OS — how privilege escalation gives attackers total, hidden control.',
    'rema', null, 20, 8
  ),
  (
    'R1pWi4jjG9I',
    'What is Process Hollowing?',
    'A legitimate process is suspended, hollowed out, and replaced with a malicious payload — one of malware''s stealthiest evasion techniques, visualised.',
    'rema', null, 30, 9
  ),
  (
    'qKykT-nIspY',
    'Cloud Forensic Sync Logs: Reconstructing the Attack',
    'Log correlation turns fragmented cloud data into a clear attack timeline — the forensic value of sync logs for evidence reconstruction.',
    'cloud-security', null, 20, 10
  ),
  (
    'tRp6J67vLB8',
    'API Security: The Cloud''s Heartbeat',
    'APIs are your biggest cloud security risk — rate-limiting and strong authentication as essential gatekeeping mechanisms for every endpoint.',
    'cloud-security', null, 20, 11
  ),
  (
    'VRENutRQBcA',
    'Cloud Encryption: In-Transit vs. At-Rest Explained',
    'Securing data in motion and at rest — why encryption makes stolen cloud data useless to attackers even after a breach.',
    'cloud-security', null, 20, 12
  ),
  (
    'pB3IAY6n6Rs',
    'Cloud IAM Explained: Your New Security Perimeter',
    'Identity IS the new perimeter — IAM and the principle of least privilege as the foundation of Zero Trust cloud architecture.',
    'cloud-security', null, 20, 13
  ),
  (
    'U03FnrAFo1c',
    'Cloud Forensics: The Fundamentals',
    'Shared responsibility changes forensics in the cloud — API-based data acquisition and snapshot-driven evidence collection in 20 seconds.',
    'cloud-security', null, 20, 14
  )
on conflict (youtube_id) do nothing;
