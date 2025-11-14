import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './usePerformance';

export interface SearchResult {
  id: string;
  type: 'vehicle' | 'customer' | 'sale' | 'expense' | 'purchase';
  title: string;
  subtitle?: string;
  value?: string | number;
  metadata?: Record<string, any>;
}

export interface SearchState {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string) => Promise<void>;
  clear: () => void;
}

export function useGlobalSearch(): SearchState {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (query: string) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchQuery = query.toLowerCase().trim();

      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      // Search vehicles (VIN, license plate, make, model)
      const vehiclePromise = supabase
        .from('inventory')
        .select('id, vin, license_plate, make, model, year, current_value')
        .or(
          `vin.ilike.%${searchQuery}%,license_plate.ilike.%${searchQuery}%,make.ilike.%${searchQuery}%,model.ilike.%${searchQuery}%`
        )
        .limit(5);

      // Search customers (name, email, phone)
      const customerPromise = supabase
        .from('customers')
        .select('id, name, email, phone, city')
        .or(
          `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%`
        )
        .limit(5);

      // Search sales (order ID, customer name via join)
      const salePromise = supabase
        .from('vehicle_sales')
        .select(
          'id, sale_date, total_amount, customers(name, email), vehicles(make, model, vin)'
        )
        .or(`id.ilike.%${searchQuery}%,total_amount::text.ilike.%${searchQuery}%`)
        .limit(5);

      // Search expenses (category, description)
      const expensePromise = supabase
        .from('expenses')
        .select('id, description, category, amount, expense_date')
        .or(`description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`)
        .limit(5);

      // Execute all searches in parallel
      const [vehiclesRes, customersRes, salesRes, expensesRes] = await Promise.all([
        vehiclePromise,
        customerPromise,
        salePromise,
        expensePromise,
      ]);

      const combinedResults: SearchResult[] = [];

      // Process vehicles
      if (vehiclesRes.data) {
        vehiclesRes.data.forEach((vehicle: any) => {
          combinedResults.push({
            id: vehicle.id,
            type: 'vehicle',
            title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            subtitle: `VIN: ${vehicle.vin} | Plate: ${vehicle.license_plate}`,
            value: vehicle.current_value,
            metadata: { vin: vehicle.vin, licensePlate: vehicle.license_plate },
          });
        });
      }

      // Process customers
      if (customersRes.data) {
        customersRes.data.forEach((customer: any) => {
          combinedResults.push({
            id: customer.id,
            type: 'customer',
            title: customer.name,
            subtitle: `${customer.email} | ${customer.phone || 'No phone'} | ${customer.city || ''}`,
            metadata: { email: customer.email, phone: customer.phone },
          });
        });
      }

      // Process sales
      if (salesRes.data) {
        salesRes.data.forEach((sale: any) => {
          const vehicle = sale.vehicles as any;
          const customer = sale.customers as any;
          combinedResults.push({
            id: sale.id,
            type: 'sale',
            title: `Sale #${sale.id}`,
            subtitle: `${vehicle?.make} ${vehicle?.model} to ${customer?.name} - €${sale.total_amount}`,
            value: sale.total_amount,
            metadata: {
              customerId: customer?.id,
              vehicleId: vehicle?.id,
              saleDate: sale.sale_date,
            },
          });
        });
      }

      // Process expenses
      if (expensesRes.data) {
        expensesRes.data.forEach((expense: any) => {
          combinedResults.push({
            id: expense.id,
            type: 'expense',
            title: expense.description,
            subtitle: `${expense.category} - €${expense.amount}`,
            value: expense.amount,
            metadata: { category: expense.category },
          });
        });
      }

      // Sort by relevance (exact matches first, then partial)
      const sortedResults = combinedResults.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const aExact = aTitle === searchQuery;
        const bExact = bTitle === searchQuery;

        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStarts = aTitle.startsWith(searchQuery);
        const bStarts = bTitle.startsWith(searchQuery);

        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;

        return 0;
      });

      setResults(sortedResults.slice(0, 20)); // Limit to 20 total results
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Search failed');
        console.error('Global search error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useDebounce(performSearch, 300);

  const search = useCallback((query: string) => {
    debouncedSearch(query);
    return Promise.resolve();
  }, [debouncedSearch]);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clear,
  };
}

// Hook for managing search history
export function useSearchHistory() {
  const maxHistoryItems = 10;
  const storageKey = 'globalSearchHistory';

  const getHistory = useCallback(() => {
    try {
      const history = localStorage.getItem(storageKey);
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }, []);

  const addToHistory = useCallback((item: { query: string; timestamp: number }) => {
    const history = getHistory();
    const filtered = history.filter((h: any) => h.query !== item.query);
    const updated = [item, ...filtered].slice(0, maxHistoryItems);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }, [getHistory]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(storageKey);
  }, []);

  return { getHistory, addToHistory, clearHistory };
}
