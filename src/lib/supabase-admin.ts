import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Creates a Supabase client with service role key for admin operations
 * IMPORTANT: This should only be used in server-side code
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or Service Role Key');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
} 