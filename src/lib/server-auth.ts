import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';
import { getServerComponentClient } from './server-supabase';

// Function to get the current user's session on the server
export async function getSession() {
  // Use the helper function for consistent cookie handling
  const supabase = getServerComponentClient();
  
  // Use getUser for better security instead of getSession
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // If we need the session data, we still fetch it
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

// Function to get the current user from session
export async function getCurrentUser() {
  // Use the helper function for consistent cookie handling
  const supabase = getServerComponentClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Function to get the current user's profile from the database
export async function getUserProfile(userId?: string) {
  if (!userId) {
    const user = await getCurrentUser();
    userId = user?.id;
  }

  if (!userId) return null;

  // Use the helper function for consistent cookie handling
  const supabase = getServerComponentClient();
  
  // First try using the secure RPC function
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_user_profile_secure', { user_id: userId })
    .maybeSingle();
    
  if (!rpcError && rpcData) {
    return rpcData;
  }
  
  // Fall back to direct query if RPC fails
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
  const user = await getCurrentUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Use the helper function for consistent cookie handling
  const supabase = getServerComponentClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Function to require a specific role for server components
export async function requireRole(requiredRole: 'patient' | 'doctor' | 'admin') {
  const session = await requireAuth();
  
  // Use the helper function for consistent cookie handling
  const supabase = getServerComponentClient();

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
  // Use the helper function for consistent cookie handling
  return getServerComponentClient();
} 