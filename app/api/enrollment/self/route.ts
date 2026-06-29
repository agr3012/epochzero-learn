// app/api/enrollment/self/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAccount } from '@/lib/auth';
import { selfEnrollInCourse } from '@/lib/enrollment';

const schema = z.object({ course_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await selfEnrollInCourse(account.id, parsed.data.course_id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
