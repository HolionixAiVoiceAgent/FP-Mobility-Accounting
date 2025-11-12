import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VehiclePurchase {
  id: string;
  inventory_id: string | null;
  seller_type: 'customer' | 'dealer' | 'auction' | 'trade_in';
  seller_name: string;
  seller_contact: string | null;
  seller_address: string | null;
  purchase_date: string;
  purchase_price: number;
  payment_terms_days: number;
  payment_due_date: string;
  amount_paid: number;
  outstanding_balance: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'overdue';
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehiclePurchaseStats {
  totalOutstanding: number;
  overdueAmount: number;
  dueThisWeek: number;
  dueThisMonth: number;
  totalPurchases: number;
  paidThisMonth: number;
}

export const useVehiclePurchases = () => {
  return useQuery({
    queryKey: ['vehicle-purchases'],
    queryFn: async (): Promise<VehiclePurchase[]> => {
      const { data, error } = await supabase
        .from('vehicle_purchases')
        .select('*')
        .order('purchase_date', { ascending: false });

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.message?.includes('not exist')) {
          throw new Error('Vehicle Purchases table not found. Please contact your administrator to run database migrations.');
        }
        throw error;
      }
      return (data || []) as VehiclePurchase[];
    },
  });
};

export const useVehiclePurchaseStats = () => {
  return useQuery({
    queryKey: ['vehicle-purchase-stats'],
    queryFn: async (): Promise<VehiclePurchaseStats> => {
      const { data: purchases, error } = await supabase
        .from('vehicle_purchases')
        .select('*');

      if (error) {
        // Check if table doesn't exist
        if (error.message?.includes('relation') || error.message?.includes('not exist')) {
          // Return empty stats if table doesn't exist
          return {
            totalOutstanding: 0,
            overdueAmount: 0,
            dueThisWeek: 0,
            dueThisMonth: 0,
            totalPurchases: 0,
            paidThisMonth: 0,
          };
        }
        throw error;
      }

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const oneWeekFromNow = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

      const totalOutstanding = purchases
        ?.filter(p => p.payment_status !== 'paid')
        .reduce((sum, p) => sum + Number(p.outstanding_balance), 0) || 0;

      const overdueAmount = purchases
        ?.filter(p => p.payment_status === 'overdue')
        .reduce((sum, p) => sum + Number(p.outstanding_balance), 0) || 0;

      const dueThisWeek = purchases
        ?.filter(p => {
          const dueDate = new Date(p.payment_due_date);
          return p.payment_status !== 'paid' && dueDate <= oneWeekFromNow;
        })
        .reduce((sum, p) => sum + Number(p.outstanding_balance), 0) || 0;

      const dueThisMonth = purchases
        ?.filter(p => {
          const dueDate = new Date(p.payment_due_date);
          return p.payment_status !== 'paid' && dueDate <= endOfMonth;
        })
        .reduce((sum, p) => sum + Number(p.outstanding_balance), 0) || 0;

      const paidThisMonth = purchases
        ?.filter(p => {
          const paidDate = new Date(p.updated_at);
          return p.payment_status === 'paid' && 
                 paidDate.getMonth() === currentMonth && 
                 paidDate.getFullYear() === currentYear;
        })
        .reduce((sum, p) => sum + Number(p.purchase_price), 0) || 0;

      return {
        totalOutstanding,
        overdueAmount,
        dueThisWeek,
        dueThisMonth,
        totalPurchases: purchases?.length || 0,
        paidThisMonth,
      };
    },
  });
};

export const useCreateVehiclePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (purchase: Omit<VehiclePurchase, 'id' | 'created_at' | 'updated_at' | 'amount_paid' | 'outstanding_balance' | 'payment_status'>) => {
      const { data, error } = await supabase
        .from('vehicle_purchases')
        .insert([{
          ...purchase,
          amount_paid: 0,
          outstanding_balance: purchase.purchase_price,
          payment_status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchase-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lifetime-stats'] });
      toast({
        title: "Success",
        description: "Vehicle purchase recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to record purchase: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateVehiclePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VehiclePurchase> & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicle_purchases')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchase-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lifetime-stats'] });
      toast({
        title: "Success",
        description: "Purchase updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update purchase: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteVehiclePurchase = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('vehicle_purchases')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle-purchase-stats'] });
      queryClient.invalidateQueries({ queryKey: ['lifetime-stats'] });
      toast({
        title: "Success",
        description: "Purchase deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete purchase: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
