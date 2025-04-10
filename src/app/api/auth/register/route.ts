import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get request body
    const { email, password, userData } = await request.json();
    
    console.log('Server-side registration attempt for:', email);
    
    // Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          role: userData.role || 'patient',
        },
        emailRedirectTo: `${requestUrl.origin}/auth/verify-email`,
      }
    });
    
    if (authError) {
      console.error('Auth error:', authError.message);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'No user returned from auth signup' },
        { status: 500 }
      );
    }
    
    console.log('Auth signup successful, user ID:', authData.user.id);
    
    // Create entry in users table
    const userProfile = {
      id: authData.user.id,
      email,
      full_name: userData.full_name || '',
      role: userData.role || 'patient',
      created_at: new Date().toISOString(),
    };
    
    // Use direct SQL execution for inserting the user profile
    const { error: profileError } = await supabase.rpc(
      'insert_user_profile',
      {
        user_id: authData.user.id,
        user_email: email,
        user_full_name: userData.full_name || '',
        user_role: userData.role || 'patient'
      }
    );
    
    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      message: 'Registration successful. Please check your email to verify your account.'
    });
    
  } catch (error: any) {
    console.error('Server error during registration:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 