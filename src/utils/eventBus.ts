// Global event bus for broadcasting business events
// Usage: events.emit('sale-created', { saleId, amount, customerName })
// Subscribers will automatically show toast notifications

import { EventEmitter } from 'eventemitter3';

export type BusinessEvent = 
  | { type: 'sale-created'; data: { saleId: string; amount: number; vehicleDescription: string; customerName: string } }
  | { type: 'payment-received'; data: { paymentId: string; amount: number; customerName: string } }
  | { type: 'expense-added'; data: { expenseId: string; amount: number; category: string; type: 'cash' | 'account' } }
  | { type: 'cash-advance-recorded'; data: { employeeId: string; employeeName: string; amount: number } }
  | { type: 'inventory-sold'; data: { vehicleId: string; make: string; model: string; salePrice: number } }
  | { type: 'bank-transaction'; data: { amount: number; description: string; date: string } }
  | { type: 'inventory-threshold-alert'; data: { message: string; vehicleId?: string; daysSinceArrival?: number } }
  | { type: 'negative-cash-forecast'; data: { forecastDays: number; estimatedBalance: number } }
  | { type: 'profit-margin-warning'; data: { saleId: string; marginPercent: number; threshold: number } }
  | { type: 'expense-anomaly'; data: { message: string; amount: number; category: string } };

class EventBus {
  private emitter = new EventEmitter();

  emit(event: BusinessEvent) {
    this.emitter.emit(event.type, event.data);
  }

  on(eventType: BusinessEvent['type'], handler: (data: any) => void) {
    this.emitter.on(eventType, handler);
    return () => this.emitter.off(eventType, handler);
  }

  off(eventType: BusinessEvent['type'], handler: (data: any) => void) {
    this.emitter.off(eventType, handler);
  }
}

export const eventBus = new EventBus();
