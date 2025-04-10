'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SupabaseChecker() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);

  useEffect(() => {
    async function checkConnection() {
      try {
        setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
        
        // Try to get some data from Supabase to test the connection
        const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact' });
        
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
          return;
        }
        
        setStatus('connected');
      } catch (error) {
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
      }
    }
    
    checkConnection();
  }, []);

  return (
    <div className="card p-6 max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Supabase Connection Status</h2>
      
      <div className="space-y-2">
        <div>
          <span className="font-medium">URL:</span> {supabaseUrl}
        </div>
        
        <div>
          <span className="font-medium">Status:</span>{' '}
          {status === 'loading' && 'Checking connection...'}
          {status === 'connected' && (
            <span className="text-success font-medium">Connected successfully!</span>
          )}
          {status === 'error' && (
            <span className="text-destructive font-medium">Connection failed</span>
          )}
        </div>
        
        {errorMessage && (
          <div>
            <span className="font-medium">Error:</span>{' '}
            <span className="text-destructive">{errorMessage}</span>
          </div>
        )}
      </div>
      
      {status === 'connected' && (
        <div className="mt-4 p-3 bg-success/10 rounded-md text-success">
          Your Supabase connection is working correctly.
        </div>
      )}
      
      {status === 'error' && (
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-destructive/10 rounded-md text-destructive">
            There was a problem connecting to Supabase. Please check your configuration.
          </div>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Verify your .env.local file has the correct NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY values</li>
            <li>Make sure you've copied these values from the Supabase dashboard: API Settings</li>
            <li>Check if the Supabase project is active</li>
            <li>Restart your development server</li>
          </ol>
        </div>
      )}
    </div>
  );
} 