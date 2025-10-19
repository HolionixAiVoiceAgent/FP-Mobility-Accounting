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

    const { accountId } = await req.json();

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    console.log('Disconnecting account:', accountId, 'for user:', user.id);

    // Get Tink account
    const { data: tinkAccount } = await supabaseClient
      .from('tink_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (!tinkAccount) {
      throw new Error('Account not found');
    }

    // Mark account as disconnected (keep historical data)
    const { error: updateError } = await supabaseClient
      .from('tink_accounts')
      .update({
        status: 'disconnected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', accountId);

    if (updateError) {
      throw new Error('Failed to disconnect account');
    }

    console.log('Account disconnected successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in tink-disconnect:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
