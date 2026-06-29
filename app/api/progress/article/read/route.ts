// app/api/progress/article/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAccount } from '@/lib/auth';
import { markArticleRead } from '@/lib/progress';

const schema = z.object({ article_id: z.string().uuid() });

export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    if (!account.email_verified)
      return NextResponse.json({ error: 'Verify your email to track progress.' }, { status: 403 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

    await markArticleRead(account.id, parsed.data.article_id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
