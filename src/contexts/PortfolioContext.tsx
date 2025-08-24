import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePriceFeeds } from '@/hooks/usePriceFeeds';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { useArbitrageScanner } from '@/hooks/useArbitrageScanner';
import { useMiningPools } from '@/hooks/useMiningPools';
import { useTokenBalances } from '@/hooks/useTokenBalances';
import { useDefiProtocols } from '@/hooks/useDefiProtocols';

export interface Position {
  symbol: string;
  balance: number;
  value: number;
  change: number;
}

export interface MiningPool {
  name: string;
  apy: number;
  tvl: number;
  rewards: string[];
  userStake: number;
  earned: number;
  progress: number;
  protocol?: string;
  chain?: string;
  riskLevel?: string;
}

export interface ArbitrageOpportunity {
  tokenPair: string;
  exchange1: string;
  exchange2: string;
  price1: number;
  price2: number;
  profit: number;
  profitUsd: number;
  confidence: string;
  timeLeft: string;
}

interface PortfolioContextType {
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  positions: Position[];
  activePositions: number;
  yieldEarned: number;
  arbitrageProfit: number;
  miningPools: MiningPool[];
  arbitrageOpportunities: ArbitrageOpportunity[];
  
  // Actions
  mintToken: (name: string, symbol: string, supply: string, standard: string) => void;
  stakeInPool: (poolIndex: number, amount: number, token?: string) => void;
  unstakeFromPool: (poolIndex: number, amount: number, token?: string) => void;
  harvestRewards: (poolIndex: number) => void;
  executeArbitrage: (oppIndex: number) => void;
  executeFlashLoan: (asset: string, amount: string, strategy: string) => void;
  executeEnhancedArbitrage: (oppIndex: number, useFlashLoan: boolean, loanAmount: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  console.log('🎯 usePortfolio hook called');
  const context = useContext(PortfolioContext);
  console.log('📦 usePortfolio context:', context);
  if (!context) {
    console.error('❌ usePortfolio: context is undefined - component is not within PortfolioProvider');
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  console.log('✅ usePortfolio: context found successfully');
  return context;
};

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('🏗️ PortfolioProvider rendering');
  
  const { prices } = usePriceFeeds();
  const { deployToken, executeArbitrage: executeBlockchainArbitrage, executeFlashLoan: executeBlockchainFlashLoan, executeStaking, isConnected } = useBlockchain();
  const { account } = useWallet();
  const { hasEnoughBalance, addStakedPosition, removeStakedPosition } = useTokenBalances();
  const { toast } = useToast();
  const { opportunities: liveOpportunities, isScanning } = useArbitrageScanner();
  const { pools: liveMiningPools = [] } = useMiningPools(); // Add default empty array
  const { aaveSupply, aaveWithdraw } = useDefiProtocols();
  
  console.log('✅ PortfolioProvider hooks loaded successfully', { 
    liveMiningPoolsCount: liveMiningPools?.length || 0,
    liveOpportunitiesCount: liveOpportunities?.length || 0 
  });
  
  const [totalValue, setTotalValue] = useState(125847.32);
  const [dailyChange, setDailyChange] = useState(5.67);
  const [dailyChangePercent, setDailyChangePercent] = useState(4.73);
  const [yieldEarned, setYieldEarned] = useState(3247);
  const [arbitrageProfit, setArbitrageProfit] = useState(892);
  const [activePositions, setActivePositions] = useState(12);

  const [positions, setPositions] = useState<Position[]>([
    { symbol: "ETH", balance: 45.23, value: 87654.21, change: 3.45 },
    { symbol: "USDC", balance: 25000, value: 25000, change: 0 },
    { symbol: "LINK", balance: 1250, value: 13193.11, change: -2.1 }
  ]);

  const [userStakes, setUserStakes] = useState<{[key: string]: {stake: number, earned: number, progress: number}}>({});

  // Use live mining pools data and merge with user stakes - with safety check
  const miningPools = (liveMiningPools || []).map(pool => ({
    ...pool,
    userStake: userStakes[pool.name]?.stake || 0,
    earned: userStakes[pool.name]?.earned || 0,
    progress: userStakes[pool.name]?.progress || 0
  }));

  // Use live arbitrage opportunities data
  const arbitrageOpportunities = liveOpportunities || [];

  const mintToken = (name: string, symbol: string, supply: string, standard: string) => {
    const newValue = parseFloat(supply) * 0.001; // Mock value calculation
    
    setPositions(prev => [...prev, {
      symbol,
      balance: parseFloat(supply),
      value: newValue,
      change: 0
    }]);
    
    setTotalValue(prev => prev + newValue);
    setActivePositions(prev => prev + 1);

    toast({
      title: "Token Minted Successfully!",
      description: `${supply} ${symbol} (${standard}) tokens created`,
    });
  };

  const stakeInPool = async (poolIndex: number, amount: number, token: string = 'USDC') => {
    const poolName = miningPools[poolIndex].name;
    
    // Check wallet connection
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake tokens",
        variant: "destructive"
      });
      return;
    }

    // Check balance
    if (!hasEnoughBalance(token, amount)) {
      toast({
        title: "Insufficient balance",
        description: `You don't have enough ${token} to stake`,
        variant: "destructive"
      });
      return;
    }

    try {
      const pool = miningPools[poolIndex];

      if (pool.protocol && pool.protocol.toLowerCase().includes('aave')) {
        const sym = (token as 'USDC' | 'WETH');
        const txHash = await aaveSupply(sym, amount);
        if (!txHash) return;
      } else {
        // Fallback to generic staking flow (simulated)
        const tokenAddress = `0x${'A'.repeat(40)}`;
        const stakingContractAddress = `0x${'B'.repeat(40)}`;
        const result = await executeStaking(
          poolName,
          tokenAddress,
          amount.toString(),
          stakingContractAddress
        );
        if (!result || result.status !== 'confirmed') return;
      }

      // Only update local state after successful transaction
      setUserStakes(prev => ({
        ...prev,
        [poolName]: {
          stake: (prev[poolName]?.stake || 0) + amount,
          earned: prev[poolName]?.earned || 0,
          progress: Math.min((prev[poolName]?.progress || 0) + 10, 100)
        }
      }));
      
      // Add to staked positions to track balance deduction
      addStakedPosition(token, amount, poolName);
      
      setTotalValue(prev => prev + amount);
    } catch (error: any) {
      toast({
        title: "Staking failed",
        description: error.message || "Failed to execute staking transaction",
        variant: "destructive"
      });
    }
  };

  const unstakeFromPool = async (poolIndex: number, amount: number, token: string = 'USDC') => {
    const poolName = miningPools[poolIndex].name;
    
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to unstake tokens",
        variant: "destructive"
      });
      return;
    }

    try {
      const pool = miningPools[poolIndex];

      if (pool.protocol && pool.protocol.toLowerCase().includes('aave')) {
        const sym = (token as 'USDC' | 'WETH');
        const txHash = await aaveWithdraw(sym, amount);
        if (!txHash) return;
      }
      
      setUserStakes(prev => ({
        ...prev,
        [poolName]: {
          stake: Math.max(0, (prev[poolName]?.stake || 0) - amount),
          earned: prev[poolName]?.earned || 0,
          progress: prev[poolName]?.progress || 0
        }
      }));
      
      // Remove from staked positions to return balance
      removeStakedPosition(token, amount, poolName);
      
      setTotalValue(prev => prev - amount);
      
      toast({
        title: "Unstaking successful!",
        description: `${amount.toLocaleString()} ${token} unstaked from ${poolName}`,
      });
    } catch (error: any) {
      toast({
        title: "Unstaking failed",
        description: error.message || "Failed to unstake tokens",
        variant: "destructive"
      });
    }
  };

  const harvestRewards = (poolIndex: number) => {
    const pool = miningPools[poolIndex];
    const earned = pool.earned;
    const poolName = pool.name;
    
    setUserStakes(prev => ({
      ...prev,
      [poolName]: {
        stake: prev[poolName]?.stake || 0,
        earned: 0,
        progress: 0
      }
    }));
    
    setYieldEarned(prev => prev + earned);
    setTotalValue(prev => prev + earned);
    
    toast({
      title: "Rewards Harvested!",
      description: `$${earned.toFixed(2)} in rewards claimed from ${poolName}`,
    });
  };

  const executeArbitrageOpportunity = async (oppIndex: number) => {
    const opp = arbitrageOpportunities[oppIndex];
    
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to execute arbitrage",
        variant: "destructive"
      });
      return;
    }

    try {
      const txHash = await executeBlockchainArbitrage(
        `0x${'A'.repeat(40)}`, // Mock token A address
        `0x${'B'.repeat(40)}`, // Mock token B address
        '1000' // Mock amount
      );

      if (txHash) {
        // Add profit to portfolio (can't remove from live opportunities array)
        setArbitrageProfit(prev => prev + opp.profitUsd);
        setTotalValue(prev => prev + opp.profitUsd);
        
        toast({
          title: "Arbitrage Executed!",
          description: `$${opp.profitUsd.toFixed(2)} profit from ${opp.tokenPair} arbitrage`,
        });
      }
    } catch (error) {
      console.error('Arbitrage execution failed:', error);
    }
  };

  const executeFlashLoanOperation = async (asset: string, amount: string, strategy: string) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected", 
        description: "Please connect your wallet to execute flash loans",
        variant: "destructive"
      });
      return;
    }

    try {
      const txHash = await executeBlockchainFlashLoan(
        `0x${'C'.repeat(40)}`, // Mock asset address
        amount,
        { strategy }
      );

      if (txHash) {
        const loanAmount = parseFloat(amount);
        const fee = loanAmount * 0.0009; // 0.09% fee
        const minProfit = loanAmount * 0.001; // 0.1% min profit
        const actualProfit = minProfit + (Math.random() * 0.02 * loanAmount); // Random profit
        
        const netProfit = actualProfit - fee;
        
        setTotalValue(prev => prev + netProfit);
        setArbitrageProfit(prev => prev + netProfit);
        
        toast({
          title: "Flash Loan Executed!",
          description: `${strategy} strategy: $${netProfit.toFixed(2)} net profit`,
        });
      }
    } catch (error) {
      console.error('Flash loan execution failed:', error);
    }
  };

  const executeEnhancedArbitrage = (oppIndex: number, useFlashLoan: boolean, loanAmount: number) => {
    const opp = arbitrageOpportunities[oppIndex];
    
    // Calculate enhanced profit with flash loan
    const flashLoanFee = useFlashLoan ? loanAmount * 0.0009 : 0;
    const baseProfit = opp.profitUsd;
    const leveragedProfit = useFlashLoan ? (loanAmount * (opp.profit / 100)) : baseProfit;
    const netProfit = leveragedProfit - flashLoanFee;
    
    // Add profit to portfolio (can't remove from live opportunities array)
    setArbitrageProfit(prev => prev + netProfit);
    setTotalValue(prev => prev + netProfit);
    
    toast({
      title: useFlashLoan ? "Enhanced Arbitrage Executed!" : "Arbitrage Executed!",
      description: `$${netProfit.toFixed(2)} net profit from ${opp.tokenPair} ${useFlashLoan ? 'flash loan arbitrage' : 'arbitrage'}`,
    });
  };

  const value = {
    totalValue,
    dailyChange,
    dailyChangePercent,
    positions,
    activePositions,
    yieldEarned,
    arbitrageProfit,
    miningPools,
    arbitrageOpportunities,
    mintToken,
    stakeInPool,
    unstakeFromPool,
    harvestRewards,
    executeArbitrage: executeArbitrageOpportunity,
    executeFlashLoan: executeFlashLoanOperation,
    executeEnhancedArbitrage,
  };

  console.log('🎯 PortfolioProvider about to return context with value');
  
  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};