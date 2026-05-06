#!/usr/bin/env node
/**
 * Bootstrap an admin user.
 *
 * Usage:
 *   1. The user must first sign up via Supabase Auth (e.g. via the Supabase
 *      Dashboard → Authentication → Add user, with "Auto Confirm User" enabled).
 *   2. Run this script with their email to insert a row into admin_users:
 *
 *      node scripts/bootstrap-admin.mjs you@example.com super_admin
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in env.
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const [, , email, role = 'admin'] = process.argv;
if (!email) {
  console.error('Usage: node scripts/bootstrap-admin.mjs <email> [role]');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Look up user by email
const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
if (listErr) {
  console.error('Error listing users:', listErr);
  process.exit(1);
}
const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
if (!user) {
  console.error(
    `No auth user found for ${email}. Create them in Supabase Dashboard → Authentication first.`
  );
  process.exit(1);
}

const { error: insertErr } = await supabase.from('admin_users').upsert({
  id: user.id,
  email: user.email,
  role,
});
if (insertErr) {
  console.error('Error inserting admin:', insertErr);
  process.exit(1);
}

console.log(`✓ ${email} promoted to ${role}.`);
