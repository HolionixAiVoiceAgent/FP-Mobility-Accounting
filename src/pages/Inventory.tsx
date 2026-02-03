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
  Upload,
  Euro,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Edit,
  Eye,
  Globe
} from 'lucide-react';
import { useState } from 'react';
import { useInventory, useInventoryStats } from '@/hooks/useInventory';
import { AddVehicleDialog } from '@/components/AddVehicleDialog';
import { EditVehicleDialog } from '@/components/EditVehicleDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { ImportDialog } from '@/components/ImportDialog';
import { BulkDeleteDialog } from '@/components/BulkDeleteDialog';
import { VehicleImageGallery } from '@/components/VehicleImageGallery';
import { VehicleImagesDialog } from '@/components/VehicleImagesDialog';
import { QuotationDialog } from '@/components/QuotationDialog';
import { exportInventoryToCSV } from '@/utils/exportUtils';
import { useToast } from '@/hooks/use-toast';

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const { data: inventory = [], isLoading, error } = useInventory();
  const { data: inventoryStats } = useInventoryStats();
  const { toast } = useToast();

  const handleExportInventory = () => {
    if (inventory.length === 0) {
      toast({
        title: "No Data",
        description: "No inventory data to export.",
        variant: "destructive"
      });
      return;
    }
    exportInventoryToCSV(inventory);
    toast({
      title: "Export Successful",
      description: "Inventory data has been exported to CSV.",
    });
  };

  const handleImportVehicles = () => {
    // Create file input for import
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Import Started",
          description: "CSV file import functionality coming soon.",
        });
      }
    };
    input.click();
  };

  // Filter inventory based on search term
  const filteredInventory = inventory.filter(vehicle => 
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success text-success-foreground';
      case 'sold': return 'bg-muted text-muted-foreground';
      case 'pending_repair': return 'bg-warning text-warning-foreground';
      case 'reserved': return 'bg-primary text-primary-foreground';
      case 'in_transit': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'sold': return 'Sold';
      case 'pending_repair': return 'In Repair';
      case 'reserved': return 'Reserved';
      case 'in_transit': return 'In Transit';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'sold': return <CheckCircle className="h-4 w-4" />;
      case 'pending_repair': return <Wrench className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      case 'in_transit': return <Car className="h-4 w-4" />;
      default: return null;
    }
  };

  const calculateDaysInStock = (purchaseDate: string, saleDate?: string) => {
    const purchase = new Date(purchaseDate);
    const end = saleDate ? new Date(saleDate) : new Date();
    return Math.floor((end.getTime() - purchase.getTime()) / (1000 * 3600 * 24));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-destructive">Error loading inventory: {error.message}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vehicle Inventory</h1>
            <p className="text-muted-foreground">Manage vehicle stock and track availability</p>
          </div>
          <div className="flex items-center space-x-3">
            <BulkDeleteDialog type="inventory" onDeleteComplete={() => window.location.reload()} />
            <ImportDialog type="inventory" onImportComplete={() => window.location.reload()} />
            <Button variant="outline" onClick={handleExportInventory}>
              <Download className="h-4 w-4 mr-2" />
              Export Inventory
            </Button>
            <AddVehicleDialog />
          </div>
        </div>

        {/* Inventory Statistics */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6">
          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
              <Car className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inventoryStats?.totalVehicles || 0}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{inventoryStats?.availableVehicles || 0}</div>
              <p className="text-xs text-muted-foreground">Ready for sale</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sold This Month</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inventoryStats?.soldThisMonth || 0}</div>
              <p className="text-xs text-muted-foreground">Vehicles sold</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Days in Stock</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{inventoryStats?.avgDaysInStock || 0}</div>
              <p className="text-xs text-muted-foreground">Average time</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
              <Euro className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">€{inventoryStats?.totalInventoryValue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total value</p>
            </CardContent>
          </Card>

          <Card className="animate-scale-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Repairs</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{inventoryStats?.pendingRepairs || 0}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
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
                  placeholder="Search by make, model, VIN, or location..." 
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

        {/* Inventory List */}
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.map((vehicle) => {
                const daysInStock = calculateDaysInStock(vehicle.purchase_date, vehicle.sale_date);
                return (
                  <div key={vehicle.id} className="border border-border rounded-lg p-6 hover:bg-accent transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                          <Car className="h-6 w-6 text-primary-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          <p className="text-sm text-muted-foreground">VIN: {vehicle.vin}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(vehicle.status)}>
                          {getStatusIcon(vehicle.status)}
                          <span className="ml-1">{getStatusText(vehicle.status)}</span>
                        </Badge>
                        {daysInStock > 60 && (
                          <Badge variant="outline" className="text-warning border-warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Long Stock
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-5">
                      <div>
                        <p className="text-sm text-muted-foreground">Details</p>
                        <p className="font-medium text-foreground">{vehicle.color || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{vehicle.mileage?.toLocaleString() || 'N/A'} km</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Purchase Price</p>
                        <p className="font-medium text-foreground">€{vehicle.purchase_price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Expected: €{vehicle.expected_sale_price?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium text-foreground">{vehicle.location || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{daysInStock} days in stock</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">TÜV / Service</p>
                        <p className="font-medium text-foreground">{vehicle.tuv_expiry || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">Last: {vehicle.last_service_date || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Images</p>
                        <p className="font-medium text-foreground">{vehicle.images_count || 0} photos</p>
                        <p className="text-xs text-muted-foreground">Documentation</p>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 mt-4">
                      <DeleteDialog 
                        id={vehicle.id} 
                        table="inventory" 
                        itemName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        onDeleteComplete={() => window.location.reload()}
                      />
                      <EditVehicleDialog vehicle={vehicle} />
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setGalleryOpen(true);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Photos
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setImagesDialogOpen(true);
                      }}>
                        <Upload className="h-4 w-4 mr-2" />
                        Manage Images
                      </Button>
                      <QuotationDialog vehicle={vehicle} />
                      <Button variant="outline" size="sm" onClick={() => {
                        // Open vehicle in new tab for listing or generate listing URL
                        const listingUrl = `${window.location.origin}/inventory/${vehicle.inventory_id}`;
                        navigator.clipboard.writeText(listingUrl);
                        toast({
                          title: "Listing Link Copied",
                          description: "Share this link to publish the vehicle listing.",
                        });
                      }}>
                        <Globe className="h-4 w-4 mr-2" />
                        Create Listing
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Image Gallery & Management Dialogs */}
      {selectedVehicle && (
        <>
          <VehicleImageGallery
            inventoryId={selectedVehicle}
            open={galleryOpen}
            onOpenChange={setGalleryOpen}
          />
          <VehicleImagesDialog
            inventoryId={selectedVehicle}
            vehicleName={inventory.find(v => v.id === selectedVehicle)?.make + ' ' + inventory.find(v => v.id === selectedVehicle)?.model || 'Vehicle'}
            open={imagesDialogOpen}
            onOpenChange={setImagesDialogOpen}
          />
        </>
      )}
    </Layout>
  );
}