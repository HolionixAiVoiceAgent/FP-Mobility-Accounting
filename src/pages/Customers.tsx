import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CustomerForm } from '@/components/CustomerForm';
import { useCustomers } from '@/hooks/useCustomers';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  Download,
  Mail,
  Phone,
  Car,
  Euro,
  Calendar,
  MapPin,
  Building2,
  User,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { DeleteDialog } from '@/components/DeleteDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { BulkDeleteDialog } from '@/components/BulkDeleteDialog';
import { exportCustomersToCSV } from '@/utils/exportUtils';


export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const { customers, stats, loading, addCustomer } = useCustomers();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-success-foreground';
      case 'pending_payment': return 'bg-warning text-warning-foreground';
      case 'inactive': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCustomerIcon = (type: string) => {
    return type === 'business' ? Building2 : User;
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || customer.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const exportCustomers = () => {
    exportCustomersToCSV(filteredCustomers);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
            <p className="text-muted-foreground">Manage customer relationships and payment tracking</p>
          </div>
          <div className="flex items-center space-x-3">
            <BulkDeleteDialog type="customers" onDeleteComplete={() => window.location.reload()} />
            <ImportDialog type="customers" onImportComplete={() => window.location.reload()} />
            <Button variant="outline" onClick={exportCustomers}>
              <Download className="h-4 w-4 mr-2" />
              Export Customers
            </Button>
            <CustomerForm onSubmit={addCustomer} />
          </div>
        </div>

        {/* Customer Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.newThisMonth}</div>
              <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
              <Euro className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">€{stats.totalOutstanding.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total outstanding</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search customers by name or email..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="px-3 py-2 border border-input rounded-md bg-background"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="individual">Individual</option>
                <option value="business">Business</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCustomers.map((customer) => {
                const Icon = getCustomerIcon(customer.type);
                return (
                  <div key={customer.id} className="border border-border rounded-lg p-6 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Customer ID: {customer.customer_id} • {customer.type === 'business' ? 'Business' : 'Individual'}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(customer.status)}>
                        {customer.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Contact Information</p>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{customer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">{customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{customer.address}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Purchase History</p>
                        <div className="space-y-1">
                          <p className="font-bold text-success">€{customer.total_purchases.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">{customer.vehicles_purchased} vehicle(s) purchased</p>
                          <p className="text-xs text-muted-foreground">Last: {customer.last_purchase || 'N/A'}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Payment Status</p>
                        <div className="space-y-1">
                          <p className={`font-bold ${customer.outstanding_balance > 0 ? 'text-warning' : 'text-success'}`}>
                            €{customer.outstanding_balance.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.outstanding_balance > 0 ? 'Outstanding balance' : 'Fully paid'}
                          </p>
                          <p className="text-xs text-muted-foreground">Since: {customer.customer_since}</p>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <DeleteDialog 
                          id={customer.id} 
                          table="customers" 
                          itemName={customer.name}
                          onDeleteComplete={() => window.location.reload()}
                        />
                        <Button variant="outline" size="sm">
                          <User className="h-4 w-4 mr-2" />
                          View Profile
                        </Button>
                        <Button variant="outline" size="sm">
                          <Car className="h-4 w-4 mr-2" />
                          Purchase History
                        </Button>
                      </div>
                    </div>

                    {customer.outstanding_balance > 0 && (
                      <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Euro className="h-4 w-4 text-warning" />
                            <span className="text-sm font-medium text-warning">
                              Outstanding Balance: €{customer.outstanding_balance.toLocaleString()}
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            Send Reminder
                          </Button>
                        </div>
                      </div>
                    )}
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