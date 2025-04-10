import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';

// Function to get the current user's session on the server
export async function getSession() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Function to get the current user from session
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// Function to get the current user's profile from the database
export async function getUserProfile(userId?: string) {
  if (!userId) {
    const user = await getCurrentUser();
    userId = user?.id;
  }

  if (!userId) return null;

  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

// Function to require authentication for server components
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/login');
  }

  return session;
}

// Function to require a specific role for server components
export async function requireRole(requiredRole: 'patient' | 'doctor' | 'admin') {
  const session = await requireAuth();
  const supabase = createServerComponentClient<Database>({ cookies });

  // Get user's role from the database
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !data || data.role !== requiredRole) {
    // Redirect to dashboard if role doesn't match
    redirect('/dashboard');
  }

  return session;
}

// Create a Supabase client for server components
export function createServerSupabaseClient() {
  return createServerComponentClient<Database>({ cookies });
} 