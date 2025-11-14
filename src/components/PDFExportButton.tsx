import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePDFExport } from '@/hooks/usePDFExport';

interface PDFExportButtonProps {
  data: any;
  reportTitle: string;
  startDate: Date;
  endDate: Date;
  includeCharts?: boolean;
}

export function PDFExportButton({ 
  data, 
  reportTitle, 
  startDate, 
  endDate,
  includeCharts = true 
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
      },
      data
    );
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
    >
      <Download className="h-4 w-4" />
      Export Report
    </Button>
  );
}
