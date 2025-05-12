import { createClientComponentClient } from '@/lib/supabase';

interface FetchOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onError?: (error: any) => void;
  onRetry?: (attempt: number) => void;
}

// Check if we're currently offline
export function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

// Listen for online/offline status changes
export function setupNetworkListeners(
  onOffline?: () => void,
  onOnline?: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOffline = () => {
    console.log('Network connection lost');
    if (onOffline) onOffline();
  };

  const handleOnline = () => {
    console.log('Network connection restored');
    if (onOnline) onOnline();
  };

  window.addEventListener('offline', handleOffline);
  window.addEventListener('online', handleOnline);

  // Return cleanup function
  return () => {
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('online', handleOnline);
  };
}

/**
 * Enhanced Supabase fetch with timeout, retry, and better error handling
 * @param queryFn Function that performs the Supabase query
 * @param options Configuration options
 * @returns Result of the fetch operation
 */
export async function enhancedFetch<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: any }> {
  const {
    timeout = 10000,
    retries = 2,
    retryDelay = 1000,
    onError,
    onRetry,
  } = options;

  // Check if offline immediately
  if (isOffline()) {
    const offlineError = { message: 'You are currently offline' };
    if (onError) onError(offlineError);
    return { data: null, error: offlineError };
  }

  // Create a timeout promise
  const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) => {
    setTimeout(() => {
      reject({ data: null, error: { message: 'Request timed out' } });
    }, timeout);
  });

  // Function to retry with exponential backoff
  const retry = async (attempt: number): Promise<{ data: T | null; error: any }> => {
    try {
      // Check if we're offline before attempting
      if (isOffline()) {
        throw new Error('Network connection unavailable');
      }

      // Race between the query and timeout
      const result = await Promise.race([
        queryFn(),
        timeoutPromise,
      ]);

      // If there's an error but we have retries left
      if (result.error && attempt < retries) {
        // Calculate backoff with jitter
        const delay = retryDelay * Math.pow(1.5, attempt) * (0.9 + Math.random() * 0.2);
        
        // Notify about retry
        if (onRetry) onRetry(attempt + 1);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry the operation
        return retry(attempt + 1);
      }

      // Either success or we're out of retries
      if (result.error && onError) {
        onError(result.error);
      }
      
      return result;
    } catch (error: any) {
      // Check if this is a network error
      const isNetworkError = error.message && (
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network connection') ||
        error.message.includes('Network request failed')
      );
      
      if (isNetworkError) {
        console.error('Network error detected:', error);
        
        // Handle network errors specially - check online status
        if (isOffline()) {
          const offlineError = { message: 'You are currently offline. Please check your internet connection.' };
          if (onError) onError(offlineError);
          return { data: null, error: offlineError };
        }
      }
      
      // Handle rejected promises (like timeouts)
      if (attempt < retries) {
        if (onRetry) onRetry(attempt + 1);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return retry(attempt + 1);
      }
      
      if (onError) onError(error);
      return { data: null, error };
    }
  };

  // Start the retry process
  return retry(0);
}

/**
 * Helper for safely querying Supabase with improved error handling
 * @param table Supabase table name
 * @param query Query function that takes a query builder
 * @param options Fetch options
 */
export async function safeQuery<T>(
  table: string,
  query: (queryBuilder: any) => any,
  options: FetchOptions = {}
): Promise<{ data: T | null; error: any }> {
  const supabase = createClientComponentClient();
  
  return enhancedFetch<T>(
    () => query(supabase.from(table)),
    options
  );
}

/**
 * Helper for safely executing an RPC function
 * @param functionName Name of the Supabase RPC function
 * @param params Parameters to pass to the function
 * @param options Fetch options
 */
export async function safeRpc<T>(
  functionName: string,
  params: Record<string, any> = {},
  options: FetchOptions = {}
): Promise<{ data: T | null; error: any }> {
  const supabase = createClientComponentClient();
  
  return enhancedFetch<T>(
    () => supabase.rpc(functionName, params),
    options
  );
}

/**
 * Helper to handle fetch race conditions with React state
 * Ensures only the most recent fetch updates the state
 */
export function createCancellableFetch() {
  let currentFetchId = 0;
  
  return function executeFetch<T>(
    fetchFn: () => Promise<T>,
    onSuccess: (data: T) => void,
    onError?: (error: any) => void
  ) {
    const fetchId = ++currentFetchId;
    
    fetchFn()
      .then(result => {
        // Only update if this is still the most recent fetch
        if (fetchId === currentFetchId) {
          onSuccess(result);
        }
      })
      .catch(error => {
        if (fetchId === currentFetchId && onError) {
          onError(error);
        }
      });
      
    // Return a function to check if this fetch is stale
    return () => fetchId === currentFetchId;
  };
} 