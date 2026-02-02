import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

export interface PDFReportConfig {
  title: string;
  startDate: Date;
  endDate: Date;
  includeCharts: boolean;
  includeDetails: boolean;
  format?: 'excel' | 'xlsx' | 'json';
}

/**
 * Export utility for dashboard reports - supports Excel (.xlsx), and JSON formats
 */
export function usePDFExport() {
  const { toast } = useToast();

  const generatePDF = async (config: PDFReportConfig, data: any) => {
    try {
      toast({
        title: "Generating Report",
        description: `Your ${config.format === 'json' ? 'JSON' : 'Excel (.xlsx)'} report is being prepared...`,
        variant: "default"
      });

      const formattedDate = new Date().toISOString().split('T')[0];
      const filename = `${config.title}_${formattedDate}`;

      // Prepare data for export
      const reportData = {
        title: config.title,
        generatedAt: new Date().toISOString(),
        period: {
          start: config.startDate.toISOString().split('T')[0],
          end: config.endDate.toISOString().split('T')[0],
        },
        data: data,
      };

      let blob: Blob;
      let downloadFilename: string;

      // Export based on format
      if (config.format === 'json') {
        // JSON format - export ALL data from the database
        const dataStr = JSON.stringify(reportData, null, 2);
        blob = new Blob([dataStr], { type: 'application/json' });
        downloadFilename = `${filename}.json`;
      } else {
        // Excel format (.xlsx) - export ALL raw data from the database (same as JSON)
        const workbook = XLSX.utils.book_new();
        
        // Sheet 1: Report Info
        const reportInfo = [
          ['Report Title', reportData.title],
          ['Generated At', reportData.generatedAt],
          ['Period Start', reportData.period.start],
          ['Period End', reportData.period.end],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(reportInfo);
        XLSX.utils.book_append_sheet(workbook, ws1, 'Report Info');

        // Helper function to convert array of objects to sheet
        const objectsToSheet = (sheetName: string, objects: any[] | undefined) => {
          if (!objects || objects.length === 0) {
            const ws = XLSX.utils.aoa_to_sheet([[sheetName], ['No data available']]);
            XLSX.utils.book_append_sheet(workbook, ws, sheetName);
            return;
          }
          
          // Get all unique keys from all objects
          const allKeys = new Set<string>();
          objects.forEach(obj => {
            Object.keys(obj).forEach(key => allKeys.add(key));
          });
          
          // Create header row
          const headers = Array.from(allKeys);
          const aoa: any[][] = [headers];
          
          // Add data rows
          objects.forEach(obj => {
            const row = headers.map(header => {
              const value = obj[header];
              if (value === null || value === undefined) return '';
              if (typeof value === 'object') return JSON.stringify(value);
              return value;
            });
            aoa.push(row);
          });
          
          const ws = XLSX.utils.aoa_to_sheet(aoa);
          XLSX.utils.book_append_sheet(workbook, ws, sheetName);
        };

        // Helper function to convert metrics object to sheet
        const metricsToSheet = (sheetName: string, metrics: Record<string, any> | undefined) => {
          if (!metrics || Object.keys(metrics).length === 0) {
            const ws = XLSX.utils.aoa_to_sheet([[sheetName], ['No data available']]);
            XLSX.utils.book_append_sheet(workbook, ws, sheetName);
            return;
          }
          
          const aoa: any[][] = [];
          Object.entries(metrics).forEach(([key, value]) => {
            aoa.push([key, value]);
          });
          
          const ws = XLSX.utils.aoa_to_sheet(aoa);
          XLSX.utils.book_append_sheet(workbook, ws, sheetName);
        };

        // Sheet 2-6: Export ALL raw data from the database (same data as JSON)
        
        // Inventory data
        objectsToSheet('Inventory', data.inventory);

        // Sales data
        objectsToSheet('Sales', data.sales);

        // Expenses data
        objectsToSheet('Expenses', data.expenses);

        // Customers data
        objectsToSheet('Customers', data.customers);

        // Financial Metrics
        metricsToSheet('Financial Metrics', data.financialMetrics);

        // Payments data
        if (Array.isArray(data.payments)) {
          objectsToSheet('Payments', data.payments);
        }

        // Cash Advances data
        if (Array.isArray(data.cashAdvances)) {
          objectsToSheet('Cash Advances', data.cashAdvances);
        }

        // Financial Obligations data
        if (Array.isArray(data.obligations)) {
          objectsToSheet('Financial Obligations', data.obligations);
        }

        // Vehicle Purchases data
        if (Array.isArray(data.vehiclePurchases)) {
          objectsToSheet('Vehicle Purchases', data.vehiclePurchases);
        }

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        downloadFilename = `${filename}.xlsx`;
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFilename;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Report exported as ${config.format === 'json' ? 'JSON' : 'Excel (.xlsx)'} successfully`,
        variant: "default"
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  return { generatePDF };
}
