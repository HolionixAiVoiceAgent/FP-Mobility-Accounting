import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PredictiveMetrics {
  next_month_forecast: number; // Predicted revenue
  growth_rate: number; // Percentage growth
  confidence: number; // 0-100 confidence level
  trend: 'up' | 'down' | 'stable';
  seasonality: 'high' | 'medium' | 'low';
}

/**
 * Stub implementation of predictive analytics
 * In production, integrate with ML service or advanced statistical models
 */
export function usePredictiveAnalytics() {
  return useQuery({
    queryKey: ['predictiveAnalytics'],
    queryFn: async (): Promise<PredictiveMetrics> => {
      // Get last 12 months of data
      const { data: financialData } = await supabase
        .from('vehicle_sales')
        .select('sale_price, created_at')
        .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (!financialData || financialData.length === 0) {
        return {
          next_month_forecast: 0,
          growth_rate: 0,
          confidence: 0,
          trend: 'stable',
          seasonality: 'low',
        };
      }

      // Simple moving average calculation
      const monthlyRevenue: Record<string, number> = {};
      financialData.forEach((sale: any) => {
        const monthKey = new Date(sale.created_at).toISOString().slice(0, 7);
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + sale.sale_price;
      });

      const months = Object.keys(monthlyRevenue).sort();
      const revenues = months.map(m => monthlyRevenue[m]);

      // Calculate trend (simplified)
      const recent3Months = revenues.slice(-3);
      const previous3Months = revenues.slice(-6, -3);
      const recentAvg = recent3Months.reduce((a, b) => a + b, 0) / 3;
      const prevAvg = previous3Months.length > 0 ? previous3Months.reduce((a, b) => a + b, 0) / 3 : recentAvg;

      const growthRate = ((recentAvg - prevAvg) / (prevAvg || 1)) * 100;
      const trend = growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable';

      // Forecast (stub: use last 3 months average as forecast)
      const forecast = recentAvg;

      // Confidence based on data consistency
      const stdDev = Math.sqrt(
        revenues.reduce((sum, val) => sum + Math.pow(val - recentAvg, 2), 0) / revenues.length
      );
      const confidence = Math.max(0, Math.min(100, 100 - (stdDev / recentAvg) * 100));

      // Simple seasonality detection
      const variance = stdDev / recentAvg;
      const seasonality = variance > 0.3 ? 'high' : variance > 0.15 ? 'medium' : 'low';

      return {
        next_month_forecast: Math.round(forecast),
        growth_rate: Math.round(growthRate * 100) / 100,
        confidence: Math.round(confidence),
        trend,
        seasonality,
      };
    },
    staleTime: 24 * 60 * 60 * 1000, // Update once per day
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}
