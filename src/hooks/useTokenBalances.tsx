import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useBlockchain } from "./useBlockchain";

interface TokenBalance {
  symbol: string;
  address: string;
  balance: string;
  decimals: number;
  price: number;
  value: number;
}

// Common token addresses for major networks
const TOKEN_ADDRESSES: { [chainId: number]: { [symbol: string]: { address: string; decimals: number } } } = {
  1: { // Ethereum Mainnet
    USDC: { address: "0xA0b86a33E6441c8c6E6c5A9C2b8e0C3b8C6F5aB2", decimals: 6 },
    USDT: { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    DAI: { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18 },
    WETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
    LINK: { address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
  },
  137: { // Polygon
    USDC: { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    DAI: { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", decimals: 18 },
    WMATIC: { address: "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", decimals: 18 },
  },
  56: { // BSC
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    USDT: { address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    BUSD: { address: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", decimals: 18 },
    WBNB: { address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18 },
  }
};

// Mock prices for tokens
const MOCK_PRICES: { [symbol: string]: number } = {
  USDC: 1.00,
  USDT: 1.00,
  DAI: 1.00,
  BUSD: 1.00,
  WETH: 2450.50,
  WMATIC: 0.85,
  WBNB: 320.75,
  LINK: 14.25,
  ETH: 2450.50,
  BNB: 320.75,
  MATIC: 0.85,
};

export const useTokenBalances = () => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { account, chainId, isConnected, balance: ethBalance } = useWallet();
  const { getTokenBalance } = useBlockchain();

  const getAvailableTokens = useCallback(() => {
    if (!chainId || !TOKEN_ADDRESSES[chainId]) return [];
    return Object.entries(TOKEN_ADDRESSES[chainId]);
  }, [chainId]);

  const fetchBalances = useCallback(async () => {
    if (!isConnected || !account || !chainId) {
      setBalances([]);
      return;
    }

    setIsLoading(true);
    try {
      const tokenList = getAvailableTokens();
      const balancePromises: Promise<TokenBalance | null>[] = [];

      // Add native token (ETH/BNB/MATIC) balance
      const nativeSymbol = chainId === 1 ? 'ETH' : chainId === 56 ? 'BNB' : 'MATIC';
      const nativeBalance: TokenBalance = {
        symbol: nativeSymbol,
        address: 'native',
        balance: ethBalance || '0',
        decimals: 18,
        price: MOCK_PRICES[nativeSymbol] || 0,
        value: parseFloat(ethBalance || '0') * (MOCK_PRICES[nativeSymbol] || 0)
      };

      // Fetch token balances  
      for (const [symbol, tokenInfo] of tokenList) {
        balancePromises.push(
          (async () => {
            try {
              const balance = await getTokenBalance(tokenInfo.address);
              if (balance && parseFloat(balance) > 0) {
                const price = MOCK_PRICES[symbol] || 0;
                return {
                  symbol,
                  address: tokenInfo.address,
                  balance,
                  decimals: tokenInfo.decimals,
                  price,
                  value: parseFloat(balance) * price
                };
              }
              return null;
            } catch (error) {
              return null;
            }
          })()
        );
      }

      const tokenBalances = await Promise.all(balancePromises);
      const validBalances = tokenBalances.filter(Boolean) as TokenBalance[];

      // Combine native and token balances
      const allBalances = [nativeBalance, ...validBalances].filter(b => parseFloat(b.balance) > 0);
      
      setBalances(allBalances);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching token balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, chainId, isConnected, ethBalance, getTokenBalance, getAvailableTokens]);

  const getBalance = useCallback((tokenSymbol: string): TokenBalance | null => {
    return balances.find(b => b.symbol === tokenSymbol) || null;
  }, [balances]);

  const hasEnoughBalance = useCallback((tokenSymbol: string, requiredAmount: number): boolean => {
    const tokenBalance = getBalance(tokenSymbol);
    return tokenBalance ? parseFloat(tokenBalance.balance) >= requiredAmount : false;
  }, [getBalance]);

  const refreshBalances = useCallback(() => {
    fetchBalances();
  }, [fetchBalances]);

  // Auto-refresh balances when wallet connects or chain changes
  useEffect(() => {
    if (isConnected) {
      fetchBalances();
      // Refresh every 30 seconds
      const interval = setInterval(fetchBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, fetchBalances]);

  return {
    balances,
    isLoading,
    lastUpdated,
    getTokenBalance: getBalance,
    hasEnoughBalance,
    refreshBalances,
    totalValue: balances.reduce((sum, token) => sum + token.value, 0),
    availableTokens: getAvailableTokens().map(([symbol]) => symbol)
  };
};