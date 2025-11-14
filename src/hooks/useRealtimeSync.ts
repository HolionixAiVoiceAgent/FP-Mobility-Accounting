/**
 * Real-time Synchronization Hook
 * Provides real-time data sync using Supabase subscriptions with optimistic updates
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logError } from '@/lib/errors';

interface UseRealtimeSyncOptions {
  tableName: string;
  filter?: string;
  onInsert?: (data: any) => void;
  onUpdate?: (data: any) => void;
  onDelete?: (data: any) => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

/**
 * Hook for real-time data synchronization
 */
export function useRealtimeSync({
  tableName,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  onError,
  enabled = true,
}: UseRealtimeSyncOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const subscribe = useCallback(async () => {
    if (!enabled) return;

    try {
      // Create channel subscription
      let channel = supabase.channel(`public:${tableName}`);

      if (filter) {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter,
          },
          (payload) => {
            try {
              switch (payload.eventType) {
                case 'INSERT':
                  onInsert?.(payload.new);
                  break;
                case 'UPDATE':
                  onUpdate?.(payload.new);
                  break;
                case 'DELETE':
                  onDelete?.(payload.old);
                  break;
              }
            } catch (error) {
              logError(error, {
                operation: 'realtimeSync.eventHandler',
                table: tableName,
              });
            }
          }
        );
      } else {
        channel = channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            try {
              switch (payload.eventType) {
                case 'INSERT':
                  onInsert?.(payload.new);
                  break;
                case 'UPDATE':
                  onUpdate?.(payload.new);
                  break;
                case 'DELETE':
                  onDelete?.(payload.old);
                  break;
              }
            } catch (error) {
              logError(error, {
                operation: 'realtimeSync.eventHandler',
                table: tableName,
              });
            }
          }
        );
      }

      channel
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else if (status === 'CLOSED') {
            setIsConnected(false);
          } else if (err) {
            const error = new Error(`Subscription error: ${err.message}`);
            logError(error, {
              operation: 'realtimeSync.subscribe',
              table: tableName,
              status,
            });
            onError?.(error);
          }
        });

      channelRef.current = channel;
    } catch (error) {
      const subscriptionError = new Error(
        `Failed to subscribe to ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      logError(subscriptionError, {
        operation: 'realtimeSync.subscribe',
        table: tableName,
      });
      onError?.(subscriptionError);
    }
  }, [tableName, filter, onInsert, onUpdate, onDelete, onError, enabled]);

  const unsubscribe = useCallback(async () => {
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current);
      channelRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      subscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [enabled, subscribe, unsubscribe]);

  return { isConnected, subscribe, unsubscribe };
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T extends { id: string }>(
  initialData: T[],
  onError?: (error: Error) => void
) {
  const [optimisticData, setOptimisticData] = useState<T[]>(initialData);
  const previousDataRef = useRef<T[]>(initialData);

  const updateOptimistic = useCallback(
    (id: string, updates: Partial<T>, applyFn: (original: T, updates: Partial<T>) => Promise<T>) => {
      // Save previous state
      previousDataRef.current = optimisticData;

      // Apply optimistic update
      const newData = optimisticData.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      );
      setOptimisticData(newData);

      // Execute actual mutation
      applyFn(
        optimisticData.find((item) => item.id === id)!,
        updates
      ).catch((error) => {
        // Revert on error
        setOptimisticData(previousDataRef.current);
        onError?.(error);
      });
    },
    [optimisticData, onError]
  );

  const addOptimistic = useCallback(
    (newItem: T, applyFn: (item: T) => Promise<T>) => {
      // Save previous state
      previousDataRef.current = optimisticData;

      // Add optimistic item
      const newData = [...optimisticData, newItem];
      setOptimisticData(newData);

      // Execute actual mutation
      applyFn(newItem).catch((error) => {
        // Revert on error
        setOptimisticData(previousDataRef.current);
        onError?.(error);
      });
    },
    [optimisticData, onError]
  );

  const deleteOptimistic = useCallback(
    (id: string, applyFn: (id: string) => Promise<void>) => {
      // Save previous state
      previousDataRef.current = optimisticData;

      // Remove optimistic item
      const newData = optimisticData.filter((item) => item.id !== id);
      setOptimisticData(newData);

      // Execute actual mutation
      applyFn(id).catch((error) => {
        // Revert on error
        setOptimisticData(previousDataRef.current);
        onError?.(error);
      });
    },
    [optimisticData, onError]
  );

  return {
    data: optimisticData,
    updateOptimistic,
    addOptimistic,
    deleteOptimistic,
    revert: () => setOptimisticData(previousDataRef.current),
  };
}

/**
 * Hook for concurrent update conflict handling
 */
export function useConcurrentUpdateHandler() {
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());

  const handleConflict = useCallback(
    async (
      id: string,
      localUpdate: any,
      remoteData: any,
      resolutionStrategy: 'local' | 'remote' | 'merge' = 'merge'
    ) => {
      switch (resolutionStrategy) {
        case 'local':
          // Keep local update
          return localUpdate;
        case 'remote':
          // Use remote data
          return remoteData;
        case 'merge':
          // Merge both updates (remote takes precedence for timestamps)
          return {
            ...localUpdate,
            ...remoteData,
            updated_at: new Date().toISOString(),
          };
        default:
          return localUpdate;
      }
    },
    []
  );

  const addPendingUpdate = useCallback((id: string, update: any) => {
    pendingUpdatesRef.current.set(id, update);
  }, []);

  const getPendingUpdate = useCallback((id: string) => {
    return pendingUpdatesRef.current.get(id);
  }, []);

  const removePendingUpdate = useCallback((id: string) => {
    pendingUpdatesRef.current.delete(id);
  }, []);

  return {
    handleConflict,
    addPendingUpdate,
    getPendingUpdate,
    removePendingUpdate,
  };
}
