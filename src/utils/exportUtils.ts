import { InventoryItem } from '@/hooks/useInventory';
import { VehicleSale } from '@/hooks/useVehicleSales';
import { Customer } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';

export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportInventoryToCSV = (inventory: InventoryItem[]) => {
  const exportData = inventory.map(item => ({
    Date: item.purchase_date,
    'Inventory ID': item.inventory_id,
    'VIN Number': item.vin,
    Make: item.make,
    Model: item.model,
    Year: item.year,
    Color: item.color || '',
    Mileage: item.mileage || '',
    'Purchase Price': item.purchase_price,
    'Expected Price': item.expected_sale_price || '',
    Status: item.status,
    Notes: item.notes || ''
  }));

  exportToCSV(exportData, `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportExpensesToCSV = async (expenses: any[]) => {
  // Fetch vehicle data to map vehicle_id to vehicle details
  const { data: vehicles } = await supabase
    .from('inventory')
    .select('id, make, model, year, vin');

  const vehicleMap = new Map(
    vehicles?.map(v => [v.id, `${v.year} ${v.make} ${v.model} (VIN: ${v.vin})`]) || []
  );

  const exportData = expenses.map(expense => ({
    Date: expense.date,
    'Expense ID': expense.expense_id,
    Amount: Number(expense.amount).toFixed(2),
    Description: expense.description,
    Vehicle: expense.vehicle_id ? (vehicleMap.get(expense.vehicle_id) || 'N/A') : 'N/A',
    Category: expense.category,
    Vendor: expense.vendor || 'N/A',
    Receipt: expense.receipt_url || 'No receipt',
    'Tax Deductible': expense.tax_deductible ? 'Yes' : 'No'
  }));

  exportToCSV(exportData, `expenses_export_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportVehicleSalesToCSV = (sales: VehicleSale[]) => {
  const exportData = sales.map(sale => ({
    sale_id: sale.sale_id,
    vehicle_make: sale.vehicle_make,
    vehicle_model: sale.vehicle_model,
    vehicle_year: sale.vehicle_year,
    vin: sale.vin,
    purchase_price: sale.purchase_price,
    sale_price: sale.sale_price,
    profit: sale.profit || 0,
    payment_status: sale.payment_status,
    payment_method: sale.payment_method || '',
    sale_date: sale.sale_date,
    notes: sale.notes || ''
  }));

  exportToCSV(exportData, `vehicle_sales_export_${new Date().toISOString().split('T')[0]}.csv`);
};

export const exportCustomersToCSV = (customers: Customer[]) => {
  const exportData = customers.map(customer => ({
    customer_id: customer.customer_id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    type: customer.type,
    status: customer.status,
    total_purchases: customer.total_purchases,
    vehicles_purchased: customer.vehicles_purchased,
    outstanding_balance: customer.outstanding_balance,
    customer_since: customer.customer_since,
    last_purchase: customer.last_purchase || ''
  }));

  exportToCSV(exportData, `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
};