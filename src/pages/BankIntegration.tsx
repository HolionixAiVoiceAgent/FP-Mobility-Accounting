import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { TinkConnectButton } from '@/components/TinkConnectButton';
import { TinkAccountCard } from '@/components/TinkAccountCard';
import { TinkTransactionList } from '@/components/TinkTransactionList';
import { useTinkAccounts } from '@/hooks/useTinkAccounts';

export default function BankIntegration() {
  const { accounts, isLoading, syncAll } = useTinkAccounts();

  const handleSyncAll = () => {
    syncAll.mutate();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bank Integration</h1>
            <p className="text-muted-foreground">Connect and manage your business bank accounts with Tink</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleSyncAll} 
              disabled={syncAll.isPending}
            >
              {syncAll.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync All Banks
            </Button>
            <TinkConnectButton />
          </div>
        </div>

        {accounts && accounts.length > 0 ? (
          <>
            <div>
              <h2 className="text-xl font-semibold mb-4">Connected Bank Accounts</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {accounts.map((account) => (
                  <TinkAccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>

            <TinkTransactionList />
          </>
        ) : (
          <Card className="animate-scale-in">
            <CardHeader>
              <CardTitle>No Bank Accounts Connected</CardTitle>
              <CardDescription>
                Connect your first bank account using Tink to start syncing transactions automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 space-y-4">
                <Plus className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  Click "Connect Bank Account" above to get started with secure bank integration via Tink
                </p>
                <div className="flex justify-center">
                  <TinkConnectButton />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Banking API Status</CardTitle>
            <CardDescription>Tink integration powered by Visa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Tink API (by Visa)</p>
                    <p className="text-sm text-muted-foreground">PSD2 Compliant - Secure Open Banking</p>
                  </div>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {accounts && accounts.length > 0 ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">Bank Connections</p>
                    <p className="text-sm text-muted-foreground">
                      {accounts && accounts.length > 0 
                        ? `${accounts.length} bank account(s) connected`
                        : 'No banks connected yet'}
                    </p>
                  </div>
                </div>
                <Badge variant={accounts && accounts.length > 0 ? "default" : "outline"}>
                  {accounts && accounts.length > 0 ? 'Connected' : 'Not Connected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
