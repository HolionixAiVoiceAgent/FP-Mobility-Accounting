import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FinancialObligation {
  id: string;
  obligation_type: "investor" | "bank_loan";
  creditor_name: string;
  principal_amount: number;
  interest_rate: number | null;
  start_date: string;
  due_date: string | null;
  monthly_payment: number | null;
  outstanding_balance: number;
  status: "active" | "paid" | "defaulted";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useFinancialObligations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  const { data: obligations, isLoading } = useQuery({
    queryKey: ["financial-obligations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_obligations")
        .select("*")
        .order("start_date", { ascending: false });

      if (error) throw error;
      return data as FinancialObligation[];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 2000,
  });

  // Set up real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel("financial_obligations_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "financial_obligations" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["financial-obligations"] });
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
  }, [queryClient]);

  const addObligation = useMutation({
    mutationFn: async (obligation: Omit<FinancialObligation, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("financial_obligations")
        .insert([obligation])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-obligations"] });
      queryClient.invalidateQueries({ queryKey: ["lifetime-stats"] });
      toast({
        title: "Success",
        description: "Financial obligation added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateObligation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<FinancialObligation> }) => {
      const { data, error } = await supabase
        .from("financial_obligations")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-obligations"] });
      queryClient.invalidateQueries({ queryKey: ["lifetime-stats"] });
      toast({
        title: "Success",
        description: "Financial obligation updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteObligation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("financial_obligations").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-obligations"] });
      queryClient.invalidateQueries({ queryKey: ["lifetime-stats"] });
      toast({
        title: "Success",
        description: "Financial obligation deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    obligations,
    isLoading,
    addObligation,
    updateObligation,
    deleteObligation,
  };
};
