import { useState, useCallback } from "react";
import { useWallet } from "./useWallet";
import { useToast } from "./use-toast";

interface TokenData {
  name: string;
  symbol: string;
  totalSupply: string;
  decimals: number;
}

interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

interface StakingTransaction {
  poolName: string;
  amount: number;
  token: string;
  status: 'approving' | 'staking' | 'confirmed' | 'failed';
  approvalTx?: string;
  stakingTx?: string;
  error?: string;
}

export const useBlockchain = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTransactions, setPendingTransactions] = useState<{[key: string]: StakingTransaction}>({});
  const { account, chainId } = useWallet();
  const { toast } = useToast();

  // ERC20 Token Contract ABI (simplified)
  const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)",
    "function transferFrom(address,address,uint256) returns (bool)",
    "function approve(address,uint256) returns (bool)"
  ];

  const deployToken = useCallback(async (tokenData: TokenData): Promise<string | null> => {
    if (!account || !window.ethereum) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      // Simulate token deployment
      const deployTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: null, // Contract creation
          data: `0x608060405234801561001057600080fd5b50...`, // Simplified bytecode
          gas: '0x5208', // 21000 gas
        }],
      });

      toast({
        title: "Token deployed!",
        description: `${tokenData.name} (${tokenData.symbol}) deployed successfully`,
      });

      return deployTx;
    } catch (error: any) {
      toast({
        title: "Deployment failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, toast]);

  const getTokenBalance = useCallback(async (tokenAddress: string, userAddress?: string): Promise<string | null> => {
    if (!window.ethereum) return null;

    try {
      const targetAddress = userAddress || account;
      if (!targetAddress) return null;

      // Simulate balance check
      const balance = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: `0x70a08231000000000000000000000000${targetAddress.slice(2)}`
        }, 'latest'],
      });

      // Convert hex to decimal and format
      const balanceInWei = parseInt(balance, 16);
      const balanceInTokens = (balanceInWei / Math.pow(10, 18)).toFixed(4);
      
      return balanceInTokens;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return null;
    }
  }, [account]);

  const sendTransaction = useCallback(async (to: string, value: string, data?: string): Promise<TransactionResult | null> => {
    if (!account || !window.ethereum) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to,
          value: `0x${parseInt(value).toString(16)}`,
          data: data || '0x',
          gas: '0x5208',
        }],
      });

      toast({
        title: "Transaction sent",
        description: "Your transaction has been submitted to the network",
      });

      return {
        hash: txHash,
        status: 'pending'
      };
    } catch (error: any) {
      toast({
        title: "Transaction failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, toast]);

  const approveToken = useCallback(async (tokenAddress: string, spenderAddress: string, amount: string): Promise<string | null> => {
    if (!account || !window.ethereum) return null;

    setIsLoading(true);
    try {
      // ERC20 approve function call data
      const data = `0x095ea7b3000000000000000000000000${spenderAddress.slice(2)}${parseInt(amount).toString(16).padStart(64, '0')}`;
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: tokenAddress,
          data,
          gas: '0x5208',
        }],
      });

      toast({
        title: "Approval successful",
        description: "Token spending approved",
      });

      return txHash;
    } catch (error: any) {
      toast({
        title: "Approval failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, toast]);

  const executeArbitrage = useCallback(async (tokenA: string, tokenB: string, amount: string): Promise<string | null> => {
    if (!account || !window.ethereum) return null;

    setIsLoading(true);
    try {
      // Simulate arbitrage execution
      const txHash = await sendTransaction(
        tokenA, // Target contract
        '0', // No ETH value
        `0xa9059cbb000000000000000000000000${tokenB.slice(2)}${parseInt(amount).toString(16).padStart(64, '0')}`
      );

      toast({
        title: "Arbitrage executed",
        description: "Your arbitrage transaction has been submitted",
      });

      return txHash?.hash || null;
    } catch (error: any) {
      toast({
        title: "Arbitrage failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, sendTransaction, toast]);

  const executeFlashLoan = useCallback(async (asset: string, amount: string, params: any): Promise<string | null> => {
    if (!account || !window.ethereum) return null;

    setIsLoading(true);
    try {
      // Flash loan contract interaction
      const flashLoanData = `0x${Math.random().toString(16).slice(2, 66)}`; // Simulated data
      
      const result = await sendTransaction(
        asset, // Flash loan contract
        '0',
        flashLoanData
      );

      toast({
        title: "Flash loan executed",
        description: "Your flash loan has been executed successfully",
      });

      return result?.hash || null;
    } catch (error: any) {
      toast({
        title: "Flash loan failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, sendTransaction, toast]);

  const executeStaking = useCallback(async (
    poolName: string, 
    tokenAddress: string, 
    amount: string, 
    stakingContractAddress: string
  ): Promise<StakingTransaction | null> => {
    if (!account || !window.ethereum) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake tokens",
        variant: "destructive"
      });
      return null;
    }

    const transactionId = `${poolName}-${Date.now()}`;
    const stakingTx: StakingTransaction = {
      poolName,
      amount: parseFloat(amount),
      token: tokenAddress,
      status: 'approving'
    };

    setPendingTransactions(prev => ({ ...prev, [transactionId]: stakingTx }));

    try {
      // Step 1: Approve token spending
      toast({
        title: "Approving tokens...",
        description: "Please confirm the approval transaction in your wallet",
      });

      const approvalTx = await approveToken(tokenAddress, stakingContractAddress, amount);
      
      if (!approvalTx) {
        setPendingTransactions(prev => ({
          ...prev,
          [transactionId]: { ...prev[transactionId], status: 'failed', error: 'Approval failed' }
        }));
        return null;
      }

      // Update with approval hash
      setPendingTransactions(prev => ({
        ...prev,
        [transactionId]: { ...prev[transactionId], approvalTx, status: 'staking' }
      }));

      toast({
        title: "Approval confirmed",
        description: "Now initiating staking transaction...",
      });

      // Step 2: Execute staking
      // Mock staking contract call data
      const stakingData = `0x${Math.random().toString(16).slice(2, 66)}`;
      
      const result = await sendTransaction(
        stakingContractAddress,
        '0', // No ETH value for token staking
        stakingData
      );

      if (result) {
        setPendingTransactions(prev => ({
          ...prev,
          [transactionId]: { 
            ...prev[transactionId], 
            stakingTx: result.hash, 
            status: 'confirmed' 
          }
        }));

        toast({
          title: "Staking successful!",
          description: `Successfully staked ${amount} tokens in ${poolName}`,
        });

        return { ...stakingTx, approvalTx, stakingTx: result.hash, status: 'confirmed' };
      } else {
        throw new Error('Staking transaction failed');
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Unknown error occurred';
      
      setPendingTransactions(prev => ({
        ...prev,
        [transactionId]: { 
          ...prev[transactionId], 
          status: 'failed', 
          error: errorMessage 
        }
      }));

      toast({
        title: "Staking failed",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    }
  }, [account, approveToken, sendTransaction, toast]);

  const getTransactionStatus = useCallback((transactionId: string) => {
    return pendingTransactions[transactionId] || null;
  }, [pendingTransactions]);

  const clearTransaction = useCallback((transactionId: string) => {
    setPendingTransactions(prev => {
      const { [transactionId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    isLoading,
    deployToken,
    getTokenBalance,
    sendTransaction,
    approveToken,
    executeArbitrage,
    executeFlashLoan,
    executeStaking,
    pendingTransactions,
    getTransactionStatus,
    clearTransaction,
    isConnected: !!account,
    currentChain: chainId
  };
};