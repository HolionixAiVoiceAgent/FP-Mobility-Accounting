import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardChartsProps {
  salesData?: Array<{ month: string; revenue: number; expenses: number; profit: number; vehiclesSold?: number }>;
  revenueBySource?: Array<{ name: string; value: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

// Custom tooltip component for better display
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-3 rounded-lg shadow-lg">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: €{Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardCharts({ salesData = [], revenueBySource = [] }: DashboardChartsProps) {
  // Ensure we have data to display - use fallback data if empty
  const displaySalesData = salesData && salesData.length > 0 ? salesData : [];
  const displayRevenueBySource = revenueBySource && revenueBySource.length > 0 ? revenueBySource : [
    { name: 'Car Sales', value: 0 },
    { name: 'Bank Commissions', value: 0 },
    { name: 'Insurance Commissions', value: 0 },
  ];

  const hasRealSalesData = salesData && salesData.length > 0;
  const hasRealRevenueData = revenueBySource && revenueBySource.some(item => item.value > 0);

  // Responsive chart heights based on screen size
  const chartHeight = typeof window !== 'undefined' && window.innerWidth < 768 ? 250 : 300;

  // Check if vehicles sold data exists
  const hasVehiclesSoldData = hasRealSalesData && salesData?.some(item => (item.vehiclesSold || 0) > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
      {/* Revenue vs Expenses Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Revenue vs Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRealSalesData ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <LineChart data={displaySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} name="Revenue" />
                <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[${chartHeight}px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg`}>
              <div className="text-center">
                <p className="text-sm font-medium">No sales data available</p>
                <p className="text-xs text-muted-foreground mt-1">Add vehicle sales to see revenue vs expenses</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profit by Month Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Monthly Profit</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRealSalesData ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={displaySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="profit" fill="hsl(var(--primary))" name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[${chartHeight}px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg`}>
              <div className="text-center">
                <p className="text-sm font-medium">No profit data available</p>
                <p className="text-xs text-muted-foreground mt-1">Add sales and expenses to calculate profit</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revenue by Source Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Revenue by Source</CardTitle>
        </CardHeader>
        <CardContent>
          {hasRealRevenueData ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <PieChart>
                <Pie
                  data={displayRevenueBySource.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={chartHeight < 300 ? 60 : 80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {displayRevenueBySource.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `€${Number(value).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[${chartHeight}px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg`}>
              <div className="text-center">
                <p className="text-sm font-medium">No revenue sources yet</p>
                <p className="text-xs text-muted-foreground mt-1">Vehicle sales will appear here</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vehicles Sold Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Vehicles Sold Trend</CardTitle>
        </CardHeader>
        <CardContent>
          {hasVehiclesSoldData ? (
            <ResponsiveContainer width="100%" height={chartHeight}>
              <BarChart data={displaySalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="vehiclesSold" fill="hsl(var(--secondary))" name="Vehicles Sold" />
              </BarChart>
            </ResponsiveContainer>
          ) : hasRealSalesData ? (
            <div className={`h-[${chartHeight}px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg`}>
              <div className="text-center">
                <p className="text-sm font-medium">No vehicles sold yet</p>
                <p className="text-xs text-muted-foreground mt-1">Vehicle sales will be tracked here</p>
              </div>
            </div>
          ) : (
            <div className={`h-[${chartHeight}px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-muted-foreground/20 rounded-lg`}>
              <div className="text-center">
                <p className="text-sm font-medium">No sales data</p>
                <p className="text-xs text-muted-foreground mt-1">Add inventory sales to see trends</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

