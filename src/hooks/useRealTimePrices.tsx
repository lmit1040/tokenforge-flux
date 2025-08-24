import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: string;
}

export function useRealTimePrices() {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, return mock data with realistic price movements
      const mockPrices: PriceData[] = [
        {
          symbol: 'WETH/USDC',
          price: 2450 + (Math.random() - 0.5) * 100,
          change24h: (Math.random() - 0.5) * 10,
          volume24h: 1250000 + Math.random() * 500000,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'USDC/USDT',
          price: 1.001 + (Math.random() - 0.5) * 0.01,
          change24h: (Math.random() - 0.5) * 0.5,
          volume24h: 850000 + Math.random() * 200000,
          lastUpdated: new Date().toISOString(),
        },
        {
          symbol: 'LINK/WETH',
          price: 0.0058 + (Math.random() - 0.5) * 0.001,
          change24h: (Math.random() - 0.5) * 8,
          volume24h: 320000 + Math.random() * 100000,
          lastUpdated: new Date().toISOString(),
        },
      ];

      setPrices(mockPrices);
    } catch (err: any) {
      console.error('Price fetch error:', err);
      setError(err.message || 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch prices on mount and every 30 seconds
  useEffect(() => {
    fetchPrices();
    
    const interval = setInterval(() => {
      fetchPrices();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchPrices]);

  return {
    prices,
    isLoading,
    error,
    refreshPrices: fetchPrices
  };
}