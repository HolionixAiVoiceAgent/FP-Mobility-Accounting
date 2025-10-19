import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';
import { generateQuotationPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';
import type { InventoryItem } from '@/hooks/useInventory';

interface QuotationDialogProps {
  vehicle: InventoryItem;
  trigger?: React.ReactNode;
}

export function QuotationDialog({ vehicle, trigger }: QuotationDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    quotedPrice: vehicle.expected_sale_price?.toString() || '',
    validityDays: '14',
    notes: '',
    includeVat: true
  });

  const handleGenerate = async () => {
    try {
      await generateQuotationPDF({
        vehicle: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          vin: vehicle.vin,
          mileage: vehicle.mileage || undefined,
          color: vehicle.color || undefined
        },
        quotedPrice: parseFloat(formData.quotedPrice),
        validityDays: parseInt(formData.validityDays),
        notes: formData.notes,
        includeVat: formData.includeVat
      });

      toast({
        title: "Quotation generated successfully",
        description: "The PDF has been downloaded",
      });

      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to generate quotation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Quotation
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Quotation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Vehicle</Label>
            <p className="text-sm text-muted-foreground">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>

          <div>
            <Label htmlFor="quotedPrice">Quoted Price (€)</Label>
            <Input
              id="quotedPrice"
              type="number"
              value={formData.quotedPrice}
              onChange={(e) => setFormData({ ...formData, quotedPrice: e.target.value })}
              placeholder="Enter quoted price"
            />
          </div>

          <div>
            <Label htmlFor="validityDays">Valid for (days)</Label>
            <Input
              id="validityDays"
              type="number"
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
              placeholder="14"
            />
          </div>

          <div>
            <Label htmlFor="notes">Special Terms / Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any special terms or conditions..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeVat"
              checked={formData.includeVat}
              onChange={(e) => setFormData({ ...formData, includeVat: e.target.checked })}
              className="h-4 w-4"
            />
            <Label htmlFor="includeVat" className="cursor-pointer">Include VAT (19%)</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">
              Generate & Download
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
