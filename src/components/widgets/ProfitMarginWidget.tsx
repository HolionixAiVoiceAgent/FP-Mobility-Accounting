import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export function ProfitMarginWidget() {
  const { data, isLoading } = useFinancialMetrics();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  const chartData = data?.last_12_months.slice(-6).map(month => ({
    month: month.month.split('-')[1],
    margin: Math.round(month.margin * 10) / 10, // Round to 1 decimal
  })) || [];

  const avgMargin = data?.last_12_months.length
    ? Math.round(
        (data.last_12_months.reduce((sum, m) => sum + m.margin, 0) / data.last_12_months.length) * 10
      ) / 10
    : 0;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Profit Margin</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Line type="monotone" dataKey="margin" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4">
          <p className="text-sm font-medium">Average Margin: {avgMargin}%</p>
          <p className="text-xs text-muted-foreground">Last 12 months</p>
        </div>
      </CardContent>
    </Card>
  );
}
