import { useState, useEffect } from 'react';
import QrReader from 'react-qr-barcode-scanner';
import { VehicleImageUpload } from './VehicleImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { useUpdateInventoryItem, InventoryItem } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';

interface EditVehicleDialogProps {
  vehicle: InventoryItem;
}

export function EditVehicleDialog({ vehicle }: EditVehicleDialogProps) {
  const [open, setOpen] = useState(false);
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [formData, setFormData] = useState({
    inventory_id: vehicle.inventory_id,
    vin: vehicle.vin,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color || '',
    mileage: vehicle.mileage || 0,
    purchase_price: vehicle.purchase_price,
    expected_sale_price: vehicle.expected_sale_price || 0,
    actual_sale_price: vehicle.actual_sale_price || 0,
    status: vehicle.status,
    location: vehicle.location || '',
    tuv_expiry: vehicle.tuv_expiry || '',
    last_service_date: vehicle.last_service_date || '',
    purchase_date: vehicle.purchase_date,
    sale_date: vehicle.sale_date || '',
    notes: vehicle.notes || ''
  });

  const updateMutation = useUpdateInventoryItem();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setFormData({
        inventory_id: vehicle.inventory_id,
        vin: vehicle.vin,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color || '',
        mileage: vehicle.mileage || 0,
        purchase_price: vehicle.purchase_price,
        expected_sale_price: vehicle.expected_sale_price || 0,
        actual_sale_price: vehicle.actual_sale_price || 0,
        status: vehicle.status,
        location: vehicle.location || '',
        tuv_expiry: vehicle.tuv_expiry || '',
        last_service_date: vehicle.last_service_date || '',
        purchase_date: vehicle.purchase_date,
        sale_date: vehicle.sale_date || '',
        notes: vehicle.notes || ''
      });
    }
  }, [open, vehicle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMutation.mutateAsync({
        id: vehicle.id,
        inventory_id: formData.inventory_id,
        vin: formData.vin,
        make: formData.make,
        model: formData.model,
        year: Number(formData.year),
        color: formData.color || null,
        mileage: formData.mileage || null,
        purchase_price: Number(formData.purchase_price),
        expected_sale_price: formData.expected_sale_price || null,
        actual_sale_price: formData.actual_sale_price || null,
        status: formData.status,
        location: formData.location || null,
        tuv_expiry: formData.tuv_expiry || null,
        last_service_date: formData.last_service_date || null,
        purchase_date: formData.purchase_date,
        sale_date: formData.sale_date || null,
        notes: formData.notes || null
      });
      
      // Toast is handled by the hook, close dialog after a short delay to allow toast to show
      setTimeout(() => {
        setOpen(false);
      }, 500);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="edit-vehicle-description">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Details</DialogTitle>
          <DialogDescription id="edit-vehicle-description">
            Update the vehicle details including VIN, make, model, year, mileage, and pricing information.
          </DialogDescription>
        </DialogHeader>

        {/* VIN Scanner Modal */}
        {showVinScanner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-white rounded-lg p-6 max-w-md w-full flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-2">Scan VIN Barcode</h2>
              <div className="w-full h-64">
                <QrReader
                  onUpdate={(result, error) => {
                    const code = (result as any)?.text;
                    if (code) {
                      setFormData(prev => ({ ...prev, vin: code }));
                      setShowVinScanner(false);
                    }
                  }}
                  width={"100%"}
                  height={256}
                />
              </div>
              <Button className="mt-4" variant="outline" onClick={() => setShowVinScanner(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inventory_id">Inventory ID</Label>
              <Input
                id="inventory_id"
                value={formData.inventory_id}
                onChange={(e) => setFormData(prev => ({...prev, inventory_id: e.target.value}))}
                placeholder="INV2024001"
              />
            </div>
            <div>
              <Label htmlFor="vin">VIN</Label>
              <div className="flex gap-2">
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({...prev, vin: e.target.value}))}
                  placeholder="WBA3A5G50FNS12345"
                />
                <Button type="button" variant="secondary" onClick={() => setShowVinScanner(true)}>
                  Scan
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({...prev, make: e.target.value}))}
                placeholder="BMW"
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                placeholder="320i"
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({...prev, year: parseInt(e.target.value)}))}
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({...prev, color: e.target.value}))}
                placeholder="Schwarz Metallic"
              />
            </div>
            <div>
              <Label htmlFor="mileage">Mileage (km)</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData(prev => ({...prev, mileage: parseInt(e.target.value) || 0}))}
                placeholder="25000"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="purchase_price">Purchase Price (€)</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData(prev => ({...prev, purchase_price: parseFloat(e.target.value) || 0}))}
                placeholder="22000"
              />
            </div>
            <div>
              <Label htmlFor="expected_sale_price">Expected Sale Price (€)</Label>
              <Input
                id="expected_sale_price"
                type="number"
                value={formData.expected_sale_price}
                onChange={(e) => setFormData(prev => ({...prev, expected_sale_price: parseFloat(e.target.value) || 0}))}
                placeholder="28500"
              />
            </div>
            <div>
              <Label htmlFor="actual_sale_price">Actual Sale Price (€)</Label>
              <Input
                id="actual_sale_price"
                type="number"
                value={formData.actual_sale_price}
                onChange={(e) => setFormData(prev => ({...prev, actual_sale_price: parseFloat(e.target.value) || 0}))}
                placeholder="28500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({...prev, status: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="pending_repair">Pending Repair</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
                placeholder="Lot A-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="tuv_expiry">TÜV Expiry</Label>
              <Input
                id="tuv_expiry"
                type="date"
                value={formData.tuv_expiry}
                onChange={(e) => setFormData(prev => ({...prev, tuv_expiry: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="last_service_date">Last Service Date</Label>
              <Input
                id="last_service_date"
                type="date"
                value={formData.last_service_date}
                onChange={(e) => setFormData(prev => ({...prev, last_service_date: e.target.value}))}
              />
            </div>
            <div>
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({...prev, purchase_date: e.target.value}))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="sale_date">Sale Date</Label>
            <Input
              id="sale_date"
              type="date"
              value={formData.sale_date}
              onChange={(e) => setFormData(prev => ({...prev, sale_date: e.target.value}))}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              placeholder="Any additional notes about the vehicle..."
              rows={3}
            />
          </div>

          {/* Vehicle Photo Upload Section */}
          {formData.inventory_id && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Vehicle Photos</h3>
              <VehicleImageUpload inventoryId={formData.inventory_id} />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Updating...' : 'Update Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}