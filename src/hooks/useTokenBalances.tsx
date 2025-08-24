import { useState, useEffect, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useBlockchain } from "./useBlockchain";

interface TokenBalance {
  symbol: string;
  address: string;
  balance: string; // Total balance (available + staked)
  availableBalance: string; // Available for new stakes
  stakedBalance: string; // Currently staked amount
  decimals: number;
  price: number;
  value: number;
  stakedValue: number;
}

interface StakedPosition {
  symbol: string;
  amount: number;
  poolName: string;
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
  const [stakedPositions, setStakedPositions] = useState<StakedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { account, chainId, isConnected, balance: ethBalance } = useWallet();
  const { getTokenBalance } = useBlockchain();

  const getAvailableTokens = useCallback(() => {
    if (!chainId || !TOKEN_ADDRESSES[chainId]) return [];
    return Object.entries(TOKEN_ADDRESSES[chainId]);
  }, [chainId]);

  const calculateBalances = useCallback((totalBalance: string, symbol: string) => {
    const stakedAmount = stakedPositions
      .filter(pos => pos.symbol === symbol)
      .reduce((sum, pos) => sum + pos.amount, 0);
    
    const total = parseFloat(totalBalance);
    const staked = stakedAmount;
    const available = Math.max(0, total - staked);
    
    return {
      total: totalBalance,
      available: available.toString(),
      staked: staked.toString()
    };
  }, [stakedPositions]);

  const fetchBalances = useCallback(async () => {
    console.log('🔄 fetchBalances called with:', { isConnected, account, chainId });
    
    if (!isConnected || !account || !chainId) {
      console.log('❌ Missing required data:', { isConnected, account, chainId });
      setBalances([]);
      return;
    }

    setIsLoading(true);
    console.log('📡 Starting balance fetch for account:', account);
    
    try {
      const tokenList = getAvailableTokens();
      const balancePromises: Promise<TokenBalance | null>[] = [];

      // Add native token (ETH/BNB/MATIC) balance
      const nativeSymbol = chainId === 1 ? 'ETH' : chainId === 56 ? 'BNB' : 'MATIC';
      console.log('🪙 Getting native balance for:', nativeSymbol, 'ethBalance:', ethBalance);
      
      const nativeBalanceCalc = calculateBalances(ethBalance || '0', nativeSymbol);
      const nativePrice = MOCK_PRICES[nativeSymbol] || 0;
      
      console.log('💰 Native balance calc:', nativeBalanceCalc);
      
      const nativeBalance: TokenBalance = {
        symbol: nativeSymbol,
        address: 'native',
        balance: nativeBalanceCalc.total,
        availableBalance: nativeBalanceCalc.available,
        stakedBalance: nativeBalanceCalc.staked,
        decimals: 18,
        price: nativePrice,
        value: parseFloat(nativeBalanceCalc.available) * nativePrice,
        stakedValue: parseFloat(nativeBalanceCalc.staked) * nativePrice
      };

      // Fetch token balances  
      for (const [symbol, tokenInfo] of tokenList) {
        balancePromises.push(
          (async () => {
            try {
              const balance = await getTokenBalance(tokenInfo.address);
              if (balance && parseFloat(balance) > 0) {
                const price = MOCK_PRICES[symbol] || 0;
                const balanceCalc = calculateBalances(balance, symbol);
                
                return {
                  symbol,
                  address: tokenInfo.address,
                  balance: balanceCalc.total,
                  availableBalance: balanceCalc.available,
                  stakedBalance: balanceCalc.staked,
                  decimals: tokenInfo.decimals,
                  price,
                  value: parseFloat(balanceCalc.available) * price,
                  stakedValue: parseFloat(balanceCalc.staked) * price
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

      // Combine native and token balances, show all tokens even with 0 balance
      const allBalances = [nativeBalance, ...validBalances];
      
      console.log('✅ Final balances:', allBalances);
      setBalances(allBalances);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('❌ Error fetching token balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, chainId, ethBalance, getTokenBalance, getAvailableTokens, calculateBalances]);

  const getBalance = useCallback((tokenSymbol: string): TokenBalance | null => {
    return balances.find(b => b.symbol === tokenSymbol) || null;
  }, [balances]);

  const hasEnoughBalance = useCallback((tokenSymbol: string, requiredAmount: number): boolean => {
    const tokenBalance = getBalance(tokenSymbol);
    return tokenBalance ? parseFloat(tokenBalance.availableBalance) >= requiredAmount : false;
  }, [getBalance]);

  const addStakedPosition = useCallback((symbol: string, amount: number, poolName: string) => {
    setStakedPositions(prev => [...prev, { symbol, amount, poolName }]);
  }, []);

  const removeStakedPosition = useCallback((symbol: string, amount: number, poolName: string) => {
    setStakedPositions(prev => 
      prev.filter(pos => !(pos.symbol === symbol && pos.poolName === poolName && pos.amount === amount))
    );
  }, []);

  const getStakedInPool = useCallback((symbol: string, poolName: string): number => {
    return stakedPositions
      .filter(pos => pos.symbol === symbol && pos.poolName === poolName)
      .reduce((sum, pos) => sum + pos.amount, 0);
  }, [stakedPositions]);

  const refreshBalances = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    fetchBalances();
  }, [fetchBalances]);

  // Simple effect that only triggers on account/chain changes
  useEffect(() => {
    console.log('🔄 Token balances effect triggered:', { isConnected, account, chainId });
    
    if (isConnected && account && chainId) {
      fetchBalances();
    } else {
      console.log('🧹 Clearing balances');
      setBalances([]);
    }
  }, [account, chainId]); // Only depend on account and chainId

  return {
    balances,
    stakedPositions,
    isLoading,
    lastUpdated,
    getTokenBalance: getBalance,
    hasEnoughBalance,
    addStakedPosition,
    removeStakedPosition,
    getStakedInPool,
    refreshBalances,
    totalValue: balances.reduce((sum, token) => sum + token.value, 0),
    totalStakedValue: balances.reduce((sum, token) => sum + token.stakedValue, 0),
    availableTokens: getAvailableTokens().map(([symbol]) => symbol)
  };
};