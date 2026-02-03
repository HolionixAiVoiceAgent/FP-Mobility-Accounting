import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useVehicleImages } from '@/hooks/useVehicleImages';

interface VehicleImageGalleryProps {
  inventoryId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleImageGallery({ inventoryId, open, onOpenChange }: VehicleImageGalleryProps) {
  const { data: images } = useVehicleImages(inventoryId);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby="gallery-empty-description">
          <div className="text-center py-8">
            <p className="text-muted-foreground">No images available</p>
          </div>
          <DialogDescription id="gallery-empty-description">
            There are no vehicle images uploaded for this inventory item.
          </DialogDescription>
        </DialogContent>
      </Dialog>
    );
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0" aria-describedby="gallery-description">
      <DialogDescription id="gallery-description" className="sr-only">
        Vehicle image gallery showing {images.length} images. Use the left and right arrows to navigate between images.
      </DialogDescription>
        <div className="relative bg-black">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="relative aspect-video">
            <img
              src={images[currentIndex].image_url}
              alt={images[currentIndex].caption || 'Vehicle image'}
              className="w-full h-full object-contain"
            />

            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>

          <div className="bg-black/80 text-white p-4">
            <p className="text-center text-sm">
              {currentIndex + 1} / {images.length}
            </p>
            {images[currentIndex].caption && (
              <p className="text-center text-sm text-gray-300 mt-2">
                {images[currentIndex].caption}
              </p>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-black/80">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 ${
                    index === currentIndex ? 'ring-2 ring-primary' : 'opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
