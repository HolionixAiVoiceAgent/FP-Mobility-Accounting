import { useRole } from './useRole';

export type DashboardVisibility = {
  showBankBalance: boolean;
  showProfitMargin: boolean;
  showFinancialMetrics: boolean;
  showCustomerData: boolean;
  showAdvancedAnalytics: boolean;
  showExpenseBreakdown: boolean;
};

export function useDashboardVisibility(): DashboardVisibility {
  const { role } = useRole();

  // Owner: show everything
  if (role === 'owner') {
    return {
      showBankBalance: true,
      showProfitMargin: true,
      showFinancialMetrics: true,
      showCustomerData: true,
      showAdvancedAnalytics: true,
      showExpenseBreakdown: true,
    };
  }

  // Employee: limited visibility
  return {
    showBankBalance: false,
    showProfitMargin: false,
    showFinancialMetrics: false,
    showCustomerData: true,
    showAdvancedAnalytics: false,
    showExpenseBreakdown: false,
  };
}

