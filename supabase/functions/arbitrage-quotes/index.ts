import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getBaseUrl(chainId: number) {
  switch (chainId) {
    case 1:
      return 'https://api.0x.org/swap/v1/quote'; // Ethereum
    case 137:
      return 'https://polygon.api.0x.org/swap/v1/quote'; // Polygon
    case 8453:
      return 'https://base.api.0x.org/swap/v1/quote'; // Base
    case 42161:
      return 'https://arbitrum.api.0x.org/swap/v1/quote'; // Arbitrum
    case 10:
      return 'https://optimism.api.0x.org/swap/v1/quote'; // Optimism
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
      amount = '0.1', // human-readable default
      side = 'sell', // 'sell' | 'buy'
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

    const startedAt = Date.now();
    const resp = await fetch(url.toString(), { headers });
    const elapsedMs = Date.now() - startedAt;

    const text = await resp.text();
    let json: any;
    try { json = JSON.parse(text); } catch (_) { json = { raw: text }; }

    if (!resp.ok) {
      console.error('0x quote error', { status: resp.status, json, elapsedMs });
      return new Response(JSON.stringify({ ok: false, status: resp.status, error: json }), {
        status: resp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sellDecimals = DECIMALS_MAP[sellToken?.toUpperCase()] ?? 18;
    const buyDecimals = DECIMALS_MAP[buyToken?.toUpperCase()] ?? 18;

    const toHuman = (raw: string, decimals: number) => {
      if (!raw) return '0';
      const s = String(raw).padStart(decimals + 1, '0');
      const intPart = s.slice(0, s.length - decimals).replace(/^0+/, '') || '0';
      const fracPart = s.slice(s.length - decimals).replace(/0+$/, '');
      return fracPart ? `${intPart}.${fracPart}` : intPart;
    };

    const sellAmountHuman = toHuman(json.sellAmount, sellDecimals);
    const buyAmountHuman = toHuman(json.buyAmount, buyDecimals);

    const payload = {
      price: json.price,
      guaranteedPrice: json.guaranteedPrice,
      estimatedGas: json.estimatedGas,
      to: json.to,
      data: json.data,
      value: json.value,
      allowanceTarget: json.allowanceTarget,
      sellAmount: json.sellAmount,
      buyAmount: json.buyAmount,
      sellAmountHuman,
      buyAmountHuman,
      sources: json.sources,
      chainId,
      side,
      elapsedMs,
    };

    return new Response(JSON.stringify({ ok: true, quote: payload }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('arbitrage-quotes fatal error', error);
    return new Response(JSON.stringify({ ok: false, error: error?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
