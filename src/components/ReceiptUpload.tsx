import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ReceiptUploadProps {
  receiptUrl: string | null;
  onUploadComplete: (url: string) => void;
  onDelete: () => void;
}

export function ReceiptUpload({ receiptUrl, onUploadComplete, onDelete }: ReceiptUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('expense-receipts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('expense-receipts')
        .getPublicUrl(fileName);

      onUploadComplete(publicUrl);

      toast({
        title: "Receipt uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10485760, // 10MB
    multiple: false,
    disabled: isUploading
  });

  const handleDelete = async () => {
    if (!receiptUrl) return;

    try {
      const path = receiptUrl.split('/expense-receipts/')[1];
      
      if (path) {
        await supabase.storage
          .from('expense-receipts')
          .remove([path]);
      }

      onDelete();

      toast({
        title: "Receipt deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (receiptUrl) {
    return (
      <div className="flex items-center gap-2 p-4 border rounded-lg">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <span className="flex-1 text-sm truncate">Receipt attached</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.open(receiptUrl, '_blank')}
        >
          <Download className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">
        {isUploading ? 'Uploading...' : isDragActive ? 'Drop receipt here...' : 'Upload receipt (PDF or image)'}
      </p>
      <p className="text-xs text-muted-foreground mt-1">Max 10MB</p>
    </div>
  );
}
