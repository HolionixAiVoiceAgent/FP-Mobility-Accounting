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
      try {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        // Fetch sales and expenses for last 12 months
        const startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 12);

        const { data: sales, error: salesError } = await supabase
          .from('vehicle_sales')
          .select('sale_price, created_at')
          .gte('created_at', startDate.toISOString());

        // Handle missing sales table
        if (salesError) {
          if (salesError.message?.includes('relation') || salesError.message?.includes('not exist')) {
            console.warn('Vehicle sales table not found, returning default metrics');
          } else {
            throw salesError;
          }
        }

        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('amount, created_at')
          .gte('created_at', startDate.toISOString());

        // Handle missing expenses table
        if (expensesError) {
          if (expensesError.message?.includes('relation') || expensesError.message?.includes('not exist')) {
            console.warn('Expenses table not found, returning default metrics');
          } else {
            throw expensesError;
          }
        }

        // Group by month
        const monthlyData: Record<string, MonthlyMetrics> = {};

        sales?.forEach((sale: any) => {
          const date = new Date(sale.created_at);
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

        expenses?.forEach((expense: any) => {
          const date = new Date(expense.created_at);
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

        // Calculate net profit and margin
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
      } catch (error) {
        console.warn('Error fetching financial metrics:', error);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
        
        return {
          current_month: {
            month: currentMonthKey,
            revenue: 0,
            expenses: 0,
            net_profit: 0,
            margin: 0,
          },
          last_12_months: [],
          year_to_date_revenue: 0,
          year_to_date_profit: 0,
          average_monthly_profit: 0,
        } as FinancialMetricsData;
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const salesSubscription = supabase
      .channel('financial_sales_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_sales' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(salesSubscription);

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
        supabase.removeChannel(subscription);
      });
      subscriptionsRef.current = [];
    };
  }, [query]);

  return query;
}
