import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { accountId, daysBack = 90 } = await req.json();

    console.log('Fetching transactions for user:', user.id, 'accountId:', accountId);

    // Get Tink user data
    const { data: tinkUser, error: tinkUserError } = await supabaseClient
      .from('tink_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tinkUserError || !tinkUser) {
      throw new Error('Tink user not found');
    }

    if (!tinkUser.access_token) {
      throw new Error('No access token found');
    }

    // Get Tink account
    const { data: tinkAccount } = await supabaseClient
      .from('tink_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (!tinkAccount) {
      throw new Error('Account not found');
    }

    // Calculate date range
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - daysBack);

    // Fetch transactions from Tink API
    const transactionsResponse = await fetch(
      `https://api.tink.com/data/v2/transactions?accountId=${tinkAccount.tink_account_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tinkUser.access_token}`,
        },
      }
    );

    if (!transactionsResponse.ok) {
      const error = await transactionsResponse.text();
      console.error('Failed to fetch transactions:', error);
      throw new Error('Failed to fetch transactions from Tink');
    }

    const { transactions } = await transactionsResponse.json();
    console.log(`Fetched ${transactions?.length || 0} transactions from Tink`);

    let importedCount = 0;

    // Import transactions to database
    for (const transaction of transactions || []) {
      // Check if transaction already exists
      const { data: existing } = await supabaseClient
        .from('bank_transactions')
        .select('id')
        .eq('tink_transaction_id', transaction.id)
        .maybeSingle();

      if (existing) {
        continue; // Skip duplicate
      }

      const transactionData = {
        transaction_id: transaction.id,
        tink_transaction_id: transaction.id,
        tink_account_id: accountId,
        account_name: tinkAccount.account_name,
        account_number: tinkAccount.account_number || tinkAccount.iban || '',
        date: transaction.dates?.booked || transaction.dates?.value || new Date().toISOString().split('T')[0],
        description: transaction.descriptions?.display || transaction.descriptions?.original || 'Unknown',
        amount: parseFloat(transaction.amount?.value?.value || '0'),
        transaction_type: parseFloat(transaction.amount?.value?.value || '0') >= 0 ? 'credit' : 'debit',
        category: transaction.categories?.pfm || null,
        balance: null,
        source: 'tink',
        is_reconciled: false,
      };

      const { error: insertError } = await supabaseClient
        .from('bank_transactions')
        .insert(transactionData);

      if (insertError) {
        console.error('Failed to insert transaction:', insertError);
      } else {
        importedCount++;
      }
    }

    // Update account last sync time
    await supabaseClient
      .from('tink_accounts')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', accountId);

    console.log(`Successfully imported ${importedCount} new transactions`);

    return new Response(
      JSON.stringify({
        success: true,
        importedCount,
        totalFetched: transactions?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in tink-fetch-transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
