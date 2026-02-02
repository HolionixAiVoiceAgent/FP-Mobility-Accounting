import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { usePredictiveAnalytics } from '@/hooks/usePredictiveAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export function PredictiveAnalyticsWidget() {
  const { data: predictions, isLoading } = usePredictiveAnalytics();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!predictions) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Next Month Forecast
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="text-2xl font-bold text-primary">
            €{predictions.next_month_forecast.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Predicted revenue</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Growth Rate</p>
            <p className={`text-lg font-bold ${predictions.growth_rate > 0 ? 'text-green-600' : predictions.growth_rate < 0 ? 'text-red-600' : ''}`}>
              {predictions.growth_rate > 0 ? '+' : ''}{predictions.growth_rate}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Confidence</p>
            <p className="text-lg font-bold">{predictions.confidence}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Trend: </span>
            <span className={`font-semibold ${predictions.trend === 'up' ? 'text-green-600' : predictions.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
              {predictions.trend.charAt(0).toUpperCase() + predictions.trend.slice(1)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Seasonality: </span>
            <span className="font-semibold">{predictions.seasonality}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>Stub forecast: uses 3-month moving average. Integrate with ML models for production.</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
