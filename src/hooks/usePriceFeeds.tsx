import { useState, useEffect, createContext, useContext } from "react";

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdate: number;
}

interface PriceFeedsContextType {
  prices: Record<string, PriceData>;
  loading: boolean;
  error: string | null;
  fetchPrice: (symbol: string) => Promise<PriceData | null>;
  subscribeToPrice: (symbol: string, callback: (price: PriceData) => void) => () => void;
}

const PriceFeedsContext = createContext<PriceFeedsContextType | undefined>(undefined);

// Mock price data for demonstration
const MOCK_PRICES: Record<string, PriceData> = {
  ETH: {
    symbol: "ETH",
    price: 2450.32,
    change24h: 3.45,
    volume24h: 15420000000,
    marketCap: 294500000000,
    lastUpdate: Date.now()
  },
  BTC: {
    symbol: "BTC", 
    price: 43250.18,
    change24h: -1.23,
    volume24h: 28340000000,
    marketCap: 847300000000,
    lastUpdate: Date.now()
  },
  USDC: {
    symbol: "USDC",
    price: 1.0002,
    change24h: 0.01,
    volume24h: 3420000000,
    marketCap: 32140000000,
    lastUpdate: Date.now()
  },
  MATIC: {
    symbol: "MATIC",
    price: 0.8543,
    change24h: 5.67,
    volume24h: 542000000,
    marketCap: 8430000000,
    lastUpdate: Date.now()
  },
  UNI: {
    symbol: "UNI",
    price: 12.45,
    change24h: 2.34,
    volume24h: 234000000,
    marketCap: 7420000000,
    lastUpdate: Date.now()
  }
};

export const PriceFeedsProvider = ({ children }: { children: React.ReactNode }) => {
  const [prices, setPrices] = useState<Record<string, PriceData>>(MOCK_PRICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(currentPrices => {
        const updated = { ...currentPrices };
        
        Object.keys(updated).forEach(symbol => {
          // Simulate small price fluctuations (±0.5%)
          const fluctuation = (Math.random() - 0.5) * 0.01;
          updated[symbol] = {
            ...updated[symbol],
            price: updated[symbol].price * (1 + fluctuation),
            lastUpdate: Date.now()
          };
        });
        
        return updated;
      });
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchPrice = async (symbol: string): Promise<PriceData | null> => {
    try {
      setLoading(true);
      
      // In a real implementation, this would call an external API
      // For now, return mock data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const price = prices[symbol.toUpperCase()];
      if (!price) {
        throw new Error(`Price data not available for ${symbol}`);
      }
      
      return price;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPrice = (symbol: string, callback: (price: PriceData) => void) => {
    const interval = setInterval(() => {
      const price = prices[symbol.toUpperCase()];
      if (price) {
        callback(price);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  return (
    <PriceFeedsContext.Provider value={{
      prices,
      loading,
      error,
      fetchPrice,
      subscribeToPrice
    }}>
      {children}
    </PriceFeedsContext.Provider>
  );
};

export const usePriceFeeds = () => {
  const context = useContext(PriceFeedsContext);
  if (context === undefined) {
    throw new Error("usePriceFeeds must be used within a PriceFeedsProvider");
  }
  return context;
};