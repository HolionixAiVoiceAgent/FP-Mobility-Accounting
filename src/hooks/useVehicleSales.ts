import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface VehicleSale {
  id: string;
  sale_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vin: string;
  customer_id: string | null;
  purchase_price: number;
  sale_price: number;
  profit: number | null;
  payment_status: string;
  payment_method: string | null;
  sale_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVehicleSales = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['vehicle-sales'],
    queryFn: async (): Promise<VehicleSale[]> => {
      const { data, error } = await supabase
        .from('vehicle_sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000, // Cache data for 30 seconds - real-time subscription will handle updates
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('vehicle_sales_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_sales' },
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

export const useVehicleSalesStats = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['vehicle-sales-stats'],
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
      
      // Fetch sales data with proper date filtering at database level
      const { data: salesThisMonth, error: currentMonthError } = await supabase
        .from('vehicle_sales')
        .select('sale_price, payment_status')
        .gte('sale_date', startOfMonthStr)
        .lte('sale_date', endOfMonthStr);

      const { data: allSales, error: allSalesError } = await supabase
        .from('vehicle_sales')
        .select('sale_price, payment_status');

      if (currentMonthError || allSalesError) throw currentMonthError || allSalesError;

      // Calculate statistics
      const totalSales = salesThisMonth?.reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;
      const vehiclesSold = salesThisMonth?.length || 0;
      const averagePrice = vehiclesSold > 0 ? totalSales / vehiclesSold : 0;
      
      // Calculate pending payments from all sales
      const pendingPayments = allSales?.filter(sale => 
        sale.payment_status === 'pending' || sale.payment_status === 'partial'
      ).reduce((sum, sale) => sum + (sale.sale_price || 0), 0) || 0;

      return {
        totalSales,
        vehiclesSold,
        averagePrice,
        pendingPayments
      };
    },
    staleTime: 30000, // Cache data for 30 seconds - real-time subscription will handle updates
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('vehicle_sales_stats_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_sales' },
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

