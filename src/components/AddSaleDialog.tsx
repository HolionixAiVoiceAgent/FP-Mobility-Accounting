import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useInventory } from '@/hooks/useInventory';
import { useCustomers } from '@/hooks/useCustomers';

export function AddSaleDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    sale_id: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vin: '',
    customer_id: '',
    purchase_price: 0,
    sale_price: 0,
    profit: 0,
    payment_status: 'pending',
    payment_method: '',
    sale_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const { data: inventory = [] } = useInventory();
  const { customers = [] } = useCustomers();
  const { toast } = useToast();

  const availableVehicles = inventory.filter(v => v.status === 'available' || v.status === 'reserved');

  const handleVehicleSelect = (vehicleId: string) => {
    const vehicle = inventory.find(v => v.id === vehicleId);
    if (vehicle) {
      setFormData(prev => ({
        ...prev,
        vehicle_make: vehicle.make,
        vehicle_model: vehicle.model,
        vehicle_year: vehicle.year,
        vin: vehicle.vin,
        purchase_price: vehicle.purchase_price,
        sale_price: vehicle.expected_sale_price || vehicle.purchase_price,
        profit: (vehicle.expected_sale_price || vehicle.purchase_price) - vehicle.purchase_price
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sale_id || !formData.vin || !formData.customer_id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create vehicle sale record
      const { error } = await supabase
        .from('vehicle_sales')
        .insert([{
          ...formData,
          vehicle_year: Number(formData.vehicle_year),
          purchase_price: Number(formData.purchase_price),
          sale_price: Number(formData.sale_price),
          profit: Number(formData.profit)
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vehicle sale recorded successfully.",
      });
      
      setOpen(false);
      setFormData({
        sale_id: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: new Date().getFullYear(),
        vin: '',
        customer_id: '',
        purchase_price: 0,
        sale_price: 0,
        profit: 0,
        payment_status: 'pending',
        payment_method: '',
        sale_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (error: any) {
      console.error('Error creating sale:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record vehicle sale.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Vehicle Sale</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sale_id">Sale ID *</Label>
              <Input
                id="sale_id"
                value={formData.sale_id}
                onChange={(e) => setFormData(prev => ({...prev, sale_id: e.target.value}))}
                placeholder="SALE2024001"
                required
              />
            </div>
            <div>
              <Label htmlFor="vehicle">Select Vehicle *</Label>
              <Select onValueChange={handleVehicleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose available vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {availableVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vehicle_make">Make</Label>
              <Input
                id="vehicle_make"
                value={formData.vehicle_make}
                onChange={(e) => setFormData(prev => ({...prev, vehicle_make: e.target.value}))}
                placeholder="BMW"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="vehicle_model">Model</Label>
              <Input
                id="vehicle_model"
                value={formData.vehicle_model}
                onChange={(e) => setFormData(prev => ({...prev, vehicle_model: e.target.value}))}
                placeholder="320i"
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="vehicle_year">Year</Label>
              <Input
                id="vehicle_year"
                type="number"
                value={formData.vehicle_year}
                onChange={(e) => setFormData(prev => ({...prev, vehicle_year: parseInt(e.target.value)}))}
                readOnly
              />
            </div>
          </div>

          <div>
            <Label htmlFor="vin">VIN</Label>
            <Input
              id="vin"
              value={formData.vin}
              onChange={(e) => setFormData(prev => ({...prev, vin: e.target.value}))}
              placeholder="WBA3A5G50FNS12345"
              readOnly
            />
          </div>

          <div>
            <Label htmlFor="customer_id">Customer *</Label>
            <Select value={formData.customer_id} onValueChange={(value) => setFormData(prev => ({...prev, customer_id: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="purchase_price">Purchase Price (€)</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => {
                  const purchasePrice = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev, 
                    purchase_price: purchasePrice,
                    profit: prev.sale_price - purchasePrice
                  }));
                }}
                readOnly
              />
            </div>
            <div>
              <Label htmlFor="sale_price">Sale Price (€) *</Label>
              <Input
                id="sale_price"
                type="number"
                value={formData.sale_price}
                onChange={(e) => {
                  const salePrice = parseFloat(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev, 
                    sale_price: salePrice,
                    profit: salePrice - prev.purchase_price
                  }));
                }}
                required
              />
            </div>
            <div>
              <Label htmlFor="profit">Profit (€)</Label>
              <Input
                id="profit"
                type="number"
                value={formData.profit}
                readOnly
                className="font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment_status">Payment Status</Label>
              <Select value={formData.payment_status} onValueChange={(value) => setFormData(prev => ({...prev, payment_status: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial Payment</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select value={formData.payment_method} onValueChange={(value) => setFormData(prev => ({...prev, payment_method: value}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="financing">Financing</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="installments">Installments</SelectItem>
                </SelectContent>
              </Select>
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
              placeholder="Additional notes about the sale..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Record Sale
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}