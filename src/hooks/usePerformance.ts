import { useMemo, useState, useEffect, useCallback, useRef } from 'react';

/**
 * Performance utility: Memoizes expensive calculations with a dependency array
 * Use this for heavy computations in dashboard components
 */
export function useMemoizedMetrics<T>(
  calculateFn: () => T,
  dependencies: any[],
  shouldRecalculate?: () => boolean
): T {
  return useMemo(() => {
    // Allow explicit control over recalculation
    if (shouldRecalculate && !shouldRecalculate()) {
      return calculateFn();
    }
    return calculateFn();
  }, dependencies);
}

/**
 * Performance utility: Debounces search/filter operations to reduce queries
 */
export function useDebounce<T>(value: T, delayMs: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Performance utility: Debounced callback for API calls
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 500
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delayMs);
    },
    [callback, delayMs]
  ) as T;
}

/**
 * Performance utility: Throttles callbacks to improve rendering performance
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delayMs: number = 300
): T {
  const [lastRun, setLastRun] = useState(Date.now());

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRun >= delayMs) {
        callback(...args);
        setLastRun(now);
      }
    },
    [callback, delayMs, lastRun]
  ) as T;
}

/**
 * Performance utility: Tracks previous value for comparison
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Performance utility: Deduplicates concurrent requests
 */
export function useDeduplicate<T>(
  asyncFn: () => Promise<T>
) {
  const inProgressRef = useRef<Promise<T> | null>(null);

  const execute = useCallback(async (): Promise<T> => {
    if (inProgressRef.current) {
      return inProgressRef.current;
    }

    inProgressRef.current = asyncFn().finally(() => {
      inProgressRef.current = null;
    });

    return inProgressRef.current;
  }, [asyncFn]);

  return execute;
}

/**
 * Performance utility: Batch updates for better performance
 */
export function useBatchUpdate<T extends Record<string, any>>(
  initialState: T,
  onBatchUpdate?: (updates: Partial<T>) => void,
  batchDelayMs: number = 100
) {
  const batchRef = useRef<Partial<T>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const update = useCallback(
    (updates: Partial<T>, immediate: boolean = false) => {
      Object.assign(batchRef.current, updates);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (immediate) {
        onBatchUpdate?.(batchRef.current);
        batchRef.current = {};
      } else {
        timerRef.current = setTimeout(() => {
          onBatchUpdate?.(batchRef.current);
          batchRef.current = {};
        }, batchDelayMs);
      }
    },
    [onBatchUpdate, batchDelayMs]
  );

  return update;
}

/**
 * Performance utility: Cache expensive async operations
 */
export function useAsyncCache<T>(
  asyncFn: () => Promise<T>,
  cacheTimeMs: number = 5 * 60 * 1000 // 5 minutes default
) {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const execute = useCallback(
    async (key: string = 'default'): Promise<T> => {
      const cached = cacheRef.current.get(key);
      const now = Date.now();

      if (cached && now - cached.timestamp < cacheTimeMs) {
        return cached.data;
      }

      const data = await asyncFn();
      cacheRef.current.set(key, { data, timestamp: now });
      return data;
    },
    [asyncFn, cacheTimeMs]
  );

  const clear = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return { execute, clear, cache: cacheRef.current };
}
