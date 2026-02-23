import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MonthlyMetrics {
  month: string;
  revenue: number;
  expenses: number;
  net_profit: number;
  margin: number;
  vehicles_sold?: number;
}

export interface FinancialMetricsData {
  current_month: MonthlyMetrics;
  last_12_months: MonthlyMetrics[];
  year_to_date_revenue: number;
  year_to_date_profit: number;
  average_monthly_profit: number;
}

// Optimized hook using direct queries for better reliability
export function useFinancialMetricsOptimized() {
  const subscriptionsRef = useRef<any[]>([]);

  const query = useQuery({
    queryKey: ['financialMetricsOptimized'],
    queryFn: async () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
      
      // Calculate date range for last 12 months (use date strings for DATE columns)
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 12);
      const startDateStr = startDate.toISOString().split('T')[0];
      
      // Fetch sales data with proper date filtering
      const { data: sales, error: salesError } = await supabase
        .from('vehicle_sales')
        .select('sale_price, purchase_price, sale_date')
        .gte('sale_date', startDateStr);

      if (salesError) throw salesError;

      // Fetch expenses data with proper date filtering (using date column, not created_at)
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, date')
        .gte('date', startDateStr);

      if (expensesError) throw expensesError;

      // Group sales by month
      const salesByMonth: Record<string, { revenue: number; vehicles: number }> = {};
      
      sales?.forEach((sale: any) => {
        const date = new Date(sale.sale_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!salesByMonth[monthKey]) {
          salesByMonth[monthKey] = { revenue: 0, vehicles: 0 };
        }
        salesByMonth[monthKey].revenue += sale.sale_price || 0;
        salesByMonth[monthKey].vehicles += 1;
      });

      // Group expenses by month
      const expensesByMonth: Record<string, number> = {};
      
      expenses?.forEach((expense: any) => {
        const date = new Date(expense.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!expensesByMonth[monthKey]) {
          expensesByMonth[monthKey] = 0;
        }
        expensesByMonth[monthKey] += expense.amount || 0;
      });

      // Get all months in the range
      const allMonths = new Set<string>();
      for (let i = 0; i < 12; i++) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        allMonths.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }

      // Build the last_12_months array
      const last12Months: MonthlyMetrics[] = [];
      
      // Sort months in ascending order
      const sortedMonths = Array.from(allMonths).sort();
      
      sortedMonths.forEach(month => {
        const revenue = salesByMonth[month]?.revenue || 0;
        const expenses = expensesByMonth[month] || 0;
        const netProfit = revenue - expenses;
        const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
        
        last12Months.push({
          month,
          revenue,
          expenses,
          net_profit: netProfit,
          margin,
          vehicles_sold: salesByMonth[month]?.vehicles || 0
        });
      });

      // Calculate current month stats
      const currentMonthRevenue = salesByMonth[currentMonthKey]?.revenue || 0;
      const currentMonthExpenses = expensesByMonth[currentMonthKey] || 0;
      const currentMonthVehicles = salesByMonth[currentMonthKey]?.vehicles || 0;
      const currentMonthProfit = currentMonthRevenue - currentMonthExpenses;
      const currentMonthMargin = currentMonthRevenue > 0 ? (currentMonthProfit / currentMonthRevenue) * 100 : 0;

      // Calculate YTD stats
      let ytdRevenue = 0;
      let ytdProfit = 0;
      
      last12Months.forEach(month => {
        if (month.month.startsWith(currentYear.toString())) {
          ytdRevenue += month.revenue;
          ytdProfit += month.net_profit;
        }
      });

      // Calculate average monthly profit
      const avgProfit = last12Months.length > 0
        ? last12Months.reduce((sum, m) => sum + m.net_profit, 0) / last12Months.length
        : 0;

      return {
        current_month: {
          month: currentMonthKey,
          revenue: currentMonthRevenue,
          expenses: currentMonthExpenses,
          net_profit: currentMonthProfit,
          margin: currentMonthMargin,
          vehicles_sold: currentMonthVehicles
        },
        last_12_months: last12Months,
        year_to_date_revenue: ytdRevenue,
        year_to_date_profit: ytdProfit,
        average_monthly_profit: avgProfit,
      } as FinancialMetricsData;
    },
    refetchInterval: 10000, // Refetch every 10 seconds
    staleTime: 5000,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const salesSubscription = supabase
      .channel('optimized_financial_sales_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_sales' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    const expensesSubscription = supabase
      .channel('optimized_financial_expenses_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(salesSubscription, expensesSubscription);

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

