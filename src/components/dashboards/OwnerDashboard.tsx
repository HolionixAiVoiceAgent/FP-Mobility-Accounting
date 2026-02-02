import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory, useInventoryStats } from '@/hooks/useInventory';
import { useVehicleSales, useVehicleSalesStats } from '@/hooks/useVehicleSales';
import { useExpenses, useExpenseStats } from '@/hooks/useExpenses';
import { useTinkBalance } from '@/hooks/useTinkBalance';
import { useCustomers } from '@/hooks/useCustomers';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { useDashboardVisibility } from '@/hooks/useDashboardVisibility';
import { Euro, TrendingUp, TrendingDown, Car, Users, AlertCircle, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardCharts } from '../DashboardCharts';
import { PDFExportButton } from '../PDFExportButton';

export function OwnerDashboard() {
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  const { data: inventoryStats, isLoading: inventoryStatsLoading } = useInventoryStats();
  const { data: sales, isLoading: salesLoading } = useVehicleSales();
  const { data: salesStats, isLoading: salesStatsLoading } = useVehicleSalesStats();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: expenseStats, isLoading: expenseStatsLoading } = useExpenseStats();
  const { data: financialMetrics, isLoading: financialLoading } = useFinancialMetrics();
  const { balance: bankBalance } = useTinkBalance();
  const { customers } = useCustomers();
  const visibility = useDashboardVisibility();

  const isLoading = inventoryLoading || salesLoading || expensesLoading || financialLoading || 
                    inventoryStatsLoading || salesStatsLoading || expenseStatsLoading;

  const monthlyRevenue = salesStats?.totalSales || 0;
  const monthlyExpenses = expenseStats?.totalExpenses || 0;
  const netProfit = monthlyRevenue - monthlyExpenses;
  const activeCustomers = customers?.filter(c => c.status === 'active').length || 0;

  // Prepare sales data for charts from financial metrics
  const salesData = financialMetrics?.last_12_months?.map(month => ({
    month: month.month,
    revenue: month.revenue,
    expenses: month.expenses,
    profit: month.net_profit,
    vehiclesSold: 0,
  })) || [];

  const revenueBySource = [
    { name: 'Car Sales', value: monthlyRevenue },
    { name: 'Bank Commissions', value: 0 },
    { name: 'Insurance Commissions', value: 0 },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header with Export Button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Owner Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Complete business overview for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <PDFExportButton 
          data={{ 
            inventoryStats, 
            salesStats, 
            expenseStats, 
            financialMetrics,
            inventory: inventory || [],
            sales: sales || [],
            expenses: expenses || [],
            customers: customers || [],
            payments: salesStats?.pendingPayments || 0,
            cashAdvances: [],
            obligations: [],
            vehiclePurchases: []
          }}
          reportTitle="Dashboard Report"
          startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          endDate={new Date()}
          defaultFormat="xlsx"
        />
      </div>

      {/* Key Metrics - Row 1: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">€{monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">From {inventoryStats?.soldThisMonth || 0} sales</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Monthly Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">€{monthlyExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Operating costs</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : !visibility.showFinancialMetrics ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="text-xs">Restricted</span>
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>€{netProfit.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">{monthlyRevenue > 0 ? ((netProfit / monthlyRevenue) * 100).toFixed(1) : 0}% margin</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Bank Balance */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bank Balance</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : !visibility.showBankBalance ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span className="text-xs">Restricted</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{bankBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Current cash</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics - Row 2: 1 col mobile, 2 cols tablet, 4 cols desktop */}
      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Available Inventory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Inventory</CardTitle>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats?.availableVehicles || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Ready to sell</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Avg Days in Stock */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days in Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats?.avgDaysInStock || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Days on lot</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{activeCustomers}</div>
                <p className="text-xs text-muted-foreground mt-1">Active relationships</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* This Month Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">{inventoryStats?.soldThisMonth || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Vehicles sold</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-4 sm:mt-8">
        {!visibility.showFinancialMetrics ? (
          <Card>
            <CardContent className="pt-6 flex items-center justify-center gap-2 text-muted-foreground h-80">
              <Lock className="h-5 w-5" />
              <span className="text-sm">Financial charts are restricted for your role</span>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            <Skeleton className="h-[250px] sm:h-[350px] w-full" />
            <Skeleton className="h-[250px] sm:h-[350px] w-full" />
          </div>
        ) : (
          <DashboardCharts salesData={salesData} revenueBySource={revenueBySource} />
        )}
      </div>
    </div>
  );
}

