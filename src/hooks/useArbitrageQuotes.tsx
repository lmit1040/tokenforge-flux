import { supabase } from "@/integrations/supabase/client";

export type QuoteRequest = {
  sellToken: string;
  buyToken: string;
  amount: string; // human-readable amount
  side?: 'sell' | 'buy';
  chainId?: number;
  takerAddress?: string;
};

export type QuotePayload = {
  price: string;
  guaranteedPrice: string;
  estimatedGas: number;
  to: string;
  data: string;
  value: string;
  allowanceTarget: string;
  sellAmount: string;
  buyAmount: string;
  sellAmountHuman: string;
  buyAmountHuman: string;
  sources: any[];
  chainId: number;
  side: 'sell' | 'buy';
  elapsedMs: number;
};

export function useArbitrageQuotes() {
  const getQuote = async (req: QuoteRequest): Promise<{ ok: boolean; quote?: QuotePayload; error?: any } | null> => {
    const { data, error } = await supabase.functions.invoke('arbitrage-quotes', {
      body: req,
    });
    if (error) return { ok: false, error } as any;
    return data as any;
  };

  const prepareSwapTx = async (req: QuoteRequest): Promise<{ ok: boolean; tx?: any; error?: any } | null> => {
    const { data, error } = await supabase.functions.invoke('arbitrage-execute', {
      body: req,
    });
    if (error) return { ok: false, error } as any;
    return data as any;
  };

  return { getQuote, prepareSwapTx };
}
