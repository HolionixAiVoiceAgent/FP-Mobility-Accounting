import React from 'react';
import { Clock, Wifi, WifiOff } from 'lucide-react';

interface RealTimeIndicatorProps {
  lastUpdated?: string | Date | null;
  isOnline?: boolean;
  isLoading?: boolean;
}

/**
 * Shows connection status and last updated time.
 * Add this to dashboard cards or page headers for real-time transparency.
 */
export function RealTimeIndicator({ lastUpdated, isOnline = true, isLoading = false }: RealTimeIndicatorProps) {
  const getTimeAgo = (date: string | Date | null | undefined): string => {
    if (!date) return 'Never';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const secs = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (secs < 30) return 'Just now';
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-1">
        {isOnline ? (
          <Wifi className="h-3 w-3 text-success" />
        ) : (
          <WifiOff className="h-3 w-3 text-destructive" />
        )}
        <span>{isOnline ? 'Live' : 'Offline'}</span>
      </div>
      <span>•</span>
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{isLoading ? 'Updating...' : `Updated ${getTimeAgo(lastUpdated)}`}</span>
      </div>
    </div>
  );
}
