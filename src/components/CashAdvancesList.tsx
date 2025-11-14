import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCashAdvances } from '@/hooks/useCashAdvances';
import { Trash } from 'lucide-react';

export function CashAdvancesList() {
  const { data = [], isLoading, remove } = useCashAdvances();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recorded Advances</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-muted-foreground">No advances recorded.</div>
        ) : (
          <div className="space-y-2">
            {data.map((adv) => (
              <div key={adv.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <div className="font-medium">{adv.employee_id || 'Unassigned'}</div>
                  <div className="text-sm text-muted-foreground">{adv.advance_date} • €{Number(adv.advance_amount).toLocaleString()}</div>
                  {adv.notes ? <div className="text-sm text-muted-foreground">{adv.notes}</div> : null}
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => remove.mutate(adv.id)}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
