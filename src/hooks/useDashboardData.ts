import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cashFlow: number;
  totalCustomers: number;
  totalVehicles: number;
  totalEmployees: number;
  activeDeals: number;
}

export const useDashboardData = () => {
  const subscriptionsRef = useRef<any[]>([]);

  const query = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Fetch from vehicle_sales for revenue
      const { data: salesData } = await supabase
        .from('vehicle_sales')
        .select('sale_price')
        .limit(1000);

      // Fetch expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .limit(1000);

      // Fetch customers count
      const { count: customerCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Fetch inventory count
      const { count: inventoryCount } = await supabase
        .from('inventory')
        .select('*', { count: 'exact', head: true });

      const totalRevenue = (salesData || []).reduce((sum, s) => sum + (s.sale_price || 0), 0);
      const totalExpenses = (expensesData || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      const netProfit = totalRevenue - totalExpenses;

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        cashFlow: netProfit,
        totalCustomers: customerCount || 0,
        totalVehicles: inventoryCount || 0,
        totalEmployees: 0,
        activeDeals: 0,
      };
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000, // Data is stale after 2 seconds
  });

  // Set up real-time subscriptions for changes
  useEffect(() => {
    // Subscribe to vehicle_sales changes
    const salesSubscription = supabase
      .channel('vehicle_sales_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_sales' },
        () => {
          // Invalidate and refetch when sales change
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(salesSubscription);

    // Subscribe to expenses changes
    const expensesSubscription = supabase
      .channel('expenses_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          // Invalidate and refetch when expenses change
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(expensesSubscription);

    // Subscribe to customers changes
    const customersSubscription = supabase
      .channel('customers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(customersSubscription);

    // Subscribe to inventory changes
    const inventorySubscription = supabase
      .channel('inventory_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionsRef.current.push(inventorySubscription);

    // Cleanup subscriptions on unmount
    return () => {
      subscriptionsRef.current.forEach(subscription => {
        supabase.removeChannel(subscription);
      });
      subscriptionsRef.current = [];
    };
  }, [query]);

  return query;
};
