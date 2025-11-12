import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseStats } from '@/hooks/useExpenses';
import { useVehicleSalesStats } from '@/hooks/useVehicleSales';
import { useTinkBalance } from '@/hooks/useTinkBalance';
import { useFinancialObligations } from '@/hooks/useFinancialObligations';
import { Euro, TrendingDown, PieChart, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardCharts } from '../DashboardCharts';

export function FinanceDashboard() {
  const { data: expenseStats, isLoading: expensesLoading } = useExpenseStats();
  const { data: salesStats } = useVehicleSalesStats();
  const { balance: bankBalance } = useTinkBalance();
  const { obligations, isLoading: obligationsLoading } = useFinancialObligations();

  const monthlyRevenue = salesStats?.totalSales || 0;
  const monthlyExpenses = expenseStats?.totalExpenses || 0;
  const netProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0;

  const totalObligations = obligations?.reduce((sum, o) => sum + (o.outstanding_balance || 0), 0) || 0;
  const dueObligations = obligations?.filter(o => new Date(o.due_date || '') <= new Date()).reduce((sum, o) => sum + (o.outstanding_balance || 0), 0) || 0;

  const expenseByCategory = expenseStats?.categoryBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Finance Dashboard</h1>
        <p className="text-muted-foreground">Financial overview for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Euro className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
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
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{profitMargin.toFixed(1)}% margin</p>
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

      {/* Obligations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Obligations</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalObligations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Now</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${dueObligations > 0 ? 'text-red-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${dueObligations > 0 ? 'text-red-600' : 'text-green-600'}`}>
              €{dueObligations.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length > 0 ? (
            <div className="space-y-4">
              {expenseByCategory.map((category: any) => (
                <div key={category.category} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{category.category}</span>
                  <span className="font-semibold">€{category.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No expenses yet</p>
          )}
        </CardContent>
      </Card>

      {/* Charts */}
      <DashboardCharts salesData={[]} revenueBySource={[]} />
    </div>
  );
}
