import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'proagentic-auth';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'h2tank2025';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export async function POST(request: Request) {
  try {
    const { password, isDev } = await request.json();

    // In development, allow bypassing auth
    if (isDev && !IS_PRODUCTION) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, 'dev-authenticated', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return NextResponse.json({ success: true });
    }

    // Validate password
    if (password === DEMO_PASSWORD) {
      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, 'authenticated', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  return NextResponse.json({ success: true });
}
