import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateVehiclePurchase } from '@/hooks/useVehiclePurchases';
import { useInventory } from '@/hooks/useInventory';
import { Plus, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const AddVehiclePurchaseDialog = () => {
  const [open, setOpen] = useState(false);
  const [showInventoryError, setShowInventoryError] = useState(false);
  const [formData, setFormData] = useState({
    inventory_id: '',
    seller_type: 'customer' as 'customer' | 'dealer' | 'auction' | 'trade_in',
    seller_name: '',
    seller_contact: '',
    seller_address: '',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_price: '',
    payment_terms_days: '0',
    payment_method: '',
    notes: '',
  });

  const { data: inventory = [], isLoading: inventoryLoading, error: inventoryError } = useInventory();
  const createPurchase = useCreateVehiclePurchase();

  // Handle when inventory loading fails
  useEffect(() => {
    if (inventoryError) {
      setShowInventoryError(true);
    }
  }, [inventoryError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentDueDate = new Date(formData.purchase_date);
    paymentDueDate.setDate(paymentDueDate.getDate() + parseInt(formData.payment_terms_days));

    createPurchase.mutate({
      inventory_id: formData.inventory_id || null,
      seller_type: formData.seller_type,
      seller_name: formData.seller_name,
      seller_contact: formData.seller_contact || null,
      seller_address: formData.seller_address || null,
      purchase_date: formData.purchase_date,
      purchase_price: parseFloat(formData.purchase_price),
      payment_terms_days: parseInt(formData.payment_terms_days),
      payment_due_date: paymentDueDate.toISOString().split('T')[0],
      payment_method: formData.payment_method || null,
      notes: formData.notes || null,
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          inventory_id: '',
          seller_type: 'customer',
          seller_name: '',
          seller_contact: '',
          seller_address: '',
          purchase_date: new Date().toISOString().split('T')[0],
          purchase_price: '',
          payment_terms_days: '0',
          payment_method: '',
          notes: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Record Vehicle Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Vehicle Purchase</DialogTitle>
        </DialogHeader>

        {createPurchase.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {createPurchase.error instanceof Error ? createPurchase.error.message : 'Failed to record purchase'}
            </AlertDescription>
          </Alert>
        )}

        {inventoryError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load inventory. You can still record the purchase without linking to inventory.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seller_type">Seller Type *</Label>
              <Select
                value={formData.seller_type}
                onValueChange={(value: any) => setFormData({ ...formData, seller_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="dealer">Dealer</SelectItem>
                  <SelectItem value="auction">Auction</SelectItem>
                  <SelectItem value="trade_in">Trade-In</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller_name">Seller Name *</Label>
              <Input
                id="seller_name"
                value={formData.seller_name}
                onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                placeholder="e.g. John's Car Deals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller_contact">Contact (Phone/Email)</Label>
              <Input
                id="seller_contact"
                value={formData.seller_contact}
                onChange={(e) => setFormData({ ...formData, seller_contact: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="seller_address">Seller Address</Label>
              <Input
                id="seller_address"
                value={formData.seller_address}
                onChange={(e) => setFormData({ ...formData, seller_address: e.target.value })}
                placeholder="123 Main Street, City"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price (€) *</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms_days">Payment Terms (Days) *</Label>
              <Input
                id="payment_terms_days"
                type="number"
                value={formData.payment_terms_days}
                onChange={(e) => setFormData({ ...formData, payment_terms_days: e.target.value })}
                placeholder="30"
                required
              />
              <p className="text-xs text-muted-foreground">
                0 = Pay immediately, 7 = 1 week, 30 = 1 month
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about the purchase..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createPurchase.isPending}>
              {createPurchase.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                'Record Purchase'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
