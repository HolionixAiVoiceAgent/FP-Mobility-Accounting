import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useVehiclePurchases, useDeleteVehiclePurchase, VehiclePurchase } from '@/hooks/useVehiclePurchases';
import { AddVehiclePurchaseDialog } from '@/components/AddVehiclePurchaseDialog';
import { RecordPurchasePaymentDialog } from '@/components/RecordPurchasePaymentDialog';
import { PurchasesPayableSummary } from '@/components/PurchasesPayableSummary';
import { Trash2, Search, Download, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { exportVehiclePurchasesToExcel } from '@/utils/exportUtils';

const VehiclePurchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: purchases, isLoading, error: purchasesError } = useVehiclePurchases();
  const deletePurchase = useDeleteVehiclePurchase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'overdue': return 'bg-red-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filteredPurchases = purchases?.filter((purchase) =>
    purchase.seller_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.seller_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    if (!purchases || purchases.length === 0) return;

    const exportData = purchases.map((purchase) => ({
      'Purchase Date': new Date(purchase.purchase_date).toLocaleDateString(),
      'Seller Name': purchase.seller_name,
      'Seller Type': purchase.seller_type,
      'Purchase Price': purchase.purchase_price,
      'Amount Paid': purchase.amount_paid,
      'Outstanding Balance': purchase.outstanding_balance,
      'Payment Status': purchase.payment_status,
      'Due Date': new Date(purchase.payment_due_date).toLocaleDateString(),
      'Payment Terms (Days)': purchase.payment_terms_days,
    }));

    exportVehiclePurchasesToExcel(exportData);
  };

  const handleDelete = () => {
    if (deleteId) {
      deletePurchase.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Vehicle Purchases Payable</h1>
            <p className="text-muted-foreground">Track payments owed to sellers and dealers</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <AddVehiclePurchaseDialog />
          </div>
        </div>

        <PurchasesPayableSummary />

        {purchasesError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load vehicle purchases. {purchasesError instanceof Error ? purchasesError.message : 'Please check your connection.'}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Purchase Records</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by seller..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : filteredPurchases && filteredPurchases.length > 0 ? (
              <div className="space-y-4">
                {filteredPurchases.map((purchase) => (
                  <Card key={purchase.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{purchase.seller_name}</h3>
                            <Badge className={getStatusColor(purchase.payment_status)}>
                              {getStatusText(purchase.payment_status)}
                            </Badge>
                            <Badge variant="outline">{purchase.seller_type}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Purchase Price</p>
                              <p className="font-semibold">€{purchase.purchase_price.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Amount Paid</p>
                              <p className="font-semibold text-green-600">€{purchase.amount_paid.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Outstanding</p>
                              <p className="font-semibold text-red-600">€{purchase.outstanding_balance.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Due Date</p>
                              <p className={`font-semibold ${purchase.payment_status === 'overdue' ? 'text-red-600' : ''}`}>
                                {new Date(purchase.payment_due_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {purchase.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Note: {purchase.notes}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          {purchase.payment_status !== 'paid' && (
                            <RecordPurchasePaymentDialog purchase={purchase} />
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteId(purchase.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No vehicle purchases recorded yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start by recording your first vehicle purchase.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Purchase Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the purchase record
              and all associated payment history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default VehiclePurchases;
