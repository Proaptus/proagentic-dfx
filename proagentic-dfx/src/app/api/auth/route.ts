import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const AUTH_COOKIE = 'proagentic-auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const expectedPassword = process.env.AUTH_PASSWORD || 'CNA180644';

    // In dev mode, always allow access; in prod, require password
    const isAuthorized = isDev || password === expectedPassword;

    if (isAuthorized) {
      const token = Buffer.from(`${Date.now()}-auth`).toString('base64');

      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_MAX_AGE,
        path: '/',
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
