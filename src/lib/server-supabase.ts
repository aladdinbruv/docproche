import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export function getServerComponentClient<T = Database>() {
  const cookieStore = cookies();
  return createServerComponentClient<T>({ cookies: () => cookieStore });
}

/**
 * Enhanced Supabase fetcher function with built-in caching
 * @param queryFn Function that performs the Supabase query
 * @param options Caching options
 */
export async function cachableSupabaseFetch<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {}
) {
  const { revalidate = 60, tags } = options;
  
  // Use fetch with next.js caching
  const fetchWithCache = async () => {
    const result = await queryFn();
    if (result.error) {
      throw new Error(`Supabase query error: ${result.error.message}`);
    }
    return result.data;
  };
  
  // Wrap in a normal fetch to get next.js caching
  const url = `supabase-cache://${Math.random().toString(36).substring(2, 10)}`;
  
  // Using Next.js built-in fetch caching
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify({}),
    cache: revalidate === false ? 'no-store' : 'force-cache',
    next: {
      revalidate,
      tags
    }
  }).then(() => fetchWithCache());
  
  return response;
}

/**
 * Fetch data from Supabase with proper caching using RPC calls
 */
export async function cachedRpc<T>(
  functionName: string,
  params: Record<string, any> = {},
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {}
) {
  const supabase = getServerComponentClient();
  
  return cachableSupabaseFetch<T>(
    () => supabase.rpc(functionName, params),
    options
  );
}

/**
 * Fetch data from Supabase with proper caching using table queries
 */
export async function cachedQuery<T>(
  tableName: string,
  queryBuilder: (query: any) => any,
  options: {
    revalidate?: number | false;
    tags?: string[];
  } = {}
) {
  const supabase = getServerComponentClient();
  
  return cachableSupabaseFetch<T>(
    () => queryBuilder(supabase.from(tableName)),
    options
  );
} 