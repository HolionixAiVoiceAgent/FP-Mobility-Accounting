import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryStats } from '@/hooks/useInventory';
import { useVehicleSalesStats } from '@/hooks/useVehicleSales';
import { useExpenseStats } from '@/hooks/useExpenses';
import { useTinkBalance } from '@/hooks/useTinkBalance';
import { useCustomers } from '@/hooks/useCustomers';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { Euro, TrendingUp, TrendingDown, Car, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardCharts } from '../DashboardCharts';
import { CashFlowWidget } from '../widgets/CashFlowWidget';
import { PipelineWidget } from '../widgets/PipelineWidget';
import { InventoryAgingWidget } from '../widgets/InventoryAgingWidget';
import { ProfitMarginWidget } from '../widgets/ProfitMarginWidget';
import { ObligationsWidget } from '../widgets/ObligationsWidget';
import { TopModelsWidget } from '../widgets/TopModelsWidget';
import { PerformanceWidget } from '../widgets/PerformanceWidget';
import { CustomerSegmentationWidget } from '../widgets/CustomerSegmentationWidget';

export function OwnerDashboard() {
  const { data: inventoryStats, isLoading: inventoryLoading } = useInventoryStats();
  const { data: salesStats, isLoading: salesLoading } = useVehicleSalesStats();
  const { data: expenseStats, isLoading: expensesLoading } = useExpenseStats();
  const { data: financialMetrics, isLoading: financialLoading } = useFinancialMetrics();
  const { balance: bankBalance } = useTinkBalance();
  const { customers } = useCustomers();

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
    vehiclesSold: 0, // This would need to be calculated from sales data
  })) || [];

  const revenueBySource = [
    { name: 'Car Sales', value: monthlyRevenue },
    { name: 'Bank Commissions', value: 0 },
    { name: 'Insurance Commissions', value: 0 },
  ];

  const isLoading = inventoryLoading || salesLoading || expensesLoading || financialLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
        <p className="text-muted-foreground">Complete business overview for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* Key Metrics - Row 1 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From {inventoryStats?.soldThisMonth || 0} sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{monthlyExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Operating costs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{monthlyRevenue > 0 ? ((netProfit / monthlyRevenue) * 100).toFixed(1) : 0}% margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bank Balance</CardTitle>
            <Euro className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{bankBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Current cash</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics - Row 2 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Inventory</CardTitle>
            <Car className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats?.availableVehicles || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to sell</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days in Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats?.avgDaysInStock || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Days on lot</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active relationships</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This Month Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats?.soldThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Vehicles sold</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Now with real-time data from financial metrics */}
      <DashboardCharts salesData={salesData} revenueBySource={revenueBySource} />

      {/* Advanced Widgets */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Advanced Analytics</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CashFlowWidget />
          <PipelineWidget />
          <InventoryAgingWidget />
          <ProfitMarginWidget />
          <ObligationsWidget />
          <TopModelsWidget />
          <PerformanceWidget />
          <CustomerSegmentationWidget />
        </div>
      </div>
    </div>
  );
}
