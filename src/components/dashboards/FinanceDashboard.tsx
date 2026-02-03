import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpenseStats } from '@/hooks/useExpenses';
import { useVehicleSalesStats } from '@/hooks/useVehicleSales';
import { useTinkBalance } from '@/hooks/useTinkBalance';
import { useFinancialObligations } from '@/hooks/useFinancialObligations';
import { useFinancialMetricsOptimized } from '@/hooks/useFinancialMetricsOptimized';
import { Euro, TrendingDown, PieChart, AlertTriangle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardCharts } from '../DashboardCharts';

export function FinanceDashboard() {
  const { data: expenseStats, isLoading: expensesLoading } = useExpenseStats();
  const { data: salesStats, isLoading: salesLoading } = useVehicleSalesStats();
  const { balance: bankBalance, isLoading: bankLoading } = useTinkBalance();
  const { obligations, isLoading: obligationsLoading } = useFinancialObligations();
  const { data: financialMetrics, isLoading: financialLoading } = useFinancialMetricsOptimized();
  
  // Debug logging
  useEffect(() => {
    console.log('FinanceDashboard - financialMetrics:', financialMetrics);
    console.log('FinanceDashboard - salesStats:', salesStats);
    console.log('FinanceDashboard - expenseStats:', expenseStats);
  }, [financialMetrics, salesStats, expenseStats]);

  // Use optimized metrics data or fall back to basic stats
  const monthlyRevenue = financialMetrics?.current_month?.revenue || salesStats?.totalSales || 0;
  const monthlyExpenses = financialMetrics?.current_month?.expenses || expenseStats?.totalExpenses || 0;
  const netProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = financialMetrics?.current_month?.margin || (monthlyRevenue > 0 ? (netProfit / monthlyRevenue) * 100 : 0);
  const vehiclesSold = financialMetrics?.current_month?.vehicles_sold || salesStats?.vehiclesSold || 0;

  const totalObligations = obligations?.reduce((sum, o) => sum + (o.outstanding_balance || 0), 0) || 0;
  const dueObligations = obligations?.filter(o => new Date(o.due_date || '') <= new Date()).reduce((sum, o) => sum + (o.outstanding_balance || 0), 0) || 0;

  const expenseByCategory = expenseStats?.categoryBreakdown || [];

  const isLoading = expensesLoading || salesLoading || bankLoading || obligationsLoading || financialLoading;

  // Prepare chart data from optimized metrics
  const salesData = (financialMetrics?.last_12_months || []).map(month => ({
    month: month.month,
    revenue: month.revenue || 0,
    expenses: month.expenses || 0,
    profit: month.net_profit || 0,
    vehiclesSold: month.vehicles_sold || 0,
  }));

  const revenueBySource = [
    { name: 'Car Sales', value: monthlyRevenue },
    { name: 'Bank Commissions', value: 0 },
    { name: 'Insurance Commissions', value: 0 },
  ];

  // Debug logging for chart data
  useEffect(() => {
    console.log('Chart data - salesData:', salesData);
    console.log('Chart data - revenueBySource:', revenueBySource);
    console.log('isLoading:', isLoading);
  }, [salesData, revenueBySource, isLoading]);

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
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">€{monthlyRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">From {vehiclesSold} sales</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{profitMargin.toFixed(1)}% margin</p>
              </>
            )}
          </CardContent>
        </Card>

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
            ) : (
              <div className="text-2xl font-bold">€{bankBalance.toLocaleString()}</div>
            )}
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
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <div className="text-2xl font-bold">€{totalObligations.toLocaleString()}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">All outstanding</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Due Now</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${dueObligations > 0 ? 'text-red-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </>
            ) : (
              <div className={`text-2xl font-bold ${dueObligations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                €{dueObligations.toLocaleString()}
              </div>
            )}
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
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : expenseByCategory.length > 0 ? (
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

      {/* Charts with data */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <DashboardCharts salesData={salesData} revenueBySource={revenueBySource} />
      )}
    </div>
  );
}

