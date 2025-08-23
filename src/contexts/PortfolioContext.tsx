import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePriceFeeds } from '@/hooks/usePriceFeeds';
import { useBlockchain } from '@/hooks/useBlockchain';
import { useWallet } from '@/hooks/useWallet';
import { useToast } from '@/hooks/use-toast';
import { useArbitrageScanner } from '@/hooks/useArbitrageScanner';

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
  stakeInPool: (poolIndex: number, amount: number) => void;
  harvestRewards: (poolIndex: number) => void;
  executeArbitrage: (oppIndex: number) => void;
  executeFlashLoan: (asset: string, amount: string, strategy: string) => void;
  executeEnhancedArbitrage: (oppIndex: number, useFlashLoan: boolean, loanAmount: number) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { prices } = usePriceFeeds();
  const { deployToken, executeArbitrage: executeBlockchainArbitrage, executeFlashLoan: executeBlockchainFlashLoan, isConnected } = useBlockchain();
  const { account } = useWallet();
  const { toast } = useToast();
  const { opportunities: liveOpportunities, isScanning } = useArbitrageScanner();
  
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

  const [miningPools, setMiningPools] = useState<MiningPool[]>([
    {
      name: "ETH/USDC LP",
      apy: 24.5,
      tvl: 125000000,
      rewards: ["ETH", "USDC", "COMP"],
      userStake: 15000,
      earned: 247.89,
      progress: 68
    },
    {
      name: "LINK Staking",
      apy: 18.2,
      tvl: 89000000,
      rewards: ["LINK"],
      userStake: 8500,
      earned: 156.32,
      progress: 45
    },
    {
      name: "Yield Farming",
      apy: 31.8,
      tvl: 45000000,
      rewards: ["FARM", "ETH"],
      userStake: 5200,
      earned: 89.45,
      progress: 23
    }
  ]);

  // Use live opportunities from scanner, fallback to empty array
  const arbitrageOpportunities = liveOpportunities;

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

  const stakeInPool = (poolIndex: number, amount: number) => {
    setMiningPools(prev => prev.map((pool, i) => 
      i === poolIndex 
        ? { ...pool, userStake: pool.userStake + amount, progress: Math.min(pool.progress + 10, 100) }
        : pool
    ));
    
    setTotalValue(prev => prev + amount);
    
    toast({
      title: "Stake Added Successfully!",
      description: `$${amount.toLocaleString()} staked in ${miningPools[poolIndex].name}`,
    });
  };

  const harvestRewards = (poolIndex: number) => {
    const pool = miningPools[poolIndex];
    const earned = pool.earned;
    
    setMiningPools(prev => prev.map((p, i) => 
      i === poolIndex ? { ...p, earned: 0, progress: 0 } : p
    ));
    
    setYieldEarned(prev => prev + earned);
    setTotalValue(prev => prev + earned);
    
    toast({
      title: "Rewards Harvested!",
      description: `$${earned.toFixed(2)} in rewards claimed from ${pool.name}`,
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
    harvestRewards,
    executeArbitrage: executeArbitrageOpportunity,
    executeFlashLoan: executeFlashLoanOperation,
    executeEnhancedArbitrage,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};