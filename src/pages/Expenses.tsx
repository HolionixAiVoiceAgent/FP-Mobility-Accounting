import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter,
  Download,
  TrendingUp,
  Calendar,
  Building2,
  Fuel,
  Users,
  FileText,
  Settings2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useExpenses, useExpenseStats } from '@/hooks/useExpenses';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { CashSummaryCard } from '@/components/CashSummaryCard';
import { AddCashAdvanceDialog } from '@/components/AddCashAdvanceDialog';
import { CashAdvancesList } from '@/components/CashAdvancesList';
import { supabase } from '@/integrations/supabase/client';
import { DeleteDialog } from '@/components/DeleteDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { BulkDeleteDialog } from '@/components/BulkDeleteDialog';
import { exportExpensesToExcel } from '@/utils/exportUtils';

const categoryColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-red-500",
  "bg-orange-500"
];

const recentExpenses = [
  {
    id: 'EXP-001',
    category: 'Office Rent',
    description: 'Monthly office rent - January 2024',
    amount: 2800,
    date: '2024-01-15',
    vendor: 'Property Management GmbH',
    paymentMethod: 'Bank Transfer',
    status: 'paid',
    receiptUrl: '#'
  },
  {
    id: 'EXP-002', 
    category: 'Vehicle Insurance',
    description: 'Comprehensive vehicle insurance premium',
    amount: 1200,
    date: '2024-01-14',
    vendor: 'Allianz Versicherung',
    paymentMethod: 'Direct Debit',
    status: 'paid',
    receiptUrl: '#'
  },
  {
    id: 'EXP-003',
    category: 'Parts & Supplies',
    description: 'Replacement parts order #PS-2024-001',
    amount: 3450,
    date: '2024-01-13',
    vendor: 'AutoTeile Express',
    paymentMethod: 'Credit Card',
    status: 'pending',
    receiptUrl: '#'
  },
  {
    id: 'EXP-004',
    category: 'Fuel & Utilities',
    description: 'Electricity bill - December 2023',
    amount: 450,
    date: '2024-01-12',
    vendor: 'Stadtwerke',
    paymentMethod: 'Bank Transfer',
    status: 'paid',
    receiptUrl: '#'
  },
  {
    id: 'EXP-005',
    category: 'Marketing',
    description: 'Online advertising campaign Q1',
    amount: 890,
    date: '2024-01-11',
    vendor: 'Google Ads',
    paymentMethod: 'Credit Card',
    status: 'paid',
    receiptUrl: '#'
  }
];

const monthlyStats = {
  totalExpenses: 17490,
  recurringExpenses: 12500,
  oneTimeExpenses: 4990,
  pendingExpenses: 3450
};

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: stats } = useExpenseStats();
  const [employeesMap, setEmployeesMap] = useState<Record<string, string>>({});

  const handleExportExpenses = async () => {
    if (expenses.length === 0) {
      toast({
        title: "No Data",
        description: "No expense data to export.",
        variant: "destructive"
      });
      return;
    }
    await exportExpensesToExcel(expenses);
    toast({
      title: "Export Successful",
      description: "Expenses data has been exported to Excel.",
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await (supabase as any).from('employees').select('id, full_name');
        if (!mounted || !data) return;
        const map: Record<string, string> = {};
        data.forEach((e: any) => { map[e.id] = e.full_name; });
        setEmployeesMap(map);
      } catch (e) {
        // employees table may not exist in some deployments
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Office Rent': return Building2;
      case 'Fuel & Utilities': return Fuel;
      case 'Staff Salaries': return Users;
      case 'Vehicle Insurance': return FileText;
      default: return Receipt;
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Expense Management</h1>
            <p className="text-muted-foreground">Track and categorize business expenses</p>
          </div>
          <div className="flex items-center space-x-3">
            <BulkDeleteDialog type="expenses" onDeleteComplete={() => window.location.reload()} />
            <ImportDialog type="expenses" onImportComplete={() => window.location.reload()} />
            <Button variant="outline" onClick={handleExportExpenses}>
              <Download className="h-4 w-4 mr-2" />
              Export Expenses
            </Button>
            <AddExpenseDialog />
          </div>
        </div>

        {/* Expense Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">€{stats?.totalExpenses?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Recurring</CardTitle>
              <Calendar className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">€{stats?.recurringExpenses?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Monthly recurring</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">One-time</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">€{stats?.oneTimeExpenses?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">€{stats?.pendingExpenses?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Employee Cash Summary and Advances */}
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <CashSummaryCard />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-end space-x-2">
              <AddCashAdvanceDialog />
            </div>
            <CashAdvancesList />
          </div>
        </div>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Categories - {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {stats.categoryBreakdown.map((category, index) => {
                  const Icon = getCategoryIcon(category.category);
                  return (
                    <div key={category.category} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <div className={`w-10 h-10 ${categoryColors[index % categoryColors.length]} rounded-lg flex items-center justify-center`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{category.category}</p>
                        <p className="text-sm font-bold text-primary">€{category.total.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No expenses this month</p>
            )}
          </CardContent>
        </Card>

        {/* Add New Expense Form */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="expense-amount">Amount (€)</Label>
                <Input id="expense-amount" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-category">Category</Label>
                <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
                  <option>Office Rent</option>
                  <option>Vehicle Insurance</option>
                  <option>Staff Salaries</option>
                  <option>Fuel & Utilities</option>
                  <option>Parts & Supplies</option>
                  <option>Marketing</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-vendor">Vendor</Label>
                <Input id="expense-vendor" placeholder="Enter vendor name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-date">Date</Label>
                <Input id="expense-date" type="date" />
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description</Label>
                <Input id="expense-description" placeholder="Enter expense description" />
              </div>
              <div className="flex space-x-2">
                <Button>Add Expense</Button>
                <Button variant="outline">Save as Template</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search expenses by description, vendor, or category..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.filter(expense => 
                expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (expense.vendor && expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()))
              ).map((expense) => {
                const Icon = getCategoryIcon(expense.category);
                return (
                  <div key={expense.id} className="border border-border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{expense.description}</h3>
                          <p className="text-sm text-muted-foreground">ID: {expense.expense_id} • {expense.vendor || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">€{expense.amount.toLocaleString()}</p>
                        <Badge className="bg-success text-success-foreground">
                          Tax Deductible: {expense.tax_deductible ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid gap-2 md:grid-cols-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <span className="ml-2 font-medium">{expense.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <span className="ml-2 font-medium">{expense.date}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Vendor:</span>
                        <span className="ml-2 font-medium">{expense.vendor || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Payment:</span>
                        <span className="ml-2 font-medium">{expense.payment_type ? expense.payment_type.charAt(0).toUpperCase() + expense.payment_type.slice(1) : 'Account'}</span>
                        {expense.payment_type === 'cash' && expense.employee_id ? (
                          <div className="text-xs text-muted-foreground">Handled by: <span className="ml-1 font-medium">{employeesMap[expense.employee_id] || expense.employee_id}</span></div>
                        ) : null}
                      </div>
                      <div className="flex space-x-2">
                        <DeleteDialog 
                          id={expense.id} 
                          table="expenses" 
                          itemName={expense.description}
                          onDeleteComplete={() => window.location.reload()}
                        />
                        {expense.receipt_url ? (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(expense.receipt_url!, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Receipt
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2">No receipt</span>
                        )}
                        <Button variant="outline" size="sm">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}