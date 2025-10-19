import { useQuery } from '@tanstack/react-query';
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
  created_at: string;
  updated_at: string;
}

export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: ['expense-stats'],
    queryFn: async () => {
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*');

      if (error) throw error;

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
    },
  });
};