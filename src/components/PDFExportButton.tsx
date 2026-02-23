import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDFExport } from '@/hooks/usePDFExport';

interface PDFExportButtonProps {
  data: any;
  reportTitle: string;
  startDate: Date;
  endDate: Date;
  includeCharts?: boolean;
  defaultFormat?: 'excel' | 'xlsx';
}

export function PDFExportButton({ 
  data, 
  reportTitle, 
  startDate, 
  endDate,
  includeCharts = true,
  defaultFormat = 'excel'
}: PDFExportButtonProps) {
  const { generatePDF } = usePDFExport();

  const handleExport = async () => {
    await generatePDF(
      {
        title: reportTitle,
        startDate,
        endDate,
        includeCharts,
        includeDetails: true,
        format: defaultFormat || 'xlsx',
      },
      data
    );
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2"
      onClick={handleExport}
    >
      <FileSpreadsheet className="h-4 w-4" />
      Export Report
    </Button>
  );
}
