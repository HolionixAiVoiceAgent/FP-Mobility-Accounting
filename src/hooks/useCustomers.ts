import { useState, useEffect, useRef } from 'react';
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
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  newThisMonth: number;
  totalOutstanding: number;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalOutstanding: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);
  const refetchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      // Handle missing table gracefully
      if (error) {
        if (error.message?.includes('relation') || error.message?.includes('not exist')) {
          console.warn('Customers table not found, returning empty data');
          setCustomers([]);
          setStats({
            totalCustomers: 0,
            activeCustomers: 0,
            newThisMonth: 0,
            totalOutstanding: 0
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      setCustomers((data || []) as Customer[]);
      
      // Calculate stats
      const totalCustomers = data?.length || 0;
      const activeCustomers = data?.filter(c => c.status === 'active').length || 0;
      const thisMonth = new Date();
      thisMonth.setDate(1);
      const newThisMonth = data?.filter(c => new Date(c.customer_since) >= thisMonth).length || 0;
      const totalOutstanding = data?.reduce((sum, c) => sum + Number(c.outstanding_balance), 0) || 0;

      setStats({
        totalCustomers,
        activeCustomers,
        newThisMonth,
        totalOutstanding
      });
    } catch (error) {
      console.warn('Error fetching customers:', error);
      // Set empty data on error
      setCustomers([]);
      setStats({
        totalCustomers: 0,
        activeCustomers: 0,
        newThisMonth: 0,
        totalOutstanding: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customerData: Omit<Customer, 'id' | 'customer_id'>) => {
    try {
      // Generate customer ID
      const customerCount = customers.length + 1;
      const customer_id = `CUST-${customerCount.toString().padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('customers')
        .insert([{ ...customerData, customer_id }])
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => [data as Customer, ...prev]);
      toast({
        title: 'Success',
        description: 'Customer added successfully'
      });
    } catch (error) {
      console.error('Error adding customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add customer',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomers(prev => prev.map(c => c.id === id ? data as Customer : c));
      toast({
        title: 'Success',
        description: 'Customer updated successfully'
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update customer',
        variant: 'destructive'
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Success',
        description: 'Customer deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchCustomers();

    // Set up real-time subscription
    const subscription = supabase
      .channel('customers_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          fetchCustomers();
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    // Also set up polling every 5 seconds for real-time updates
    refetchIntervalRef.current = setInterval(() => {
      fetchCustomers();
    }, 5000);

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
      }
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, []);

  return {
    customers,
    stats,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refetch: fetchCustomers
  };
}