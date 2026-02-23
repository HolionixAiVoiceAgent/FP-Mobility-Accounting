import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { generateExpenseExcelTemplate, validateExpenseCSV } from '@/utils/csvTemplates';

// Excel Template generator for inventory
const generateInventoryExcelTemplate = () => {
  const templateData = [
    {
      inventory_id: "INV2024001",
      vin: "WBA3A5G50FNS12345",
      make: "BMW",
      model: "320i",
      year: "2023",
      mileage: "25000",
      color: "Schwarz Metallic",
      purchase_price: "22000",
      expected_sale_price: "28500",
      status: "available",
      location: "Lot A-12",
      notes: "Excellent condition"
    },
    {
      inventory_id: "INV2024002",
      vin: "WAUZZZ8V5NA123456",
      make: "Audi",
      model: "A4",
      year: "2022",
      mileage: "45000",
      color: "Weiß",
      purchase_price: "28000",
      expected_sale_price: "35000",
      status: "available",
      location: "Lot B-05",
      notes: "Full service history"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Template");
  XLSX.writeFile(workbook, 'inventory_template.xlsx');
};

// Excel Template generator for vehicle sales
const generateVehicleSalesExcelTemplate = () => {
  const templateData = [
    {
      sale_id: "SALE-001",
      vehicle_make: "BMW",
      vehicle_model: "320i",
      vehicle_year: "2023",
      vin: "WBA3A5G50FNS12345",
      customer_id: "",
      purchase_price: "22000",
      sale_price: "28500",
      payment_status: "pending",
      payment_method: "bank_transfer",
      sale_date: "2024-01-15",
      notes: "Sold to new customer"
    },
    {
      sale_id: "SALE-002",
      vehicle_make: "Mercedes",
      vehicle_model: "C200",
      vehicle_year: "2022",
      vin: "WDD2050461F123456",
      customer_id: "",
      purchase_price: "26000",
      sale_price: "32000",
      payment_status: "paid",
      payment_method: "financing",
      sale_date: "2024-01-20",
      notes: "Financed through bank"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Template");
  XLSX.writeFile(workbook, 'vehicle_sales_template.xlsx');
};

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

    try {
      // Read Excel file using xlsx library
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (type === 'sales') {
            const importedCount = await importSales(jsonData);
            toast({
              title: "Success",
              description: `Imported ${importedCount} vehicle sales successfully!`,
            });
          } else if (type === 'inventory') {
            const importedCount = await importInventory(jsonData);
            toast({
              title: "Success",
              description: `Imported ${importedCount} inventory items successfully!`,
            });
          } else if (type === 'customers') {
            const importedCount = await importCustomers(jsonData);
            toast({
              title: "Success",
              description: `Imported ${importedCount} customers successfully!`,
            });
          } else if (type === 'expenses') {
            const validation = validateExpenseCSV(jsonData);
            if (!validation.valid) {
              throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            const importedCount = await importExpenses(jsonData);
            toast({
              title: "Success",
              description: `Imported ${importedCount} expenses successfully!`,
            });
          }

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
      };
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setImporting(false);
    }
  };

  const importInventory = async (data: any[]): Promise<number> => {
    // Helper function to get value from various column name formats
    const getField = (row: any, fieldName: string): any => {
      return row[fieldName] || 
             row[fieldName.toLowerCase()] || 
             row[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
             row[fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
    };

    // Validate required fields
    const validData = data.filter((row: any) => {
      const make = getField(row, 'make');
      const model = getField(row, 'model');
      return make && model && String(make).trim() !== '' && String(model).trim() !== '';
    });

    if (validData.length === 0) {
      const sampleRow = data[0];
      const columns = sampleRow ? Object.keys(sampleRow).join(', ') : 'none';
      throw new Error(`No valid inventory items found. Please ensure the Excel file has 'make' and 'model' columns. Available columns: ${columns}`);
    }

    // Check for duplicate inventory_ids and vins in the import data itself
    const inventoryIdSet = new Set();
    const vinSet = new Set();
    const duplicateInventoryIds = [];
    const duplicateVins = [];
    
    for (const row of validData) {
      const inventoryId = getField(row, 'inventory_id');
      const vin = getField(row, 'vin');
      
      if (inventoryId) {
        if (inventoryIdSet.has(String(inventoryId).trim())) {
          duplicateInventoryIds.push(inventoryId);
        }
        inventoryIdSet.add(String(inventoryId).trim());
      }
      
      if (vin) {
        if (vinSet.has(String(vin).trim())) {
          duplicateVins.push(vin);
        }
        vinSet.add(String(vin).trim());
      }
    }

    if (duplicateInventoryIds.length > 0) {
      throw new Error(`Duplicate inventory IDs found in import file: ${duplicateInventoryIds.join(', ')}. Please fix and try again.`);
    }

    if (duplicateVins.length > 0) {
      throw new Error(`Duplicate VINs found in import file: ${duplicateVins.join(', ')}. Please fix and try again.`);
    }

    // Check for existing inventory_ids and vins in database
    const allInventoryIds = Array.from(inventoryIdSet) as string[];
    const allVins = Array.from(vinSet) as string[];
    
    const existingItems: string[] = [];
    if (allInventoryIds.length > 0) {
      const { data: existingInv } = await supabase
        .from('inventory')
        .select('inventory_id')
        .in('inventory_id', allInventoryIds);
      existingItems.push(...(existingInv || []).map(i => i.inventory_id));
    }
    
    if (allVins.length > 0) {
      const { data: existingVin } = await supabase
        .from('inventory')
        .select('vin')
        .in('vin', allVins);
      existingItems.push(...(existingVin || []).map(i => i.vin));
    }

    const existingSet = new Set(existingItems);
    
    const existingInImport = validData.filter(row => {
      const inventoryId = getField(row, 'inventory_id');
      const vin = getField(row, 'vin');
      return (inventoryId && existingSet.has(String(inventoryId).trim())) || 
             (vin && existingSet.has(String(vin).trim()));
    });

    if (existingInImport.length > 0) {
      throw new Error(`The following inventory items already exist in the system (matching inventory_id or VIN): ${existingInImport.map(r => getField(r, 'inventory_id') || getField(r, 'vin')).join(', ')}. Please remove these records from the import file.`);
    }

    // Filter out items that already exist
    const dataToImport = validData.filter(row => {
      const inventoryId = getField(row, 'inventory_id');
      const vin = getField(row, 'vin');
      return (!inventoryId || !existingSet.has(String(inventoryId).trim())) && 
             (!vin || !existingSet.has(String(vin).trim()));
    });

    if (dataToImport.length === 0) {
      throw new Error("All inventory items in the import file already exist in the system.");
    }

    const BATCH_SIZE = 50;
    
    for (let i = 0; i < dataToImport.length; i += BATCH_SIZE) {
      const batch = dataToImport.slice(i, i + BATCH_SIZE);
      const vehicles = batch.map((row: any, index: number) => {
        // Get status with flexible column name
        let status = getField(row, 'status');
        // Normalize status to valid values
        if (status) {
          status = status.toLowerCase();
          const validStatuses = ['available', 'sold', 'pending_repair', 'reserved', 'in_transit'];
          if (!validStatuses.includes(status)) {
            status = 'available'; // Default to available if invalid
          }
        } else {
          status = 'available';
        }

        // Handle date fields
        let purchaseDate = getField(row, 'purchase_date');
        if (purchaseDate) {
          try {
            const dateObj = new Date(purchaseDate);
            if (!isNaN(dateObj.getTime())) {
              purchaseDate = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            purchaseDate = new Date().toISOString().split('T')[0];
          }
        } else {
          purchaseDate = new Date().toISOString().split('T')[0];
        }

        let tuvExpiry = getField(row, 'tuv_expiry');
        if (tuvExpiry) {
          try {
            const dateObj = new Date(tuvExpiry);
            if (!isNaN(dateObj.getTime())) {
              tuvExpiry = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            tuvExpiry = null;
          }
        }

        let lastServiceDate = getField(row, 'last_service_date');
        if (lastServiceDate) {
          try {
            const dateObj = new Date(lastServiceDate);
            if (!isNaN(dateObj.getTime())) {
              lastServiceDate = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            lastServiceDate = null;
          }
        }

        return {
          inventory_id: getField(row, 'inventory_id') || getField(row, 'inventoryId') || `INV-${Date.now()}-${i + index}`,
          vin: getField(row, 'vin') || null,
          make: String(getField(row, 'make')).trim(),
          model: String(getField(row, 'model')).trim(),
          year: parseInt(getField(row, 'year')) || new Date().getFullYear(),
          mileage: getField(row, 'mileage') ? parseInt(getField(row, 'mileage')) : null,
          color: getField(row, 'color') || null,
          purchase_price: parseFloat(getField(row, 'purchase_price')) || 0,
          expected_sale_price: getField(row, 'expected_sale_price') ? parseFloat(getField(row, 'expected_sale_price')) : null,
          status: status,
          location: getField(row, 'location') || null,
          tuv_expiry: tuvExpiry,
          last_service_date: lastServiceDate,
          purchase_date: purchaseDate,
          notes: getField(row, 'notes') || null,
        };
      });

      console.log('Inserting inventory batch:', JSON.stringify(vehicles, null, 2));

      const { error } = await supabase.from('inventory').insert(vehicles);
      if (error) {
        console.error('Insert error:', error);
        if (error.code === '23505') {
          if (error.message.includes('inventory_id')) {
            throw new Error(`Duplicate inventory ID found during import.`);
          }
          if (error.message.includes('vin')) {
            throw new Error(`Duplicate VIN found during import. One of the VINs already exists in inventory.`);
          }
        }
        if (error.code === '23514') {
          if (error.message.includes('status')) {
            throw new Error(`Invalid status value. Please use: available, sold, pending_repair, reserved, or in_transit.`);
          }
        }
        throw error;
      }
    }

    return dataToImport.length;
  };

const importCustomers = async (data: any[]): Promise<number> => {
    // Helper function to get value from various column name formats
    const getField = (row: any, fieldName: string): any => {
      return row[fieldName] || 
             row[fieldName.toLowerCase()] || 
             row[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
             row[fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
    };

    // Filter out rows without required name field
    const validData = data.filter((row: any) => {
      const name = getField(row, 'name');
      return name && String(name).trim() !== '';
    });

    if (validData.length === 0) {
      const sampleRow = data[0];
      const columns = sampleRow ? Object.keys(sampleRow).join(', ') : 'none';
      throw new Error(`No valid customers found. Please ensure the Excel file has a 'name' column. Available columns: ${columns}`);
    }

    // Check for duplicate customer_ids in the import data itself
    const customerIdSet = new Set();
    const duplicateCustomerIds = [];
    for (const row of validData) {
      const customerId = getField(row, 'customer_id');
      if (customerId && customerIdSet.has(String(customerId).trim())) {
        duplicateCustomerIds.push(customerId);
      }
      if (customerId) {
        customerIdSet.add(String(customerId).trim());
      }
    }

    if (duplicateCustomerIds.length > 0) {
      throw new Error(`Duplicate customer IDs found in import file: ${duplicateCustomerIds.join(', ')}. Please fix and try again.`);
    }

    // Check for existing customer_ids in database before importing
    const allCustomerIds = validData
      .map((row: any) => getField(row, 'customer_id'))
      .filter((id: any) => id);

    let existingCustomerIds: string[] = [];
    if (allCustomerIds.length > 0) {
      const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('customer_id')
        .in('customer_id', allCustomerIds);

      if (checkError) {
        throw new Error(`Failed to check existing customers: ${checkError.message}`);
      }

      existingCustomerIds = (existingCustomers || []).map(c => c.customer_id);
    }

    const existingCustomerIdSet = new Set(existingCustomerIds);
    const existingInImport = validData.filter(row => {
      const customerId = getField(row, 'customer_id');
      return customerId && existingCustomerIdSet.has(String(customerId).trim());
    });

    if (existingInImport.length > 0) {
      throw new Error(`The following customer IDs already exist in the system: ${existingInImport.map(r => getField(r, 'customer_id')).join(', ')}. Please remove these records from the import file.`);
    }

    // Filter out customers with IDs that already exist
    const dataToImport = validData.filter(row => {
      const customerId = getField(row, 'customer_id');
      return !customerId || !existingCustomerIdSet.has(String(customerId).trim());
    });

    if (dataToImport.length === 0) {
      throw new Error("All customers in the import file already exist in the system.");
    }

    const BATCH_SIZE = 50;
    
    for (let i = 0; i < dataToImport.length; i += BATCH_SIZE) {
      const batch = dataToImport.slice(i, i + BATCH_SIZE);
      const customers = batch.map((row: any, index: number) => {
        // Get customer type with flexible column name
        let customerType = getField(row, 'type');
        // Normalize type to valid values
        if (customerType) {
          customerType = customerType.toLowerCase();
          if (customerType !== 'individual' && customerType !== 'business') {
            customerType = 'individual'; // Default to individual if invalid
          }
        } else {
          customerType = 'individual';
        }

        // Get status with flexible column name
        let status = getField(row, 'status');
        // Normalize status to valid values
        if (status) {
          status = status.toLowerCase();
          if (status === 'pending_payment') {
            status = 'pending_payment';
          } else if (status === 'inactive') {
            status = 'inactive';
          } else {
            status = 'active'; // Default to active if invalid
          }
        } else {
          status = 'active';
        }

        // Handle date fields
        let customerSince = getField(row, 'customer_since') || getField(row, 'customerSince') || getField(row, 'customerSinceDate');
        if (customerSince) {
          try {
            const dateObj = new Date(customerSince);
            if (!isNaN(dateObj.getTime())) {
              customerSince = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            customerSince = new Date().toISOString().split('T')[0];
          }
        } else {
          customerSince = new Date().toISOString().split('T')[0];
        }

        let lastPurchase = getField(row, 'last_purchase') || getField(row, 'lastPurchase');
        if (lastPurchase) {
          try {
            const dateObj = new Date(lastPurchase);
            if (!isNaN(dateObj.getTime())) {
              lastPurchase = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            lastPurchase = null;
          }
        }

        return {
          customer_id: getField(row, 'customer_id') || getField(row, 'customerId') || `CUST-${Date.now()}-${i + index}`,
          type: customerType,
          name: String(getField(row, 'name')).trim(),
          email: getField(row, 'email') || null,
          phone: getField(row, 'phone') || null,
          address: getField(row, 'address') || null,
          status: status,
          customer_since: customerSince,
          last_purchase: lastPurchase,
        };
      });

      console.log('Inserting customers batch:', JSON.stringify(customers, null, 2));

      const { error } = await supabase.from('customers').insert(customers);
      if (error) {
        console.error('Insert error:', error);
        // Handle duplicate key error specifically
        if (error.code === '23505') {
          if (error.message.includes('customer_id')) {
            throw new Error(`Duplicate customer ID found during import. One of the customer IDs in the import file already exists.`);
          }
          if (error.message.includes('email')) {
            throw new Error(`Duplicate email found during import. Please ensure all emails are unique.`);
          }
        }
        // Handle check constraint violations
        if (error.code === '23514') {
          if (error.message.includes('type')) {
            throw new Error(`Invalid customer type. Please use 'individual' or 'business'.`);
          }
          if (error.message.includes('status')) {
            throw new Error(`Invalid status value. Please use 'active', 'pending_payment', or 'inactive'.`);
          }
        }
        throw error;
      }
    }

    // Return the number of imported records
    return dataToImport.length;
  };

  const importExpenses = async (data: any[]): Promise<number> => {
    // Helper function to get value from various column name formats
    const getField = (row: any, fieldName: string): any => {
      return row[fieldName] || 
             row[fieldName.toLowerCase()] || 
             row[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
             row[fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
    };

    // Validate required fields
    const validData = data.filter((row: any) => {
      const category = getField(row, 'category');
      const description = getField(row, 'description');
      const amount = getField(row, 'amount');
      return category && description && amount && String(category).trim() !== '' && String(description).trim() !== '';
    });

    if (validData.length === 0) {
      const sampleRow = data[0];
      const columns = sampleRow ? Object.keys(sampleRow).join(', ') : 'none';
      throw new Error(`No valid expenses found. Please ensure the Excel file has 'category', 'description', and 'amount' columns. Available columns: ${columns}`);
    }

    // Check for duplicate expense_ids in the import data itself
    const expenseIdSet = new Set();
    const duplicateExpenseIds = [];
    for (const row of validData) {
      const expenseId = getField(row, 'expense_id');
      if (expenseId) {
        if (expenseIdSet.has(String(expenseId).trim())) {
          duplicateExpenseIds.push(expenseId);
        }
        expenseIdSet.add(String(expenseId).trim());
      }
    }

    if (duplicateExpenseIds.length > 0) {
      throw new Error(`Duplicate expense IDs found in import file: ${duplicateExpenseIds.join(', ')}. Please fix and try again.`);
    }

    // Check for existing expense_ids in database before importing
    const allExpenseIds = Array.from(expenseIdSet) as string[];
    
    let existingExpenseIds: string[] = [];
    if (allExpenseIds.length > 0) {
      const { data: existingExpenses, error: checkError } = await supabase
        .from('expenses')
        .select('expense_id')
        .in('expense_id', allExpenseIds);

      if (checkError) {
        throw new Error(`Failed to check existing expenses: ${checkError.message}`);
      }

      existingExpenseIds = (existingExpenses || []).map(e => e.expense_id);
    }

    const existingExpenseIdSet = new Set(existingExpenseIds);
    const existingInImport = validData.filter(row => {
      const expenseId = getField(row, 'expense_id');
      return expenseId && existingExpenseIdSet.has(String(expenseId).trim());
    });

    if (existingInImport.length > 0) {
      throw new Error(`The following expense IDs already exist in the system: ${existingInImport.map(r => getField(r, 'expense_id')).join(', ')}. Please remove these records from the import file.`);
    }

    // Filter out expenses with IDs that already exist
    const dataToImport = validData.filter(row => {
      const expenseId = getField(row, 'expense_id');
      return !expenseId || !existingExpenseIdSet.has(String(expenseId).trim());
    });

    if (dataToImport.length === 0) {
      throw new Error("All expenses in the import file already exist in the system.");
    }

    const BATCH_SIZE = 50;
    
    for (let i = 0; i < dataToImport.length; i += BATCH_SIZE) {
      const batch = dataToImport.slice(i, i + BATCH_SIZE);
      const expenses = batch.map((row: any, index: number) => {
        // Handle date field
        let date = getField(row, 'date');
        if (date) {
          try {
            const dateObj = new Date(date);
            if (!isNaN(dateObj.getTime())) {
              date = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            date = new Date().toISOString().split('T')[0];
          }
        } else {
          date = new Date().toISOString().split('T')[0];
        }

        // Handle tax_deductible field - accept various formats
        let taxDeductible = getField(row, 'tax_deductible');
        if (taxDeductible !== undefined && taxDeductible !== null) {
          if (typeof taxDeductible === 'boolean') {
            taxDeductible = taxDeductible;
          } else if (typeof taxDeductible === 'string') {
            taxDeductible = taxDeductible.toLowerCase() === 'true' || taxDeductible === '1' || taxDeductible === 'yes';
          } else {
            taxDeductible = true; // Default to true
          }
        } else {
          taxDeductible = true;
        }

        return {
          expense_id: getField(row, 'expense_id') || getField(row, 'expenseId') || `EXP-${Date.now()}-${i + index}`,
          category: String(getField(row, 'category')).trim(),
          description: String(getField(row, 'description')).trim(),
          amount: parseFloat(getField(row, 'amount')) || 0,
          date: date,
          vendor: getField(row, 'vendor') || null,
          receipt_url: getField(row, 'receipt_url') || getField(row, 'receiptUrl') || null,
          tax_deductible: taxDeductible,
        };
      });

      console.log('Inserting expenses batch:', JSON.stringify(expenses, null, 2));

      const { error } = await supabase.from('expenses').insert(expenses);
      if (error) {
        console.error('Insert error:', error);
        if (error.code === '23505') {
          if (error.message.includes('expense_id')) {
            throw new Error(`Duplicate expense ID found during import. One of the expense IDs in the import file already exists.`);
          }
        }
        // Handle check constraint violations
        if (error.code === '23514') {
          if (error.message.includes('category')) {
            throw new Error(`Invalid category value.`);
          }
        }
        throw error;
      }
    }

    return dataToImport.length;
  };

  const importSales = async (data: any[]): Promise<number> => {
    // Debug: Log first row to see actual column names
    console.log('First row of import data:', JSON.stringify(data[0], null, 2));
    
    // Helper function to get value from various column name formats
    const getField = (row: any, fieldName: string): any => {
      // Check exact match, lowercase, uppercase, etc.
      return row[fieldName] || 
             row[fieldName.toLowerCase()] || 
             row[fieldName.charAt(0).toUpperCase() + fieldName.slice(1)] ||
             row[fieldName.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())];
    };

    // Helper function to get VIN from various column name formats
    const getVin = (row: any): string | undefined => {
      // Check various possible column names for VIN
      return row.vin || row.VIN || row.Vin || row['VIN'] || 
             row.vin_number || row.VIN_NUMBER || row['Vehicle Identification Number'] ||
             row.vehicle_vin || row.VehicleVIN || undefined;
    };

    // Validate VINs before import - be more flexible with column names
    const validData = data.filter((row: any) => {
      const vin = getVin(row);
      if (!vin || String(vin).trim() === '') {
        console.warn('Skipping row with empty VIN:', row);
        return false;
      }
      return true;
    });

    if (validData.length === 0) {
      // Show the actual column names for debugging
      const sampleRow = data[0];
      const columns = sampleRow ? Object.keys(sampleRow).join(', ') : 'none';
      throw new Error(`No valid sales found. Please ensure the Excel file has a 'vin' column with VIN numbers. Available columns: ${columns}`);
    }

    // Check for duplicate VINs in the import data itself
    const vinSet = new Set();
    const duplicateVINs = [];
    for (const row of validData) {
      const vin = String(getVin(row)).trim();
      if (vinSet.has(vin)) {
        duplicateVINs.push(vin);
      }
      vinSet.add(vin);
    }

    if (duplicateVINs.length > 0) {
      throw new Error(`Duplicate VINs found in import file: ${duplicateVINs.join(', ')}. Please fix and try again.`);
    }

    // Check for existing VINs in database before importing
    const allVins = validData.map((row: any) => String(getVin(row)).trim());
    const { data: existingSales, error: checkError } = await supabase
      .from('vehicle_sales')
      .select('vin')
      .in('vin', allVins);

    if (checkError) {
      throw new Error(`Failed to check existing sales: ${checkError.message}`);
    }

    const existingVinSet = new Set((existingSales || []).map(s => s.vin));
    const existingVinsInImport = validData.filter(row => existingVinSet.has(String(getVin(row)).trim()));

    if (existingVinsInImport.length > 0) {
      throw new Error(`The following VINs already exist in the system: ${existingVinsInImport.map(r => getVin(r)).join(', ')}. Please remove these records from the import file.`);
    }

    // Filter out sales with VINs that already exist
    const dataToImport = validData.filter(row => !existingVinSet.has(String(getVin(row)).trim()));

    if (dataToImport.length === 0) {
      throw new Error("All sales in the import file already exist in the system.");
    }

    const BATCH_SIZE = 50;
    
    for (let i = 0; i < dataToImport.length; i += BATCH_SIZE) {
      const batch = dataToImport.slice(i, i + BATCH_SIZE);
      const sales = batch.map((row: any, index: number) => {
        const purchasePrice = parseFloat(row.purchase_price) || parseFloat(row.purchasePrice) || 0;
        const salePrice = parseFloat(row.sale_price) || parseFloat(row.salePrice) || 0;
        
        // Get vehicle make and model with flexible column names
        const vehicleMake = getField(row, 'vehicle_make') || getField(row, 'make') || getField(row, 'Make') || 'Unknown';
        const vehicleModel = getField(row, 'vehicle_model') || getField(row, 'model') || getField(row, 'Model') || 'Unknown';
        const vehicleYear = parseInt(row.vehicle_year || row.vehicleYear || row.Year || row.year) || new Date().getFullYear();
        const customerId = getField(row, 'customer_id') || getField(row, 'customerId') || null;
        
        // Map payment status to valid values
        let paymentStatus = row.payment_status || row.paymentStatus || row.payment || 'pending';
        // Normalize payment status to valid values
        if (paymentStatus.toLowerCase() === 'completed' || paymentStatus.toLowerCase() === 'paid') {
          paymentStatus = 'paid';
        } else if (paymentStatus.toLowerCase() === 'partial') {
          paymentStatus = 'partial';
        } else {
          paymentStatus = 'pending';
        }
        
        const paymentMethod = row.payment_method || row.paymentMethod || row.method || null;
        
        // Handle date format - ensure it's in YYYY-MM-DD format
        let saleDate = row.sale_date || row.saleDate || row.date;
        if (saleDate) {
          // Try to parse and format the date
          try {
            const dateObj = new Date(saleDate);
            if (!isNaN(dateObj.getTime())) {
              saleDate = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            saleDate = new Date().toISOString().split('T')[0];
          }
        } else {
          saleDate = new Date().toISOString().split('T')[0];
        }
        
        return {
          sale_id: row.sale_id || row.saleId || `SALE-${Date.now()}-${i + index}`,
          vehicle_make: String(vehicleMake).trim(),
          vehicle_model: String(vehicleModel).trim(),
          vehicle_year: vehicleYear,
          vin: String(getVin(row)).trim(),
          customer_id: customerId,
          purchase_price: purchasePrice,
          sale_price: salePrice,
          profit: salePrice - purchasePrice,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          sale_date: saleDate,
          notes: row.notes || null,
        };
      });

      console.log('Inserting sales batch:', JSON.stringify(sales, null, 2));

      const { error } = await supabase.from('vehicle_sales').insert(sales);
      if (error) {
        console.error('Insert error:', error);
        // Handle duplicate key error specifically
        if (error.code === '23505') {
          if (error.message.includes('vin')) {
            throw new Error(`Duplicate VIN found during import. One of the VINs in the import file already exists.`);
          }
          if (error.message.includes('sale_id')) {
            throw new Error(`Duplicate Sale ID found during import. Please ensure all sale IDs are unique.`);
          }
        }
        // Handle check constraint violations
        if (error.code === '23514') {
          if (error.message.includes('payment_status')) {
            throw new Error(`Invalid payment status value. Please use 'paid', 'pending', or 'partial'.`);
          }
        }
        throw error;
      }
    }

    // Update inventory status for imported sales
    for (const row of dataToImport) {
      const vin = String(getVin(row)).trim();
      // Find inventory item by VIN and update status to sold
      const { data: inventoryItem } = await supabase
        .from('inventory')
        .select('id')
        .eq('vin', vin)
        .single();

      if (inventoryItem) {
        await supabase
          .from('inventory')
          .update({ 
            status: 'sold', 
            sale_date: row.sale_date || new Date().toISOString().split('T')[0],
            actual_sale_price: parseFloat(row.sale_price) || 0
          })
          .eq('id', inventoryItem.id);
      }
    }

    // Return the number of imported records
    return dataToImport.length;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import {type.charAt(0).toUpperCase() + type.slice(1)}</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import {type}. Make sure your Excel has the required columns.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {(type === 'expenses' || type === 'inventory' || type === 'sales') && (
            <Button
              variant="outline"
              onClick={type === 'inventory' ? generateInventoryExcelTemplate : type === 'sales' ? generateVehicleSalesExcelTemplate : generateExpenseExcelTemplate}
              className="w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel Template
            </Button>
          )}
          <div className="space-y-2">
            <Label htmlFor="file">Excel File</Label>
             <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
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
