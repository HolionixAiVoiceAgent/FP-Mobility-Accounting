import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdvancedKPIs } from '@/hooks/useAdvancedKPIs';
import { TrendingUp, Users, ShoppingCart, RotateCcw } from 'lucide-react';

export function AdvancedKPIsSection() {
  const { data: kpis, isLoading } = useAdvancedKPIs();

  if (isLoading || !kpis) {
    return (
      <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {/* Inventory Aging */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium">Inventory Aging</CardTitle>
          <RotateCcw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Avg Days in Stock</p>
              <p className="text-2xl font-bold">{kpis.inventoryAging.average_days}</p>
            </div>
            <div className="text-xs space-y-1">
              <p>Oldest: <span className="font-semibold">{kpis.inventoryAging.oldest_vehicle_days}d</span></p>
              <p>Over 60d: <span className="font-semibold">{kpis.inventoryAging.vehicles_over_60_days}</span> vehicles</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Velocity */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium">Sales Velocity</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Avg Days to Sale</p>
              <p className="text-2xl font-bold">{kpis.salesVelocity.avg_days_to_sale}</p>
            </div>
            <div className="text-xs">
              <p>{kpis.salesVelocity.sales_per_month} sales/month avg</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gross Margin */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium">Gross Margin</CardTitle>
          <ShoppingCart className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Avg Margin %</p>
              <p className="text-2xl font-bold">{kpis.grossMargin.avg_margin_percentage}%</p>
            </div>
            <div className="text-xs">
              <p>€{kpis.grossMargin.avg_profit_per_sale.toLocaleString()} per sale</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Retention */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-xs sm:text-sm font-medium">Retention Rate</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Repeat Customers</p>
              <p className="text-2xl font-bold">{kpis.customerRetention.retention_rate}%</p>
            </div>
            <div className="text-xs">
              <p>LTV: €{kpis.customerRetention.avg_customer_lifetime_value.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
