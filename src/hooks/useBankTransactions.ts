import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useBankTransactions = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["bank-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_transactions")
        .select("*")
        .order("date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  return {
    transactions,
    isLoading,
  };
};
