'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@/lib/supabase';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the verification code from URL
        const code = searchParams.get('code');
        
        if (!code) {
          // If no code is present, this is just the standard page view
          setStatus('success');
          setMessage('Please check your email for the verification link.');
          return;
        }

        console.log('Attempting to verify email with code:', code);
        
        // Call the verification API
        const { error } = await supabase.auth.verifyOtp({
          token_hash: code,
          type: 'email',
        });

        if (error) {
          console.error('Verification error:', error);
          setStatus('error');
          setMessage(`Email verification failed: ${error.message}`);
          return;
        }

        console.log('Email verification successful');
        setStatus('success');
        setMessage('Your email has been verified successfully! You can now log in.');
      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setStatus('error');
        setMessage('An unexpected error occurred during verification.');
      }
    };

    verifyEmail();
  }, [searchParams, supabase.auth]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Email Verification</h1>
          <p className="text-muted-foreground mt-2">
            {status === 'loading' ? 'Processing your verification...' : ''}
          </p>
        </div>
        
        <div className="card p-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin"></div>
              <p className="mt-4 text-center">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6">
                {message}
              </div>
              <Link href="/auth/login" className="btn-primary">
                Go to Login
              </Link>
            </div>
          )}
          
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
                {message}
              </div>
              <p className="mb-4">
                If you're having trouble, you can request a new verification email:
              </p>
              <Link href="/auth/register" className="btn-primary">
                Back to Registration
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 