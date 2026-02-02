import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCustomerImages, useUploadCustomerImage, useDeleteCustomerImage, useSetPrimaryCustomerImage } from '@/hooks/useCustomerImages';

interface CustomerImageUploadProps {
  customerDbId: string;
}

export function CustomerImageUpload({ customerDbId }: CustomerImageUploadProps) {
  const { data: images, isLoading } = useCustomerImages(customerDbId);
  const uploadImage = useUploadCustomerImage();
  const deleteImage = useDeleteCustomerImage();
  const setPrimary = useSetPrimaryCustomerImage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file, index) => {
      uploadImage.mutate({
        customerDbId,
        file,
        isPrimary: index === 0 && (!images || images.length === 0)
      });
    });
  }, [customerDbId, uploadImage, images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxSize: 5242880, // 5MB
    multiple: true
  });

  if (isLoading) return <div>Loading images...</div>;

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? 'Drop images here...' : 'Drag & drop images here, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Max 5MB per image. Supports PNG, JPG, JPEG, WEBP
        </p>
      </div>

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="relative group overflow-hidden">
              <img
                src={image.image_url}
                alt={image.caption || 'Customer image'}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant={image.is_primary ? "default" : "secondary"}
                  onClick={() => setPrimary.mutate({ id: image.id, customerDbId })}
                  title={image.is_primary ? "Primary image" : "Set as primary"}
                >
                  <Star className="h-4 w-4" fill={image.is_primary ? "currentColor" : "none"} />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => deleteImage.mutate({ 
                    id: image.id, 
                    imageUrl: image.image_url,
                    customerDbId 
                  })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {image.is_primary && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  Primary
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

