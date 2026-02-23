import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VehicleImage {
  id: string;
  inventory_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export const useVehicleImages = (inventoryId: string | undefined) => {
  return useQuery({
    queryKey: ['vehicle-images', inventoryId],
    queryFn: async (): Promise<VehicleImage[]> => {
      if (!inventoryId) return [];
      
      const { data, error } = await supabase
        .from('vehicle_images')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('image_order', { ascending: true });

      if (error) {
        console.error('Error fetching vehicle images:', error);
        // If table doesn't exist or other error, return empty array
        return [];
      }
      return data || [];
    },
    enabled: !!inventoryId,
    retry: 1,
  });
};

export const useUploadVehicleImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      inventoryId, 
      file, 
      isPrimary = false 
    }: { 
      inventoryId: string; 
      file: File; 
      isPrimary?: boolean;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${inventoryId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vehicle-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vehicle-images')
        .getPublicUrl(fileName);

      const { data: images } = await supabase
        .from('vehicle_images')
        .select('image_order')
        .eq('inventory_id', inventoryId)
        .order('image_order', { ascending: false })
        .limit(1);

      const nextOrder = images && images.length > 0 ? images[0].image_order + 1 : 0;

      const { error: dbError } = await supabase
        .from('vehicle_images')
        .insert({
          inventory_id: inventoryId,
          image_url: publicUrl,
          image_order: nextOrder,
          is_primary: isPrimary
        });

      if (dbError) throw dbError;

      // Update images_count in inventory table - count actual images
      const { data: currentImages } = await supabase
        .from('vehicle_images')
        .select('id', { count: 'exact', head: true })
        .eq('inventory_id', inventoryId);

      const imageCount = currentImages?.length || 0;

      await supabase
        .from('inventory')
        .update({ images_count: imageCount })
        .eq('inventory_id', inventoryId);

      return publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-images', variables.inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Image uploaded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteVehicleImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, imageUrl, inventoryId }: { id: string; imageUrl: string; inventoryId: string }) => {
      const path = imageUrl.split('/vehicle-images/')[1];
      
      if (path) {
        await supabase.storage
          .from('vehicle-images')
          .remove([path]);
      }

      const { error } = await supabase
        .from('vehicle_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update images_count in inventory table - count actual images
      const { data: currentImages } = await supabase
        .from('vehicle_images')
        .select('id', { count: 'exact', head: true })
        .eq('inventory_id', inventoryId);

      const imageCount = currentImages?.length || 0;

      await supabase
        .from('inventory')
        .update({ images_count: imageCount })
        .eq('inventory_id', inventoryId);
      
      return inventoryId;
    },
    onSuccess: (inventoryId) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-images', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Image deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, inventoryId }: { id: string; inventoryId: string }) => {
      await supabase
        .from('vehicle_images')
        .update({ is_primary: false })
        .eq('inventory_id', inventoryId);

      const { error } = await supabase
        .from('vehicle_images')
        .update({ is_primary: true })
        .eq('id', id);

      if (error) throw error;
      
      return inventoryId;
    },
    onSuccess: (inventoryId) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-images', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Primary image updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
