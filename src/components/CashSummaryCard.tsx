import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCashSummary } from '@/hooks/useCashSummary';
import { Download } from 'lucide-react';
import { exportToExcel } from '@/utils/exportUtils';

export function CashSummaryCard() {
  const { data = [], isLoading } = useCashSummary();

  const handleExport = () => {
    const rows = (data || []).map(d => ({
      'Employee ID': d.employee_id,
      'Employee Name': d.full_name,
      'Total Advanced (€)': Number(d.total_advanced),
      'Total Spent (€)': Number(d.total_spent),
      'Remaining (€)': Number(d.remaining)
    }));

    exportToExcel(rows, `cash_summary_${new Date().toISOString().split('T')[0]}`);
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Employee Cash Summary</CardTitle>
        <div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No cash summary data available.</div>
        ) : (
          <div className="space-y-3">
            {data.map((row) => (
              <div key={row.employee_id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-foreground">{row.full_name}</div>
                  <div className="text-sm text-muted-foreground">ID: {row.employee_id}</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm">Advanced: <span className="font-medium">€{Number(row.total_advanced).toLocaleString()}</span></div>
                  <div className="text-sm">Spent: <span className="font-medium">€{Number(row.total_spent).toLocaleString()}</span></div>
                  <div className={`text-sm font-medium ${row.remaining < 0 ? 'text-destructive' : 'text-success'}`}>Remaining: €{Number(row.remaining).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
