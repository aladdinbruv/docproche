import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * Verifies the hCaptcha token with the hCaptcha API
 */
async function verifyHCaptcha(token: string): Promise<boolean> {
  if (!token) return false;

  // If we're using the test sitekey, return true for testing
  if (process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001') {
    return true;
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.HCAPTCHA_SECRET_KEY || '',
        response: token
      })
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    // Get request body
    const { email, password, userData, captchaToken } = await request.json();
    
    console.log('Server-side registration attempt for:', email);
    
    // Verify hCaptcha token
    const isValidCaptcha = await verifyHCaptcha(captchaToken);
    if (!isValidCaptcha) {
      console.error('Invalid captcha token');
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 });
    }
    
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
        captchaToken
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