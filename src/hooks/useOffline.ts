// src/hooks/useOffline.ts

import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

/**
 * Hook to show offline indicator
 */
export function useOfflineIndicator() {
  const isOffline = useOffline();
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShowBanner(true);
    } else {
      // Delay hiding to show "Back online" message
      const timer = setTimeout(() => setShowBanner(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  return { isOffline, showBanner };
}

export default useOffline;
