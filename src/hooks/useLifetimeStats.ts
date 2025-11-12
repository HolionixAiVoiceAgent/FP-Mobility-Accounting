import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LifetimeStats {
  totalRevenue: number;
  vehiclesSold: number;
  vehiclesPurchased: number;
  totalCustomers: number;
  lifetimeProfit: number;
  averageProfitPerCar: number;
  currentInventoryValue: number;
  totalFinancialObligations: number;
  netCompanyValue: number;
  obligationsBreakdown: {
    investors: number;
    bankLoans: number;
  };
}

export const useLifetimeStats = () => {
  return useQuery({
    queryKey: ["lifetime-stats"],
    queryFn: async (): Promise<LifetimeStats> => {
      // Fetch all vehicle sales
      const { data: sales, error: salesError } = await supabase
        .from("vehicle_sales")
        .select("sale_price, profit");

      if (salesError) throw salesError;

      // Fetch all inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from("inventory")
        .select("purchase_price, status");

      if (inventoryError) throw inventoryError;

      // Fetch all customers
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("id");

      if (customersError) throw customersError;

      // Fetch all financial obligations
      const { data: obligations, error: obligationsError } = await supabase
        .from("financial_obligations")
        .select("obligation_type, outstanding_balance, status")
        .eq("status", "active");

      if (obligationsError) throw obligationsError;

      // Fetch vehicle purchases payable (amounts we owe to sellers/dealers)
      const { data: purchases, error: purchasesError } = await supabase
        .from("vehicle_purchases")
        .select("outstanding_balance")
        .neq("payment_status", "paid");

      if (purchasesError) throw purchasesError;

      // Calculate metrics
      const totalRevenue = sales?.reduce((sum, sale) => sum + Number(sale.sale_price), 0) || 0;
      const vehiclesSold = sales?.length || 0;
      const vehiclesPurchased = inventory?.length || 0;
      const totalCustomers = customers?.length || 0;
      const lifetimeProfit = sales?.reduce((sum, sale) => sum + Number(sale.profit || 0), 0) || 0;
      const averageProfitPerCar = vehiclesSold > 0 ? lifetimeProfit / vehiclesSold : 0;

      // Current inventory value (only available vehicles)
      const currentInventoryValue =
        inventory
          ?.filter((item) => item.status === "available")
          .reduce((sum, item) => sum + Number(item.purchase_price), 0) || 0;

      // Financial obligations breakdown
      const investorObligations =
        obligations
          ?.filter((o) => o.obligation_type === "investor")
          .reduce((sum, o) => sum + Number(o.outstanding_balance), 0) || 0;

      const bankLoanObligations =
        obligations
          ?.filter((o) => o.obligation_type === "bank_loan")
          .reduce((sum, o) => sum + Number(o.outstanding_balance), 0) || 0;

      const totalFinancialObligations = investorObligations + bankLoanObligations;

      // Calculate total purchases payable
      const totalPurchasesPayable =
        purchases?.reduce((sum, purchase) => sum + Number(purchase.outstanding_balance), 0) || 0;

      // Net company value = (Lifetime Profit + Current Inventory Value) - Financial Obligations - Purchases Payable
      const netCompanyValue =
        lifetimeProfit + currentInventoryValue - totalFinancialObligations - totalPurchasesPayable;

      return {
        totalRevenue,
        vehiclesSold,
        vehiclesPurchased,
        totalCustomers,
        lifetimeProfit,
        averageProfitPerCar,
        currentInventoryValue,
        totalFinancialObligations,
        netCompanyValue,
        obligationsBreakdown: {
          investors: investorObligations,
          bankLoans: bankLoanObligations,
        },
      };
    },
  });
};
