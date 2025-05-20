import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

// This middleware protects routes that should only be accessible to authenticated users
export async function middleware(request: NextRequest) {
  // Skip middleware if the URL has a 'reason' parameter to prevent redirect loops
  if (request.nextUrl.searchParams.has('reason')) {
    console.log('Skipping middleware redirect due to reason parameter');
    return NextResponse.next();
  }

  // Create a response object with no modifications initially
  const response = NextResponse.next();
  
  // Create a Supabase client with the request and response
  const supabase = createMiddlewareClient<Database>({ 
    req: request, 
    res: response 
  });
  
  try {
    // Check if we have a session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // URLs that require authentication
    const protectedPaths = [
      '/dashboard',
      '/booking',
      '/appointments',
      '/profile',
      '/health-records',
      '/payments',
      '/prescriptions',
      '/consultation'
    ];

    // Check if the URL is protected
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    // If accessing a protected route and not signed in, redirect to login
    if (isProtectedPath && !session) {
      // Store the original URL as a redirect parameter
      const originalPath = request.nextUrl.pathname;
      const searchParams = request.nextUrl.search;
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', originalPath + searchParams);
      return NextResponse.redirect(redirectUrl);
    }

    // Doctor-only paths - expanded list
    const doctorPaths = [
      '/doctor/', 
      '/doctor/appointments',
      '/doctor/patients',
      '/doctor/schedule',
      '/doctor/prescriptions',
      '/doctor/analytics',
      '/doctor/billing',
      '/doctor/profile',
      '/doctor/medical-records',
      '/doctor/consultations',
      '/doctor/consultation'
    ];

    // Check if the URL is doctor-only
    const isDoctorPath = doctorPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    // Improved handling for doctor routes
    if (isDoctorPath) {
      if (!session) {
        // If not logged in, redirect to login
        const redirectUrl = new URL('/auth/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        redirectUrl.searchParams.set('reason', 'auth_required');
        return NextResponse.redirect(redirectUrl);
      }

      try {
        // First try to get role from database (most reliable)
        const { data: userData, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Middleware - Error fetching user role:', error.message);
          // Fallback to metadata if DB query fails
          const userRole = session.user?.user_metadata?.role;
          
          if (userRole !== 'doctor') {
            const redirectUrl = new URL('/dashboard', request.url);
            redirectUrl.searchParams.set('reason', 'not_doctor');
            return NextResponse.redirect(redirectUrl);
          }
        } else if (userData && userData.role !== 'doctor') {
          // User exists but is not a doctor
          const redirectUrl = new URL('/dashboard', request.url);
          redirectUrl.searchParams.set('reason', 'not_doctor');
          return NextResponse.redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Middleware - Exception in role check:', error);
        // On any error, default to checking metadata
        const userRole = session.user?.user_metadata?.role;
        
        if (userRole !== 'doctor') {
          const redirectUrl = new URL('/dashboard', request.url);
          redirectUrl.searchParams.set('reason', 'not_doctor');
          return NextResponse.redirect(redirectUrl);
        }
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
      // Check if there's a redirectTo parameter in the URL
      const redirectTo = request.nextUrl.searchParams.get('redirectTo');
      if (redirectTo && redirectTo.startsWith('/')) {
        // Redirect to the original destination if it exists and is valid
        const redirectUrl = new URL(redirectTo, request.url);
        redirectUrl.searchParams.set('reason', 'already_logged_in');
        return NextResponse.redirect(redirectUrl);
      }
      
      // Otherwise redirect to dashboard
      const redirectUrl = new URL('/dashboard', request.url);
      redirectUrl.searchParams.set('reason', 'already_logged_in');
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error('Middleware exception:', error);
    return response;
  }
}

// Expanded matcher to include all protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/booking/:path*',
    '/appointments/:path*',
    '/profile/:path*',
    '/auth/:path*',
    '/doctor/:path*',
    '/payments/:path*',
    '/consultation/:path*',
    '/health-records/:path*',
    '/prescriptions/:path*',
  ],
}; 