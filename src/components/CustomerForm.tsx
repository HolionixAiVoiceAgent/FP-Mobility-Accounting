import { useState } from 'react';
import { CustomerImageUpload } from './CustomerImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Customer } from '@/hooks/useCustomers';

interface CustomerFormProps {
  onSubmit: (customer: Omit<Customer, 'id' | 'customer_id'>) => Promise<any>;
}

export function CustomerForm({ onSubmit }: CustomerFormProps) {
  const [open, setOpen] = useState(false);
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'individual' as 'individual' | 'business',
    name: '',
    email: '',
    phone: '',
    address: '',
    total_purchases: 0,
    vehicles_purchased: 0,
    outstanding_balance: 0,
    status: 'active' as 'active' | 'pending_payment' | 'inactive',
    customer_since: new Date().toISOString().split('T')[0],
    last_purchase: undefined as string | undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await onSubmit(formData);
      
      // If successful and result has id, show image upload section
      if (result && result.id) {
        setCreatedCustomerId(result.id);
      } else {
        setOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to add customer:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'individual',
      name: '',
      email: '',
      phone: '',
      address: '',
      total_purchases: 0,
      vehicles_purchased: 0,
      outstanding_balance: 0,
      status: 'active',
      customer_since: new Date().toISOString().split('T')[0],
      last_purchase: undefined
    });
  };

  const handleClose = () => {
    setOpen(false);
    setCreatedCustomerId(null);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => {
      if (!v) handleClose();
      else setOpen(true);
    }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Customer Type</Label>
              <Select value={formData.type} onValueChange={(value: 'individual' | 'business') => 
                setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'pending_payment' | 'inactive') => 
                setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending_payment">Pending Payment</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total_purchases">Total Purchases (€)</Label>
              <Input
                id="total_purchases"
                type="number"
                value={formData.total_purchases}
                onChange={(e) => setFormData(prev => ({ ...prev, total_purchases: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="vehicles_purchased">Vehicles Purchased</Label>
              <Input
                id="vehicles_purchased"
                type="number"
                value={formData.vehicles_purchased}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicles_purchased: Number(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="outstanding_balance">Outstanding Balance (€)</Label>
              <Input
                id="outstanding_balance"
                type="number"
                value={formData.outstanding_balance}
                onChange={(e) => setFormData(prev => ({ ...prev, outstanding_balance: Number(e.target.value) }))}
              />
            </div>
          </div>

          {/* Customer Photo Upload Section - Only show after customer is created */}
          {createdCustomerId ? (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Customer Photos</h3>
              <CustomerImageUpload customerDbId={createdCustomerId} />
            </div>
          ) : null}

          <div className="flex justify-end space-x-2">
            {createdCustomerId ? (
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit">Add Customer</Button>
              </>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

