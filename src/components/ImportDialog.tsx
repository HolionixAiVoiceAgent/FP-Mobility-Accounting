import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download } from "lucide-react";
import Papa from 'papaparse';
import { supabase } from "@/integrations/supabase/client";
import { generateExpenseCSVTemplate, validateExpenseCSV } from '@/utils/csvTemplates';

interface ImportDialogProps {
  type: 'inventory' | 'customers' | 'expenses' | 'sales';
  onImportComplete: () => void;
}

export function ImportDialog({ type, onImportComplete }: ImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setImporting(true);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          if (type === 'inventory') {
            await importInventory(results.data);
          } else if (type === 'customers') {
            await importCustomers(results.data);
          } else if (type === 'expenses') {
            const validation = validateExpenseCSV(results.data);
            if (!validation.valid) {
              throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            await importExpenses(results.data);
          } else if (type === 'sales') {
            await importSales(results.data);
          }

          toast({
            title: "Success",
            description: `Imported ${results.data.length} ${type} successfully!`,
          });

          setOpen(false);
          setFile(null);
          onImportComplete();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } finally {
          setImporting(false);
        }
      },
      error: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        setImporting(false);
      },
    });
  };

  const importInventory = async (data: any[]) => {
    const vehicles = data.map((row: any) => ({
      inventory_id: row.inventory_id || `INV-${Date.now()}`,
      vin: row.vin,
      make: row.make,
      model: row.model,
      year: parseInt(row.year),
      mileage: row.mileage ? parseInt(row.mileage) : null,
      color: row.color || null,
      purchase_price: parseFloat(row.purchase_price),
      expected_sale_price: row.expected_sale_price ? parseFloat(row.expected_sale_price) : null,
      status: row.status || 'available',
      location: row.location || null,
      notes: row.notes || null,
    }));

    const { error } = await supabase.from('inventory').insert(vehicles);
    if (error) throw error;
  };

  const importCustomers = async (data: any[]) => {
    const customers = data.map((row: any) => ({
      customer_id: row.customer_id || `CUST-${Date.now()}`,
      type: row.type || 'individual',
      name: row.name,
      email: row.email,
      phone: row.phone,
      address: row.address || null,
      status: row.status || 'active',
    }));

    const { error } = await supabase.from('customers').insert(customers);
    if (error) throw error;
  };

  const importExpenses = async (data: any[]) => {
    const expenses = data.map((row: any) => ({
      expense_id: row.expense_id || `EXP-${Date.now()}`,
      category: row.category,
      description: row.description,
      amount: parseFloat(row.amount),
      vendor: row.vendor || null,
      date: row.date,
      tax_deductible: row.tax_deductible === 'true' || row.tax_deductible === true,
    }));

    const { error } = await supabase.from('expenses').insert(expenses);
    if (error) throw error;
  };

  const importSales = async (data: any[]) => {
    const sales = data.map((row: any) => {
      const purchasePrice = parseFloat(row.purchase_price);
      const salePrice = parseFloat(row.sale_price);
      
      return {
        sale_id: row.sale_id || `SALE-${Date.now()}`,
        vehicle_make: row.vehicle_make,
        vehicle_model: row.vehicle_model,
        vehicle_year: parseInt(row.vehicle_year),
        vin: row.vin,
        customer_id: row.customer_id || null,
        purchase_price: purchasePrice,
        sale_price: salePrice,
        profit: salePrice - purchasePrice,
        payment_status: row.payment_status || 'pending',
        payment_method: row.payment_method || null,
        sale_date: row.sale_date,
        notes: row.notes || null,
      };
    });

    const { error } = await supabase.from('vehicle_sales').insert(sales);
    if (error) throw error;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import {type}. Make sure your CSV has the required columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {type === 'expenses' && (
            <Button
              variant="outline"
              onClick={generateExpenseCSVTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
          )}
          <div className="space-y-2">
            <Label htmlFor="file">CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>
          <Button
            onClick={handleImport}
            disabled={!file || importing}
            className="w-full"
          >
            {importing ? "Importing..." : "Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
