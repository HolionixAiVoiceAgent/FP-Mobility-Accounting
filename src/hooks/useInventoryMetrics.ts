import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VehicleAgingBucket {
  days_range: string;
  count: number;
  percentage: number;
}

export interface InventoryMetricsData {
  total_vehicles: number;
  available_vehicles: number;
  reserved_vehicles: number;
  aging_buckets: VehicleAgingBucket[];
  average_days_in_stock: number;
  total_inventory_value: number;
}

export function useInventoryMetrics() {
  return useQuery({
    queryKey: ['inventoryMetrics'],
    queryFn: async () => {
      // Fetch inventory data
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const agingBuckets: Record<string, number> = {
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
      };

      let totalValue = 0;
      let reservedCount = 0;
      let totalDays = 0;

      inventory?.forEach((vehicle: any) => {
        totalValue += vehicle.purchase_price || 0;

        if (vehicle.status === 'reserved') {
          reservedCount += 1;
        }

        // Use created_at (or purchase_date) for inventory aging calculation
        const vehicleDate = vehicle.created_at || vehicle.purchase_date;
        if (vehicleDate) {
          const daysInStock = Math.floor(
            (now.getTime() - new Date(vehicleDate).getTime()) / (1000 * 60 * 60 * 24)
          );
          totalDays += daysInStock;

          if (daysInStock <= 30) agingBuckets['0-30']++;
          else if (daysInStock <= 60) agingBuckets['31-60']++;
          else if (daysInStock <= 90) agingBuckets['61-90']++;
          else agingBuckets['90+']++;
        }
      });

      const total = inventory?.length || 0;
      const agingArray = Object.entries(agingBuckets).map(([range, count]) => ({
        days_range: range,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }));

      return {
        total_vehicles: total,
        available_vehicles: (total - reservedCount) || 0,
        reserved_vehicles: reservedCount,
        aging_buckets: agingArray,
        average_days_in_stock: total > 0 ? Math.round(totalDays / total) : 0,
        total_inventory_value: totalValue,
      } as InventoryMetricsData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
