import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ServiceRecord {
  id: string;
  inventory_id: string;
  service_date: string;
  service_type: 'oil_change' | 'inspection' | 'repair' | 'tuv' | 'tire_change' | 'brake_service' | 'other';
  description: string;
  mileage_at_service: number | null;
  cost: number | null;
  vendor_name: string | null;
  next_service_date: string | null;
  next_service_mileage: number | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useServiceRecords = (inventoryId?: string) => {
  return useQuery({
    queryKey: ['service-records', inventoryId],
    queryFn: async (): Promise<ServiceRecord[]> => {
      let query = supabase
        .from('service_records')
        .select('*')
        .order('service_date', { ascending: false });

      if (inventoryId) {
        query = query.eq('inventory_id', inventoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as ServiceRecord[];
    },
  });
};

export const useUpcomingServices = () => {
  return useQuery({
    queryKey: ['upcoming-services'],
    queryFn: async () => {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const { data, error } = await supabase
        .from('service_records')
        .select('*, inventory(make, model, vin)')
        .not('next_service_date', 'is', null)
        .lte('next_service_date', thirtyDaysFromNow.toISOString().split('T')[0])
        .order('next_service_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateServiceRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (record: Omit<ServiceRecord, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('service_records')
        .insert([record])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-services'] });
      toast({
        title: "Success",
        description: "Service record added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add service record: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateServiceRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServiceRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('service_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-services'] });
      toast({
        title: "Success",
        description: "Service record updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update service record: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteServiceRecord = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-records'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-services'] });
      toast({
        title: "Success",
        description: "Service record deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete service record: ${error.message}`,
        variant: "destructive",
      });
    },
  });
};
