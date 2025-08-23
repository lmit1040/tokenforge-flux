import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FlashLoanQuote {
  asset: string;
  amount: string;
  fee: number;
  totalRepayment: number;
  strategy: string;
  expectedProfit: number;
  gasEstimate: string;
  poolAddress: string;
  assetAddress: string;
}

export interface FlashLoanResult {
  success: boolean;
  txHash?: string;
  profit?: number;
  error?: string;
}

export const useFlashLoans = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastQuote, setLastQuote] = useState<FlashLoanQuote | null>(null);
  const { toast } = useToast();

  const getFlashLoanQuote = async (
    asset: string,
    amount: string,
    strategy: string,
    chainId: number = 1
  ): Promise<FlashLoanQuote | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('flash-loan-execute', {
        body: {
          asset,
          amount,
          strategy,
          chainId,
          userAddress: '0x0000000000000000000000000000000000000000', // Mock address for quote
          quoteOnly: true
        }
      });

      if (error) {
        console.error('Flash loan quote error:', error);
        toast({
          title: "Quote Failed",
          description: error.message || "Failed to get flash loan quote",
          variant: "destructive"
        });
        return null;
      }

      const quote: FlashLoanQuote = {
        asset,
        amount,
        fee: data.estimatedOutcome.fee,
        totalRepayment: data.estimatedOutcome.totalRepayment,
        strategy,
        expectedProfit: data.estimatedOutcome.expectedProfit,
        gasEstimate: data.estimatedOutcome.gasEstimate,
        poolAddress: data.poolAddress,
        assetAddress: data.assetAddress
      };

      setLastQuote(quote);
      return quote;

    } catch (error) {
      console.error('Flash loan quote error:', error);
      toast({
        title: "Quote Failed",
        description: "Failed to get flash loan quote",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const executeFlashLoan = async (
    asset: string,
    amount: string,
    strategy: string,
    userAddress: string,
    chainId: number = 1
  ): Promise<FlashLoanResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('flash-loan-execute', {
        body: {
          asset,
          amount,
          strategy,
          chainId,
          userAddress
        }
      });

      if (error) {
        console.error('Flash loan execution error:', error);
        return {
          success: false,
          error: error.message || "Flash loan execution failed"
        };
      }

      // In a real implementation, you would:
      // 1. Send the transaction payload to the user's wallet
      // 2. Wait for transaction confirmation
      // 3. Return the actual results

      const mockSuccess = data.estimatedOutcome.success;
      const profit = mockSuccess ? data.estimatedOutcome.expectedProfit - data.estimatedOutcome.fee : 0;

      return {
        success: mockSuccess,
        txHash: mockSuccess ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
        profit: mockSuccess ? profit : undefined,
        error: mockSuccess ? undefined : "Flash loan execution failed"
      };

    } catch (error) {
      console.error('Flash loan execution error:', error);
      return {
        success: false,
        error: "Flash loan execution failed"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableLiquidity = async (asset: string, chainId: number = 1) => {
    // Mock liquidity data - in real implementation would query Aave contracts
    const liquidityData = {
      ETH: { available: 15000, apy: 2.5 },
      USDC: { available: 50000000, apy: 3.2 },
      DAI: { available: 25000000, apy: 2.8 }
    };

    return liquidityData[asset] || { available: 0, apy: 0 };
  };

  return {
    isLoading,
    lastQuote,
    getFlashLoanQuote,
    executeFlashLoan,
    getAvailableLiquidity
  };
};