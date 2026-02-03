import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdvancedKPIs {
  inventoryAging: {
    average_days: number;
    oldest_vehicle_days: number;
    vehicles_over_60_days: number;
  };
  salesVelocity: {
    avg_days_to_sale: number;
    sales_per_month: number;
    monthly_trend: number; // percentage change
  };
  grossMargin: {
    avg_profit_per_sale: number;
    avg_margin_percentage: number;
    best_margin_make: string;
  };
  customerRetention: {
    repeat_customers: number;
    retention_rate: number; // percentage
    avg_customer_lifetime_value: number;
  };
}

/**
 * Fetch advanced KPIs for dashboard
 * Includes inventory aging, sales velocity, gross margin, and customer retention metrics
 */
export function useAdvancedKPIs() {
  return useQuery({
    queryKey: ['advancedKPIs'],
    queryFn: async (): Promise<AdvancedKPIs> => {
      // Fetch inventory data
      const { data: inventory } = await supabase
        .from('inventory')
        .select('id, created_at, status')
        .eq('status', 'available');

      // Fetch sales data
      const { data: sales } = await supabase
        .from('vehicle_sales')
        .select('id, vehicle_make, profit, sale_price, purchase_price, customer_id, created_at, sale_date')
        .gte('sale_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch customers
      const { data: customers } = await supabase
        .from('customers')
        .select('id, vehicles_purchased, total_purchases, customer_since');

      // Calculate Inventory Aging
      const now = new Date();
      const agingDays = (inventory || []).map((item: any) => {
        // Use created_at or purchase_date for aging calculation
        const itemDate = item.created_at || item.purchase_date;
        if (!itemDate) return 0;
        const createdDate = new Date(itemDate);
        return Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      });

      const inventoryAging = {
        average_days: agingDays.length > 0 ? Math.round(agingDays.reduce((a, b) => a + b, 0) / agingDays.length) : 0,
        oldest_vehicle_days: agingDays.length > 0 ? Math.max(...agingDays) : 0,
        vehicles_over_60_days: agingDays.filter((d: number) => d > 60).length,
      };

      // Calculate Sales Velocity
      const salesThisMonth = (sales || []).filter(
        (s: any) => new Date(s.sale_date).getMonth() === new Date().getMonth()
      ).length;

      const avgDaysToSale = sales && sales.length > 0
        ? Math.round(
            sales.reduce((sum: number, s: any) => {
              const created = new Date(s.created_at);
              const sold = new Date(s.sale_date);
              return sum + (sold.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            }, 0) / sales.length
          )
        : 0;

      const salesVelocity = {
        avg_days_to_sale: avgDaysToSale,
        sales_per_month: Math.round((sales?.length || 0) / 12),
        monthly_trend: 0, // Would calculate YoY trend in production
      };

      // Calculate Gross Margin
      const totalProfit = (sales || []).reduce((sum: number, s: any) => sum + (s.profit || 0), 0);
      const totalSales = sales ? sales.length : 0;
      const avgProfitPerSale = totalSales > 0 ? Math.round(totalProfit / totalSales) : 0;
      const totalRevenue = (sales || []).reduce((sum: number, s: any) => sum + (s.sale_price || 0), 0);
      const avgMarginPercentage = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100 * 10) / 10 : 0;

      const grossMargin = {
        avg_profit_per_sale: avgProfitPerSale,
        avg_margin_percentage: avgMarginPercentage,
        best_margin_make: 'N/A', // Would aggregate by make in production
      };

      // Calculate Customer Retention
      const repeatCustomers = (customers || []).filter((c: any) => c.vehicles_purchased > 1).length;
      const totalCustomers = customers?.length || 0;
      const retentionRate = totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0;
      const avgLifetimeValue = totalCustomers > 0
        ? Math.round((customers || []).reduce((sum: number, c: any) => sum + (c.total_purchases || 0), 0) / totalCustomers)
        : 0;

      const customerRetention = {
        repeat_customers: repeatCustomers,
        retention_rate: retentionRate,
        avg_customer_lifetime_value: avgLifetimeValue,
      };

      return {
        inventoryAging,
        salesVelocity,
        grossMargin,
        customerRetention,
      };
    },
    staleTime: 60 * 60 * 1000, // Update every hour
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}
