import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  Car, 
  Users, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { useInventoryStats } from '@/hooks/useInventory';
import { useCustomers } from '@/hooks/useCustomers';
import { useVehicleSalesStats } from '@/hooks/useVehicleSales';
import { useExpenseStats } from '@/hooks/useExpenses';
import { useBankTransactions } from '@/hooks/useBankTransactions';
import { useTinkBalance } from '@/hooks/useTinkBalance';
import { useMonthlyFinancialData } from '@/hooks/useMonthlyFinancialData';
import { DashboardCharts } from './DashboardCharts';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

export function Dashboard() {
  const queryClient = useQueryClient();
  const { data: inventoryStats, isLoading: inventoryLoading } = useInventoryStats();
  const { customers, loading: customersLoading } = useCustomers();
  const { data: salesStats, isLoading: salesLoading } = useVehicleSalesStats();
  const { data: expenseStats, isLoading: expensesLoading } = useExpenseStats();
  const { transactions, isLoading: transactionsLoading } = useBankTransactions();
  const { balance: bankBalance, lastSynced, isLoading: balanceLoading } = useTinkBalance();
  const { data: monthlyData, isLoading: monthlyDataLoading } = useMonthlyFinancialData();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
    queryClient.invalidateQueries({ queryKey: ["customers"] });
    queryClient.invalidateQueries({ queryKey: ["vehicle-sales-stats"] });
    queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
    queryClient.invalidateQueries({ queryKey: ["bank-transactions"] });
    queryClient.invalidateQueries({ queryKey: ["tink-balance"] });
    queryClient.invalidateQueries({ queryKey: ["monthly-financial-data"] });
  };

  const monthlyRevenue = salesStats?.totalSales || 0;
  const monthlyExpenses = expenseStats?.totalExpenses || 0;
  const netProfit = monthlyRevenue - monthlyExpenses;
  const pendingPayments = salesStats?.pendingPayments || 0;

  const activeCustomers = customers?.filter(c => c.status === 'active').length || 0;
  
  // Use real monthly data from database for charts
  const salesData = monthlyData || [];

  const revenueBySource = [
    { name: 'Car Sales', value: salesStats?.totalSales || 0 },
    { name: 'Bank Commissions', value: 0 },
    { name: 'Insurance Commissions', value: 0 },
  ];

  const isLoading = inventoryLoading || customersLoading || salesLoading || expensesLoading || monthlyDataLoading;
  const recentTransactions = transactions?.slice(0, 5) || [];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Financial overview for January 2024</p>
        </div>
        <div className="flex items-center space-x-3">
          {bankBalance > 0 && (
            <Badge variant="outline" className="text-success">
              <CreditCard className="h-3 w-3 mr-1" />
              Bank Connected
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">€{monthlyRevenue.toLocaleString()}</div>
                {monthlyRevenue === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">No sales this month</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">€{monthlyExpenses.toLocaleString()}</div>
                {monthlyExpenses === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">No expenses this month</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <Euro className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                €{netProfit.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles Sold</CardTitle>
            <Car className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-2xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <div className="text-2xl font-bold text-foreground">{inventoryStats?.soldThisMonth || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Bank Account Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {balanceLoading ? (
              <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground">€{bankBalance.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {lastSynced ? `Last updated: ${formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}` : 'No bank connected'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-warning">€{pendingPayments.toLocaleString()}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {pendingPayments > 0 ? 'From outstanding invoices' : 'No pending payments'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Active Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {customersLoading ? (
              <div className="text-3xl font-bold text-muted-foreground">Loading...</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-foreground">{activeCustomers}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {activeCustomers === 0 ? 'No customers yet' : 'Active customers'}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <p className="text-muted-foreground">Loading transactions...</p>
          ) : recentTransactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions yet. Connect your bank to see transactions.</p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      transaction.transaction_type === 'CREDIT' ? 'bg-success' : 'bg-primary'
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.account_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.transaction_type === 'CREDIT' ? 'text-success' : 'text-primary'
                    }`}>
                      {transaction.transaction_type === 'CREDIT' ? '+' : '-'}€{Math.abs(Number(transaction.amount)).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <DashboardCharts salesData={salesData} revenueBySource={revenueBySource} />
    </div>
  );
}