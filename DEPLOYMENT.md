# REMA Club — Deployment Guide

Step-by-step setup for GitHub → Supabase → Resend → Vercel. Follow exactly in this order. Estimated time: **30–45 minutes** the first time.

---

## Prerequisites (5 min)

You need free accounts on all four:

| Service | Sign up | Purpose |
|---------|---------|---------|
| GitHub | <https://github.com/signup> | Source code hosting |
| Supabase | <https://supabase.com/dashboard/sign-up> | Database, auth, storage |
| Resend | <https://resend.com/signup> | Transactional email |
| Vercel | <https://vercel.com/signup> | App hosting (sign up via GitHub) |

You also need on your laptop:
- **Git** — `git --version` should work. If not, install from <https://git-scm.com>
- **Node.js 20 LTS** — `node --version` should print `v20.x.x` or `v22.x.x`. Get from <https://nodejs.org>

That's it. No need for Docker, no Supabase CLI, nothing else.

---

## Step 1 — Extract the project (2 min)

```bash
# Wherever you downloaded the tarball:
tar -xzf rema-club.tar.gz
cd rema-club
ls -la
```

You should see `app/`, `components/`, `lib/`, `supabase/`, `package.json`, etc.

---

## Step 2 — Push to GitHub (5 min)

### 2.1 Create a new GitHub repo

1. Go to <https://github.com/new>
2. **Repository name:** `rema-club`
3. **Description:** `REMA Club — UGC 4Q learning hub for Reverse Engineering and Malware Analysis`
4. **Visibility:** Private (recommended) or Public — your choice
5. **Do NOT** check any of "Add README", "Add .gitignore", or "Choose a license" — the repo we have already contains these
6. Click **Create repository**

GitHub now shows you a quick-setup page. Copy the URL — it looks like `https://github.com/yourusername/rema-club.git`

### 2.2 Push the code

In the `rema-club/` folder:

```bash
git init
git add -A
git commit -m "Initial commit — Phase 1-4 + 4Q layer"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/rema-club.git
git push -u origin main
```

Replace `YOURUSERNAME` with your actual GitHub username. Refresh the GitHub page; all 50+ files should be there.

---

## Step 3 — Create the Supabase project (10 min)

### 3.1 New project

1. Go to <https://supabase.com/dashboard>
2. Click **New project**
3. **Name:** `rema-club`
4. **Database password:** Generate a strong one. **Save it somewhere safe** — you'll need it later if you ever connect via psql, though we won't in this guide.
5. **Region:** Pick the closest one to your users. For India, choose `Asia South (Mumbai)` — `ap-south-1`.
6. **Pricing plan:** Free tier
7. Click **Create new project**. Wait ~2 minutes for provisioning.

### 3.2 Run the three SQL migrations

Once the project is ready, on the left sidebar click **SQL Editor** → **New query**.

Run the three migrations **strictly in this order**. Do not skip or reorder.

#### Migration 1: Schema

1. Open `supabase/migrations/001_initial_schema.sql` from the `rema-club/` folder
2. Copy its entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter`)
5. You should see "Success. No rows returned." This created 11 tables, indexes, triggers, and helper functions.

#### Migration 2: Row Level Security

1. **New query** in SQL Editor
2. Open `supabase/migrations/002_rls_policies.sql`
3. Copy → paste → **Run**
4. Result: "Success." All tables now have RLS enabled. Storage buckets `public-assets`, `resources`, `audio`, `certificates` are created.

#### Migration 3: 4Q layer

1. **New query** in SQL Editor
2. Open `supabase/migrations/003_four_quadrant.sql`
3. Copy → paste → **Run**
4. Result: "Success." This adds the `courses`, `units`, `topics` tables, linkage tables, and seeds the **REMA course with 6 units**.

### 3.3 Verify the data is there

Left sidebar → **Table Editor**. You should see:
- `courses` — 1 row (REMA)
- `units` — 6 rows (Unit 1–6)
- `topics` — 0 rows (you'll add these)
- All other tables — 0 rows

If `courses` is empty, migration 003 didn't run. Re-run it.

### 3.4 Copy the API keys

Left sidebar → **Project Settings** (gear icon at the bottom) → **API**.

Copy these three values into a notepad — you'll paste them into Vercel later:

| Label in Supabase | Variable name in our app |
|-------------------|--------------------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **`anon` `public`** API Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **`service_role` `secret`** API Key | `SUPABASE_SERVICE_ROLE_KEY` |

> The `service_role` key is highly sensitive — it bypasses RLS. Keep it secret. Never paste it into Client Components or commit it to GitHub.

---

## Step 4 — Set up Resend for email (10 min)

Resend handles OTP delivery and certificate emails. Two paths:

- **Path A (fast, for testing):** Use Resend's shared sender. No DNS setup needed. Emails come from `onboarding@resend.dev`. Works only for sending to **your own verified email address** until you add a domain.
- **Path B (proper, for production):** Send from your own domain (e.g. `noreply@epochzero.net`). Requires adding 3 DNS records.

Start with Path A to verify everything works, then move to Path B before sharing the site publicly.

### 4.1 Path A — Quick test setup

1. Go to <https://resend.com/api-keys>
2. Click **Create API Key**
3. **Name:** `rema-club-prod`
4. **Permission:** Sending access
5. Click **Add**
6. Copy the key (starts with `re_...`). You can only see it once. Save it. This is `RESEND_API_KEY`.

For `RESEND_FROM_EMAIL`, use exactly:
```
REMA Club <onboarding@resend.dev>
```

In Resend dashboard → **Settings → Verified emails** → add **your own** email (the one you'll test with). Otherwise Resend rejects sends.

### 4.2 Path B — Domain setup (do this before going live)

1. Resend dashboard → **Domains → Add Domain**
2. Enter the domain you'll send from. Examples:
   - `epochzero.net` — if you own it (recommended; matches your existing brand)
   - Or a subdomain like `mail.epochzero.net`
3. Resend gives you 3 DNS records: **SPF** (TXT), **DKIM** (TXT or CNAME), **DMARC** (TXT)
4. Add these records at your domain registrar (GoDaddy / Namecheap / Cloudflare / wherever epochzero.net is registered)
5. Click **Verify DNS Records** in Resend. Verification can take 5–60 minutes.
6. Once verified, set `RESEND_FROM_EMAIL` to `REMA Club <noreply@epochzero.net>` (or whatever address you chose)

---

## Step 5 — Deploy to Vercel (10 min)

### 5.1 Import the GitHub repo

1. Go to <https://vercel.com/dashboard>
2. Click **Add New → Project**
3. Vercel asks you to connect to GitHub. Authorise it. Pick the `rema-club` repo and click **Import**

### 5.2 Configure the build

Vercel auto-detects Next.js — leave **Framework Preset**, **Build Command**, **Output Directory**, **Install Command** as their defaults.

### 5.3 Add environment variables

This is the critical part. Click **Environment Variables** and add each row exactly:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | (your Supabase Project URL) | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your Supabase anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | (your Supabase service_role key) | All |
| `RESEND_API_KEY` | (your Resend API key, starts with `re_`) | All |
| `RESEND_FROM_EMAIL` | `REMA Club <onboarding@resend.dev>` for now | All |
| `NEXT_PUBLIC_SITE_URL` | `https://rema-club.vercel.app` (placeholder — fix in step 5.5) | All |

Do **not** add Turnstile keys yet. Skip them.

> "All" means Production, Preview, and Development.

### 5.4 First deploy

Click **Deploy**. Wait ~2 minutes. Vercel runs `npm install` and `next build`.

If the build succeeds, Vercel shows a confetti animation and gives you the live URL — something like `https://rema-club-abc123.vercel.app`.

### 5.5 Update `NEXT_PUBLIC_SITE_URL`

The first deploy used a placeholder. Now that you know the real URL:

1. Vercel → your project → **Settings → Domains**
2. Note your assigned `.vercel.app` URL — for example `https://rema-club.vercel.app`
3. **Settings → Environment Variables** → edit `NEXT_PUBLIC_SITE_URL` to the exact URL (no trailing slash)
4. Top-right → **Deployments** → click the three dots on the latest deployment → **Redeploy**

This URL gets baked into emails (verification links) and certificate PDFs, so it must match your real domain.

---

## Step 6 — Bootstrap an admin user (5 min)

The admin tables are gated by RLS. To grant yourself admin rights:

### 6.1 Create an auth user

1. Supabase → **Authentication → Users → Add user → Create new user**
2. **Email:** your email
3. **Password:** create one
4. Tick **Auto Confirm User**
5. Click **Create user**

### 6.2 Promote to admin

In your local `rema-club/` folder, create a temporary `.env.local`:

```bash
cd rema-club
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://YOURPROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
EOF
```

Replace the two values with your actual Supabase URL and service-role key. Then run:

```bash
npm install
node --env-file=.env.local scripts/bootstrap-admin.mjs you@example.com super_admin
```

Output: `✓ you@example.com promoted to super_admin.`

You're now an admin. (The admin UI itself is Phase 6 — pending — but RLS policies already use this.)

> Once done, **delete `.env.local`** so you don't accidentally commit it. The `.gitignore` already excludes it, but be safe.

---

## Step 7 — Verify the entire flow end-to-end (5 min)

This is the test that proves the whole pipeline works.

### 7.1 Insert a sample test via SQL

Supabase → SQL Editor → New query:

```sql
-- Sample test
insert into public.tests (slug, title, description, malware_family, category,
  duration_minutes, passing_score, total_questions, is_published)
values
  ('njrat-fundamentals', 'njRAT — Fundamentals',
   'Five sample questions covering the njRAT analysis basics.',
   'njRAT', 'static-analysis', 10, 60, 5, true)
returning id;
```

Note the returned `id`. Then add 5 questions (replace `THE-TEST-UUID-HERE` with that id):

```sql
insert into public.test_questions (test_id, question_text, options, correct_index, explanation, difficulty, btl_level, order_index) values
  ('THE-TEST-UUID-HERE',
   'njRAT is primarily classified as which type of malware?',
   '["Ransomware", "Remote Access Trojan", "Keylogger only", "Bootkit"]'::jsonb,
   1, 'njRAT is a .NET-based RAT (Remote Access Trojan).', 'easy', 1, 1),
  ('THE-TEST-UUID-HERE',
   'What is the typical default C2 port used by njRAT?',
   '["80", "443", "5552", "8080"]'::jsonb,
   2, '5552 is the historical default port for njRAT campaigns.', 'medium', 2, 2),
  ('THE-TEST-UUID-HERE',
   'njRAT is most commonly written in which language?',
   '["C", "C++", ".NET (C#/VB)", "Go"]'::jsonb,
   2, 'njRAT is a .NET assembly (typically C# or VB.NET).', 'easy', 1, 3),
  ('THE-TEST-UUID-HERE',
   'Which technique does njRAT use to maintain persistence on Windows?',
   '["Registry Run keys", "Kernel rootkit", "UEFI implant", "BIOS infection"]'::jsonb,
   0, 'njRAT commonly uses the Run/RunOnce registry keys for persistence.', 'medium', 2, 4),
  ('THE-TEST-UUID-HERE',
   'What is a primary indicator of njRAT activity in a network capture?',
   '["TLS handshake to port 443", "Plaintext beaconing on a custom TCP port", "DNS over HTTPS", "ICMP echo storm"]'::jsonb,
   1, 'njRAT historically beacons in plaintext over a custom TCP port (e.g. 5552).', 'medium', 3, 5);
```

### 7.2 Take the test

1. Visit `https://your-rema-club.vercel.app/tests/njrat-fundamentals`
2. Click **Begin Test**
3. Enter your name and **the email you verified with Resend in Step 4**
4. Check your inbox for the 6-digit OTP — should arrive in 5–15 seconds
5. Enter OTP, take the test, submit
6. If you score ≥60%, you should see "Certificate issued" and receive a **second email** with the PDF attached

### 7.3 Verify the certificate

The cert email contains a verification URL like `https://your-app.vercel.app/verify/REMA-2026-XXXXXX`. Open it. You should see the public verification page showing the recipient name, score, and a download PDF button.

If all of this works, **the entire stack is operational**.

---

## Step 8 — Wire up the 4Q view (15 min, ongoing)

The 4Q infrastructure is live but every topic starts empty. To populate it, you link existing content (videos, articles, tests) to topics via SQL or (later) the admin panel.

### 8.1 Add your first topic to a unit

```sql
-- Find Unit 2 (Static Analysis) of the REMA course
select u.id as unit_id, u.title
from public.units u
join public.courses c on c.id = u.course_id
where c.slug = 'rema' and u.unit_number = 2;
-- Note the unit_id

-- Insert a topic in that unit
insert into public.topics (unit_id, slug, title, topic_number, description,
  learning_objectives, estimated_minutes, is_published, order_index)
values (
  'PASTE-UNIT-ID-HERE',
  'pe-file-structure',
  'PE File Structure & Header Analysis',
  1,
  'Anatomy of a Windows PE binary: DOS header, NT headers, sections, imports, and exports.',
  array[
    'Identify each major component of a Windows PE binary',
    'Use a hex viewer to locate the DOS and NT headers manually',
    'Read the import table to predict malware behaviour',
    'Calculate per-section entropy and interpret what it suggests'
  ],
  45,
  true,
  1
);
```

### 8.2 Link content to that topic

```sql
-- Link an existing test to the topic (Q4)
insert into public.topic_tests (topic_id, test_id, order_index)
select t.id, x.id, 0
from public.topics t, public.tests x
where t.slug = 'pe-file-structure' and x.slug = 'njrat-fundamentals';

-- Add a Q3 web resource
insert into public.topic_web_links (topic_id, title, url, description, source_type, order_index)
select t.id, 'PE Format — Microsoft Docs',
  'https://learn.microsoft.com/en-us/windows/win32/debug/pe-format',
  'Official Microsoft documentation of the PE/COFF file format.',
  'reference', 1
from public.topics t where t.slug = 'pe-file-structure';
```

### 8.3 Visit the topic page

Open `https://your-app.vercel.app/learn/rema/unit-2-static-analysis/pe-file-structure`

You'll see the four-quadrant layout with whatever you linked.

> When the admin panel ships in Phase 6, this will all be a few clicks instead of SQL.

---

## Domain (optional)

To use a custom domain instead of `*.vercel.app`:

1. **Vercel → Settings → Domains → Add**
2. Enter your domain (e.g. `rema.epochzero.net` or `learn.epochzero.net`)
3. Vercel shows you a CNAME record. Add it at your DNS provider (where epochzero.net lives).
4. After verification, also update `NEXT_PUBLIC_SITE_URL` in Vercel env vars to the new domain and redeploy.

---

## Common issues

| Symptom | Fix |
|---------|-----|
| Build fails on Vercel with "Module not found" | Local `node_modules` got committed. Delete it: `git rm -rf --cached node_modules && git commit -m "remove node_modules" && git push` |
| OTP email never arrives | Check Resend → **Logs** tab. If "Email not allowed", you're sending to a non-verified address while still on `onboarding@resend.dev`. Either verify the recipient in Resend, or move to your own domain (Path B). |
| OTP arrives but verification fails | Check Vercel → **Functions → Logs** for the `/api/otp/verify` route. Most likely cause: `SUPABASE_SERVICE_ROLE_KEY` is wrong or missing. |
| Certificate PDF generation hangs / times out | Vercel Hobby has 10s timeout on Edge functions but 30s on Node functions. The cert route already has `maxDuration = 30`. If it still times out, the Resend send is slow — check Resend dashboard. |
| `relation "public.courses" does not exist` | Migration 003 wasn't run. Re-run it. |
| Topic page shows all empty quadrants | Topics start empty. Link content via the SQL in Step 8.2 (or wait for admin panel in Phase 6). |

---

## Post-deploy checklist

- [ ] All three SQL migrations ran without error
- [ ] OTP email arrives within 30 seconds
- [ ] Certificate email with PDF attachment arrives after passing
- [ ] `/verify/REMA-...` page loads the certificate
- [ ] `/learn` shows the REMA course with 6 units
- [ ] You're a `super_admin` in the `admin_users` table
- [ ] `RESEND_FROM_EMAIL` points to a domain you control (move off `onboarding@resend.dev`)
- [ ] `NEXT_PUBLIC_SITE_URL` matches your live URL (no trailing slash)

---

## What's next

Phase 5 (student dashboard) and Phase 6 (admin panel for managing courses, units, topics, MCQ bulk import) are the remaining work. The data model is final and operational; everything from here is building UI on top of it.
