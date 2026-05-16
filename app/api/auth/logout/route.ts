// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth';

export async function POST() {
  clearSessionCookie();
  return NextResponse.redirect(new URL('/dashboard/login', process.env.NEXT_PUBLIC_SITE_URL!));
}
