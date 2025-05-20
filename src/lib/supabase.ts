import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient as createSupabaseClientComponent } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Singleton instance for client components
let clientComponentClientInstance: ReturnType<typeof createSupabaseClientComponent<Database>> | null = null;

export function createClientComponentClient<T = Database>() {
  if (clientComponentClientInstance === null) {
    clientComponentClientInstance = createSupabaseClientComponent<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
  
  return clientComponentClientInstance as ReturnType<typeof createSupabaseClientComponent<T>>;
}

export type { Database };