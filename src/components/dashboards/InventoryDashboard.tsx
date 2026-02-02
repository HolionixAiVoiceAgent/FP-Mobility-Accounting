import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory, useInventoryStats } from '@/hooks/useInventory';
import { PDFExportButton } from '../PDFExportButton';
import { Truck, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

export function InventoryDashboard() {
  const { data: inventory = [], isLoading: inventoryLoading } = useInventory();
  const { data: stats, isLoading: statsLoading } = useInventoryStats();

  // Calculate additional metrics
  const totalVehicles = inventory.length;
  const availableVehicles = inventory.filter((v: any) => v.status === 'available').length;
  const soldVehicles = inventory.filter((v: any) => v.status === 'sold').length;
  
  // Vehicles over 90 days in stock
  const currentDate = new Date();
  const aging90Days = inventory.filter((v: any) => {
    if (v.status === 'sold') return false;
    const purchaseDate = new Date(v.purchase_date);
    const daysInStock = Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24));
    return daysInStock > 90;
  }).length;

  // Total inventory value (available vehicles)
  const totalInventoryValue = inventory
    .filter((v: any) => v.status === 'available')
    .reduce((sum: number, v: any) => sum + (v.expected_sale_price || v.purchase_price || 0), 0);

  // Average days in stock
  const avgDaysInStock = stats?.avgDaysInStock || 0;

  // Prepare export data
  const exportData = {
    inventoryStats: stats,
    inventory,
    inventoryMetrics: {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      totalInventoryValue,
      avgDaysInStock,
      aging90Days
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Dashboard</h1>
          <p className="text-muted-foreground">Vehicle tracking & stock analysis for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <PDFExportButton
          data={exportData}
          reportTitle="Inventory Report"
          startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          endDate={new Date()}
          defaultFormat="xlsx"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalVehicles}</div>
                <p className="text-xs text-muted-foreground mt-1">{availableVehicles} available</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Days in Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{avgDaysInStock}</div>
                <p className="text-xs text-muted-foreground mt-1">Days average</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{totalInventoryValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Available stock</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aging Stock</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${aging90Days > 0 ? 'text-red-600' : 'text-green-600'}`} />
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{aging90Days}</div>
                <p className="text-xs text-muted-foreground mt-1">Over 90 days</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vehicle List */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Stock</CardTitle>
        </CardHeader>
        <CardContent>
          {inventoryLoading ? (
            <p className="text-muted-foreground">Loading inventory...</p>
          ) : inventory.length > 0 ? (
            <div className="space-y-2">
              {inventory.map((vehicle: any) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    <p className="text-sm text-muted-foreground">VIN: {vehicle.vin || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{(vehicle.expected_sale_price || vehicle.purchase_price || 0).toLocaleString()}</p>
                    <p className={`text-xs ${vehicle.status === 'available' ? 'text-green-600' : vehicle.status === 'sold' ? 'text-blue-600' : 'text-orange-600'}`}>
                      {vehicle.status || 'unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No vehicles in inventory. Add vehicles to see them here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
