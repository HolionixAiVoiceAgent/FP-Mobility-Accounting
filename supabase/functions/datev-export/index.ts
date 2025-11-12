import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { startDate, endDate } = await req.json();

    // Fetch vehicle sales
    let salesQuery = supabaseClient
      .from("vehicle_sales")
      .select("*")
      .order("sale_date", { ascending: true });

    if (startDate) salesQuery = salesQuery.gte("sale_date", startDate);
    if (endDate) salesQuery = salesQuery.lte("sale_date", endDate);

    const { data: sales, error: salesError } = await salesQuery;
    if (salesError) throw salesError;

    // Fetch expenses
    let expensesQuery = supabaseClient
      .from("expenses")
      .select("*")
      .order("date", { ascending: true });

    if (startDate) expensesQuery = expensesQuery.gte("date", startDate);
    if (endDate) expensesQuery = expensesQuery.lte("date", endDate);

    const { data: expenses, error: expensesError } = await expensesQuery;
    if (expensesError) throw expensesError;

    // Generate DATEV CSV format (SKR04 standard)
    const csvRows: string[] = [];

    // Header row (DATEV Buchungsstapel format)
    csvRows.push(
      [
        "Umsatz (ohne Soll/Haben-Kz)",
        "Soll/Haben-Kennzeichen",
        "WKZ Umsatz",
        "Konto",
        "Gegenkonto",
        "BU-Schlüssel",
        "Belegdatum",
        "Belegfeld 1",
        "Buchungstext",
        "Kostenstelle",
        "Kost1",
        "Kost2",
      ].join(";")
    );

    // Add sales (revenue - account 8400 for vehicle sales in SKR04)
    sales?.forEach((sale) => {
      csvRows.push(
        [
          sale.sale_price.toString().replace(".", ","), // Amount
          "H", // Haben (credit) for revenue
          "EUR", // Currency
          "8400", // Revenue account (SKR04)
          "1200", // Bank account
          "", // Tax code (empty for now)
          new Date(sale.sale_date).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          sale.sale_id, // Document number
          `Fahrzeugverkauf ${sale.vehicle_make} ${sale.vehicle_model}`, // Description
          "", // Cost center
          "", // Cost1
          "", // Cost2
        ].join(";")
      );
    });

    // Add expenses (account varies by category)
    expenses?.forEach((expense) => {
      const expenseAccount = getExpenseAccount(expense.category);
      csvRows.push(
        [
          expense.amount.toString().replace(".", ","), // Amount
          "S", // Soll (debit) for expenses
          "EUR", // Currency
          expenseAccount, // Expense account
          "1200", // Bank account
          "", // Tax code
          new Date(expense.date).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          expense.expense_id, // Document number
          expense.description, // Description
          "", // Cost center
          "", // Cost1
          "", // Cost2
        ].join(";")
      );
    });

    const csvContent = csvRows.join("\n");

    // Update last sync time
    await supabaseClient
      .from("tax_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("integration_type", "datev");

    return new Response(csvContent, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="datev_export_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error in datev-export:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Map expense categories to DATEV account numbers (SKR04)
function getExpenseAccount(category: string): string {
  const accountMap: Record<string, string> = {
    maintenance: "6300", // Repairs and maintenance
    fuel: "6530", // Fuel costs
    insurance: "6510", // Insurance
    registration: "6815", // Registration fees
    parts: "6000", // Purchases of goods
    labor: "6100", // Wages
    other: "6800", // Other operating expenses
  };

  return accountMap[category.toLowerCase()] || "6800"; // Default to other operating expenses
}
