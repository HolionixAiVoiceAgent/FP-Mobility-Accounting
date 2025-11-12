import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';
import { TrendingUp } from 'lucide-react';

export function CashFlowWidget() {
  const { data, isLoading } = useFinancialMetrics();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  const chartData = data?.last_12_months.slice(-6).map(month => ({
    month: month.month.split('-')[1],
    revenue: month.revenue,
    expenses: month.expenses,
    profit: month.net_profit,
  })) || [];

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Cash Flow Analysis</CardTitle>
        <TrendingUp className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `€${(value as number).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            <Bar dataKey="profit" fill="#10b981" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
