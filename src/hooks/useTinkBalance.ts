import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTinkBalance = () => {
  const { data: balance, isLoading } = useQuery({
    queryKey: ["tink-balance"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("tink_accounts")
          .select("balance, last_synced_at")
          .eq("status", "active");

        // Handle missing table gracefully
        if (error) {
          if (error.message?.includes('relation') || error.message?.includes('not exist')) {
            console.warn('Tink accounts table not found, returning default balance');
            return {
              totalBalance: 0,
              lastSynced: null,
            };
          }
          throw error;
        }

        const totalBalance = data?.reduce((sum, account) => sum + Number(account.balance || 0), 0) || 0;
        const lastSynced = data?.[0]?.last_synced_at || null;

        return {
          totalBalance,
          lastSynced,
        };
      } catch (error) {
        console.warn('Error fetching tink balance:', error);
        return {
          totalBalance: 0,
          lastSynced: null,
        };
      }
    },
  });

  return {
    balance: balance?.totalBalance || 0,
    lastSynced: balance?.lastSynced,
    isLoading,
  };
};
