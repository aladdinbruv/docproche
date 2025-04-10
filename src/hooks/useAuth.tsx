'use client';

import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Database, User } from '@/types/supabase';

type AuthContextType = {
  user: SupabaseUser | null;
  session: Session | null;
  profile: User | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  // Create the Supabase client once to avoid multiple instances
  const supabase = useRef(createClientComponentClient()).current;

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user ID:', userId);
      
      // First check if profile exists by user ID
      const { data: existingProfiles, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);
      
      if (checkError) {
        console.error('Error checking user profile by ID:', checkError);
        return null;
      }
      
      // If profile doesn't exist, create a basic one
      if (!existingProfiles || existingProfiles.length === 0) {
        console.log('No profile found for user, creating one');
        
        // Get user metadata from auth to help create profile
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData || !userData.user) {
          console.error('Could not get user data for profile creation');
          return null;
        }
        
        const userEmail = userData.user.email || '';
        const userMetadata = userData.user.user_metadata;
        
        // Check if a profile with this email already exists
        if (userEmail) {
          const { data: emailProfiles, error: emailCheckError } = await supabase
            .from('users')
            .select('*')
            .eq('email', userEmail);
            
          if (emailCheckError) {
            console.error('Error checking for existing email:', emailCheckError);
          } else if (emailProfiles && emailProfiles.length > 0) {
            console.log('Found existing profile with same email. Updating ID reference.');
            
            // Update the existing profile with the new user ID
            const { data: updatedProfile, error: updateError } = await supabase
              .from('users')
              .update({ id: userId })
              .eq('email', userEmail)
              .select()
              .single();
              
            if (updateError) {
              console.error('Error updating existing profile:', updateError);
            } else {
              console.log('Successfully updated profile ID:', updatedProfile);
              return updatedProfile as User;
            }
          }
        }
        
        // Create basic profile
        const newProfile: Partial<User> = {
          id: userId,
          email: userEmail,
          full_name: userMetadata?.full_name || '',
          role: userMetadata?.role || 'patient',
          created_at: new Date().toISOString(),
        };
        
        // Try to insert new profile, handle potential constraint errors
        try {
          const { data: insertedProfile, error: insertError } = await supabase
            .from('users')
            .insert(newProfile)
            .select()
            .single();
          
          if (insertError) {
            // If duplicate key constraint error
            if (insertError.code === '23505') {
              console.log('Duplicate constraint error. Fetching existing profile by email instead.');
              
              // More robust fetch that doesn't use .single()
              const { data: existingEmailProfiles, error: existingError } = await supabase
                .from('users')
                .select('*')
                .eq('email', userEmail);
                
              if (existingError) {
                console.error('Error fetching existing profiles by email:', existingError);
                
                // Last resort - create a profile with a modified email to avoid conflicts
                const modifiedEmail = `${userEmail}.${Date.now()}`;
                console.log(`Creating profile with modified email: ${modifiedEmail}`);
                
                const { data: fallbackProfile, error: fallbackError } = await supabase
                  .from('users')
                  .insert({
                    ...newProfile,
                    email: modifiedEmail
                  })
                  .select()
                  .single();
                  
                if (fallbackError) {
                  console.error('Error creating fallback profile:', fallbackError);
                  return null;
                }
                
                return fallbackProfile as User;
              }
              
              if (!existingEmailProfiles || existingEmailProfiles.length === 0) {
                console.log('No profiles found with email. This is unexpected. Creating with modified email.');
                
                // Create with modified email to avoid conflicts
                const modifiedEmail = `${userEmail}.${Date.now()}`;
                const { data: altProfile, error: altError } = await supabase
                  .from('users')
                  .insert({
                    ...newProfile,
                    email: modifiedEmail
                  })
                  .select()
                  .single();
                  
                if (altError) {
                  console.error('Error creating profile with alt email:', altError);
                  
                  // Final fallback - try with minimal profile
                  console.log('Trying with minimal profile fields');
                  const { data: minimalProfile, error: minError } = await supabase
                    .from('users')
                    .insert({
                      id: userId,
                      email: modifiedEmail,
                      full_name: userMetadata?.full_name || '',
                      role: 'patient'
                    })
                    .select()
                    .single();
                    
                  if (minError) {
                    console.error('Error creating minimal profile:', minError);
                    return null;
                  }
                  
                  return minimalProfile as User;
                }
                
                return altProfile as User;
              }
              
              console.log(`Found ${existingEmailProfiles.length} profiles with email ${userEmail}`);
              return existingEmailProfiles[0] as User;
            } else {
              console.error('Error creating user profile:', insertError);
              return null;
            }
          }
          
          console.log('Created new profile:', insertedProfile);
          return insertedProfile as User;
        } catch (insertErr) {
          console.error('Exception during profile creation:', insertErr);
          return null;
        }
      }
      
      // Return the existing profile
      return existingProfiles[0] as User;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const userProfile = await fetchProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
      }
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          
          // Fetch the user profile data
          const userProfile = await fetchProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      
      setIsLoading(false);
      router.refresh();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase.auth]);

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setIsLoading(true);
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role || 'patient',
          },
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      });

      if (error) {
        console.error('Error during auth.signUp:', error.message);
        throw error;
      }

      console.log('Auth signup successful. User created:', data.user?.id);

      // Create a user profile in the users table
      if (data.user) {
        const userProfile: Partial<User> = {
          id: data.user.id,
          email,
          full_name: userData.full_name || '',
          role: userData.role || 'patient',
          phone_number: userData.phone_number,
          profile_image: userData.profile_image,
          created_at: new Date().toISOString(),
        };

        if (userData.role === 'doctor') {
          userProfile.specialty = userData.specialty;
          userProfile.years_of_experience = userData.years_of_experience;
          userProfile.education = userData.education;
          userProfile.bio = userData.bio;
          userProfile.consultation_fee = userData.consultation_fee;
        }

        console.log('Inserting user profile with ID:', data.user.id);
        
        // Try to insert with better error handling
        const { error: profileError } = await supabase
          .from('users')
          .insert(userProfile);

        if (profileError) {
          console.error('Error inserting user profile:', profileError.message);
          // We continue despite profile creation error - fetchProfile will handle it later
          console.log('Will attempt to create profile during first login');
        } else {
          console.log('User profile inserted successfully');
        }
      }
      
      router.push('/auth/verify-email');
    } catch (error) {
      console.error('Error during sign up:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Check specifically for email verification error
        if (error.message?.includes('Email not confirmed') || 
            error.message?.includes('Email verification required') ||
            error.message?.includes('Email not verified')) {
          throw new Error('Please verify your email before logging in. Check your inbox for a verification email.');
        }
        console.error("Login error:", error);
        throw error;
      }

      if (data?.user) {
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
        
        // Explicitly redirect to dashboard after successful login
        console.log('Login successful, redirecting to dashboard');
        router.push('/dashboard');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    isLoading,
    setIsLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 