import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateServiceRecord } from '@/hooks/useServiceRecords';
import { useInventory } from '@/hooks/useInventory';
import { Plus, Wrench } from 'lucide-react';

interface AddServiceRecordDialogProps {
  inventoryId?: string;
  trigger?: React.ReactNode;
}

export const AddServiceRecordDialog = ({ inventoryId, trigger }: AddServiceRecordDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    inventory_id: inventoryId || '',
    service_date: new Date().toISOString().split('T')[0],
    service_type: 'oil_change' as const,
    description: '',
    mileage_at_service: '',
    cost: '',
    vendor_name: '',
    next_service_date: '',
    next_service_mileage: '',
  });

  const { data: inventory } = useInventory();
  const createRecord = useCreateServiceRecord();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRecord.mutate({
      inventory_id: formData.inventory_id,
      service_date: formData.service_date,
      service_type: formData.service_type,
      description: formData.description,
      mileage_at_service: formData.mileage_at_service ? parseInt(formData.mileage_at_service) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      vendor_name: formData.vendor_name || null,
      next_service_date: formData.next_service_date || null,
      next_service_mileage: formData.next_service_mileage ? parseInt(formData.next_service_mileage) : null,
      invoice_url: null,
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          inventory_id: inventoryId || '',
          service_date: new Date().toISOString().split('T')[0],
          service_type: 'oil_change',
          description: '',
          mileage_at_service: '',
          cost: '',
          vendor_name: '',
          next_service_date: '',
          next_service_mileage: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Wrench className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Service Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="inventory_id">Vehicle *</Label>
              <Select
                value={formData.inventory_id}
                onValueChange={(value) => setFormData({ ...formData, inventory_id: value })}
                disabled={!!inventoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.vin})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_date">Service Date *</Label>
              <Input
                id="service_date"
                type="date"
                value={formData.service_date}
                onChange={(e) => setFormData({ ...formData, service_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type *</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value: any) => setFormData({ ...formData, service_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oil_change">Oil Change</SelectItem>
                  <SelectItem value="inspection">Inspection</SelectItem>
                  <SelectItem value="repair">Repair</SelectItem>
                  <SelectItem value="tuv">TÜV</SelectItem>
                  <SelectItem value="tire_change">Tire Change</SelectItem>
                  <SelectItem value="brake_service">Brake Service</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage_at_service">Mileage (km)</Label>
              <Input
                id="mileage_at_service"
                type="number"
                value={formData.mileage_at_service}
                onChange={(e) => setFormData({ ...formData, mileage_at_service: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost (€)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="vendor_name">Vendor/Shop Name</Label>
              <Input
                id="vendor_name"
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_service_date">Next Service Date</Label>
              <Input
                id="next_service_date"
                type="date"
                value={formData.next_service_date}
                onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next_service_mileage">Next Service Mileage (km)</Label>
              <Input
                id="next_service_mileage"
                type="number"
                value={formData.next_service_mileage}
                onChange={(e) => setFormData({ ...formData, next_service_mileage: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRecord.isPending}>
              {createRecord.isPending ? 'Adding...' : 'Add Service Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
