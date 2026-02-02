import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  phone?: string;
  position?: string;
  department?: string;
  salary?: number;
  commission?: number;
  status?: string;
  hire_date?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useEmployees = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['employees'],
    queryFn: async (): Promise<Employee[]> => {
      try {
        const { data, error } = await (supabase as any)
          .from('employees')
          .select('*')
          .order('full_name', { ascending: true });
        
        if (error) {
          if (error.message?.includes('relation') || error.message?.includes('not exist')) {
            console.warn('Employees table not found, returning empty data');
            return [];
          }
          throw error;
        }
        return data || [];
      } catch (error) {
        console.warn('Error fetching employees:', error);
        return [];
      }
    },
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<Employee>) => {
      const { data, error } = await (supabase as any)
        .from('employees')
        .insert([payload])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });

  const update = useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Employee> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('employees')
        .update(payload)
        .eq('id', id)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('employees')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] })
  });

  return { ...listQuery, create, update, remove };
};

