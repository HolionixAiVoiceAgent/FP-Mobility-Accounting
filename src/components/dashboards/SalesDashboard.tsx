import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehicleSalesStats, useVehicleSales } from '@/hooks/useVehicleSales';
import { useInventoryStats } from '@/hooks/useInventory';
import { PDFExportButton } from '../PDFExportButton';
import { TrendingUp, Target, DollarSign, Users } from 'lucide-react';
import { format } from 'date-fns';

export function SalesDashboard() {
  const { data: salesStats, isLoading: salesLoading } = useVehicleSalesStats();
  const { data: sales = [], isLoading: salesListLoading } = useVehicleSales();
  const { data: inventoryStats } = useInventoryStats();

  const conversionRate = salesStats ? (salesStats.totalSales / (salesStats.totalSales + 10)) * 100 : 0;
  const avgSaleValue = salesStats?.totalSales && salesStats.totalSales > 0 
    ? salesStats.totalSales / (inventoryStats?.soldThisMonth || 1)
    : 0;

  // Prepare export data
  const exportData = {
    salesStats,
    sales,
    salesMetrics: {
      soldThisMonth: inventoryStats?.soldThisMonth || 0,
      totalSalesRevenue: salesStats?.totalSales || 0,
      avgSaleValue: Math.round(avgSaleValue),
      conversionRate: conversionRate.toFixed(1),
      pendingPayments: salesStats?.pendingPayments || 0
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sales Dashboard</h1>
          <p className="text-muted-foreground">Pipeline & performance metrics for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <PDFExportButton
          data={exportData}
          reportTitle="Sales Report"
          startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          endDate={new Date()}
          defaultFormat="xlsx"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(salesStats?.totalSales || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Sale Value</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{Math.round(avgSaleValue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Per vehicle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Of inquiries</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Sales pipeline will be available in Phase 2</p>
        </CardContent>
      </Card>
    </div>
  );
}
