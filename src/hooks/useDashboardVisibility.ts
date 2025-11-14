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

  // Default: show everything for admins and owners
  if (role === 'admin' || role === 'owner') {
    return {
      showBankBalance: true,
      showProfitMargin: true,
      showFinancialMetrics: true,
      showCustomerData: true,
      showAdvancedAnalytics: true,
      showExpenseBreakdown: true,
    };
  }

  // Sales managers: show sales, customers, pipeline (hide bank details)
  if (role === 'sales_manager' || role === 'salesperson') {
    return {
      showBankBalance: false,
      showProfitMargin: false,
      showFinancialMetrics: false,
      showCustomerData: true,
      showAdvancedAnalytics: false,
      showExpenseBreakdown: false,
    };
  }

  // Accountants: show financial data (hide customer and sales pipeline)
  if (role === 'accountant') {
    return {
      showBankBalance: true,
      showProfitMargin: true,
      showFinancialMetrics: true,
      showCustomerData: false,
      showAdvancedAnalytics: true,
      showExpenseBreakdown: true,
    };
  }

  // Inventory managers: show inventory only
  if (role === 'inventory_manager') {
    return {
      showBankBalance: false,
      showProfitMargin: false,
      showFinancialMetrics: false,
      showCustomerData: false,
      showAdvancedAnalytics: false,
      showExpenseBreakdown: false,
    };
  }

  // HR managers: show general metrics only
  if (role === 'hr_manager') {
    return {
      showBankBalance: false,
      showProfitMargin: false,
      showFinancialMetrics: false,
      showCustomerData: false,
      showAdvancedAnalytics: false,
      showExpenseBreakdown: false,
    };
  }

  // Default: minimal visibility
  return {
    showBankBalance: false,
    showProfitMargin: false,
    showFinancialMetrics: false,
    showCustomerData: false,
    showAdvancedAnalytics: false,
    showExpenseBreakdown: false,
  };
}
