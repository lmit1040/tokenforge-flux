import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { exchangeName, apiKey, apiSecret } = await req.json();
    
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Simple encryption (in production, use proper encryption)
    const encryptedApiKey = btoa(apiKey);
    const encryptedApiSecret = btoa(apiSecret);

    // Test the API connection first
    const isValid = await testExchangeConnection(exchangeName, apiKey, apiSecret);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid API credentials or connection failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the connection
    const { data, error } = await supabase
      .from('exchange_connections')
      .insert({
        user_id: user.id,
        exchange_name: exchangeName,
        api_key_encrypted: encryptedApiKey,
        api_secret_encrypted: encryptedApiSecret,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save connection' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Exchange connected successfully:', exchangeName);

    return new Response(
      JSON.stringify({ 
        success: true, 
        connectionId: data.id,
        message: 'Exchange connected successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in connect-exchange function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function testExchangeConnection(exchangeName: string, apiKey: string, apiSecret: string): Promise<boolean> {
  try {
    // Mock API connection test for now
    // In production, implement actual API calls to each exchange
    console.log(`Testing connection to ${exchangeName} with API key: ${apiKey.substring(0, 8)}...`);
    
    // Simulate API validation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, accept any non-empty credentials
    return apiKey.length > 10 && apiSecret.length > 10;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}