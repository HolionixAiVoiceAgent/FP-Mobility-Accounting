import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, Car, Euro, Phone, Mail, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerDetailsDialogProps {
  customerId: string | null;
  trigger?: React.ReactNode;
}

export function CustomerDetailsDialog({ customerId, trigger }: CustomerDetailsDialogProps) {
  const [open, setOpen] = useState(false);

  const { data: customer } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId && open
  });

  const { data: purchases } = useQuery({
    queryKey: ['customer-purchases', customerId],
    queryFn: async () => {
      if (!customerId) return [];
      const { data, error } = await supabase
        .from('vehicle_sales')
        .select('*')
        .eq('customer_id', customerId)
        .order('sale_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId && open
  });

  if (!customerId) {
    return (
      <Button variant="outline" size="sm" disabled>
        <User className="h-4 w-4 mr-2" />
        No Customer
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <User className="h-4 w-4 mr-2" />
            Customer Details
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        
        {customer && (
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-muted-foreground">{customer.type}</p>
                    <Badge className={customer.status === 'active' ? 'bg-success' : 'bg-warning'}>
                      {customer.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="text-sm">{customer.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{customer.address}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Purchases</p>
                      <p className="text-2xl font-bold">€{customer.total_purchases?.toLocaleString() || 0}</p>
                    </div>
                    <Euro className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vehicles Bought</p>
                      <p className="text-2xl font-bold">{customer.vehicles_purchased || 0}</p>
                    </div>
                    <Car className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
                      <p className="text-2xl font-bold">€{customer.outstanding_balance?.toLocaleString() || 0}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Purchase History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchases && purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div key={purchase.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">
                              {purchase.vehicle_year} {purchase.vehicle_make} {purchase.vehicle_model}
                            </h4>
                            <p className="text-sm text-muted-foreground">VIN: {purchase.vin}</p>
                            <p className="text-sm text-muted-foreground">Sale ID: {purchase.sale_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">€{purchase.sale_price.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">{purchase.sale_date}</p>
                            <Badge className={
                              purchase.payment_status === 'completed' ? 'bg-success' :
                              purchase.payment_status === 'pending' ? 'bg-warning' : 'bg-destructive'
                            }>
                              {purchase.payment_status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No purchase history found</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}