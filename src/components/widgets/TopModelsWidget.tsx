import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useVehicleSales } from '@/hooks/useVehicleSales';
import { TrendingUp } from 'lucide-react';

export function TopModelsWidget() {
  const { data: sales, isLoading } = useVehicleSales();

  if (isLoading) {
    return <Card><CardContent className="pt-6">Loading...</CardContent></Card>;
  }

  // Group sales by model from the data
  const modelSales: Record<string, number> = {};
  sales?.forEach((sale: any) => {
    const model = sale.vehicle_model || 'Unknown';
    modelSales[model] = (modelSales[model] || 0) + 1;
  });

  const topModels = Object.entries(modelSales)
    .map(([model, count]) => ({ model, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">Top Models</CardTitle>
        <TrendingUp className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topModels.map((model, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{model.model}</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${(model.count / (topModels[0]?.count || 1)) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-600 w-6 text-right">{model.count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
