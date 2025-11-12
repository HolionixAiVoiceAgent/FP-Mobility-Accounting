import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecordPurchasePayment, usePurchasePayments } from '@/hooks/usePurchasePayments';
import { VehiclePurchase } from '@/hooks/useVehiclePurchases';
import { Euro } from 'lucide-react';

interface RecordPurchasePaymentDialogProps {
  purchase: VehiclePurchase;
}

const getPaymentTermsText = (days: number) => {
  if (days === 0) return 'Pay immediately';
  if (days === 7) return 'Pay within 1 week';
  if (days === 14) return 'Pay within 2 weeks';
  if (days === 30) return 'Pay within 1 month';
  if (days === 60) return 'Pay within 2 months';
  if (days === 90) return 'Pay within 3 months';
  return `Pay within ${days} days`;
};

export const RecordPurchasePaymentDialog = ({ purchase }: RecordPurchasePaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    payment_date: new Date().toISOString().split('T')[0],
    amount: purchase.outstanding_balance.toString(),
    payment_method: 'bank_transfer',
    reference_number: '',
    notes: '',
  });

  const recordPayment = useRecordPurchasePayment();
  const { data: payments } = usePurchasePayments(purchase.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    recordPayment.mutate({
      vehicle_purchase_id: purchase.id,
      payment_date: formData.payment_date,
      amount: parseFloat(formData.amount),
      payment_method: formData.payment_method || null,
      reference_number: formData.reference_number || null,
      notes: formData.notes || null,
    }, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          payment_date: new Date().toISOString().split('T')[0],
          amount: '',
          payment_method: 'bank_transfer',
          reference_number: '',
          notes: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Euro className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment to {purchase.seller_name}</DialogTitle>
        </DialogHeader>
        
        <div className="mb-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            <strong>Payment Terms:</strong> {getPaymentTermsText(purchase.payment_terms_days)} 
            (Due: {new Date(purchase.payment_due_date).toLocaleDateString()})
          </p>
        </div>
        
        <div className="mb-4 p-4 bg-muted rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Purchase Price:</span>
            <span className="font-semibold">€{purchase.purchase_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Amount Paid:</span>
            <span className="font-semibold">€{purchase.amount_paid.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="text-sm font-semibold">Outstanding Balance:</span>
            <span className="font-bold text-lg">€{purchase.outstanding_balance.toLocaleString()}</span>
          </div>
        </div>

        {payments && payments.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold mb-2">Payment History</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between text-sm p-2 bg-muted rounded">
                  <span>{new Date(payment.payment_date).toLocaleDateString()}</span>
                  <span className="font-semibold">€{payment.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_date">Payment Date *</Label>
              <Input
                id="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (€) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                max={purchase.outstanding_balance}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference_number">Reference Number</Label>
              <Input
                id="reference_number"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                placeholder="e.g., TXN123456"
              />
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={recordPayment.isPending}>
              {recordPayment.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
