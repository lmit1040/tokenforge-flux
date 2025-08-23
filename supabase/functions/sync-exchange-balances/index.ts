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
    const { connectionId } = await req.json();
    
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

    // Get exchange connections
    let connectionsQuery = supabase
      .from('exchange_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (connectionId) {
      connectionsQuery = connectionsQuery.eq('id', connectionId);
    }

    const { data: connections, error: connectionError } = await connectionsQuery;

    if (connectionError) {
      console.error('Error fetching connections:', connectionError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch connections' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sync balances for each connection
    for (const connection of connections) {
      await syncConnectionBalances(supabase, user.id, connection);
    }

    console.log(`Synced balances for ${connections.length} connections`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${connections.length} exchange connections` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-exchange-balances function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function syncConnectionBalances(supabase: any, userId: string, connection: any) {
  try {
    // Decrypt API credentials (in production, use proper decryption)
    const apiKey = atob(connection.api_key_encrypted);
    const apiSecret = atob(connection.api_secret_encrypted);

    // Mock balance data for demo purposes
    // In production, call actual exchange APIs
    const mockBalances = generateMockBalances(connection.exchange_name);

    // Delete existing balances for this connection
    await supabase
      .from('external_balances')
      .delete()
      .eq('exchange_connection_id', connection.id);

    // Insert new balances
    const balancesToInsert = mockBalances.map(balance => ({
      user_id: userId,
      exchange_connection_id: connection.id,
      symbol: balance.symbol,
      balance: balance.balance,
      available_balance: balance.available,
      locked_balance: balance.locked,
      usd_value: balance.usdValue,
      last_updated: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('external_balances')
      .insert(balancesToInsert);

    if (insertError) {
      console.error('Error inserting balances:', insertError);
      return;
    }

    // Update last sync time
    await supabase
      .from('exchange_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);

    console.log(`Synced balances for ${connection.exchange_name}`);
  } catch (error) {
    console.error(`Error syncing balances for ${connection.exchange_name}:`, error);
  }
}

function generateMockBalances(exchangeName: string) {
  const baseBalances = [
    { symbol: 'BTC', balance: 0.15432, available: 0.15432, locked: 0, price: 45000 },
    { symbol: 'ETH', balance: 2.567, available: 2.067, locked: 0.5, price: 3200 },
    { symbol: 'USDT', balance: 5420.50, available: 5420.50, locked: 0, price: 1 },
    { symbol: 'BNB', balance: 8.345, available: 8.345, locked: 0, price: 320 },
    { symbol: 'ADA', balance: 1250.00, available: 1250.00, locked: 0, price: 0.45 },
    { symbol: 'SOL', balance: 25.67, available: 20.67, locked: 5, price: 95 },
  ];

  // Vary balances slightly by exchange
  const exchangeMultiplier = exchangeName === 'binance' ? 1.2 : 
                            exchangeName === 'coinbase-pro' ? 0.8 : 
                            exchangeName === 'kraken' ? 1.1 : 1.0;

  return baseBalances.map(balance => ({
    ...balance,
    balance: balance.balance * exchangeMultiplier,
    available: balance.available * exchangeMultiplier,
    locked: balance.locked * exchangeMultiplier,
    usdValue: balance.balance * balance.price * exchangeMultiplier,
  }));
}