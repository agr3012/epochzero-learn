# REMA Club — Learning Portal

A Next.js 14 + Supabase + Resend learning hub for Reverse Engineering and Malware Analysis. Public articles, video walkthroughs, MCQ tests with verifiable certificates, eBook and question bank downloads.

> **Course Instructor:** Ashish Revar
> **Identity:** REMA Club — Reverse · Reveal · Respond

---

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + custom theme
- **Supabase** — Postgres, Auth, Storage, RLS
- **Resend** — transactional email
- **@react-pdf/renderer** — certificate PDFs
- **next-mdx-remote** — article rendering
- **Vercel** — hosting (Hobby plan)

---

## Project structure

```
rema-club/
├── app/                          # App Router pages
│   ├── (api)
│   │   ├── otp/send/             # POST: send 6-digit code
│   │   ├── otp/verify/           # POST: verify code, start attempt
│   │   ├── tests/submit/         # POST: score test, trigger cert
│   │   └── certificates/generate/# POST: render PDF, upload, email
│   ├── articles/[slug]/          # Article reader (MDX)
│   ├── videos/[slug]/            # Video + step-by-step sidebar
│   ├── tests/[slug]/             # Test detail + engine
│   ├── verify/[uid]/             # Public certificate verification
│   ├── resources/                # Downloadable PDFs
│   ├── podcast/                  # Audio episodes
│   ├── reels/                    # Instagram reel grid
│   ├── about/
│   ├── page.tsx                  # Landing
│   └── layout.tsx
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── test-engine.tsx           # Multi-step MCQ engine (client)
│   ├── certificate-pdf.tsx       # PDF document
│   └── video-player.tsx          # YouTube embed wrapper
├── lib/
│   ├── supabase/                 # client / server / admin clients
│   ├── resend.ts
│   ├── env.ts                    # Zod-validated env vars
│   └── utils.ts                  # OTP gen/hash, formatters
├── supabase/migrations/
│   ├── 001_initial_schema.sql
│   └── 002_rls_policies.sql
├── public/
│   └── logo.png                  # REMA Club shield
├── scripts/
│   └── bootstrap-admin.mjs       # promote a user to admin
├── middleware.ts                 # Supabase session refresh
├── tailwind.config.ts
├── next.config.js
└── .env.local.example
```

---

## Deployment checklist

Follow in this order. Anything skipped will break a downstream step.

### 1. Supabase project

1. Create a new project at <https://supabase.com>.
2. **SQL Editor → New query** → paste `supabase/migrations/001_initial_schema.sql` → Run.
3. **SQL Editor → New query** → paste `supabase/migrations/002_rls_policies.sql` → Run.
4. **Project Settings → API** — copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret)

### 2. Resend account (email)

1. Sign up at <https://resend.com>.
2. **API Keys → Create API Key** → copy as `RESEND_API_KEY`.
3. **Domains → Add Domain** → enter the domain you'll send from (e.g. `epochzero.net`). Add the DNS records Resend gives you (SPF, DKIM, DMARC). Wait for verification.
4. Set `RESEND_FROM_EMAIL` to a verified sender — for example `REMA Club <noreply@epochzero.net>`.
   - For initial testing without a verified domain, you can use `onboarding@resend.dev`.

### 3. Local development

```bash
git clone <your-repo-url>
cd rema-club
cp .env.local.example .env.local
# Fill in all values in .env.local
npm install
npm run dev
```

Visit <http://localhost:3000>.

### 4. Vercel deployment

1. Push the repo to GitHub.
2. <https://vercel.com> → **Add New → Project** → import the repo.
3. **Environment Variables** → add every variable from `.env.local.example`. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL (e.g. `https://rema-club.vercel.app`).
4. **Deploy.**
5. Once deployed, update `RESEND_FROM_EMAIL` if your Resend domain wasn't verified at first deploy, then **Redeploy**.

### 5. Bootstrap an admin user

The admin panel is gated by RLS on `admin_users`. To create the first admin:

1. **Supabase Dashboard → Authentication → Add user** → use your email, enable *Auto Confirm User*.
2. Run:
   ```bash
   node scripts/bootstrap-admin.mjs you@example.com super_admin
   ```
3. Now sign in to the app at `/admin/login` with that email (admin UI to be built in Phase 6).

### 6. Add content

Until the admin UI is live, insert content directly via the Supabase **Table Editor** or SQL:

- `articles` — set `mdx_content`, `is_published = true`, `published_at = now()`
- `videos` — set `youtube_id`, optionally `steps` as JSON array
- `tests` + `test_questions` — bulk-insert questions; ensure `correct_index` is set
- `resources` — upload PDFs to Supabase Storage `resources` bucket, paste public URL into `file_url`

### 7. Verify the test → certificate flow end-to-end

1. Insert a test row + 5 questions via SQL Editor.
2. Visit `/tests/<slug>`.
3. Submit your real email → check inbox for OTP → take the test → verify the certificate email arrives with the PDF attached.
4. Visit `/verify/REMA-2026-XXXXXX` to confirm public verification works.

---

## Security model

- **Correct answers never leave the server.** The test engine receives only question text + options. Scoring runs in the API route using the service role key.
- **Option shuffling is integrity-checked** via an `option_permutation` array echoed by the client and re-applied server-side before scoring.
- **OTP rate limit:** 5 codes per email per test per hour. SHA-256 hashed at rest.
- **First-pass-only certificates.** Repeat passes do not issue new certificates.
- **RLS** on every table. The anon key cannot read `test_questions`, `attempts`, `email_otps`, or `admin_users`.
- **Service role key** is used only in API routes and the bootstrap script. Never imported into a Client Component.
- **Optional Cloudflare Turnstile** can be enabled by setting `TURNSTILE_SECRET_KEY` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

---

## Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| 1. Foundation | ✓ Complete | Scaffold, landing, layout, Supabase, design system |
| 2. Content reading | ✓ Complete | Articles (MDX), resources, podcast, reels |
| 3. Video learning | ✓ Complete | YouTube grid, step-by-step sidebar |
| 4. Test engine + certs | ✓ Complete | OTP, MCQ flow, PDF cert, email, public verify |
| 5. Student dashboard | ◯ Pending | Passwordless login, past attempts, downloadable certs |
| 6. Admin panel | ◯ Pending | CRUD for articles/videos/tests, bulk MCQ import |

---

## License

Educational project. Content licensing per article/video as marked. Code: MIT.
