import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyMetrics {
  month: string;
  revenue: number;
  expenses: number;
  net_profit: number;
  margin: number;
}

export interface FinancialMetricsData {
  current_month: MonthlyMetrics;
  last_12_months: MonthlyMetrics[];
  year_to_date_revenue: number;
  year_to_date_profit: number;
  average_monthly_profit: number;
}

export function useFinancialMetrics() {
  const subscriptionsRef = useRef<any[]>([]);

  const query = useQuery({
    queryKey: ['financialMetrics'],
    queryFn: async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      // Calculate date range for last 12 months
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      const startDateStr = startDate.toISOString().split('T')[0];

      // Fetch sales data with proper date filtering
      const { data: sales, error: salesError } = await supabase
        .from('vehicle_sales')
        .select('sale_price, sale_date')
        .gte('sale_date', startDateStr);

      // Fetch expenses data with proper date column (NOT created_at)
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', startDateStr);

      if (salesError || expensesError) throw salesError || expensesError;

      // Group by month using proper date fields
      const monthlyData: Record<string, MonthlyMetrics> = {};

      // Process sales by sale_date
      sales?.forEach((sale: any) => {
        const date = new Date(sale.sale_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            revenue: 0,
            expenses: 0,
            net_profit: 0,
            margin: 0,
          };
        }
        monthlyData[monthKey].revenue += sale.sale_price || 0;
      });

      // Process expenses by date column (not created_at)
      expenses?.forEach((expense: any) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            revenue: 0,
            expenses: 0,
            net_profit: 0,
            margin: 0,
          };
        }
        monthlyData[monthKey].expenses += expense.amount || 0;
      });

      // Calculate net profit and margin for each month
      Object.values(monthlyData).forEach(month => {
        month.net_profit = month.revenue - month.expenses;
        month.margin = month.revenue > 0 ? (month.net_profit / month.revenue) * 100 : 0;
      });

      const sortedMonths = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
      const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      const currentMonthData = monthlyData[currentMonthKey] || {
        month: currentMonthKey,
        revenue: 0,
        expenses: 0,
        net_profit: 0,
        margin: 0,
      };

      // Calculate YTD and averages
      let ytdRevenue = 0;
      let ytdProfit = 0;
      sortedMonths.forEach(month => {
        if (month.month.startsWith(currentYear.toString())) {
          ytdRevenue += month.revenue;
          ytdProfit += month.net_profit;
        }
      });

      const avgProfit = sortedMonths.length > 0
        ? sortedMonths.reduce((sum, m) => sum + m.net_profit, 0) / sortedMonths.length
        : 0;

      return {
        current_month: currentMonthData,
        last_12_months: sortedMonths.slice(-12),
        year_to_date_revenue: ytdRevenue,
        year_to_date_profit: ytdProfit,
        average_monthly_profit: avgProfit,
      } as FinancialMetricsData;
    },
    staleTime: 30000,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const createdSalesSubscription = supabase
      .channel('financial_sales_created_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'vehicle_sales' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    const updatedSalesSubscription = supabase
      .channel('financial_sales_updated_updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'vehicle_sales' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(createdSalesSubscription, updatedSalesSubscription);

    const expensesSubscription = supabase
      .channel('financial_expenses_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(expensesSubscription);

    return () => {
      subscriptionsRef.current.forEach(subscription => {
        if (subscription) {
          supabase.removeChannel(subscription);
        }
      });
      subscriptionsRef.current = [];
    };
  }, [query]);

  return query;
}

