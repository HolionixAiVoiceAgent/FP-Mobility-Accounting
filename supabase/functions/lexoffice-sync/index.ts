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

    // Get Lexoffice API key from tax_integrations
    const { data: integration, error: integrationError } = await supabaseClient
      .from("tax_integrations")
      .select("api_key, is_active")
      .eq("integration_type", "lexoffice")
      .eq("is_active", true)
      .single();

    if (integrationError || !integration?.api_key) {
      throw new Error("Lexoffice integration not configured or not active");
    }

    const lexofficeApiKey = integration.api_key;

    // Fetch recent vehicle sales (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sales, error: salesError } = await supabaseClient
      .from("vehicle_sales")
      .select("*, customers(*)")
      .gte("sale_date", thirtyDaysAgo.toISOString().split("T")[0])
      .order("sale_date", { ascending: false });

    if (salesError) throw salesError;

    let invoicesCreated = 0;
    let errors: string[] = [];

    // Create invoices in Lexoffice for each sale
    for (const sale of sales || []) {
      try {
        const customer = sale.customers;

        // Create invoice in Lexoffice
        const invoiceData = {
          voucherDate: sale.sale_date,
          address: {
            name: customer?.name || "Customer",
            street: customer?.address?.split(",")[0] || "",
            city: customer?.address?.split(",")[1]?.trim() || "",
            countryCode: "DE",
          },
          lineItems: [
            {
              type: "custom",
              name: `${sale.vehicle_make} ${sale.vehicle_model} (${sale.vehicle_year})`,
              description: `VIN: ${sale.vin}`,
              quantity: 1,
              unitName: "Stück",
              unitPrice: {
                currency: "EUR",
                netAmount: sale.sale_price / 1.19, // Remove VAT
                grossAmount: sale.sale_price,
                taxRatePercentage: 19,
              },
            },
          ],
          totalPrice: {
            currency: "EUR",
            totalNetAmount: sale.sale_price / 1.19,
            totalGrossAmount: sale.sale_price,
            totalTaxAmount: sale.sale_price - sale.sale_price / 1.19,
          },
          taxConditions: {
            taxType: "gross",
          },
          paymentConditions: {
            paymentTermLabel: "10 Tage",
            paymentTermDuration: 10,
          },
          title: `Fahrzeugverkauf - ${sale.sale_id}`,
          introduction: "Vielen Dank für Ihren Kauf!",
        };

        const response = await fetch("https://api.lexoffice.io/v1/invoices", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lexofficeApiKey}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          errors.push(`Failed to create invoice for sale ${sale.sale_id}: ${errorText}`);
          console.error(`Lexoffice API error for sale ${sale.sale_id}:`, errorText);
        } else {
          invoicesCreated++;
          console.log(`Invoice created for sale ${sale.sale_id}`);
        }
      } catch (error) {
        errors.push(`Error processing sale ${sale.sale_id}: ${error.message}`);
        console.error(`Error processing sale ${sale.sale_id}:`, error);
      }
    }

    // Update last sync time
    await supabaseClient
      .from("tax_integrations")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("integration_type", "lexoffice");

    return new Response(
      JSON.stringify({
        success: true,
        invoicesCreated,
        totalSales: sales?.length || 0,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in lexoffice-sync:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
