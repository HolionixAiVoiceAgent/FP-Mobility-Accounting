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

    const { code } = await req.json();

    if (!code) {
      throw new Error('Authorization code is required');
    }

    const tinkClientId = Deno.env.get('TINK_CLIENT_ID');
    const tinkClientSecret = Deno.env.get('TINK_CLIENT_SECRET');

    if (!tinkClientId || !tinkClientSecret) {
      throw new Error('Tink credentials not configured');
    }

    console.log('Exchanging authorization code for access token');

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://api.tink.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: tinkClientId,
        client_secret: tinkClientSecret,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Failed to exchange code for token:', error);
      throw new Error('Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const { access_token, refresh_token, expires_in } = tokenData;

    console.log('Successfully obtained access token');

    // Calculate token expiration time
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    // Update Tink user with tokens
    const { error: updateError } = await supabaseClient
      .from('tink_users')
      .update({
        access_token,
        refresh_token,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update Tink user:', updateError);
      throw new Error('Failed to save tokens');
    }

    console.log('Tokens saved successfully');

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in tink-exchange-code:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
