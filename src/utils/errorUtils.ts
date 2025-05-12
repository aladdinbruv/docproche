import { isOffline } from './fetchUtils';

/**
 * Determines if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  // Check for error message
  if (typeof error === 'string') {
    return (
      error.includes('NetworkError') ||
      error.includes('Failed to fetch') ||
      error.includes('Network request failed') ||
      error.includes('network error')
    );
  }
  
  // Check error object message
  if (error.message) {
    return (
      error.message.includes('NetworkError') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed') ||
      error.message.includes('network error')
    );
  }
  
  // Check for specific error types
  if (error.name === 'TypeError' && error.message === 'NetworkError when attempting to fetch resource.') {
    return true;
  }
  
  return false;
}

/**
 * Gets a user-friendly error message from an error object
 */
export function getUserFriendlyErrorMessage(error: any): string {
  // Check for network issues first
  if (isOffline()) {
    return 'You are currently offline. Please check your internet connection.';
  }
  
  if (isNetworkError(error)) {
    return 'A network error occurred. Please check your internet connection and try again.';
  }
  
  // Authentication errors
  if (error?.status === 401 || error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
    return 'Your session has expired. Please sign in again.';
  }
  
  // Permission errors
  if (error?.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  
  // Not found errors
  if (error?.status === 404) {
    return 'The requested resource was not found.';
  }
  
  // Validation errors
  if (error?.code === 'PGRST109') {
    return 'There was a validation error. Please check your input.';
  }
  
  // Handle Supabase specific errors
  if (error?.message) {
    return error.message;
  }
  
  // Default error message
  return 'An unexpected error occurred. Please try again later.';
}

/**
 * Formats API errors for consistent display
 */
export function formatApiError(error: any): {
  title: string;
  message: string;
  suggestion?: string;
} {
  const message = getUserFriendlyErrorMessage(error);
  
  // Network errors
  if (isNetworkError(error) || isOffline()) {
    return {
      title: 'Network Error',
      message,
      suggestion: 'Try refreshing the page or checking your internet connection.'
    };
  }
  
  // Authentication errors
  if (error?.status === 401 || error?.code === 'PGRST301') {
    return {
      title: 'Authentication Error',
      message,
      suggestion: 'Please sign in again to continue.'
    };
  }
  
  // Permission errors
  if (error?.status === 403) {
    return {
      title: 'Permission Denied',
      message,
      suggestion: 'If you believe this is a mistake, please contact support.'
    };
  }
  
  // General error format
  return {
    title: 'Error',
    message
  };
} 