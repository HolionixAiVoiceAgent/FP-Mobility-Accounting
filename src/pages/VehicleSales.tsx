import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Car, 
  Plus, 
  Search, 
  Filter,
  Download,
  Euro,
  Calendar,
  User,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { useVehicleSales, useVehicleSalesStats } from '@/hooks/useVehicleSales';
import { AddSaleDialog } from '@/components/AddSaleDialog';
import { exportVehicleSalesToExcel } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { CustomerDetailsDialog } from '@/components/CustomerDetailsDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { BulkDeleteDialog } from '@/components/BulkDeleteDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { supabase } from '@/integrations/supabase/client';

export default function VehicleSales() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: vehicleSales = [], isLoading, error } = useVehicleSales();
  const { data: salesStats } = useVehicleSalesStats();
  const { toast } = useToast();

  const handleExportSales = () => {
    if (vehicleSales.length === 0) {
      toast({
        title: "No Data",
        description: "No sales data to export.",
        variant: "destructive"
      });
      return;
    }
    exportVehicleSalesToExcel(vehicleSales);
    toast({
      title: "Export Successful",
      description: "Sales data has been exported to Excel.",
    });
  };

  // Filter sales based on search term
  const filteredSales = vehicleSales.filter(sale => 
    sale.vehicle_make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.vehicle_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.sale_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'pending': return 'bg-warning text-warning-foreground';
      case 'partial': return 'bg-primary text-primary-foreground';
      case 'overdue': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'pending': return 'Pending Payment';
      case 'partial': return 'Partial Payment';
      case 'overdue': return 'Overdue';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading sales data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading sales data</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vehicle Sales</h1>
            <p className="text-muted-foreground">Manage vehicle inventory and customer sales</p>
          </div>
          <div className="flex items-center space-x-3">
            <BulkDeleteDialog type="sales" onDeleteComplete={() => window.location.reload()} />
            <ImportDialog type="sales" onImportComplete={() => window.location.reload()} />
            <Button variant="outline" onClick={handleExportSales}>
              <Download className="h-4 w-4 mr-2" />
              Export Sales
            </Button>
            <AddSaleDialog />
          </div>
        </div>

        {/* Sales Statistics */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <Euro className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">€{salesStats?.totalSales?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Vehicles Sold</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{salesStats?.vehiclesSold || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Price</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">€{salesStats?.averagePrice?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Per vehicle</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">€{salesStats?.pendingPayments?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Outstanding</p>
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
                  placeholder="Search by customer name, vehicle, or VIN..." 
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

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Vehicle Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredSales.map((sale) => (
                <div key={sale.id} className="border border-border rounded-lg p-6 hover:bg-accent transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Car className="h-6 w-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {sale.vehicle_year} {sale.vehicle_make} {sale.vehicle_model}
                        </h3>
                        <p className="text-sm text-muted-foreground">Invoice #{sale.sale_id}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(sale.payment_status)}>
                      {getStatusText(sale.payment_status)}
                    </Badge>
                  </div>

                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-medium text-foreground">Customer ID: {sale.customer_id || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Payment: {sale.payment_method || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sale Price</p>
                        <p className="font-bold text-success">€{sale.sale_price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Profit: €{(sale.profit || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                        <p className="font-medium text-foreground">€{sale.purchase_price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Status: {sale.payment_status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sale Date</p>
                        <p className="font-medium text-foreground">{sale.sale_date}</p>
                        <p className="text-xs text-muted-foreground">VIN: {sale.vin}</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <DeleteDialog 
                        id={sale.id} 
                        table="vehicle_sales" 
                        itemName={`Sale #${sale.sale_id}`}
                        onDeleteComplete={() => window.location.reload()}
                      />
                      <Button variant="outline" size="sm" onClick={async () => {
                        try {
                          const { data: customer } = await supabase
                            .from('customers')
                            .select('*')
                            .eq('id', sale.customer_id)
                            .single();

                          await generateInvoicePDF(sale, customer || {});
                          
                          toast({
                            title: "Invoice Generated",
                            description: "The invoice PDF has been downloaded.",
                          });
                        } catch (error: any) {
                          toast({
                            title: "Error",
                            description: "Failed to generate invoice: " + error.message,
                            variant: "destructive",
                          });
                        }
                      }}>
                        <FileText className="h-4 w-4 mr-2" />
                        View Invoice
                      </Button>
                      <CustomerDetailsDialog customerId={sale.customer_id} />
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}