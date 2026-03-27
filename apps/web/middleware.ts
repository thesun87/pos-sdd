import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001';

// Routes yêu cầu xác thực
const PROTECTED_PATTERNS = [
  /^\/(dashboard|management|pos|kds)/,
];

// Routes auth (public)
const AUTH_PATTERNS = [
  /^\/login/,
  /^\/pin/,
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATTERNS.some((pattern) => pattern.test(pathname));

  if (!isProtected) {
    return NextResponse.next();
  }

  // Kiểm tra session bằng cách gọi API server với cookie forwarding
  const cookieHeader = request.headers.get('cookie') ?? '';

  try {
    const res = await fetch(`${API_BASE}/api/v1/auth/session`, {
      headers: { cookie: cookieHeader },
      // Không dùng credentials: 'include' trong server-side fetch
    });

    if (res.status === 401) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    // Nếu không connect được API server, redirect về login để an toàn
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
