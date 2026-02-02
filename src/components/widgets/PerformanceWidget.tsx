import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTeamPerformance } from '@/hooks/useTeamPerformance';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award } from 'lucide-react';

export function PerformanceWidget() {
  const { data, isLoading } = useTeamPerformance();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  const chartData = data?.team_members.slice(0, 5).map(member => ({
    name: member.name.substring(0, 10),
    sales: member.sales_count,
    revenue: member.total_revenue,
  })) || [];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Team Performance</CardTitle>
        <Award className="h-4 w-4 text-purple-600" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="sales" fill="#3b82f6" name="Sales" />
            <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (€)" />
          </BarChart>
        </ResponsiveContainer>
        {data?.top_performer && (
          <div className="mt-4 p-2 bg-blue-50 rounded">
            <p className="text-sm font-medium">Top Performer: {data.top_performer.name}</p>
            <p className="text-xs text-muted-foreground">€{data.top_performer.total_revenue.toLocaleString()} this month</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
