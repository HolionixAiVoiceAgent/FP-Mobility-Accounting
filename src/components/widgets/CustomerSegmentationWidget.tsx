import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomers } from '@/hooks/useCustomers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

export function CustomerSegmentationWidget() {
  const { customers, loading } = useCustomers();

  if (loading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  // Group customers by type/status
  const segmentation: Record<string, number> = {
    'active': 0,
    'inactive': 0,
    'prospects': 0,
    'vip': 0,
  };

  customers?.forEach((customer: any) => {
    if (customer.is_active) {
      segmentation['active'] += 1;
    } else {
      segmentation['inactive'] += 1;
    }
  });

  const chartData = Object.entries(segmentation).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count: value,
  }));

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Customer Segments</CardTitle>
        <Users className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} customers`} />
            <Bar dataKey="count" fill="#3b82f6" name="Count" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium">Total Customers: {customers?.length || 0}</p>
          <p className="text-xs text-muted-foreground">
            Active: {segmentation.active} | Inactive: {segmentation.inactive}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
