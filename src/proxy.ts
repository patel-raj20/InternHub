import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Mock function to simulate session retrieval
// In a real app, this would use NextAuth's getToken or a similar method
async function getSession(req: NextRequest) {
  // Check for a cookie or header that identifies the user and their role
  // This is a placeholder for development
  const sessionCookie = req.cookies.get('session');
  if (!sessionCookie) return null;
  
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude static files and api routes
  if (
    pathname.includes('.') || 
    pathname.startsWith('/api') || 
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const session = await getSession(request);

  // For development: if no session, allow access but ideally redirect to login
  if (!session && pathname !== '/login') {
    // If the login page exists, redirect. Otherwise, allow (or bypass)
    // For now, I'll allow access to avoid blocking the user if they don't have cookies set
    return NextResponse.next();
  }

  // If logged in, enforce role-based access
  if (session) {
    const { role } = session;

    // Interns can only access /intern routes
    if (role === 'INTERN' && (pathname.startsWith('/admin') || pathname.startsWith('/super-admin'))) {
      return NextResponse.redirect(new URL('/profile', request.url));
    }

    // Dept Admins cannot access /super-admin routes
    if (role === 'DEPT_ADMIN' && pathname.startsWith('/super-admin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    
    // If user is on root, redirect to their respective dashboard
    if (pathname === '/') {
      if (role === 'SUPER_ADMIN') return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
      if (role === 'DEPT_ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (role === 'INTERN') return NextResponse.redirect(new URL('/profile', request.url));
    }
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
