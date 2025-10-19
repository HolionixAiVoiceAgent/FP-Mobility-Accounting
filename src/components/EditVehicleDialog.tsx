import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
        ...formData,
        year: Number(formData.year),
        mileage: formData.mileage || undefined,
        purchase_price: Number(formData.purchase_price),
        expected_sale_price: formData.expected_sale_price || undefined,
        actual_sale_price: formData.actual_sale_price || undefined,
        tuv_expiry: formData.tuv_expiry || undefined,
        last_service_date: formData.last_service_date || undefined,
        sale_date: formData.sale_date || undefined
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error updating vehicle:', error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Vehicle Details</DialogTitle>
        </DialogHeader>
        
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
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => setFormData(prev => ({...prev, vin: e.target.value}))}
                placeholder="WBA3A5G50FNS12345"
              />
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