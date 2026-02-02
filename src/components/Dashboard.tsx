import { useRole } from '@/hooks/useRole';
import { OwnerDashboard } from './dashboards/OwnerDashboard';
import { SalesDashboard } from './dashboards/SalesDashboard';
import { FinanceDashboard } from './dashboards/FinanceDashboard';
import { HRDashboard } from './dashboards/HRDashboard';
import { InventoryDashboard } from './dashboards/InventoryDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Loading dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Route to role-specific dashboard (user_roles has admin | employee; extended roles from employees table)
  switch (role) {
    case 'owner':
    case 'admin':
      return <OwnerDashboard />;
    case 'sales_manager':
    case 'salesperson':
      return <SalesDashboard />;
    case 'accountant':
      return <FinanceDashboard />;
    case 'hr_manager':
      return <HRDashboard />;
    case 'inventory_manager':
      return <InventoryDashboard />;
    case 'employee':
      // Default app role for non-admin users: show sales-focused dashboard
      return <SalesDashboard />;
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">No dashboard available for your role.</p>
          </CardContent>
        </Card>
      );
  }
}