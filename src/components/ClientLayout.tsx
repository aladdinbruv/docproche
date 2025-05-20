'use client';

import { ReactNode, useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/hooks/useAuth';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { NetworkStatusProvider } from './NetworkStatusProvider';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  // Register Service Worker and Initialize App
  useEffect(() => {
    // Service Worker registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }

    // Initialize application resources
    const initializeApp = async () => {
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
        try {
          console.log(`Initializing application (${retries} attempts left)...`);
          const response = await fetch('/api/init');
          const data = await response.json();
          
          if (!response.ok) {
            console.warn('Application initialization warning:', data.message);
            console.warn('Details:', data.details || 'No details provided');
          } else {
            console.log('Application initialized successfully');
            if (data.details) {
              console.log('Initialization details:', data.details);
            }
            success = true;
          }
        } catch (error) {
          console.error('Failed to initialize application:', error);
          retries--;
          if (retries > 0) {
            console.log(`Retrying initialization in 2 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!success) {
        console.error('Application initialization failed after multiple attempts');
      }
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NetworkStatusProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </NetworkStatusProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
} 