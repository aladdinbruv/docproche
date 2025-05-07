import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Database } from '@/types/supabase';

/**
 * Verifies the hCaptcha token with the hCaptcha API
 */
async function verifyHCaptcha(token: string): Promise<boolean> {
  if (!token) return false;

  // Always allow verification in development or when using test key
  // The test sitekey is '10000000-ffff-ffff-ffff-000000000001'
  if (process.env.NODE_ENV === 'development' || 
      process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY === '10000000-ffff-ffff-ffff-000000000001') {
    console.log('Development environment or test key detected - bypassing hCaptcha verification');
    return true;
  }

  try {
    const secret = process.env.HCAPTCHA_SECRET_KEY;
    if (!secret) {
      console.error('HCAPTCHA_SECRET_KEY is not set');
      // In production this would be a serious error, but to enable testing:
      return process.env.NODE_ENV !== 'production';
    }

    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secret,
        response: token
      })
    });

    const data = await response.json();
    console.log('hCaptcha verification result:', data);
    return data.success;
  } catch (error) {
    console.error('hCaptcha verification error:', error);
    return false;
  }
}

interface UserMetadata {
  full_name: string;
  role: string;
  specialty?: string;
  years_of_experience?: number;
  consultation_fee?: number;
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  phone_number?: string;
  specialty?: string;
  years_of_experience?: number;
  education?: string;
  bio?: string;
  consultation_fee?: number;
  available_days?: string[];
  location?: string;
  medical_license?: string;
}

export async function POST(request: Request) {
  try {
    // Create a direct Supabase client WITHOUT using cookies for auth
    // We'll handle the user creation directly without relying on auth cookies
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    // Get request body
    const { email, password, userData, captchaToken } = await request.json();
    
    console.log('Server-side registration attempt for:', email, 'with role:', userData.role);
    console.log('Captcha token received:', captchaToken ? "Token present" : "No token");
    
    // Verify hCaptcha token
    const isValidCaptcha = await verifyHCaptcha(captchaToken);
    if (!isValidCaptcha) {
      console.error('Invalid captcha token');
      return NextResponse.json({ error: 'Captcha verification failed' }, { status: 400 });
    }
    
    console.log('Captcha verification successful');
    
    // Prepare user metadata based on role
    const userMetadata: UserMetadata = {
      full_name: userData.full_name,
      role: userData.role || 'patient',
    };
    
    // Add additional metadata for doctors
    if (userData.role === 'doctor') {
      userMetadata.specialty = userData.specialty;
      userMetadata.years_of_experience = userData.years_of_experience;
      userMetadata.consultation_fee = userData.consultation_fee;
    }
    
    // Create the user using the admin client instead
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
      user_metadata: userMetadata,
      app_metadata: {
        provider: 'email',
        role: userData.role || 'patient'
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
    
    // Create entry in users table with role-specific fields
    const userProfile: UserProfile = {
      id: authData.user.id,
      email,
      full_name: userData.full_name || '',
      role: userData.role || 'patient',
      created_at: new Date().toISOString(),
    };
    
    // Add doctor-specific fields if applicable
    if (userData.role === 'doctor') {
      userProfile.phone_number = userData.phone_number;
      userProfile.specialty = userData.specialty;
      userProfile.years_of_experience = userData.years_of_experience;
      userProfile.education = userData.education;
      userProfile.bio = userData.bio;
      userProfile.consultation_fee = userData.consultation_fee;
      userProfile.available_days = userData.available_days;
      userProfile.location = userData.location;
      userProfile.medical_license = userData.medical_license;
    }
    
    // Insert the user profile into the users table
    const { error: profileError } = await supabase
      .from('users')
      .insert(userProfile);
    
    if (profileError) {
      console.error('Profile creation error:', profileError.message);
      
      // If the insert fails, try upserting instead (in case of conflicts)
      const { error: upsertError } = await supabase
        .from('users')
        .upsert(userProfile, { onConflict: 'id' });
        
      if (upsertError) {
        console.error('Profile upsert error:', upsertError.message);
        return NextResponse.json(
          { error: upsertError.message },
          { status: 500 }
        );
      }
    }
    
    // Modify the response to indicate successful signup
    // Note: User will need to sign in separately since we're not setting cookies
    return NextResponse.json({ 
      success: true, 
      userId: authData.user.id,
      message: 'Registration successful. Please proceed to login.'
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Server error during registration:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 