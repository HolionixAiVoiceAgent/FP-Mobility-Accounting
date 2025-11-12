import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function InventoryDashboard() {
  // These will populate after inventory hooks are built
  const totalVehicles = 0;
  const averageDaysInStock = 0;
  const totalInventoryValue = 0;
  const vehiclesOverstock = 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inventory Dashboard</h1>
        <p className="text-muted-foreground">Vehicle tracking & stock analysis for {format(new Date(), 'MMMM yyyy')}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVehicles}</div>
            <p className="text-xs text-muted-foreground mt-1">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days in Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageDaysInStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalInventoryValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aging Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehiclesOverstock}</div>
            <p className="text-xs text-muted-foreground mt-1">Over 90 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for vehicle list */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Stock</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Vehicle inventory management will be available in Phase 4</p>
        </CardContent>
      </Card>
    </div>
  );
}
