import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { eventBus, BusinessEvent } from '@/utils/eventBus';
import { DollarSign, ShoppingCart, AlertTriangle, TrendingDown, Zap } from 'lucide-react';

/**
 * Global listener for all business events.
 * Automatically displays toast notifications for major events.
 * Place this component once at the root of your app (e.g., in App.tsx after other providers).
 */
export function RealTimeEventListener() {
  const { toast } = useToast();

  useEffect(() => {
    // Sale Created
    const unsubscribeSale = eventBus.on('sale-created', (data) => {
      toast({
        title: '🎉 Sale Recorded',
        description: `${data.vehicleDescription} sold to ${data.customerName} for €${data.amount.toLocaleString()}`,
        duration: 5000,
      });
    });

    // Payment Received
    const unsubscribePayment = eventBus.on('payment-received', (data) => {
      toast({
        title: '💰 Payment Received',
        description: `€${data.amount.toLocaleString()} from ${data.customerName}`,
        duration: 5000,
      });
    });

    // Expense Added
    const unsubscribeExpense = eventBus.on('expense-added', (data) => {
      toast({
        title: '📋 Expense Recorded',
        description: `${data.category}: €${data.amount.toFixed(2)} (${data.type === 'cash' ? 'Cash' : 'Account'})`,
        duration: 4000,
      });
    });

    // Cash Advance
    const unsubscribeCashAdvance = eventBus.on('cash-advance-recorded', (data) => {
      toast({
        title: '💵 Cash Advance',
        description: `€${data.amount.toLocaleString()} recorded for ${data.employeeName}`,
        duration: 4000,
      });
    });

    // Inventory Sold
    const unsubscribeInventorySold = eventBus.on('inventory-sold', (data) => {
      toast({
        title: '✅ Vehicle Sold',
        description: `${data.make} ${data.model} - €${data.salePrice.toLocaleString()}`,
        duration: 4000,
      });
    });

    // Bank Transaction
    const unsubscribeBankTransaction = eventBus.on('bank-transaction', (data) => {
      toast({
        title: '🏦 Bank Transaction',
        description: `${data.description}: €${data.amount.toLocaleString()} on ${data.date}`,
        duration: 4000,
      });
    });

    // Alerts
    const unsubscribeInventoryAlert = eventBus.on('inventory-threshold-alert', (data) => {
      toast({
        title: '⚠️ Inventory Alert',
        description: data.message,
        variant: 'destructive',
        duration: 6000,
      });
    });

    const unsubscribeCashForecast = eventBus.on('negative-cash-forecast', (data) => {
      toast({
        title: '📉 Cash Flow Warning',
        description: `Negative balance forecast in ${data.forecastDays} days (€${data.estimatedBalance.toFixed(2)})`,
        variant: 'destructive',
        duration: 6000,
      });
    });

    const unsubscribeProfitMargin = eventBus.on('profit-margin-warning', (data) => {
      toast({
        title: '⚠️ Low Profit Margin',
        description: `Sale margin: ${data.marginPercent.toFixed(1)}% (threshold: ${data.threshold}%)`,
        variant: 'destructive',
        duration: 5000,
      });
    });

    const unsubscribeExpenseAnomaly = eventBus.on('expense-anomaly', (data) => {
      toast({
        title: '🚨 Unusual Expense',
        description: `${data.message} (€${data.amount.toFixed(2)} in ${data.category})`,
        variant: 'destructive',
        duration: 6000,
      });
    });

    // Cleanup
    return () => {
      unsubscribeSale();
      unsubscribePayment();
      unsubscribeExpense();
      unsubscribeCashAdvance();
      unsubscribeInventorySold();
      unsubscribeBankTransaction();
      unsubscribeInventoryAlert();
      unsubscribeCashForecast();
      unsubscribeProfitMargin();
      unsubscribeExpenseAnomaly();
    };
  }, [toast]);

  return null; // This is a listener, not a visual component
}
