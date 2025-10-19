import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subMonths, format, startOfMonth, endOfMonth } from 'date-fns';

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  vehiclesSold: number;
}

export const useMonthlyFinancialData = () => {
  return useQuery({
    queryKey: ['monthly-financial-data'],
    queryFn: async (): Promise<MonthlyData[]> => {
      const currentDate = new Date();
      const monthsData: MonthlyData[] = [];

      // Get data for last 6 months
      for (let i = 5; i >= 0; i--) {
        const targetDate = subMonths(currentDate, i);
        const monthStart = startOfMonth(targetDate);
        const monthEnd = endOfMonth(targetDate);

        // Fetch sales for this month
        const { data: sales, error: salesError } = await supabase
          .from('vehicle_sales')
          .select('sale_price, sale_date')
          .gte('sale_date', monthStart.toISOString().split('T')[0])
          .lte('sale_date', monthEnd.toISOString().split('T')[0]);

        if (salesError) throw salesError;

        // Fetch expenses for this month
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('amount, date')
          .gte('date', monthStart.toISOString().split('T')[0])
          .lte('date', monthEnd.toISOString().split('T')[0]);

        if (expensesError) throw expensesError;

        const revenue = sales?.reduce((sum, sale) => sum + Number(sale.sale_price), 0) || 0;
        const totalExpenses = expenses?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
        const profit = revenue - totalExpenses;
        const vehiclesSold = sales?.length || 0;

        monthsData.push({
          month: format(targetDate, 'MMM'),
          revenue,
          expenses: totalExpenses,
          profit,
          vehiclesSold,
        });
      }

      return monthsData;
    },
  });
};
