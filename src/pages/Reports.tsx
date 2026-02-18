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
  Settings2,
  Cloud
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVehicleSales } from '@/hooks/useVehicleSales';
import { useExpenses } from '@/hooks/useExpenses';
import { useCustomers } from '@/hooks/useCustomers';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo, useState } from 'react';
import { useLifetimeStats } from '@/hooks/useLifetimeStats';
import { FinancialHealthCard } from '@/components/FinancialHealthCard';
import { AddObligationDialog } from '@/components/AddObligationDialog';
import * as XLSX from 'xlsx';

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

/**
 * Helper function to create Excel sheet from data array
 */
const createExcelSheet = (data: any[], sheetName: string): XLSX.WorkSheet => {
  if (data.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['No data available']]);
    return ws;
  }

  const headers = Object.keys(data[0]);
  const aoa: any[][] = [headers];

  data.forEach(row => {
    const rowData: any[] = [];
    headers.forEach(header => {
      const value = row[header];
      // Format currency values properly
      if (header.toLowerCase().includes('price') || 
          header.toLowerCase().includes('amount') || 
          header.toLowerCase().includes('profit') ||
          header.toLowerCase().includes('balance') ||
          header.toLowerCase().includes('revenue') ||
          header.toLowerCase().includes('expense') ||
          header.toLowerCase().includes('total') ||
          header.toLowerCase().includes('cost')) {
        rowData.push(typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0);
      } else {
        rowData.push(value || '');
      }
    });
    aoa.push(rowData);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  
  // Set column widths
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => {
        const value = row[header];
        return value ? String(value).length : 0;
      })
    );
    return { wch: Math.min(maxLength + 2, 30) };
  });
  ws['!cols'] = colWidths;

  return ws;
};

/**
 * Download Excel file
 */
const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export default function Reports() {
  const { toast } = useToast();
  const { data: vehicleSales = [], isLoading: salesLoading } = useVehicleSales();
  const { data: expenses = [], isLoading: expensesLoading } = useExpenses();
  const { customers = [], loading: customersLoading } = useCustomers();
  const { data: lifetimeStats, isLoading: statsLoading } = useLifetimeStats();
  const [datevExporting, setDatevExporting] = useState(false);
  const [lexofficeSyncing, setLexofficeSyncing] = useState(false);

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
    
    const summaryData = [
      { 'Item': 'Total Sales', 'Amount (€)': totalSales },
      { 'Item': 'Total Expenses', 'Amount (€)': totalExpenses },
      { 'Item': 'Net Profit', 'Amount (€)': profit },
    ];

    const salesData = vehicleSales.map(sale => ({
      'Vehicle': `${sale.vehicle_year} ${sale.vehicle_make} ${sale.vehicle_model}`,
      'Sale Price (€)': sale.sale_price,
      'Purchase Price (€)': sale.purchase_price,
      'Profit (€)': sale.profit || 0,
      'Sale Date': sale.sale_date,
      'Payment Status': sale.payment_status
    }));

    const expensesData = expenses.map(expense => ({
      'Category': expense.category,
      'Description': expense.description,
      'Amount (€)': expense.amount,
      'Date': expense.date,
      'Vendor': expense.vendor || 'N/A'
    }));

    // Create workbook with multiple sheets
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(summaryData, 'Summary'), 'Summary');
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(salesData, 'Sales'), 'Sales');
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(expensesData, 'Expenses'), 'Expenses');
    
    downloadExcel(workbook, `pl_statement_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "P&L Report Generated",
      description: "Monthly profit & loss statement has been downloaded as Excel.",
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
    
    const salesData = vehicleSales.map(sale => ({
      'Sale ID': sale.sale_id,
      'Vehicle': `${sale.vehicle_year} ${sale.vehicle_make} ${sale.vehicle_model}`,
      'VIN': sale.vin,
      'Sale Price (€)': sale.sale_price,
      'Purchase Price (€)': sale.purchase_price,
      'Profit (€)': sale.profit || 0,
      'Sale Date': sale.sale_date,
      'Payment Status': sale.payment_status,
      'Payment Method': sale.payment_method || '',
      'Notes': sale.notes || ''
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(salesData, 'Vehicle Sales'), 'Vehicle Sales');
    
    downloadExcel(workbook, `vehicle_sales_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Sales Report Generated",
      description: "Vehicle sales report has been downloaded as Excel.",
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

    const categoryData = Object.entries(categoryTotals).map(([category, amount]) => ({
      'Category': category,
      'Total Amount (€)': amount
    }));

    const expensesData = expenses.map(expense => ({
      'Expense ID': expense.expense_id,
      'Category': expense.category,
      'Description': expense.description,
      'Amount (€)': expense.amount,
      'Date': expense.date,
      'Vendor': expense.vendor || 'N/A',
      'Payment Type': expense.payment_type || 'account',
      'Tax Deductible': expense.tax_deductible ? 'Yes' : 'No'
    }));

    // Create workbook with category summary and detailed expenses
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(categoryData, 'Category Summary'), 'Category Summary');
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(expensesData, 'Detailed Expenses'), 'Detailed Expenses');
    
    downloadExcel(workbook, `expense_breakdown_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Expense Report Generated",
      description: "Expense breakdown report has been downloaded as Excel.",
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
    
    const customerData = customers.map(customer => ({
      'Customer ID': customer.customer_id,
      'Name': customer.name,
      'Email': customer.email,
      'Phone': customer.phone,
      'Address': customer.address,
      'Type': customer.type,
      'Status': customer.status,
      'Total Purchases (€)': customer.total_purchases,
      'Vehicles Purchased': customer.vehicles_purchased,
      'Outstanding Balance (€)': customer.outstanding_balance,
      'Customer Since': customer.customer_since,
      'Last Purchase': customer.last_purchase || ''
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, createExcelSheet(customerData, 'Customers'), 'Customers');
    
    downloadExcel(workbook, `customer_analysis_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({
      title: "Customer Report Generated",
      description: "Customer analysis report has been downloaded as Excel.",
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

  const handleDATEVExport = async () => {
    setDatevExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("datev-export", {
        body: {
          startDate: null,
          endDate: null,
        },
      });

      if (error) throw error;

      // Create blob and download (DATEV is CSV format, keeping as is)
      const blob = new Blob([data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `datev_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "DATEV Export Complete",
        description: "DATEV-compliant CSV has been downloaded.",
      });
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDatevExporting(false);
    }
  };

  const handleLexofficeSync = async () => {
    setLexofficeSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("lexoffice-sync");

      if (error) throw error;

      toast({
        title: "Lexoffice Sync Complete",
        description: `Created ${data.invoicesCreated} invoices out of ${data.totalSales} sales.`,
      });
    } catch (error: any) {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLexofficeSyncing(false);
    }
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

        {/* Lifetime Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Revenue</CardTitle>
              <Euro className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    €{lifetimeStats?.totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Total sales</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles Sold</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{lifetimeStats?.vehiclesSold || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {lifetimeStats?.vehiclesPurchased || 0} purchased
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">{lifetimeStats?.totalCustomers || 0}</div>
                  <p className="text-xs text-muted-foreground">Lifetime</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Profit/Car</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="text-2xl font-bold text-muted-foreground">...</div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-foreground">
                    €{lifetimeStats?.averageProfitPerCar.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Total: €{lifetimeStats?.lifetimeProfit.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Health Card */}
        <FinancialHealthCard />

        {/* Financial Obligations Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Financial Obligations</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage investor money and bank loans
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/obligations'}>
                  View All
                </Button>
                <AddObligationDialog />
              </div>
            </div>
          </CardHeader>
        </Card>

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
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Export data to DATEV or sync with Lexoffice for tax compliance
              </p>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleDATEVExport}
                disabled={datevExporting}
              >
                <Download className="h-4 w-4 mr-2" />
                {datevExporting ? "Exporting..." : "DATEV Export"}
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={handleLexofficeSync}
                disabled={lexofficeSyncing}
              >
                <Cloud className="h-4 w-4 mr-2" />
                {lexofficeSyncing ? "Syncing..." : "Sync to Lexoffice"}
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

