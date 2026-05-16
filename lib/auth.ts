// lib/auth.ts
// Server-side only — never import this in client components

import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;
const SESSION_DURATION_DAYS = 7;
const RESET_TOKEN_EXPIRY_HOURS = 2;
const COOKIE_NAME = 'ez_session';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Session token — random hex stored in httpOnly cookie ──────────────────
// We store a random session ID in the cookie and map it to account_id
// in a simple in-memory approach using JWT signed with DASHBOARD_SECRET.

export function generateSessionToken(accountId: string, email: string): string {
  const payload = {
    sub: accountId,
    email,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_DAYS * 86400,
    iat: Math.floor(Date.now() / 1000),
  };
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body    = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret  = process.env.DASHBOARD_SECRET ?? 'change-me-in-production';
  const sig     = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifySessionToken(token: string): { sub: string; email: string } | null {
  try {
    const [header, body, sig] = token.split('.');
    const secret = process.env.DASHBOARD_SECRET ?? 'change-me-in-production';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (expected !== sig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────
export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly:  true,
    secure:    process.env.NODE_ENV === 'production',
    sameSite:  'lax',
    path:      '/',
    maxAge:    SESSION_DURATION_DAYS * 86400,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
}

export function getSessionFromCookie(): { sub: string; email: string } | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

// ── Password reset token ──────────────────────────────────────────────────
export async function generateResetToken(): Promise<{ raw: string; hash: string }> {
  const raw    = crypto.randomBytes(32).toString('hex');
  const hash   = await bcrypt.hash(raw, 10);
  return { raw, hash };
}

export async function verifyResetToken(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}

export function resetTokenExpiresAt(): Date {
  return new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 3600 * 1000);
}

// ── RRU email validation ──────────────────────────────────────────────────
const VALID_DOMAINS = ['student.rru.ac.in', 'rru.ac.in'];

export function isValidRRUEmail(email: string): boolean {
  const t = email.trim().toLowerCase();
  if (!t.includes('@')) return false;
  return VALID_DOMAINS.includes(t.split('@')[1]);
}

// ── Get current account from DB via session ────────────────────────────────
export async function getCurrentAccount() {
  const session = getSessionFromCookie();
  if (!session) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from('student_accounts')
    .select('id, email, role, is_active')
    .eq('id', session.sub)
    .single();
  if (!data || !data.is_active) return null;
  return data;
}
