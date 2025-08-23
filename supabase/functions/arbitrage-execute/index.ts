import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getBaseUrl(chainId: number) {
  switch (chainId) {
    case 1:
      return 'https://api.0x.org/swap/v1/quote';
    case 137:
      return 'https://polygon.api.0x.org/swap/v1/quote';
    case 8453:
      return 'https://base.api.0x.org/swap/v1/quote';
    case 42161:
      return 'https://arbitrum.api.0x.org/swap/v1/quote';
    case 10:
      return 'https://optimism.api.0x.org/swap/v1/quote';
    default:
      return 'https://api.0x.org/swap/v1/quote';
  }
}

const DECIMALS_MAP: Record<string, number> = {
  ETH: 18,
  WETH: 18,
  DAI: 18,
  USDC: 6,
  USDT: 6,
  LINK: 18,
  UNI: 18,
};

function toBaseUnits(amountHuman: string, symbol: string) {
  const decimals = DECIMALS_MAP[symbol?.toUpperCase()] ?? 18;
  const [intPart, fracPart = ''] = String(amountHuman).split('.');
  const fracPadded = (fracPart + '0'.repeat(decimals)).slice(0, decimals);
  const normalized = `${intPart}${fracPadded}`.replace(/^0+/, '') || '0';
  return normalized;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ZEROX_API_KEY');
    if (!apiKey) {
      console.error('ZEROX_API_KEY is not set');
      return new Response(JSON.stringify({ ok: false, error: 'Server not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const {
      sellToken,
      buyToken,
      amount = '0.1',
      side = 'sell',
      chainId = 1,
      takerAddress,
    } = body ?? {};

    if (!sellToken || !buyToken) {
      return new Response(JSON.stringify({ ok: false, error: 'sellToken and buyToken are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(getBaseUrl(Number(chainId)));
    const search = url.searchParams;
    search.set('sellToken', sellToken);
    search.set('buyToken', buyToken);

    const baseAmount = toBaseUnits(amount, side === 'sell' ? sellToken : buyToken);
    if (side === 'sell') {
      search.set('sellAmount', baseAmount);
    } else {
      search.set('buyAmount', baseAmount);
    }

    if (takerAddress) search.set('takerAddress', takerAddress);

    const headers: Record<string, string> = {
      '0x-api-key': apiKey,
      'Content-Type': 'application/json',
    };

    const resp = await fetch(url.toString(), { headers });
    const json: any = await resp.json();

    if (!resp.ok) {
      console.error('0x prepare tx error', { status: resp.status, json });
      return new Response(JSON.stringify({ ok: false, status: resp.status, error: json }), {
        status: resp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = {
      to: json.to,
      data: json.data,
      value: json.value,
      allowanceTarget: json.allowanceTarget,
      sellToken,
      buyToken,
      chainId,
      price: json.price,
      estimatedGas: json.estimatedGas,
      sellAmount: json.sellAmount,
      buyAmount: json.buyAmount,
    };

    return new Response(JSON.stringify({ ok: true, tx: payload }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('arbitrage-execute fatal error', error);
    return new Response(JSON.stringify({ ok: false, error: error?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
