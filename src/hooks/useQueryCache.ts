import { useState, useCallback } from 'react';

export interface CacheStrategy {
  name: 'network-first' | 'cache-first' | 'stale-while-revalidate';
  ttl?: number; // Time to live in ms
}

const localCache = new Map<string, { data: any; timestamp: number }>();

/**
 * Custom caching strategy for React Query results
 * Complements React Query's built-in caching with additional strategies
 */
export function useQueryCache(strategy: CacheStrategy = { name: 'stale-while-revalidate', ttl: 5 * 60 * 1000 }) {
  const [cache, setCache] = useState(localCache);

  const getCached = useCallback((key: string): any | null => {
    const cached = cache.get(key);
    if (!cached) return null;

    if (strategy.ttl && Date.now() - cached.timestamp > strategy.ttl) {
      cache.delete(key);
      return null;
    }

    return cached.data;
  }, [cache, strategy.ttl]);

  const setCached = useCallback((key: string, data: any): void => {
    cache.set(key, { data, timestamp: Date.now() });
    setCache(new Map(cache));
  }, [cache]);

  const clearCache = useCallback((): void => {
    cache.clear();
    setCache(new Map());
  }, [cache]);

  return { getCached, setCached, clearCache };
}

/**
 * Prefetch data for better UX
 * Load data before user navigates to a page
 */
export function usePrefetch(queryFn: () => Promise<any>, enabled: boolean = true) {
  const [isPrefetching, setIsPrefetching] = useState(false);

  const prefetch = useCallback(async () => {
    if (!enabled || isPrefetching) return;
    setIsPrefetching(true);
    try {
      await queryFn();
    } catch (error) {
      console.warn('Prefetch failed:', error);
    } finally {
      setIsPrefetching(false);
    }
  }, [queryFn, enabled, isPrefetching]);

  return { prefetch, isPrefetching };
}
