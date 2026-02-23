import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Expense {
  id: string;
  expense_id: string;
  category: string;
  description: string;
  amount: number;
  vendor: string | null;
  date: string;
  tax_deductible: boolean | null;
  receipt_url: string | null;
  vehicle_id: string | null;
  payment_type?: 'cash' | 'account' | null;
  employee_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const useExpenses = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['expenses'],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('expenses_stats_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [query]);

  return query;
};

export const useExpenseStats = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['expense-stats'],
    queryFn: async () => {
      // Get current month date range for database-level filtering
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
      const endOfMonth = new Date(currentYear, currentMonth, 0);
      
      // Use date strings for DATE column comparisons
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
      const endOfMonthStr = endOfMonth.toISOString().split('T')[0];
      
      // Fetch aggregated data from database using proper grouping
      const { data: categoryData, error: categoryError } = await supabase
        .from('expenses')
        .select('category, amount')
        .gte('date', startOfMonthStr)
        .lte('date', endOfMonthStr);

      const { data: totalData, error: totalError } = await supabase
        .from('expenses')
        .select('amount')
        .gte('date', startOfMonthStr)
        .lte('date', endOfMonthStr);

      if (categoryError || totalError) throw categoryError || totalError;

      // Calculate total expenses
      const totalExpenses = totalData?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

      // Calculate category breakdown with database-level grouping logic
      const categoryMap = new Map<string, { total: number; count: number }>();
      categoryData?.forEach(expense => {
        const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
        categoryMap.set(expense.category, {
          total: existing.total + (expense.amount || 0),
          count: existing.count + 1
        });
      });

      const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count
      }));

      // Calculate recurring vs one-time expenses
      const recurringExpenses = categoryData
        ?.filter(expense => ['Office Rent', 'Vehicle Insurance', 'Staff Salaries'].includes(expense.category))
        .reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
      const oneTimeExpenses = totalExpenses - recurringExpenses;

      return {
        totalExpenses,
        recurringExpenses,
        oneTimeExpenses,
        pendingExpenses: 0,
        categoryBreakdown
      };
    },
    staleTime: 30000,
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('expense_stats_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [query]);

  return query;
};

