import { InventoryItem } from '@/hooks/useInventory';
import { VehicleSale } from '@/hooks/useVehicleSales';
import { Customer } from '@/hooks/useCustomers';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

/**
 * Helper function to format cell values for Excel
 */
const formatCellValue = (value: any): any => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' && value.includes(',')) {
    return value; // Let Excel handle string values
  }
  return value;
};

/**
 * Helper function to create a formatted Excel sheet from data array
 */
const createExcelSheet = (data: any[], worksheetTitle: string): XLSX.WorkSheet => {
  if (data.length === 0) {
    const ws = XLSX.utils.aoa_to_sheet([['No data available']]);
    return ws;
  }

  const headers = Object.keys(data[0]);
  const aoa: any[][] = [headers];

  data.forEach(row => {
    const rowData: any[] = [];
    headers.forEach(header => {
      const value = row[header];
      // Format currency values properly
      if (header.toLowerCase().includes('price') || 
          header.toLowerCase().includes('amount') || 
          header.toLowerCase().includes('profit') ||
          header.toLowerCase().includes('balance') ||
          header.toLowerCase().includes('revenue') ||
          header.toLowerCase().includes('expense') ||
          header.toLowerCase().includes('total') ||
          header.toLowerCase().includes('paid') ||
          header.toLowerCase().includes('outstanding') ||
          header.toLowerCase().includes('purchase') ||
          header.toLowerCase().includes('sales') ||
          header.toLowerCase().includes('purchases')) {
        rowData.push(typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, '')) || 0);
      } else {
        rowData.push(formatCellValue(value));
      }
    });
    aoa.push(rowData);
  });

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  
  // Set column widths
  const colWidths = headers.map((header, i) => {
    const maxLength = Math.max(
      header.length,
      ...data.map(row => {
        const value = row[header];
        return value ? String(value).length : 0;
      })
    );
    return { wch: Math.min(maxLength + 2, 30) };
  });
  ws['!cols'] = colWidths;

  return ws;
};

/**
 * Create Excel workbook and trigger download
 */
const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Generic export to Excel - replaces old CSV export
 */
export const exportToExcel = (data: any[], filename: string) => {
  if (data.length === 0) return;

  const workbook = XLSX.utils.book_new();
  const ws = createExcelSheet(data, 'Data');
  XLSX.utils.book_append_sheet(workbook, ws, 'Data');
  
  downloadExcel(workbook, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
};

/**
 * Export inventory to Excel format
 */
export const exportInventoryToExcel = (inventory: InventoryItem[]) => {
  const exportData = inventory.map(item => ({
    'Date': item.purchase_date,
    'Inventory ID': item.inventory_id,
    'VIN Number': item.vin,
    'Make': item.make,
    'Model': item.model,
    'Year': item.year,
    'Color': item.color || '',
    'Mileage': item.mileage || '',
    'Purchase Price (€)': item.purchase_price,
    'Expected Price (€)': item.expected_sale_price || '',
    'Status': item.status,
    'Notes': item.notes || ''
  }));

  const workbook = XLSX.utils.book_new();
  const ws = createExcelSheet(exportData, 'Inventory');
  XLSX.utils.book_append_sheet(workbook, ws, 'Inventory');
  
  downloadExcel(workbook, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export expenses to Excel format
 */
export const exportExpensesToExcel = async (expenses: any[]) => {
  // Fetch vehicle data to map vehicle_id to vehicle details
  const { data: vehicles } = await supabase
    .from('inventory')
    .select('id, make, model, year, vin');

  // Fetch employees to map employee_id to name
  const { data: employees } = await (supabase as any)
    .from('employees')
    .select('id, full_name');

  const employeeMap = new Map(
    employees?.map((e: any) => [e.id, e.full_name]) || []
  );

  const vehicleMap = new Map(
    vehicles?.map(v => [v.id, `${v.year} ${v.make} ${v.model} (VIN: ${v.vin})`]) || []
  );

  const exportData = expenses.map(expense => ({
    'Date': expense.date,
    'Expense ID': expense.expense_id,
    'Amount (€)': Number(expense.amount).toFixed(2),
    'Description': expense.description,
    'Vehicle': expense.vehicle_id ? (vehicleMap.get(expense.vehicle_id) || 'N/A') : 'N/A',
    'Category': expense.category,
    'Vendor': expense.vendor || 'N/A',
    'Payment Type': expense.payment_type || 'account',
    'Employee': expense.employee_id ? (employeeMap.get(expense.employee_id) || expense.employee_id) : '',
    'Tax Deductible': expense.tax_deductible ? 'Yes' : 'No'
  }));

  const workbook = XLSX.utils.book_new();
  const ws = createExcelSheet(exportData, 'Expenses');
  XLSX.utils.book_append_sheet(workbook, ws, 'Expenses');
  
  downloadExcel(workbook, `expenses_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export vehicle sales to Excel format
 */
export const exportVehicleSalesToExcel = (sales: VehicleSale[]) => {
  const exportData = sales.map(sale => ({
    'Sale ID': sale.sale_id,
    'Vehicle': `${sale.vehicle_year} ${sale.vehicle_make} ${sale.vehicle_model}`,
    'VIN': sale.vin,
    'Purchase Price (€)': sale.purchase_price,
    'Sale Price (€)': sale.sale_price,
    'Profit (€)': sale.profit || 0,
    'Payment Status': sale.payment_status,
    'Payment Method': sale.payment_method || '',
    'Sale Date': sale.sale_date,
    'Notes': sale.notes || ''
  }));

  const workbook = XLSX.utils.book_new();
  const ws = createExcelSheet(exportData, 'Vehicle Sales');
  XLSX.utils.book_append_sheet(workbook, ws, 'Vehicle Sales');
  
  downloadExcel(workbook, `vehicle_sales_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export customers to Excel format
 */
export const exportCustomersToExcel = (customers: Customer[]) => {
  const exportData = customers.map(customer => ({
    'Customer ID': customer.customer_id,
    'Name': customer.name,
    'Email': customer.email,
    'Phone': customer.phone,
    'Address': customer.address,
    'Type': customer.type,
    'Status': customer.status,
    'Total Purchases (€)': customer.total_purchases,
    'Vehicles Purchased': customer.vehicles_purchased,
    'Outstanding Balance (€)': customer.outstanding_balance,
    'Customer Since': customer.customer_since,
    'Last Purchase': customer.last_purchase || ''
  }));

  const workbook = XLSX.utils.book_new();
  const ws = createExcelSheet(exportData, 'Customers');
  XLSX.utils.book_append_sheet(workbook, ws, 'Customers');
  
  downloadExcel(workbook, `customers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Export vehicle purchases to Excel format
 */
export const exportVehiclePurchasesToExcel = (purchases: any[]) => {
  const exportData = purchases.map(purchase => ({
    'Purchase Date': new Date(purchase.purchase_date).toLocaleDateString(),
    'Seller Name': purchase.seller_name,
    'Seller Type': purchase.seller_type,
    'Purchase Price (€)': purchase.purchase_price,
    'Amount Paid (€)': purchase.amount_paid,
    'Outstanding Balance (€)': purchase.outstanding_balance,
    'Payment Status': purchase.payment_status,
    'Due Date': new Date(purchase.payment_due_date).toLocaleDateString(),
    'Payment Terms (Days)': purchase.payment_terms_days,
    'Notes': purchase.notes || ''
  }));

  const workbook = XLSX.utils.book_new();
  const ws = createExcelSheet(exportData, 'Vehicle Purchases');
  XLSX.utils.book_append_sheet(workbook, ws, 'Vehicle Purchases');
  
  downloadExcel(workbook, `vehicle_purchases_export_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Legacy CSV functions (kept for backward compatibility but marked as deprecated)
export const exportToCSV = (data: any[], filename: string) => {
  console.warn('exportToCSV is deprecated, please use exportToExcel instead');
  exportToExcel(data, filename.replace('.csv', '.xlsx'));
};

export const exportInventoryToCSV = (inventory: InventoryItem[]) => {
  console.warn('exportInventoryToCSV is deprecated, please use exportInventoryToExcel instead');
  exportInventoryToExcel(inventory);
};

export const exportExpensesToCSV = async (expenses: any[]) => {
  console.warn('exportExpensesToCSV is deprecated, please use exportExpensesToExcel instead');
  await exportExpensesToExcel(expenses);
};

export const exportVehicleSalesToCSV = (sales: VehicleSale[]) => {
  console.warn('exportVehicleSalesToCSV is deprecated, please use exportVehicleSalesToExcel instead');
  exportVehicleSalesToExcel(sales);
};

export const exportCustomersToCSV = (customers: Customer[]) => {
  console.warn('exportCustomersToCSV is deprecated, please use exportCustomersToExcel instead');
  exportCustomersToExcel(customers);
};

