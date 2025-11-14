import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCashAdvances } from '@/hooks/useCashAdvances';
import { supabase } from '@/integrations/supabase/client';

export function AddCashAdvanceDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ employee_id: '', advance_amount: '', advance_date: new Date().toISOString().split('T')[0], notes: '' });
  const { toast } = useToast();
  const cashAdvances = useCashAdvances();
  const [employees, setEmployees] = useState<Array<{ id: string; full_name: string }>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await (supabase as any).from('employees').select('id, full_name');
        if (mounted && data) setEmployees(data as any);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await cashAdvances.create.mutateAsync({
        employee_id: form.employee_id || null,
        advance_amount: parseFloat(form.advance_amount),
        advance_date: form.advance_date,
        notes: form.notes || null
      });
      toast({ title: 'Advance recorded', description: 'Cash advance saved.' });
      setForm({ employee_id: '', advance_amount: '', advance_date: new Date().toISOString().split('T')[0], notes: '' });
      setOpen(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save advance', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">
          <Plus className="h-4 w-4 mr-2" />
          Add Advance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Cash Advance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v === '__unassigned__' ? '' : v })}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__unassigned__">— Unassigned —</SelectItem>
                {employees.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount (€)</Label>
            <Input type="number" step="0.01" value={form.advance_amount} onChange={(e) => setForm({ ...form, advance_amount: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={form.advance_date} onChange={(e) => setForm({ ...form, advance_date: e.target.value })} required />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
