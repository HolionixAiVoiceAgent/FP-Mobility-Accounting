import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
  salesData: Array<{ month: string; revenue: number; expenses: number; profit: number; vehiclesSold?: number }>;
  revenueBySource: Array<{ name: string; value: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export function DashboardCharts({ salesData, revenueBySource }: DashboardChartsProps) {
  // Ensure we have data to display
  const hasSalesData = salesData && salesData.length > 0;
  const hasRevenueData = revenueBySource && revenueBySource.some(item => item.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSalesData ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No sales data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profit by Month Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Profit</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSalesData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="profit" fill="hsl(var(--primary))" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No profit data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Source Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Source</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRevenueData ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {revenueBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No revenue data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles Sold Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles Sold Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {hasSalesData && salesData.some(item => item.vehiclesSold) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="vehiclesSold" fill="hsl(var(--secondary))" name="Vehicles Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No vehicle sales data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
