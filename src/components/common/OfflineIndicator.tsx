// src/components/common/OfflineIndicator.tsx

import { useOfflineIndicator } from '@/hooks/useOffline';
import { WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOffline, showBanner } = useOfflineIndicator();

  if (!showBanner) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-colors',
        isOffline
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-success text-white'
      )}
    >
      <div className="flex items-center justify-center gap-2">
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4" />
            You're offline. Some features may not work.
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4" />
            Back online!
          </>
        )}
      </div>
    </div>
  );
}

export default OfflineIndicator;
