import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePipelineMetrics } from '@/hooks/usePipelineMetrics';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function PipelineWidget() {
  const { data, isLoading } = usePipelineMetrics();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  const chartData = data?.stages.map(stage => ({
    name: stage.stage,
    value: stage.count,
  })) || [];

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Sales Pipeline</CardTitle>
        <TrendingUp className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name} (${value})`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} deals`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Total Pipeline Value: €{(data?.total_value || 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Avg Deal: €{(data?.average_deal_value || 0).toLocaleString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
