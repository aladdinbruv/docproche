'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setupNetworkListeners, isOffline } from '@/utils/fetchUtils';
import { Wifi, WifiOff } from 'lucide-react';

interface NetworkStatusContextType {
  isOnline: boolean;
  showOfflineWarning: boolean;
  dismissOfflineWarning: () => void;
}

const NetworkStatusContext = createContext<NetworkStatusContextType>({
  isOnline: true,
  showOfflineWarning: false,
  dismissOfflineWarning: () => {},
});

export const useNetworkStatus = () => useContext(NetworkStatusContext);

interface NetworkStatusProviderProps {
  children: ReactNode;
}

export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  // Initialize network status
  useEffect(() => {
    // Check initial status
    setIsOnline(!isOffline());
    setShowOfflineWarning(isOffline());
    
    // Set up event listeners
    const cleanupListeners = setupNetworkListeners(
      // onOffline
      () => {
        setIsOnline(false);
        setShowOfflineWarning(true);
      },
      // onOnline
      () => {
        setIsOnline(true);
        // Don't automatically dismiss the warning when reconnected
        // Let the user manually dismiss it so they notice the change
      }
    );
    
    return cleanupListeners;
  }, []);
  
  // Dismiss offline warning
  const dismissOfflineWarning = () => setShowOfflineWarning(false);
  
  return (
    <NetworkStatusContext.Provider 
      value={{ 
        isOnline, 
        showOfflineWarning, 
        dismissOfflineWarning 
      }}
    >
      {children}
      
      {/* Offline Indicator */}
      {showOfflineWarning && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
            {isOnline ? (
              <>
                <Wifi className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Connection restored!</span>
              </>
            ) : (
              <>
                <WifiOff className="h-5 w-5 text-red-600" />
                <span className="text-sm font-medium text-red-700">You're offline</span>
              </>
            )}
            
            <button 
              onClick={dismissOfflineWarning}
              className="ml-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </NetworkStatusContext.Provider>
  );
} 