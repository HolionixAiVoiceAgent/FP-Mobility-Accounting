import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CashSummary {
  employee_id: string;
  full_name: string;
  total_advanced: number;
  total_spent: number;
  remaining: number;
}

export const useCashSummary = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['cash-summary'],
    queryFn: async (): Promise<CashSummary[]> => {
      // The view `employee_cash_summary` is created by a migration. Cast to any in case the
      // typed supabase client does not include it yet.
      const { data, error } = await (supabase as any)
        .from('employee_cash_summary')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      return (data || []) as CashSummary[];
    },
    staleTime: 30000,
  });

  // Subscribe to changes on expenses and employee_cash_advances to keep summary realtime
  useEffect(() => {
    const channel = supabase
      .channel('cash_summary_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => query.refetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'employee_cash_advances' },
        () => query.refetch()
      )
      .subscribe();

    subscriptionRef.current = channel;

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [query]);

  return query;
};
