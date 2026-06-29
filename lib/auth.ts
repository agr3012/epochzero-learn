// lib/auth.ts
// Server-side only — never import this in client components

import { createAdminClient } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS          = 12;
const SESSION_DURATION_DAYS  = 7;
const RESET_TOKEN_EXPIRY_HOURS = 2;
const COOKIE_NAME            = 'ez_session';

// ── Role type ─────────────────────────────────────────────────────────────
export type UserRole = 'student' | 'admin' | 'super_admin';

// ── Password helpers ──────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Session token — signed JWT stored in httpOnly cookie ──────────────────
export function generateSessionToken(accountId: string, email: string): string {
  const payload = {
    sub:   accountId,
    email,
    exp:   Math.floor(Date.now() / 1000) + SESSION_DURATION_DAYS * 86400,
    iat:   Math.floor(Date.now() / 1000),
  };
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body   = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.DASHBOARD_SECRET ?? 'change-me-in-production';
  const sig    = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifySessionToken(token: string): { sub: string; email: string } | null {
  try {
    const [header, body, sig] = token.split('.');
    const secret   = process.env.DASHBOARD_SECRET ?? 'change-me-in-production';
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (expected !== sig) return null;
    const payload  = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}

// ── Cookie helpers ────────────────────────────────────────────────────────
export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   SESSION_DURATION_DAYS * 86400,
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
  const raw  = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(raw, 10);
  return { raw, hash };
}

export async function verifyResetToken(raw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(raw, hash);
}

export function resetTokenExpiresAt(): Date {
  return new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 3600 * 1000);
}

// ── Get current account from DB via session ───────────────────────────────
// Returns the full account row including role.
// Returns null if no valid session or account is inactive.
export async function getCurrentAccount(): Promise<{
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  display_name: string | null;
  email_verified: boolean;
} | null> {
  const session = getSessionFromCookie();
  if (!session) return null;
  const admin = createAdminClient();
  const { data } = await admin
    .from('student_accounts')
    .select('id, email, role, is_active, display_name, email_verified')
    .eq('id', session.sub)
    .single();
  if (!data || !data.is_active) return null;
  return data as { id: string; email: string; role: UserRole; is_active: boolean; display_name: string | null; email_verified: boolean };
}

// ── Role helpers ──────────────────────────────────────────────────────────

/**
 * Returns the role for any email address.
 * Safe to call in API routes — single DB query, cached per request.
 */
export async function getAccountRole(email: string): Promise<UserRole> {
  const admin    = createAdminClient();
  const { data } = await admin
    .from('student_accounts')
    .select('role')
    .eq('email', email.trim().toLowerCase())
    .single();
  return (data?.role as UserRole) ?? 'student';
}

/**
 * Throws if email is not admin or super_admin.
 * Use in API routes after verifying the session.
 *
 * @example
 * const account = await getCurrentAccount();
 * if (!account) return Response.json({ error: 'Unauthenticated' }, { status: 401 });
 * try { await requireAdmin(account.email); }
 * catch { return Response.json({ error: 'Forbidden' }, { status: 403 }); }
 */
export async function requireAdmin(email: string): Promise<void> {
  const role = await getAccountRole(email);
  if (!['admin', 'super_admin'].includes(role)) {
    throw new Error('Forbidden: admin access required');
  }
}

/**
 * Throws if email is not super_admin.
 * Use for destructive or elevated operations:
 * — assigning/revoking roles
 * — revoking certificates
 * — permanently deleting forum threads
 */
export async function requireSuperAdmin(email: string): Promise<void> {
  const role = await getAccountRole(email);
  if (role !== 'super_admin') {
    throw new Error('Forbidden: super_admin access required');
  }
}

/**
 * Convenience: returns true/false without throwing.
 * Useful for conditional UI rendering in server components.
 *
 * @example
 * const isAdmin = await checkIsAdmin(account.email);
 * // show admin controls conditionally
 */
export async function checkIsAdmin(email: string): Promise<boolean> {
  const role = await getAccountRole(email);
  return ['admin', 'super_admin'].includes(role);
}

export async function checkIsSuperAdmin(email: string): Promise<boolean> {
  const role = await getAccountRole(email);
  return role === 'super_admin';
}

// ── Admin action logger ───────────────────────────────────────────────────
/**
 * Writes to admin_actions audit table.
 * Call from any admin API route after a successful action.
 *
 * @example
 * await logAdminAction({
 *   adminEmail: account.email,
 *   action:     'approve_forum_thread',
 *   targetTable:'forum_threads',
 *   targetId:   threadId,
 * });
 */
export async function logAdminAction({
  adminEmail,
  action,
  targetTable,
  targetId,
  notes,
}: {
  adminEmail:   string;
  action:       string;
  targetTable?: string;
  targetId?:    string;
  notes?:       string;
}): Promise<void> {
  const admin = createAdminClient();
  await admin.from('admin_actions').insert({
    admin_email:  adminEmail,
    action,
    target_table: targetTable ?? null,
    target_id:    targetId    ?? null,
    notes:        notes        ?? null,
  });
}
