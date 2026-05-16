// =====================================================================
// app/api/auth/login/route.ts
// =====================================================================
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { verifyPassword, generateSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

    const admin = createAdminClient();
    const normalised = email.trim().toLowerCase();

    const { data: account } = await admin
      .from('student_accounts')
      .select('id, email, password_hash, role, is_active')
      .eq('email', normalised)
      .maybeSingle();

    // Generic message — do not reveal whether email exists
    if (!account || !account.is_active)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    const valid = await verifyPassword(password, account.password_hash);
    if (!valid)
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    // Update last login
    await admin
      .from('student_accounts')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', account.id);

    const token = generateSessionToken(account.id, account.email);
    setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}

// =====================================================================
// app/api/auth/logout/route.ts  (separate file — shown below as comment)
// =====================================================================
// import { clearSessionCookie } from '@/lib/auth';
// export async function POST() {
//   clearSessionCookie();
//   return NextResponse.json({ success: true });
// }
