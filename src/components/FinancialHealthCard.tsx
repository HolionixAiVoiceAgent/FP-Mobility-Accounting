import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { useLifetimeStats } from "@/hooks/useLifetimeStats";
import { Skeleton } from "@/components/ui/skeleton";

export const FinancialHealthCard = () => {
  const { data: stats, isLoading } = useLifetimeStats();

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (!stats) return null;

  const isHealthy = stats.netCompanyValue > 0;
  const profitMargin = stats.totalRevenue > 0 ? (stats.lifetimeProfit / stats.totalRevenue) * 100 : 0;

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Financial Health</h3>
          {isHealthy ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Net Company Value */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Net Company Value</p>
            <p className={`text-2xl font-bold ${isHealthy ? "text-green-600" : "text-red-600"}`}>
              €{stats.netCompanyValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Lifetime Profit */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Lifetime Profit</p>
            <p className="text-2xl font-bold">
              €{stats.lifetimeProfit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Average Profit Per Car */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Profit/Car</p>
            <p className="text-xl font-semibold">
              €{stats.averageProfitPerCar.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Profit Margin */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Profit Margin</p>
            <p className="text-xl font-semibold">{profitMargin.toFixed(1)}%</p>
          </div>

          {/* Current Inventory Value */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Inventory Value</p>
            <p className="text-xl font-semibold">
              €{stats.currentInventoryValue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Outstanding Obligations */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Outstanding Obligations
              {stats.totalFinancialObligations > 0 && <AlertCircle className="h-3 w-3 text-amber-500" />}
            </p>
            <p className="text-xl font-semibold text-amber-600">
              €{stats.totalFinancialObligations.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Obligations Breakdown */}
        {stats.totalFinancialObligations > 0 && (
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm font-medium">Obligations Breakdown:</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investors:</span>
                <span className="font-medium">
                  €{stats.obligationsBreakdown.investors.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bank Loans:</span>
                <span className="font-medium">
                  €{stats.obligationsBreakdown.bankLoans.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
