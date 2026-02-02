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
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          // Check if table doesn't exist
          if (error.message?.includes('relation') || error.message?.includes('not exist')) {
            console.warn('Expenses table not found, returning empty data');
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.warn('Error fetching expenses:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000,
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('expenses_updates')
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
      supabase.removeChannel(subscription);
    };
  }, [query]);

  return query;
};

export const useExpenseStats = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['expense-stats'],
    queryFn: async () => {
      try {
        const { data: expenses, error } = await supabase
          .from('expenses')
          .select('*');

        // Handle missing table gracefully
        if (error) {
          if (error.message?.includes('relation') || error.message?.includes('not exist')) {
            console.warn('Expenses table not found, returning default stats');
            return {
              totalExpenses: 0,
              recurringExpenses: 0,
              oneTimeExpenses: 0,
              pendingExpenses: 0,
              categoryBreakdown: []
            };
          }
          throw error;
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const expensesThisMonth = expenses?.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
        }) || [];

        const totalExpenses = expensesThisMonth.reduce((sum, expense) => sum + expense.amount, 0);
        const recurringExpenses = expensesThisMonth
          .filter(expense => ['Office Rent', 'Vehicle Insurance', 'Staff Salaries'].includes(expense.category))
          .reduce((sum, expense) => sum + expense.amount, 0);
        const oneTimeExpenses = totalExpenses - recurringExpenses;
        const pendingExpenses = 0; // This would need a status field

        // Calculate category breakdown
        const categoryMap = new Map<string, { total: number; count: number }>();
        expensesThisMonth.forEach(expense => {
          const existing = categoryMap.get(expense.category) || { total: 0, count: 0 };
          categoryMap.set(expense.category, {
            total: existing.total + expense.amount,
            count: existing.count + 1
          });
        });

        const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
          category,
          total: data.total,
          count: data.count
        }));

        return {
          totalExpenses,
          recurringExpenses,
          oneTimeExpenses,
          pendingExpenses,
          categoryBreakdown
        };
      } catch (error) {
        console.warn('Error fetching expense stats:', error);
        return {
          totalExpenses: 0,
          recurringExpenses: 0,
          oneTimeExpenses: 0,
          pendingExpenses: 0,
          categoryBreakdown: []
        };
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000,
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
      supabase.removeChannel(subscription);
    };
  }, [query]);

  return query;
};