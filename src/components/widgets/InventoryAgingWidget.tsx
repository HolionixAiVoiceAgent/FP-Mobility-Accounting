import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryMetrics } from '@/hooks/useInventoryMetrics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';

export function InventoryAgingWidget() {
  const { data, isLoading } = useInventoryMetrics();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  const chartData = data?.aging_buckets || [];

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Inventory Aging</CardTitle>
        <AlertTriangle className="h-4 w-4 text-orange-600" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="days_range" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} vehicles`} />
            <Bar dataKey="count" fill="#f59e0b" name="Count" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Avg Days in Stock: {data?.average_days_in_stock || 0} days</p>
          <p className="text-sm text-muted-foreground">Total Value: €{(data?.total_inventory_value || 0).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
