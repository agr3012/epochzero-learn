// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hashPassword, isValidRRUEmail, generateSessionToken, setSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });

    if (!isValidRRUEmail(email))
      return NextResponse.json({ error: 'Only RRU email addresses are accepted.' }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const admin = createAdminClient();
    const normalised = email.trim().toLowerCase();

    // Check if account already exists
    const { data: existing } = await admin
      .from('student_accounts')
      .select('id')
      .eq('email', normalised)
      .maybeSingle();

    if (existing)
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

    const password_hash = await hashPassword(password);

    const { data: account, error } = await admin
      .from('student_accounts')
      .insert({ email: normalised, password_hash, role: 'student' })
      .select('id, email, role')
      .single();

    if (error || !account)
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });

    const token = generateSessionToken(account.id, account.email);
    setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
