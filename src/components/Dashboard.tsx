import { useRole } from '@/hooks/useRole';
import { OwnerDashboard } from './dashboards/OwnerDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';

export function Dashboard() {
  const { role, loading } = useRole();

  // Debug logging
  useEffect(() => {
    console.log('[Dashboard] Role:', role, 'Loading:', loading);
  }, [role, loading]);

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

  // Route to role-specific dashboard
  switch (role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'employee':
      return <OwnerDashboard />; // Employees also see owner dashboard
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Please log in to access the dashboard.</p>
          </CardContent>
        </Card>
      );
  }
}

