import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, RefreshCw, Unplug, Loader2 } from "lucide-react";
import { useTinkAccounts } from "@/hooks/useTinkAccounts";
import { formatDistanceToNow } from "date-fns";

interface TinkAccountCardProps {
  account: {
    id: string;
    account_name: string;
    iban: string | null;
    account_number: string | null;
    balance: number;
    currency: string;
    account_type: string;
    last_synced_at: string | null;
  };
}

export const TinkAccountCard = ({ account }: TinkAccountCardProps) => {
  const { fetchTransactions, disconnect } = useTinkAccounts();

  const handleSync = () => {
    fetchTransactions.mutate({ accountId: account.id });
  };

  const handleDisconnect = () => {
    if (confirm(`Are you sure you want to disconnect ${account.account_name}?`)) {
      disconnect.mutate(account.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-lg">{account.account_name}</CardTitle>
              <CardDescription className="text-sm">
                {account.iban || account.account_number || 'No account number'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={account.balance >= 0 ? "default" : "destructive"}>
            {account.balance.toLocaleString('de-DE', {
              style: 'currency',
              currency: account.currency,
            })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {account.last_synced_at ? (
              <>Last synced {formatDistanceToNow(new Date(account.last_synced_at), { addSuffix: true })}</>
            ) : (
              'Never synced'
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={fetchTransactions.isPending}
            >
              {fetchTransactions.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
            >
              <Unplug className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
