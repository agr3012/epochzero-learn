// app/api/auth/update-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionFromCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromCookie();
    if (!session)
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

    const { display_name } = await req.json();
    if (!display_name || !display_name.trim())
      return NextResponse.json({ error: 'Name cannot be empty.' }, { status: 400 });

    const admin = createAdminClient();
    const { error } = await admin
      .from('student_accounts')
      .update({ display_name: display_name.trim() })
      .eq('id', session.sub);

    if (error) {
      console.error('update-profile error:', error);
      return NextResponse.json({ error: `Failed to update: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('update-profile server error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
