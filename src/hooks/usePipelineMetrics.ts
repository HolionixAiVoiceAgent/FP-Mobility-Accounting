import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PipelineMetrics {
  stage: string;
  count: number;
  value: number;
  conversion_rate: number;
}

export interface PipelineData {
  stages: PipelineMetrics[];
  total_deals: number;
  total_value: number;
  average_deal_value: number;
}

export function usePipelineMetrics() {
  return useQuery({
    queryKey: ['pipelineMetrics'],
    queryFn: async () => {
      // Fetch vehicle sales data to calculate pipeline metrics
      const { data: sales, error } = await supabase
        .from('vehicle_sales')
        .select('*')
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by status to create pipeline stages
      const stages: Record<string, { count: number; value: number }> = {
        'lead': { count: 0, value: 0 },
        'qualification': { count: 0, value: 0 },
        'proposal': { count: 0, value: 0 },
        'negotiation': { count: 0, value: 0 },
        'closed_won': { count: 0, value: 0 },
      };

      let totalValue = 0;
      sales?.forEach((sale: any) => {
        const status = sale.status || 'lead';
        stages[status] = stages[status] || { count: 0, value: 0 };
        stages[status].count += 1;
        stages[status].value += sale.sale_price || 0;
        totalValue += sale.sale_price || 0;
      });

      // Calculate conversion rates
      const stageArray: PipelineMetrics[] = Object.entries(stages).map(([stage, data]) => ({
        stage,
        count: data.count,
        value: data.value,
        conversion_rate: sales && sales.length > 0 ? (data.count / sales.length) * 100 : 0,
      }));

      return {
        stages: stageArray,
        total_deals: sales?.length || 0,
        total_value: totalValue,
        average_deal_value: sales && sales.length > 0 ? totalValue / sales.length : 0,
      } as PipelineData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
