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

    const tinkClientId = Deno.env.get('TINK_CLIENT_ID');
    const tinkClientSecret = Deno.env.get('TINK_CLIENT_SECRET');

    if (!tinkClientId || !tinkClientSecret) {
      console.error('Tink credentials missing:', {
        hasClientId: !!tinkClientId,
        hasClientSecret: !!tinkClientSecret,
      });
      throw new Error('Tink API credentials not configured. Please add TINK_CLIENT_ID and TINK_CLIENT_SECRET to Supabase environment variables.');
    }

    console.log('Creating Tink user for:', user.id);

    // Step 1: Get access token first for verification
    const verifyTokenResponse = await fetch('https://api.tink.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: tinkClientId,
        client_secret: tinkClientSecret,
        grant_type: 'client_credentials',
        scope: 'authorization:grant,user:create',
      }),
    });

    if (!verifyTokenResponse.ok) {
      const error = await verifyTokenResponse.text();
      console.error('Failed to get Tink access token:', error);
      throw new Error('Failed to authenticate with Tink');
    }

    const { access_token } = await verifyTokenResponse.json();

    // Check if user already has a Tink user
    let tinkUserId: string;
    
    const { data: existingTinkUser } = await supabaseClient
      .from('tink_users')
      .select('tink_user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingTinkUser) {
      // Verify the Tink user still exists on Tink's side
      console.log('Verifying existing Tink user:', existingTinkUser.tink_user_id);
      const verifyResponse = await fetch(
        `https://api.tink.com/api/v1/user/${existingTinkUser.tink_user_id}`,
        {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${access_token}` 
          }
        }
      );

      if (verifyResponse.ok) {
        tinkUserId = existingTinkUser.tink_user_id;
        console.log('Using existing Tink user:', tinkUserId);
      } else {
        // Tink user doesn't exist anymore, delete from DB and create new one
        console.log('Tink user no longer exists on Tink side, creating new one');
        await supabaseClient
          .from('tink_users')
          .delete()
          .eq('user_id', user.id);
        
        existingTinkUser = null as any;
      }
    }
    
    if (!existingTinkUser) {
      // Create Tink user (using already obtained access_token)
      const createUserResponse = await fetch('https://api.tink.com/api/v1/user/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          external_user_id: user.id,
          market: 'DE',
          locale: 'de_DE',
        }),
      });

      if (!createUserResponse.ok) {
        const error = await createUserResponse.text();
        console.error('Failed to create Tink user:', error);
        throw new Error('Failed to create Tink user');
      }

      const { user_id } = await createUserResponse.json();
      tinkUserId = user_id;

      console.log('Created new Tink user:', tinkUserId);

      // Store Tink user in database
      await supabaseClient.from('tink_users').insert({
        user_id: user.id,
        tink_user_id: tinkUserId,
      });
    }

    // Step 2: Generate authorization code for the user
    console.log('Generating authorization code for Tink user:', tinkUserId);
    
    // Get a fresh token with authorization:grant scope
    const authTokenResponse = await fetch('https://api.tink.com/api/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: tinkClientId,
        client_secret: tinkClientSecret,
        grant_type: 'client_credentials',
        scope: 'authorization:grant',
      }),
    });

    if (!authTokenResponse.ok) {
      const error = await authTokenResponse.text();
      console.error('Failed to get authorization token:', {
        status: authTokenResponse.status,
        error: error,
      });
      throw new Error(`Failed to get authorization token: ${authTokenResponse.status}`);
    }

    const { access_token: authToken } = await authTokenResponse.json();

    // Create authorization grant/code using the delegated token
    const grantResponse = await fetch('https://api.tink.com/api/v1/oauth/authorization-grant/delegate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        user_id: tinkUserId,
        id_hint: user.id,
        actor_client_id: tinkClientId,
        scope: 'authorization:read,authorization:grant,credentials:refresh,credentials:read,credentials:write,investments:read,identity:read,user:read,accounts:read,transactions:read',
      }),
    });

    if (!grantResponse.ok) {
      const errorText = await grantResponse.text();
      console.error('Failed to create authorization grant:', {
        status: grantResponse.status,
        statusText: grantResponse.statusText,
        error: errorText,
      });
      throw new Error(`Failed to create authorization grant: ${grantResponse.status} - ${errorText}`);
    }

    const { code } = await grantResponse.json();
    console.log('Successfully generated authorization code');

    // Step 3: Generate Tink Link URL
    const redirectUri = `${req.headers.get('origin')}/bank`;
    const linkUrl = `https://link.tink.com/1.0/transactions/connect-accounts?client_id=${tinkClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&market=DE&locale=de_DE&test=true&authorization_code=${code}`;

    console.log('Generated Tink Link URL successfully');

    return new Response(
      JSON.stringify({
        linkUrl,
        tinkUserId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in tink-create-link:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Full error details:', {
      message: errorMessage,
      hasClientId: !!Deno.env.get('TINK_CLIENT_ID'),
      hasClientSecret: !!Deno.env.get('TINK_CLIENT_SECRET'),
    });
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Check server logs for more information. Make sure TINK_CLIENT_ID and TINK_CLIENT_SECRET are set in Supabase Secrets.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
