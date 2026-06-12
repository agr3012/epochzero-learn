// app/api/pdf/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  const { fileId } = params;

  if (!/^[A-Za-z0-9_-]{20,60}$/.test(fileId)) {
    return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 });
  }

  // confirm=t bypasses Google's virus-scan warning page for larger files
  const url = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`;

  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EpochZeroLearn/1.0)',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Could not fetch PDF from Google Drive' },
        { status: res.status }
      );
    }

    return new NextResponse(res.body, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': 'inline',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}
