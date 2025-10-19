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

    console.log('Fetching accounts for user:', user.id);

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

    // Fetch accounts from Tink API
    const accountsResponse = await fetch('https://api.tink.com/data/v2/accounts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tinkUser.access_token}`,
      },
    });

    if (!accountsResponse.ok) {
      const error = await accountsResponse.text();
      console.error('Failed to fetch accounts:', error);
      throw new Error('Failed to fetch accounts from Tink');
    }

    const { accounts } = await accountsResponse.json();
    console.log(`Fetched ${accounts?.length || 0} accounts from Tink`);

    // Store or update accounts in database
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

      // Upsert account
      const { error: upsertError } = await supabaseClient
        .from('tink_accounts')
        .upsert(accountData, {
          onConflict: 'tink_account_id',
        });

      if (upsertError) {
        console.error('Failed to upsert account:', upsertError);
      }
    }

    // Fetch updated accounts from database
    const { data: savedAccounts, error: fetchError } = await supabaseClient
      .from('tink_accounts')
      .select('*')
      .eq('tink_user_id', tinkUser.id)
      .eq('status', 'active');

    if (fetchError) {
      throw new Error('Failed to fetch saved accounts');
    }

    console.log(`Successfully synced ${savedAccounts?.length || 0} accounts`);

    return new Response(
      JSON.stringify({ accounts: savedAccounts || [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in tink-fetch-accounts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
