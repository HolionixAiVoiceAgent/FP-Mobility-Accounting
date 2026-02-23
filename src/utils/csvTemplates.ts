import * as XLSX from 'xlsx';

export const generateExpenseExcelTemplate = () => {
  const templateData = [
    {
      date: "2024-03-15",
      amount: "150.50",
      description: "Office supplies",
      category: "Office Supplies",
      vendor: "Office Depot",
      tax_deductible: "true"
    },
    {
      date: "2024-03-16",
      amount: "2500.00",
      description: "Monthly rent",
      category: "Office Rent",
      vendor: "Property Management Co",
      tax_deductible: "true"
    },
    {
      date: "2024-03-17",
      amount: "89.99",
      description: "Fuel for company vehicle",
      category: "Fuel",
      vendor: "Shell",
      tax_deductible: "true"
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses Template");
  XLSX.writeFile(workbook, 'expense_template.xlsx');
};

export const generateExpenseCSVTemplate = () => {
  const headers = ['date', 'amount', 'description', 'category', 'vendor', 'tax_deductible'];
  const sampleData = [
    ['2024-03-15', '150.50', 'Office supplies', 'Office Supplies', 'Office Depot', 'true'],
    ['2024-03-16', '2500.00', 'Monthly rent', 'Office Rent', 'Property Management Co', 'true'],
    ['2024-03-17', '89.99', 'Fuel for company vehicle', 'Fuel', 'Shell', 'true'],
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', 'expense_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const validateExpenseCSV = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const requiredColumns = ['date', 'amount', 'description', 'category'];

  if (data.length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors };
  }

  const headers = Object.keys(data[0]);
  const missingColumns = requiredColumns.filter(col => !headers.includes(col));

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  data.forEach((row, index) => {
    const rowNum = index + 2; // +2 because index 0 is row 2 in spreadsheet (after header)

    if (!row.date) {
      errors.push(`Row ${rowNum}: Date is required`);
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(row.date)) {
      errors.push(`Row ${rowNum}: Date must be in YYYY-MM-DD format`);
    }

    if (!row.amount) {
      errors.push(`Row ${rowNum}: Amount is required`);
    } else if (isNaN(parseFloat(row.amount))) {
      errors.push(`Row ${rowNum}: Amount must be a valid number`);
    }

    if (!row.description) {
      errors.push(`Row ${rowNum}: Description is required`);
    }

    if (!row.category) {
      errors.push(`Row ${rowNum}: Category is required`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};
