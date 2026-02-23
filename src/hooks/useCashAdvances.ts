import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CashAdvance {
  id: string;
  employee_id: string;
  advance_amount: number;
  advance_date: string;
  notes?: string | null;
  created_at?: string;
}

export const useCashAdvances = () => {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['cash-advances'],
    queryFn: async (): Promise<CashAdvance[]> => {
      const { data, error } = await (supabase as any)
        .from('employee_cash_advances')
        .select('*')
        .order('advance_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<CashAdvance>) => {
      const { data, error } = await (supabase as any)
        .from('employee_cash_advances')
        .insert([payload])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cash-advances'] })
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('employee_cash_advances')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cash-advances'] })
  });

  return { ...listQuery, create, remove };
};
