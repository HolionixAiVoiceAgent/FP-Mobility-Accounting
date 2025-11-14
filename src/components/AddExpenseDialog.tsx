import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useInventory } from '@/hooks/useInventory';
import { useQueryClient } from '@tanstack/react-query';
import { ReceiptUpload } from '@/components/ReceiptUpload';

export function AddExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    expense_id: '',
    category: '',
    description: '',
    amount: '',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    tax_deductible: true,
    vehicle_id: '',
    receipt_url: null as string | null,
    payment_type: 'account' as 'account' | 'cash',
    employee_id: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: vehicles = [] } = useInventory();
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        expense_id: formData.expense_id || `EXP-${Date.now()}`,
        category: formData.category,
        description: formData.description,
        amount: parseFloat(formData.amount),
        vendor: formData.vendor || null,
        date: formData.date,
        tax_deductible: formData.tax_deductible,
        vehicle_id: formData.vehicle_id && formData.vehicle_id !== 'none' ? formData.vehicle_id : null,
        receipt_url: formData.receipt_url || null,
        payment_type: formData.payment_type,
        employee_id: formData.payment_type === 'cash' && formData.employee_id && formData.employee_id !== '__none__' ? formData.employee_id : null
      };

      console.log('Submitting expense:', expenseData);

      const { error } = await supabase
        .from('expenses')
        .insert([expenseData]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-stats'] });

      toast({
        title: "Expense Added",
        description: "The expense has been successfully added.",
      });

      setFormData({
        expense_id: '',
        category: '',
        description: '',
        amount: '',
        vendor: '',
        date: new Date().toISOString().split('T')[0],
        tax_deductible: true,
        vehicle_id: '',
        receipt_url: null,
        payment_type: 'account',
        employee_id: ''
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Fetch employees for cash assignment (if employees table exists)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // cast to any because the generated supabase client may not include an employees table in types
        const { data } = await (supabase as any).from('employees').select('id,full_name');
        if (mounted && data) setEmployees(data as any);
      } catch (e) {
        // ignore - employees table may not exist yet in some deployments
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expense_id">Expense ID</Label>
              <Input
                id="expense_id"
                value={formData.expense_id}
                onChange={(e) => setFormData({...formData, expense_id: e.target.value})}
                placeholder="Auto-generated if empty"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Office Rent">Office Rent</SelectItem>
                  <SelectItem value="Vehicle Insurance">Vehicle Insurance</SelectItem>
                  <SelectItem value="Staff Salaries">Staff Salaries</SelectItem>
                  <SelectItem value="Fuel & Utilities">Fuel & Utilities</SelectItem>
                  <SelectItem value="Parts & Supplies">Parts & Supplies</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Repairs & Maintenance">Repairs & Maintenance</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_type">Payment Type</Label>
              <Select value={formData.payment_type} onValueChange={(value) => setFormData({...formData, payment_type: value as 'account' | 'cash'})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Account / Bank</SelectItem>
                  <SelectItem value="cash">Cash (Employee Advance)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Employee (when Cash)</Label>
              <Select value={formData.employee_id} onValueChange={(value) => setFormData({...formData, employee_id: value === '__none__' ? '' : value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select employee (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle (Optional)</Label>
            <Select value={formData.vehicle_id} onValueChange={(value) => setFormData({...formData, vehicle_id: value === 'none' ? '' : value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle if applicable" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.make} {vehicle.model} ({vehicle.year}) - VIN: {vehicle.vin.slice(-6)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input
              id="vendor"
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              placeholder="Enter vendor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Enter expense description"
            />
          </div>

          <div className="space-y-2">
            <Label>Receipt (Optional)</Label>
            <ReceiptUpload
              receiptUrl={formData.receipt_url}
              onUploadComplete={(url) => setFormData({ ...formData, receipt_url: url })}
              onDelete={() => setFormData({ ...formData, receipt_url: null })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.category}>Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}