import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmployees } from '@/hooks/useEmployees';
import { useCashAdvances } from '@/hooks/useCashAdvances';
import { PDFExportButton } from '../PDFExportButton';
import { Users, TrendingUp, Award, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export function HRDashboard() {
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: cashAdvances = [], isLoading: advancesLoading } = useCashAdvances();

  // Calculate HR metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e: any) => e.status === 'active').length;
  const departments = new Set(employees.map((e: any) => e.department).filter(Boolean)).size;
  const averageSalary = totalEmployees > 0 
    ? employees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0) / totalEmployees
    : 0;
  
  // Cash advances this month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const advancesThisMonth = cashAdvances.filter((adv: any) => {
    const advDate = new Date(adv.advance_date || adv.date);
    return advDate.getMonth() === currentMonth && advDate.getFullYear() === currentYear;
  });
  const totalAdvancesThisMonth = advancesThisMonth.reduce((sum: number, adv: any) => sum + (adv.amount || adv.advance_amount || 0), 0);

  // Prepare export data
  const exportData = {
    employees,
    cashAdvances,
    hrMetrics: {
      totalEmployees,
      activeEmployees,
      departments,
      averageSalary,
      totalAdvancesThisMonth
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
          <p className="text-muted-foreground">Employee management & performance for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <PDFExportButton
          data={exportData}
          reportTitle="HR Report"
          startDate={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
          endDate={new Date()}
          defaultFormat="xlsx"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground mt-1">{activeEmployees} active</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Teams</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">{new Set(employees.map((e: any) => e.department)).size}</div>
                <p className="text-xs text-muted-foreground mt-1">Departments</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cash Advances</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {advancesLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{totalAdvancesThisMonth.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">This month</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Salary</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {employeesLoading ? (
              <div className="text-2xl font-bold">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold">€{averageSalary.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Per employee</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee List</CardTitle>
        </CardHeader>
        <CardContent>
          {employeesLoading ? (
            <p className="text-muted-foreground">Loading employees...</p>
          ) : employees.length > 0 ? (
            <div className="space-y-2">
              {employees.map((employee: any) => (
                <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{employee.full_name || employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.position || 'No position'} • {employee.department || 'No department'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{(employee.salary || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{employee.status || 'active'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No employees found. Add employees to see them here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
