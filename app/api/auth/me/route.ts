// app/api/auth/me/route.ts
// Returns 200 + user info if session is valid, 401 otherwise.
// Used by forum pages to check login state client-side.

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('ez_session')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const [payloadB64] = token.split('.');
    if (!payloadB64) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString());
    if (!payload?.userId) return NextResponse.json({ error: 'Invalid session' }, { status: 401 });

    const { data } = await supabaseAdmin
      .from('student_accounts')
      .select('id, display_name, email, is_active')
      .eq('id', payload.userId)
      .single();

    if (!data || !data.is_active) return NextResponse.json({ error: 'Account inactive' }, { status: 401 });

    return NextResponse.json({ id: data.id, name: data.display_name, email: data.email });
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}
