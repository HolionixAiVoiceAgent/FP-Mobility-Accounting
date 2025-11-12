import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehiclePurchaseStats } from '@/hooks/useVehiclePurchases';
import { AlertCircle, Calendar, Euro, TrendingDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const PurchasesPayableSummary = () => {
  const { data: stats, isLoading } = useVehiclePurchaseStats();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.totalOutstanding.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            To sellers & dealers
          </p>
        </CardContent>
      </Card>

      <Card className={stats.overdueAmount > 0 ? 'border-destructive' : ''}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue Payments</CardTitle>
          <AlertCircle className={`h-4 w-4 ${stats.overdueAmount > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${stats.overdueAmount > 0 ? 'text-destructive' : ''}`}>
            €{stats.overdueAmount.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.overdueAmount > 0 ? 'Action required!' : 'No overdue payments'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.dueThisWeek.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Next 7 days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Due This Month</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€{stats.dueThisMonth.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            Next 30 days
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
