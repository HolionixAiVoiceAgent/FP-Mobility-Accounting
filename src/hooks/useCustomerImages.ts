import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CustomerImage {
  id: string;
  customer_id: string;
  image_url: string;
  image_order: number;
  is_primary: boolean;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

// Helper to bypass TypeScript table restrictions
const getCustomerImagesTable = () => supabase.from('customer_images') as any;

export const useCustomerImages = (customerDbId: string | undefined) => {
  return useQuery({
    queryKey: ['customer-images', customerDbId],
    queryFn: async (): Promise<CustomerImage[]> => {
      if (!customerDbId) return [];
      
      const { data, error } = await getCustomerImagesTable()
        .select('*')
        .eq('customer_id', customerDbId)
        .order('image_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customerDbId,
  });
};

export const useUploadCustomerImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      customerDbId, 
      file, 
      isPrimary = false 
    }: { 
      customerDbId: string; 
      file: File; 
      isPrimary?: boolean;
    }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${customerDbId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('customer-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('customer-images')
        .getPublicUrl(fileName);

      const { data: images } = await getCustomerImagesTable()
        .select('image_order')
        .eq('customer_id', customerDbId)
        .order('image_order', { ascending: false })
        .limit(1);

      const nextOrder = images && images.length > 0 ? images[0].image_order + 1 : 0;

      const { error: dbError } = await getCustomerImagesTable()
        .insert({
          customer_id: customerDbId,
          image_url: publicUrl,
          image_order: nextOrder,
          is_primary: isPrimary
        });

      if (dbError) throw dbError;

      return publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['customer-images', variables.customerDbId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: "Image uploaded successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    },
  });
};

export const useDeleteCustomerImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, imageUrl, customerDbId }: { id: string; imageUrl: string; customerDbId: string }) => {
      const path = imageUrl.split('/customer-images/')[1];
      
      if (path) {
        await supabase.storage.from('customer-images').remove([path]);
      }

      const { error } = await getCustomerImagesTable().delete().eq('id', id);
      if (error) throw error;
      
      return customerDbId;
    },
    onSuccess: (customerDbId) => {
      queryClient.invalidateQueries({ queryKey: ['customer-images', customerDbId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: "Image deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    },
  });
};

export const useSetPrimaryCustomerImage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, customerDbId }: { id: string; customerDbId: string }) => {
      await getCustomerImagesTable().update({ is_primary: false }).eq('customer_id', customerDbId);
      const { error } = await getCustomerImagesTable().update({ is_primary: true }).eq('id', id);
      if (error) throw error;
      return customerDbId;
    },
    onSuccess: (customerDbId) => {
      queryClient.invalidateQueries({ queryKey: ['customer-images', customerDbId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: "Primary image updated" });
    },
    onError: (error: any) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });
};

