// app/api/progress/video/heartbeat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentAccount } from '@/lib/auth';
import { recordVideoHeartbeat } from '@/lib/progress';

const schema = z.object({
  video_id: z.string().uuid(),
  delta_seconds: z.number().min(0).max(60),
  position_seconds: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const account = await getCurrentAccount();
    if (!account)
      return NextResponse.json({ error: 'Sign in required' }, { status: 401 });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success)
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    const { video_id, delta_seconds, position_seconds } = parsed.data;

    const result = await recordVideoHeartbeat(account.id, video_id, delta_seconds, position_seconds);
    if (!result)
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
