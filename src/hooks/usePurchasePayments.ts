import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PurchasePayment {
  id: string;
  vehicle_purchase_id: string;
  payment_date: string;
  amount: number;
  payment_method: string | null;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export const usePurchasePayments = (vehiclePurchaseId?: string) => {
  return useQuery({
    queryKey: ['purchase-payments', vehiclePurchaseId],
    queryFn: async (): Promise<PurchasePayment[]> => {
      let query = supabase
        .from('purchase_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (vehiclePurchaseId) {
        query = query.eq('vehicle_purchase_id', vehiclePurchaseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    enabled: !vehiclePurchaseId || !!vehiclePurchaseId,
  });
};

export const useRecordPurchasePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payment: Omit<PurchasePayment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('purchase_payments')
        .insert([payment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchase-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lifetime-stats'] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeletePurchasePayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('purchase_payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-payments'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchase-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lifetime-stats'] });
      toast({
        title: "Success",
        description: "Payment deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete payment: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
