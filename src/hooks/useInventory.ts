import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  inventory_id: string;
  vin: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  mileage?: number;
  purchase_price: number;
  expected_sale_price?: number;
  actual_sale_price?: number;
  status: string;
  location?: string;
  tuv_expiry?: string;
  last_service_date?: string;
  purchase_date: string;
  sale_date?: string;
  images_count?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryStats {
  totalVehicles: number;
  availableVehicles: number;
  soldThisMonth: number;
  avgDaysInStock: number;
  totalInventoryValue: number;
  pendingRepairs: number;
}

export const useInventory = () => {
  const subscriptionRef = useRef<any>(null);
  const imageSubscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['inventory'],
    queryFn: async (): Promise<InventoryItem[]> => {
      console.log('Fetching inventory...');
      
      // Fetch inventory items
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Inventory fetch error:', error);
        // If it's an auth error, return empty array for demo mode
        const errorStatus = (error as any).status;
        if (error.message?.includes('JWT') || errorStatus === 406) {
          console.warn('Auth error - returning empty array for demo mode');
          return [];
        }
        throw error;
      }
      
      console.log('Inventory fetch raw response:', { data, count: data?.length });
      
      // Fetch actual image counts from vehicle_images table
      const { data: vehicleImages, error: imagesError } = await supabase
        .from('vehicle_images')
        .select('inventory_id');
      
      if (imagesError) {
        console.warn('Could not fetch vehicle images:', imagesError);
      }
      
      // Create a count map of images per inventory_id
      const imageCountMap = new Map<string, number>();
      if (vehicleImages) {
        vehicleImages.forEach((img) => {
          const count = imageCountMap.get(img.inventory_id) || 0;
          imageCountMap.set(img.inventory_id, count + 1);
        });
      }
      
      // Map image counts to inventory items (using both inventory_id and vin as fallback)
      const inventoryWithImages = (data || []).map(item => ({
        ...item,
        images_count: imageCountMap.get(item.inventory_id) || imageCountMap.get(item.vin) || 0
      }));
      
      console.log('Inventory with image counts:', inventoryWithImages.map(i => ({ 
        inventory_id: i.inventory_id, 
        vin: i.vin, 
        images_count: i.images_count 
      })));
      
      if (data && data.length > 0) {
        console.log('First vehicle data:', JSON.stringify(data[0], null, 2));
      }
      return inventoryWithImages;
    },
    staleTime: 10000, // Cache data for 10 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const subscription = supabase
      .channel('inventory_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    subscriptionRef.current = subscription;

    // Also subscribe to vehicle_images changes to update image counts
    const imageSubscription = supabase
      .channel('vehicle_images_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_images' },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    imageSubscriptionRef.current = imageSubscription;

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
      if (imageSubscriptionRef.current) {
        supabase.removeChannel(imageSubscriptionRef.current);
        imageSubscriptionRef.current = null;
      }
    };
  }, [query]);

  return query;
};

export const useInventoryStats = () => {
  const subscriptionRef = useRef<any>(null);

  const query = useQuery({
    queryKey: ['inventory-stats'],
    queryFn: async (): Promise<InventoryStats> => {
      const { data: inventory, error } = await supabase
        .from('inventory')
        .select('*');

      if (error) {
        console.error('Inventory stats fetch error:', error);
        const errorStatus = (error as any).status;
        if (error.message?.includes('JWT') || errorStatus === 406) {
          return {
            totalVehicles: 0,
            availableVehicles: 0,
            soldThisMonth: 0,
            avgDaysInStock: 0,
            totalInventoryValue: 0,
            pendingRepairs: 0
          };
        }
        throw error;
      }

      const items = inventory || [];
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const totalVehicles = items.length;
      const availableVehicles = items.filter(item => item.status === 'available').length;
      
      const soldThisMonth = items.filter(item => {
        if (!item.sale_date) return false;
        const saleDate = new Date(item.sale_date);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      }).length;

      const daysInStock = items.map(item => {
        const purchaseDate = new Date(item.purchase_date);
        const endDate = item.sale_date ? new Date(item.sale_date) : currentDate;
        return Math.floor((endDate.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24));
      });
      const avgDaysInStock = daysInStock.length > 0 
        ? Math.round(daysInStock.reduce((sum, days) => sum + days, 0) / daysInStock.length)
        : 0;

      const totalInventoryValue = items
        .filter(item => item.status === 'available')
        .reduce((sum, item) => sum + (item.expected_sale_price || item.purchase_price), 0);

      const pendingRepairs = items.filter(item => item.status === 'pending_repair').length;

      return {
        totalVehicles,
        availableVehicles,
        soldThisMonth,
        avgDaysInStock,
        totalInventoryValue,
        pendingRepairs
      };
    },
    staleTime: 10000, // Cache data for 10 seconds
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  useEffect(() => {
    const subscription = supabase
      .channel('inventory_stats_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory' },
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

  return query;
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating inventory item with data:', JSON.stringify(data, null, 2));
      
      // Insert the data
      const { error: insertError } = await supabase
        .from('inventory')
        .insert([data]);

      if (insertError) {
        console.error('Insert error details:', insertError);
        throw new Error(insertError.message);
      }

      console.log('Insert successful! Vehicle added to inventory.');
      
      // Return success - don't try to fetch as demo tokens may not work for authenticated requests
      // The item will appear when we refetch the inventory list
      return { success: true, data };
    },
    onSuccess: (result) => {
      // Invalidate and refetch the inventory list to get the newly added item
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast({
        title: "Success",
        description: "Vehicle added to inventory successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add vehicle to inventory.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InventoryItem> & { id: string }) => {
      console.log('Updating inventory item:', { id, data });
      
      // First do the update without select
      const { error: updateError } = await supabase
        .from('inventory')
        .update(data)
        .eq('id', id);

      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }

      // Then fetch the updated item
      const { data: updatedItem, error: fetchError } = await supabase
        .from('inventory')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Fetch updated item error:', fetchError);
        // Even if fetch fails, the update might have succeeded
        return { success: true, data: null };
      }

      console.log('Update successful, fetched item:', updatedItem);
      return { success: true, data: updatedItem };
    },
    onSuccess: (result) => {
      // Directly update the cache with the updated item for immediate UI feedback
      if (result.data) {
        queryClient.setQueryData<InventoryItem[]>(['inventory'], (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(item => 
            item.id === result.data!.id ? { ...item, ...result.data } : item
          );
        });
      }
      // Invalidate to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast({
        title: "Success",
        description: "Vehicle updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update vehicle.",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast({
        title: "Success",
        description: "Vehicle removed from inventory successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove vehicle.",
        variant: "destructive",
      });
    },
  });
};
