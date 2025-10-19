import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface LogoUploadSectionProps {
  currentLogoUrl?: string | null;
}

export function LogoUploadSection({ currentLogoUrl }: LogoUploadSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    if (file.size > 2097152) {
      toast({
        title: "File too large",
        description: "Logo must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('company_settings')
        .update({ logo_url: publicUrl })
        .eq('id', (await supabase.from('company_settings').select('id').single()).data?.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({ title: "Logo uploaded successfully" });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Logo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentLogoUrl && (
          <div className="relative w-48 h-24 border rounded p-2">
            <img src={currentLogoUrl} alt="Company logo" className="w-full h-full object-contain" />
          </div>
        )}
        <div>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload">
            <Button asChild disabled={uploading}>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Logo'}
              </span>
            </Button>
          </label>
          <p className="text-xs text-muted-foreground mt-2">
            Recommended: 200x80px, Max 2MB (PNG, JPG)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
