import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  PieChart,
  BarChart3,
  Euro,
  Car,
  Users,
  Receipt,
  Building2,
  Settings2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVehicleSales } from '@/hooks/useVehicleSales';
import { useExpenses } from '@/hooks/useExpenses';
import { useCustomers } from '@/hooks/useCustomers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

const reportTemplates = [
  {
    id: 'monthly-pl',
    name: 'Monthly P&L Statement',
    description: 'Comprehensive profit and loss report for tax compliance',
    category: 'Financial',
    frequency: 'Monthly',
    lastGenerated: '2024-01-15',
    icon: TrendingUp,
    color: 'bg-success'
  },
  {
    id: 'vehicle-sales',
    name: 'Vehicle Sales Report',
    description: 'Detailed vehicle sales performance and inventory analysis',
    category: 'Sales',
    frequency: 'Weekly',
    lastGenerated: '2024-01-14',
    icon: Car,
    color: 'bg-primary'
  },
  {
    id: 'expense-breakdown',
    name: 'Expense Category Breakdown',
    description: 'Categorized expense analysis for cost optimization',
    category: 'Expenses',
    frequency: 'Monthly',
    lastGenerated: '2024-01-13',
    icon: Receipt,
    color: 'bg-warning'
  },
  {
    id: 'customer-analysis',
    name: 'Customer Analysis Report',
    description: 'Customer behavior, payment patterns, and segmentation',
    category: 'Customers',
    frequency: 'Quarterly',
    lastGenerated: '2024-01-01',
    icon: Users,
    color: 'bg-muted-foreground'
  },
  {
    id: 'cash-flow',
    name: 'Cash Flow Statement',
    description: 'Detailed cash flow analysis for financial planning',
    category: 'Financial',
    frequency: 'Monthly',
    lastGenerated: '2024-01-15',
    icon: Euro,
    color: 'bg-success'
  },
  {
    id: 'tax-summary',
    name: 'Tax Summary Report',
    description: 'German tax authority compliant summary (DATEV format)',
    category: 'Compliance',
    frequency: 'Quarterly',
    lastGenerated: '2024-01-01',
    icon: Building2,
    color: 'bg-destructive'
  }
];


export default function Reports() {
  const { toast } = useToast();
  const { data: vehicleSales = [], isLoading: salesLoading } = useVehicleSales();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { customers = [], loading: customersLoading } = useCustomers();

  // Calculate quick stats from real data
  const quickStats = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Count data from this month
    const salesThisMonth = vehicleSales.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    }).length;

    const expensesThisMonth = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }).length;

    // Total reports would be sum of all data entries across all categories
    const totalReports = vehicleSales.length + expenses.length + customers.length;
    
    // Monthly reports = sales + expenses this month
    const monthlyReports = salesThisMonth + expensesThisMonth;

    return {
      totalReports,
      monthlyReports,
      scheduledReports: 0, // Would need a scheduled_reports table
      complianceReports: Math.floor(vehicleSales.length / 10) // Approximate tax reports needed
    };
  }, [vehicleSales, expenses, customers]);

  const isLoading = salesLoading || expensesLoading || customersLoading;

  const generatePLReport = () => {
    const totalSales = vehicleSales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const profit = totalSales - totalExpenses;
    
    const reportData = [
      ['Item', 'Amount (€)'],
      ['Total Sales', totalSales.toFixed(2)],
      ['Total Expenses', totalExpenses.toFixed(2)],
      ['Net Profit', profit.toFixed(2)],
      [''],
      ['Sales Breakdown'],
      ...vehicleSales.map(sale => [`${sale.vehicle_make} ${sale.vehicle_model}`, sale.sale_price.toFixed(2)]),
      [''],
      ['Expense Breakdown'],
      ...expenses.map(expense => [expense.description, expense.amount.toFixed(2)])
    ];
    
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pl_statement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "P&L Report Generated",
      description: "Monthly profit & loss statement has been downloaded.",
    });
  };

  const generateVehicleSalesReport = () => {
    if (vehicleSales.length === 0) {
      toast({
        title: "No Data",
        description: "No vehicle sales data available.",
        variant: "destructive"
      });
      return;
    }
    
    const reportData = [
      ['Sale ID', 'Vehicle', 'Sale Price', 'Purchase Price', 'Profit', 'Date', 'Payment Status'],
      ...vehicleSales.map(sale => [
        sale.sale_id,
        `${sale.vehicle_year} ${sale.vehicle_make} ${sale.vehicle_model}`,
        sale.sale_price.toFixed(2),
        sale.purchase_price.toFixed(2),
        (sale.profit || 0).toFixed(2),
        sale.sale_date,
        sale.payment_status
      ])
    ];
    
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vehicle_sales_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sales Report Generated",
      description: "Vehicle sales report has been downloaded.",
    });
  };

  const generateExpenseReport = () => {
    if (expenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expense data available.",
        variant: "destructive"
      });
      return;
    }
    
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const reportData = [
      ['Category', 'Total Amount (€)'],
      ...Object.entries(categoryTotals).map(([category, amount]) => [category, amount.toFixed(2)]),
      [''],
      ['Detailed Expenses'],
      ['ID', 'Category', 'Description', 'Amount', 'Date', 'Vendor'],
      ...expenses.map(expense => [
        expense.expense_id,
        expense.category,
        expense.description,
        expense.amount.toFixed(2),
        expense.date,
        expense.vendor || 'N/A'
      ])
    ];
    
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_breakdown_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Expense Report Generated",
      description: "Expense breakdown report has been downloaded.",
    });
  };

  const generateCustomerReport = () => {
    if (customers.length === 0) {
      toast({
        title: "No Data",
        description: "No customer data available.",
        variant: "destructive"
      });
      return;
    }
    
    const reportData = [
      ['Customer ID', 'Name', 'Email', 'Total Purchases', 'Vehicles Purchased', 'Outstanding Balance', 'Customer Since'],
      ...customers.map(customer => [
        customer.customer_id,
        customer.name,
        customer.email,
        (customer.total_purchases || 0).toFixed(2),
        customer.vehicles_purchased || 0,
        (customer.outstanding_balance || 0).toFixed(2),
        customer.customer_since
      ])
    ];
    
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customer_analysis_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Customer Report Generated",
      description: "Customer analysis report has been downloaded.",
    });
  };

  const handleGenerateReport = (templateId: string) => {
    switch (templateId) {
      case 'monthly-pl':
        generatePLReport();
        break;
      case 'vehicle-sales':
        generateVehicleSalesReport();
        break;
      case 'expense-breakdown':
        generateExpenseReport();
        break;
      case 'customer-analysis':
        generateCustomerReport();
        break;
      case 'cash-flow':
        toast({
          title: "Cash Flow Report",
          description: "Cash flow analysis will be available soon.",
        });
        break;
      case 'tax-summary':
        toast({
          title: "Tax Summary",
          description: "DATEV-compliant tax export will be available soon.",
        });
        break;
      default:
        toast({
          title: "Report Generation",
          description: "This report type will be available soon.",
        });
    }
  };

  const handleDATEVExport = () => {
    toast({
      title: "DATEV Export",
      description: "DATEV-compliant export started. This feature will be fully implemented soon.",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'processing': return 'bg-warning text-warning-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Financial': return 'bg-success text-success-foreground';
      case 'Sales': return 'bg-primary text-primary-foreground';
      case 'Expenses': return 'bg-warning text-warning-foreground';
      case 'Customers': return 'bg-muted text-muted-foreground';
      case 'Compliance': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">Generate financial reports and business intelligence</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Settings2 className="h-4 w-4 mr-2" />
              Report Settings
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Custom Report
            </Button>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Data Entries</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{quickStats.totalReports}</div>
                  <p className="text-xs text-muted-foreground">All records</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{quickStats.monthlyReports}</div>
                  <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Records</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{vehicleSales.length}</div>
                  <p className="text-xs text-muted-foreground">Vehicle sales</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Customers</CardTitle>
              <Users className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{customers.length}</div>
                  <p className="text-xs text-muted-foreground">Active customers</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Report Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Report Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div key={template.id} className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className={`w-10 h-10 ${template.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{template.frequency}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Last: {template.lastGenerated}
                      </span>
                      <Button size="sm" onClick={() => handleGenerateReport(template.id)}>
                        Generate Report
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2 text-primary" />
                Financial Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Interactive financial dashboard with real-time charts and KPIs
              </p>
              <Button className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-success" />
                Scheduled Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Manage automatic report generation and email delivery
              </p>
              <Button className="w-full" variant="outline">
                <Settings2 className="h-4 w-4 mr-2" />
                Manage Schedule
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-destructive" />
                Tax Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate DATEV-compliant exports for German tax authorities
              </p>
              <Button className="w-full" variant="outline" onClick={handleDATEVExport}>
                <Download className="h-4 w-4 mr-2" />
                DATEV Export
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading data...</div>
            ) : (
              <div className="space-y-4">
                {vehicleSales.length === 0 && expenses.length === 0 && customers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No data available yet</p>
                    <p className="text-sm mt-1">Start by adding vehicle sales, expenses, or customers</p>
                  </div>
                ) : (
                  <>
                    {vehicleSales.slice(0, 3).map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Car className="h-8 w-8 text-primary" />
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {sale.vehicle_year} {sale.vehicle_make} {sale.vehicle_model}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">Vehicle Sale</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(sale.sale_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">€{sale.sale_price.toLocaleString()}</p>
                          <Badge className={sale.payment_status === 'paid' ? 'bg-success' : 'bg-warning'}>
                            {sale.payment_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {expenses.slice(0, 2).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Receipt className="h-8 w-8 text-warning" />
                          <div>
                            <h4 className="font-semibold text-foreground">{expense.description}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                              <span className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">€{expense.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}