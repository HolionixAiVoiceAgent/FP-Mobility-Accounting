import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMemberPerformance {
  name: string;
  sales_count: number;
  total_revenue: number;
  average_deal_value: number;
  conversion_rate: number;
}

export interface TeamPerformanceData {
  team_members: TeamMemberPerformance[];
  top_performer: TeamMemberPerformance | null;
  total_team_revenue: number;
  average_conversion_rate: number;
}

export function useTeamPerformance() {
  return useQuery({
    queryKey: ['teamPerformance'],
    queryFn: async () => {
      // Fetch vehicle sales with salesperson info
      const { data: sales, error } = await supabase
        .from('vehicle_sales')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by salesperson to create team performance
      const teamMap: Record<string, TeamMemberPerformance> = {};
      let totalRevenue = 0;
      let totalConversions = 0;

      sales?.forEach((sale: any) => {
        const salesPerson = sale.salesperson_id || 'Unassigned';
        if (!teamMap[salesPerson]) {
          teamMap[salesPerson] = {
            name: salesPerson,
            sales_count: 0,
            total_revenue: 0,
            average_deal_value: 0,
            conversion_rate: 0,
          };
        }

        teamMap[salesPerson].sales_count += 1;
        teamMap[salesPerson].total_revenue += sale.sale_price || 0;
        totalRevenue += sale.sale_price || 0;

        if (sale.status === 'closed_won') {
          totalConversions += 1;
        }
      });

      // Calculate averages
      const teamMembers = Object.values(teamMap).map(member => ({
        ...member,
        average_deal_value: member.sales_count > 0 ? member.total_revenue / member.sales_count : 0,
        conversion_rate: sales && sales.length > 0 ? (member.sales_count / sales.length) * 100 : 0,
      }));

      // Sort by revenue
      teamMembers.sort((a, b) => b.total_revenue - a.total_revenue);

      return {
        team_members: teamMembers,
        top_performer: teamMembers[0] || null,
        total_team_revenue: totalRevenue,
        average_conversion_rate: sales && sales.length > 0 ? (totalConversions / sales.length) * 100 : 0,
      } as TeamPerformanceData;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}
