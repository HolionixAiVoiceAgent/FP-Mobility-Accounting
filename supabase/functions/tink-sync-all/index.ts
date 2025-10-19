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

    console.log('Starting full sync for user:', user.id);

    // Get Tink user data
    const { data: tinkUser, error: tinkUserError } = await supabaseClient
      .from('tink_users')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (tinkUserError || !tinkUser) {
      throw new Error('Tink user not found. Please connect your bank first.');
    }

    if (!tinkUser.access_token) {
      throw new Error('No access token found. Please reconnect your bank.');
    }

    const results = {
      accountsSynced: 0,
      transactionsImported: 0,
      errors: [] as string[],
    };

    // Step 1: Sync accounts
    try {
      const accountsResponse = await fetch('https://api.tink.com/data/v2/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tinkUser.access_token}`,
        },
      });

      if (accountsResponse.ok) {
        const { accounts } = await accountsResponse.json();
        
        for (const account of accounts || []) {
          const accountData = {
            tink_user_id: tinkUser.id,
            tink_account_id: account.id,
            account_name: account.name || account.financialInstitutionId,
            iban: account.identifiers?.iban?.iban || null,
            account_number: account.accountNumber || null,
            balance: parseFloat(account.balances?.booked?.amount?.value || '0'),
            currency: account.balances?.booked?.amount?.currency?.code || 'EUR',
            account_type: account.type || 'CHECKING',
            status: 'active',
            last_synced_at: new Date().toISOString(),
          };

          await supabaseClient
            .from('tink_accounts')
            .upsert(accountData, { onConflict: 'tink_account_id' });
          
          results.accountsSynced++;
        }
      }
    } catch (error) {
      results.errors.push(`Failed to sync accounts: ${error.message}`);
    }

    // Step 2: Get all accounts and sync transactions
    const { data: accounts } = await supabaseClient
      .from('tink_accounts')
      .select('*')
      .eq('tink_user_id', tinkUser.id)
      .eq('status', 'active');

    for (const account of accounts || []) {
      try {
        const transactionsResponse = await fetch(
          `https://api.tink.com/data/v2/transactions?accountId=${account.tink_account_id}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${tinkUser.access_token}`,
            },
          }
        );

        if (transactionsResponse.ok) {
          const { transactions } = await transactionsResponse.json();

          for (const transaction of transactions || []) {
            // Check if transaction already exists
            const { data: existing } = await supabaseClient
              .from('bank_transactions')
              .select('id')
              .eq('tink_transaction_id', transaction.id)
              .maybeSingle();

            if (!existing) {
              const transactionData = {
                transaction_id: transaction.id,
                tink_transaction_id: transaction.id,
                tink_account_id: account.id,
                account_name: account.account_name,
                account_number: account.account_number || account.iban || '',
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

              if (!insertError) {
                results.transactionsImported++;
              }
            }
          }

          // Update account last sync time
          await supabaseClient
            .from('tink_accounts')
            .update({ last_synced_at: new Date().toISOString() })
            .eq('id', account.id);
        }
      } catch (error) {
        results.errors.push(`Failed to sync transactions for account ${account.account_name}: ${error.message}`);
      }
    }

    console.log('Sync complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in tink-sync-all:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
