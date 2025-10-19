import { useQuery } from '@tanstack/react-query';
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
  return useQuery({
    queryKey: ['vehicle-sales'],
    queryFn: async (): Promise<VehicleSale[]> => {
      const { data, error } = await supabase
        .from('vehicle_sales')
        .select('*')
        .order('sale_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useVehicleSalesStats = () => {
  return useQuery({
    queryKey: ['vehicle-sales-stats'],
    queryFn: async () => {
      const { data: sales, error } = await supabase
        .from('vehicle_sales')
        .select('*');

      if (error) throw error;

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
    },
  });
};