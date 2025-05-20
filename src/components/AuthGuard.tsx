'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingWithTimeout } from './LoadingWithTimeout';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'patient' | 'doctor' | 'admin';
  redirectPath?: string;
}

/**
 * AuthGuard component that ensures authentication is ready before rendering protected pages
 * 
 * @param children - The protected content to render when authentication is ready
 * @param requiredRole - Optional role requirement ('patient', 'doctor', or 'admin')
 * @param redirectPath - Optional custom redirect path (defaults to login page)
 */
export function AuthGuard({ 
  children, 
  requiredRole, 
  redirectPath = '/auth/login' 
}: AuthGuardProps) {
  const { user, profile, isLoading, authStateReady } = useAuth();
  const router = useRouter();

  // Check authentication and role requirements
  useEffect(() => {
    // Only perform checks after auth state is fully ready
    if (!isLoading && authStateReady) {
      // If user is not authenticated, redirect to login
      if (!user) {
        // Preserve the current URL to redirect back after login
        const currentPath = window.location.pathname;
        const searchParams = window.location.search;
        const redirectParams = new URLSearchParams();
        redirectParams.set('redirectTo', currentPath + searchParams);
        
        router.push(`${redirectPath}?${redirectParams.toString()}`);
        return;
      }

      // If role is required but user doesn't have that role, redirect to dashboard
      if (requiredRole && profile?.role !== requiredRole) {
        console.log(`Access denied: ${profile?.role} trying to access ${requiredRole} route`);
        router.push('/dashboard');
        return;
      }
    }
  }, [user, profile, isLoading, authStateReady, requiredRole, redirectPath, router]);

  // Show loading state while auth is initializing or checking
  if (isLoading || !authStateReady) {
    return (
      <LoadingWithTimeout
        isLoading={true}
        loadingMessage="Verifying your credentials..."
      >
        <></>
      </LoadingWithTimeout>
    );
  }

  // If auth checks pass (user exists and meets role requirements), render children
  if (user && (!requiredRole || profile?.role === requiredRole)) {
    return <>{children}</>;
  }

  // Return empty while redirecting
  return (
    <LoadingWithTimeout
      isLoading={true}
      loadingMessage="Redirecting..."
    >
      <></>
    </LoadingWithTimeout>
  );
} 