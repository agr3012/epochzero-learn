// app/api/enrollment/redeem/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAccount } from '@/lib/auth';
import { redeemEnrollmentCode } from '@/lib/enrollment';

const schema = z.object({ code: z.string().min(1).max(64) });

export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: 'Enter an enrollment code.' }, { status: 400 });

    const result = await redeemEnrollmentCode(account.id, parsed.data.code);
    if (!result.ok)
      return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json({
      success: true,
      batch_label: result.batch_label,
      course_title: result.course_title,
    });
  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
