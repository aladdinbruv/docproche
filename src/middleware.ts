import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// This middleware protects routes that should only be accessible to authenticated users
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = createMiddlewareClient<Database>({ req: request, res: response });
  
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // URLs that require authentication
  const protectedPaths = [
    '/dashboard',
    '/booking',
    '/doctors/appointments',
    '/profile',
  ];

  // Check if the URL is protected
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing a protected route and not signed in, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Doctor-only paths
  const doctorPaths = [
    '/dashboard/doctor',
    '/dashboard/appointments',
  ];

  // Check if the URL is doctor-only
  const isDoctorPath = doctorPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing a doctor-only route but user is not a doctor, redirect to dashboard
  if (isDoctorPath && session) {
    // Fetch user role from metadata
    const userRole = session.user?.user_metadata?.role;
    
    if (userRole !== 'doctor') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Auth URLs that should not be accessible when signed in
  const authPaths = [
    '/auth/login',
    '/auth/signin',
    '/auth/signup',
    '/auth/register',
  ];

  // Check if the URL is an auth path
  const isAuthPath = authPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // If accessing an auth route and already signed in, redirect to dashboard
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Only apply this middleware to routes that should be protected
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/booking/:path*',
    '/doctors/appointments/:path*',
    '/profile/:path*',
    '/auth/:path*',
  ],
}; 