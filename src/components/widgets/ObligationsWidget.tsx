import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFinancialObligations } from '@/hooks/useFinancialObligations';
import { AlertCircle } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export function ObligationsWidget() {
  const { obligations, isLoading } = useFinancialObligations();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  const now = new Date();
  const dueSoon = obligations?.filter(o => {
    if (!o.due_date) return false;
    const days = differenceInDays(new Date(o.due_date), now);
    return days > 0 && days <= 30;
  }) || [];

  const overdue = obligations?.filter(o => {
    if (!o.due_date) return false;
    return differenceInDays(new Date(o.due_date), now) < 0;
  }) || [];

  const totalDue = obligations?.reduce((sum, o) => sum + (o.outstanding_balance || 0), 0) || 0;

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Obligations</CardTitle>
        <AlertCircle className="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-2xl font-bold">€{totalDue.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total outstanding</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-orange-50 rounded">
            <p className="font-medium text-orange-700">{dueSoon.length}</p>
            <p className="text-xs text-orange-600">Due within 30d</p>
          </div>
          <div className="p-2 bg-red-50 rounded">
            <p className="font-medium text-red-700">{overdue.length}</p>
            <p className="text-xs text-red-600">Overdue</p>
          </div>
        </div>

        {overdue.length > 0 && (
          <div className="p-2 border-l-2 border-red-500 bg-red-50">
            <p className="text-xs font-medium text-red-700">Action Required</p>
            <p className="text-xs text-red-600">{overdue.length} payments overdue</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
