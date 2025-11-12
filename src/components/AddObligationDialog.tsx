import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useFinancialObligations } from "@/hooks/useFinancialObligations";

export const AddObligationDialog = () => {
  const [open, setOpen] = useState(false);
  const { addObligation } = useFinancialObligations();

  const [formData, setFormData] = useState({
    obligation_type: "investor" as "investor" | "bank_loan",
    creditor_name: "",
    principal_amount: "",
    interest_rate: "",
    start_date: "",
    due_date: "",
    monthly_payment: "",
    outstanding_balance: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addObligation.mutate(
      {
        obligation_type: formData.obligation_type,
        creditor_name: formData.creditor_name,
        principal_amount: Number(formData.principal_amount),
        interest_rate: formData.interest_rate ? Number(formData.interest_rate) : null,
        start_date: formData.start_date,
        due_date: formData.due_date || null,
        monthly_payment: formData.monthly_payment ? Number(formData.monthly_payment) : null,
        outstanding_balance: Number(formData.outstanding_balance),
        status: "active",
        notes: formData.notes || null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setFormData({
            obligation_type: "investor",
            creditor_name: "",
            principal_amount: "",
            interest_rate: "",
            start_date: "",
            due_date: "",
            monthly_payment: "",
            outstanding_balance: "",
            notes: "",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Obligation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Financial Obligation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.obligation_type}
                onValueChange={(value: "investor" | "bank_loan") =>
                  setFormData({ ...formData, obligation_type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="bank_loan">Bank Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditor">Creditor Name *</Label>
              <Input
                id="creditor"
                value={formData.creditor_name}
                onChange={(e) => setFormData({ ...formData, creditor_name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="principal">Principal Amount (€) *</Label>
              <Input
                id="principal"
                type="number"
                step="0.01"
                value={formData.principal_amount}
                onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="outstanding">Outstanding Balance (€) *</Label>
              <Input
                id="outstanding"
                type="number"
                step="0.01"
                value={formData.outstanding_balance}
                onChange={(e) => setFormData({ ...formData, outstanding_balance: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interest">Interest Rate (%)</Label>
              <Input
                id="interest"
                type="number"
                step="0.01"
                value={formData.interest_rate}
                onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly">Monthly Payment (€)</Label>
              <Input
                id="monthly"
                type="number"
                step="0.01"
                value={formData.monthly_payment}
                onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start">Start Date *</Label>
              <Input
                id="start"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due">Due Date</Label>
              <Input
                id="due"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={addObligation.isPending}>
              {addObligation.isPending ? "Adding..." : "Add Obligation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
