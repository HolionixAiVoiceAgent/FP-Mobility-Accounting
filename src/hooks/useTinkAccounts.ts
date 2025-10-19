import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTinkAccounts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["tink-accounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tink_accounts")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createLink = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("tink-create-link");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.linkUrl) {
        window.open(data.linkUrl, "_blank", "width=600,height=800");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchAccounts = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("tink-fetch-accounts");
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tink-accounts"] });
      toast({
        title: "Success",
        description: "Accounts synced successfully",
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

  const syncAll = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("tink-sync-all");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tink-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast({
        title: "Sync Complete",
        description: `Synced ${data.accountsSynced} accounts and imported ${data.transactionsImported} new transactions`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const fetchTransactions = useMutation({
    mutationFn: async ({ accountId, daysBack = 90 }: { accountId: string; daysBack?: number }) => {
      const { data, error } = await supabase.functions.invoke("tink-fetch-transactions", {
        body: { accountId, daysBack },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
      toast({
        title: "Transactions Imported",
        description: `Imported ${data.importedCount} new transactions`,
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

  const disconnect = useMutation({
    mutationFn: async (accountId: string) => {
      const { data, error } = await supabase.functions.invoke("tink-disconnect", {
        body: { accountId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tink-accounts"] });
      toast({
        title: "Account Disconnected",
        description: "Bank account has been disconnected",
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
    accounts,
    isLoading,
    createLink,
    fetchAccounts,
    syncAll,
    fetchTransactions,
    disconnect,
  };
};
