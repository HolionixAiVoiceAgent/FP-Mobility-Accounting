import { useState } from 'react';
import QrReader from 'react-qr-barcode-scanner';
import { VehicleImageUpload } from './VehicleImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useCreateInventoryItem } from '@/hooks/useInventory';
import { useToast } from '@/hooks/use-toast';

export function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [showVinScanner, setShowVinScanner] = useState(false);
  const [tempInventoryId, setTempInventoryId] = useState('');
  const [formData, setFormData] = useState({
    inventory_id: '',
    vin: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mileage: 0,
    purchase_price: 0,
    expected_sale_price: 0,
    status: 'available',
    location: '',
    tuv_expiry: '',
    last_service_date: '',
    purchase_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const createMutation = useCreateInventoryItem();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vin || !formData.make || !formData.model) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        ...formData,
        year: Number(formData.year),
        mileage: formData.mileage || undefined,
        purchase_price: Number(formData.purchase_price),
        expected_sale_price: formData.expected_sale_price || undefined,
        tuv_expiry: formData.tuv_expiry || undefined,
        last_service_date: formData.last_service_date || undefined,
        images_count: 0
      });
      
      setOpen(false);
      setFormData({
        inventory_id: '',
        vin: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        mileage: 0,
        purchase_price: 0,
        expected_sale_price: 0,
        status: 'available',
        location: '',
        tuv_expiry: '',
        last_service_date: '',
        purchase_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error) {
      console.error('Error adding vehicle:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
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
              <Label htmlFor="inventory_id">Inventory ID *</Label>
              <Input
                id="inventory_id"
                value={formData.inventory_id}
                onChange={(e) => setFormData(prev => ({...prev, inventory_id: e.target.value}))}
                placeholder="INV2024001"
                required
              />
            </div>
            <div>
              <Label htmlFor="vin">VIN *</Label>
              <div className="flex gap-2">
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => setFormData(prev => ({...prev, vin: e.target.value}))}
                  placeholder="WBA3A5G50FNS12345"
                  required
                />
                <Button type="button" variant="secondary" onClick={() => setShowVinScanner(true)}>
                  Scan
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData(prev => ({...prev, make: e.target.value}))}
                placeholder="BMW"
                required
              />
            </div>
            <div>
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({...prev, model: e.target.value}))}
                placeholder="320i"
                required
              />
            </div>
            <div>
              <Label htmlFor="year">Year *</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({...prev, year: parseInt(e.target.value)}))}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_price">Purchase Price (€) *</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData(prev => ({...prev, purchase_price: parseFloat(e.target.value) || 0}))}
                placeholder="22000"
                required
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
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({...prev, purchase_date: e.target.value}))}
                required
              />
            </div>
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

          {/* ...existing form fields... */}

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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}