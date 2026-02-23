import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Customer {
  id: string;
  customer_id: string;
  type: 'individual' | 'business';
  name: string;
  email: string;
  phone: string;
  address: string;
  total_purchases: number;
  vehicles_purchased: number;
  outstanding_balance: number;
  status: 'active' | 'pending_payment' | 'inactive';
  customer_since: string;
  last_purchase?: string;
  created_at?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  totalOutstanding: number;
}

export const useCustomers = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      console.log('Fetching customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Customers fetch error:', error);
        const errorStatus = (error as any).status;
        if (error.message?.includes('JWT') || errorStatus === 406) {
          console.warn('Auth error - returning empty array for demo mode');
          return [];
        }
        throw error;
      }
      
      console.log('Customers fetched successfully:', data?.length || 0, 'items');
      return (data || []) as Customer[];
    },
    staleTime: 30000, // Cache data for 30 seconds - real-time subscription will handle updates
  });

  // Calculate stats from the fetched customers
  const stats: CustomerStats = {
    totalCustomers: query.data?.length || 0,
    activeCustomers: query.data?.filter(c => c.status === 'active').length || 0,
    newThisMonth: query.data?.filter(c => {
      const customerDate = new Date(c.customer_since);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return customerDate >= thisMonth;
    }).length || 0,
    totalOutstanding: query.data?.reduce((sum, c) => sum + Number(c.outstanding_balance), 0) || 0
  };

  useEffect(() => {
    const subscription = supabase
      .channel('customers_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
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

  return {
    customers: query.data || [],
    stats,
    loading: query.isLoading,
    error: query.error,
    addCustomer: async (customerData: any) => {
      // Generate customer ID
      const { data: countData } = await supabase
        .from('customers')
        .select('count', { count: 'exact' });
      
      const customerCount = (countData?.[0]?.count || 0) + 1;
      const customer_id = `CUST-${customerCount.toString().padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, customer_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    refetch: query.refetch
  };
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (customerData: any) => {
      // Generate customer ID
      const { data: countData } = await supabase
        .from('customers')
        .select('count', { count: 'exact' });
      
      const customerCount = (countData?.[0]?.count || 0) + 1;
      const customer_id = `CUST-${customerCount.toString().padStart(4, '0')}`;

      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, customer_id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success',
        description: 'Customer added successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add customer',
        variant: 'destructive'
      });
      throw error;
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success',
        description: 'Customer updated successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update customer',
        variant: 'destructive'
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Success',
        description: 'Customer deleted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete customer',
        variant: 'destructive'
      });
    },
  });
};

