'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { MedicalSpinner } from './Loaders';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { useNetworkStatus } from './NetworkStatusProvider';
import { isOffline } from '@/utils/fetchUtils';

interface LoadingWithTimeoutProps {
  isLoading: boolean;
  children: ReactNode;
  loadingMessage?: string;
  timeoutMs?: number;
  showRefreshButton?: boolean;
  onRefresh?: () => void;
}

export const LoadingWithTimeout: React.FC<LoadingWithTimeoutProps> = ({
  isLoading,
  children,
  loadingMessage = 'Loading content...',
  timeoutMs = 15000, // Default timeout of 15 seconds
  showRefreshButton = true,
  onRefresh
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [timeoutDuration, setTimeoutDuration] = useState(timeoutMs);
  const { isOnline } = useNetworkStatus();
  
  // Reset timeout state when loading state changes
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLoading) {
      setHasTimedOut(false);
      timeoutId = setTimeout(() => {
        setHasTimedOut(true);
      }, timeoutDuration);
    }
    
    // Cleanup function
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, timeoutDuration]);
  
  // Handle manual refresh
  const handleRefresh = () => {
    // Check if we're offline
    if (isOffline()) {
      // Just show an alert if we're offline
      alert('You are currently offline. Please check your internet connection and try again.');
      return;
    }
    
    setHasTimedOut(false);
    setTimeoutDuration(timeoutDuration * 1.5); // Increase timeout for next attempt
    if (onRefresh) onRefresh();
    
    // If no onRefresh provided, reload the page
    if (!onRefresh) {
      window.location.reload();
    }
  };
  
  if (!isLoading) return <>{children}</>;
  
  return (
    <div className="min-h-[200px] flex flex-col items-center justify-center p-8">
      {!isOnline ? (
        // Offline state display
        <div className="text-center space-y-4">
          <WifiOff className="h-12 w-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">You are currently offline</h3>
            <p className="text-sm text-gray-500 max-w-md">
              We can't load the content because you don't have an internet connection. 
              Please check your network and try again.
            </p>
          </div>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          )}
        </div>
      ) : hasTimedOut ? (
        // Timeout state display
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Loading is taking longer than expected</h3>
            <p className="text-sm text-gray-500 max-w-md">
              This could be due to a slow connection or a server issue. You can wait a bit longer or refresh the page.
            </p>
          </div>
          {showRefreshButton && (
            <button
              onClick={handleRefresh}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          )}
        </div>
      ) : (
        // Normal loading state
        <div className="text-center space-y-4">
          <MedicalSpinner />
          <p className="text-gray-600">{loadingMessage}</p>
        </div>
      )}
    </div>
  );
}; 