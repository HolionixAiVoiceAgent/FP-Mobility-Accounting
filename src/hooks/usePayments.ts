import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  customer_id: string;
  vehicle_sale_id: string | null;
  amount: number;
  payment_date: string;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const usePayments = (customerId?: string) => {
  return useQuery({
    queryKey: customerId ? ['payments', customerId] : ['payments'],
    queryFn: async (): Promise<Payment[]> => {
      let query = supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};
