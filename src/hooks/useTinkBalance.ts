import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTinkBalance = () => {
  const { data: balance, isLoading } = useQuery({
    queryKey: ["tink-balance"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tink_accounts")
        .select("balance, last_synced_at")
        .eq("status", "active");

      if (error) throw error;

      const totalBalance = data?.reduce((sum, account) => sum + Number(account.balance || 0), 0) || 0;
      const lastSynced = data?.[0]?.last_synced_at || null;

      return {
        totalBalance,
        lastSynced,
      };
    },
  });

  return {
    balance: balance?.totalBalance || 0,
    lastSynced: balance?.lastSynced,
    isLoading,
  };
};
