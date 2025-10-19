import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle, Calendar } from "lucide-react";
import { useBankTransactions } from "@/hooks/useBankTransactions";
import { format } from "date-fns";

export const TinkTransactionList = () => {
  const { transactions, isLoading } = useBankTransactions();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">Loading transactions...</div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No transactions found. Connect a bank account and sync to see transactions.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions ({transactions.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {transaction.transaction_type === 'credit' ? (
                  <ArrowUpCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDownCircle className="h-5 w-5 text-red-600" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{transaction.description}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(transaction.date), 'PPP')}
                    {transaction.source && (
                      <Badge variant="outline" className="text-xs">
                        {transaction.source}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-semibold ${
                    transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.transaction_type === 'credit' ? '+' : '-'}
                  {Math.abs(transaction.amount).toLocaleString('de-DE', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </div>
                <div className="text-xs text-muted-foreground">{transaction.account_name}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
