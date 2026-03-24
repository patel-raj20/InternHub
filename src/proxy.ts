import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    pathname === '/login' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Get token manually
  const cookieName = process.env.NODE_ENV === 'production' 
    ? '__Secure-next-auth.session-token' 
    : 'next-auth.session-token';
    
  const tokenString = request.cookies.get(cookieName)?.value;

  let token: any = null;
  if (tokenString) {
    try {
      const key = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload } = await jwtVerify(tokenString, key, { algorithms: ["HS256"] });
      token = payload;
    } catch (e) {
      console.error("[Middleware] Token verification failed:", e.message);
    }
  }

  console.log(`[Middleware Check] Path: ${pathname}, Token found: ${!!token}, Role: ${token?.role}`);

  if (!token) {
    console.log(`[Middleware Redirect] No valid token found, redirecting ${pathname} to /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const role = token.role as string;

  if (role === 'INTERN') {
    if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
        return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  if (role === 'DEPT_ADMIN') {
    if (pathname.startsWith('/super-admin')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }
  
  // Redirection for root /
  if (pathname === '/') {
    if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    if (role === 'DEPT_ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'INTERN') return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
