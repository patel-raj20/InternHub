import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";

/**
 * Middleware Proxy for InternHub
 * Handles:
 * 1. Token Verification (Custom Jose/Hasura compatible)
 * 2. Role-Based Access Control (RBAC)
 * 3. Authenticated Redirection (Redirecting logged-in users away from /login)
 * 4. Automatic Dashboard Routing
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Static Assets and API Bypass
  if (
    pathname.includes('.') ||
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Extract and Verify Token
  // NextAuth getToken + Custom Jose Decoder to match lib/auth.ts signing strategy
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    decode: async ({ token, secret }) => {
      if (!token) return null;
      try {
        const key = new TextEncoder().encode((secret as string) || process.env.NEXTAUTH_SECRET);
        const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
        return payload as any;
      } catch (e) {
        console.error("[Middleware] Token verification failed:", e instanceof Error ? e.message : "Unknown error");
        return null;
      }
    }
  });

  const role = token?.role as string;

  // 3. Authenticated Redirection
  // If user is already logged in, don't let them go back to login/recovery pages
  if (token && pathname.startsWith('/login')) {
    console.log(`[Middleware] Authenticated user (${token.email}) attempting to access login path. Redirecting to authorized dashboard.`);
    if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    if (role === 'DEPT_ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'INTERN') return NextResponse.redirect(new URL('/profile', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Public Path Permission
  if (pathname.startsWith('/login') || pathname === '/accept-invite') {
    return NextResponse.next();
  }

  // 5. Protected Path Lockdown
  if (!token) {
    console.log(`[Middleware] Unauthorized access attempt to ${pathname}. Redirecting to login.`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 6. Role-Based Access Control (RBAC)
  // Prevent Interns from accessing Admin/SuperAdmin areas
  if (role === 'INTERN') {
    if (pathname.startsWith('/admin') || pathname.startsWith('/super-admin')) {
      console.warn(`[Security Alert] Intern (${token.email}) attempted to access admin path: ${pathname}`);
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }

  // Prevent Dept Admins from accessing SuperAdmin areas
  if (role === 'DEPT_ADMIN') {
    if (pathname.startsWith('/super-admin')) {
      console.warn(`[Security Alert] Dept Admin (${token.email}) attempted to access super-admin path: ${pathname}`);
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // 7. Root Path/Dashboard Auto-Routing
  if (pathname === '/') {
    if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
    if (role === 'DEPT_ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    if (role === 'INTERN') return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};