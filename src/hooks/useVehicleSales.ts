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
      try {
        const { data, error } = await supabase
          .from('vehicle_sales')
          .select('*')
          .order('sale_date', { ascending: false });

        if (error) {
          // Check if table doesn't exist
          if (error.message?.includes('relation') || error.message?.includes('not exist')) {
            console.warn('Vehicle sales table not found, returning empty data');
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.warn('Error fetching vehicle sales:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000,
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
      supabase.removeChannel(subscription);
    };
  }, [query]);

  return query;
};

export const useVehicleSalesStats = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['vehicle-sales-stats'],
    queryFn: async () => {
      try {
        const { data: sales, error } = await supabase
          .from('vehicle_sales')
          .select('*');

        // Handle missing table gracefully
        if (error) {
          if (error.message?.includes('relation') || error.message?.includes('not exist')) {
            console.warn('Vehicle sales table not found, returning default stats');
            return {
              totalSales: 0,
              vehiclesSold: 0,
              averagePrice: 0,
              pendingPayments: 0
            };
          }
          throw error;
        }

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const salesThisMonth = sales?.filter(sale => {
          const saleDate = new Date(sale.sale_date);
          return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
        }) || [];

        const totalSales = salesThisMonth.reduce((sum, sale) => sum + sale.sale_price, 0);
        const vehiclesSold = salesThisMonth.length;
        const averagePrice = vehiclesSold > 0 ? totalSales / vehiclesSold : 0;
        const pendingPayments = sales?.filter(sale => 
          sale.payment_status === 'pending' || sale.payment_status === 'partial'
        ).reduce((sum, sale) => sum + sale.sale_price, 0) || 0;

        return {
          totalSales,
          vehiclesSold,
          averagePrice,
          pendingPayments
        };
      } catch (error) {
        console.warn('Error fetching vehicle sales stats:', error);
        return {
          totalSales: 0,
          vehiclesSold: 0,
          averagePrice: 0,
          pendingPayments: 0
        };
      }
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000,
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
      supabase.removeChannel(subscription);
    };
  }, [query]);

  return query;
};