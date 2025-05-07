"use client";

import React, { useEffect } from 'react';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';

interface ServiceWorkerProviderProps {
  children: React.ReactNode;
}

export default function ServiceWorkerProvider({ children }: ServiceWorkerProviderProps) {
  const isOffline = useOfflineStatus();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
          console.log('ServiceWorker registration failed: ', err);
        });
      });
    }
  }, []);

  return (
    <>
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center z-50">
          You are currently offline. Some features may be limited.
        </div>
      )}
      {children}
    </>
  );
} 