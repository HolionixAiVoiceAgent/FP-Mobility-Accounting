import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VehicleImageUpload } from '@/components/VehicleImageUpload';

interface VehicleImagesDialogProps {
  inventoryId: string;
  vehicleName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleImagesDialog({ inventoryId, vehicleName, open, onOpenChange }: VehicleImagesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Images - {vehicleName}</DialogTitle>
        </DialogHeader>
        <VehicleImageUpload inventoryId={inventoryId} />
      </DialogContent>
    </Dialog>
  );
}
