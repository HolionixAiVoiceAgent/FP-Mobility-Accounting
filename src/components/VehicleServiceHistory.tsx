import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useServiceRecords, useDeleteServiceRecord } from '@/hooks/useServiceRecords';
import { AddServiceRecordDialog } from './AddServiceRecordDialog';
import { Wrench, Trash2, Euro, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

interface VehicleServiceHistoryProps {
  inventoryId: string;
}

export const VehicleServiceHistory = ({ inventoryId }: VehicleServiceHistoryProps) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: services, isLoading } = useServiceRecords(inventoryId);
  const deleteService = useDeleteServiceRecord();

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      oil_change: 'Oil Change',
      inspection: 'Inspection',
      repair: 'Repair',
      tuv: 'TÜV',
      tire_change: 'Tire Change',
      brake_service: 'Brake Service',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const getServiceTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      oil_change: 'bg-blue-500',
      inspection: 'bg-green-500',
      repair: 'bg-red-500',
      tuv: 'bg-purple-500',
      tire_change: 'bg-orange-500',
      brake_service: 'bg-yellow-500',
      other: 'bg-gray-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            <CardTitle>Service History</CardTitle>
          </div>
          <AddServiceRecordDialog inventoryId={inventoryId} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="space-y-4">
            {services.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getServiceTypeColor(service.service_type)}>
                          {getServiceTypeLabel(service.service_type)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(service.service_date).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm">{service.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {service.mileage_at_service && (
                          <div>
                            <span className="text-muted-foreground">Mileage: </span>
                            <span className="font-semibold">{service.mileage_at_service.toLocaleString()} km</span>
                          </div>
                        )}
                        {service.cost && (
                          <div>
                            <span className="text-muted-foreground">Cost: </span>
                            <span className="font-semibold">€{service.cost.toLocaleString()}</span>
                          </div>
                        )}
                        {service.vendor_name && (
                          <div>
                            <span className="text-muted-foreground">Vendor: </span>
                            <span className="font-semibold">{service.vendor_name}</span>
                          </div>
                        )}
                        {service.next_service_date && (
                          <div>
                            <span className="text-muted-foreground">Next Service: </span>
                            <span className="font-semibold">
                              {new Date(service.next_service_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteId(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No service records yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Track all maintenance and repairs for this vehicle.
            </p>
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Service Record?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service record.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteId) {
                    deleteService.mutate(deleteId, {
                      onSuccess: () => setDeleteId(null),
                    });
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
