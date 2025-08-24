import { useCallback } from "react";
import { useWallet } from "./useWallet";
import { useToast } from "./use-toast";
import { useBlockchain } from "./useBlockchain";
import { encodeFunctionData, parseUnits } from "viem";

// Minimal Aave V3 Pool ABI for supply/withdraw
const AAVE_POOL_ABI = [
  {
    name: "supply",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" }
    ],
    outputs: []
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" }
    ],
    outputs: [ { name: "", type: "uint256" } ]
  }
] as const;

const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [ { name: "", type: "bool" } ]
  }
] as const;

// Known contract addresses on Ethereum mainnet
const ADDRESSES = {
  aavePool: "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2",
  tokens: {
    USDC: { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    WETH: { address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
  }
} as const;

export const useDefiProtocols = () => {
  const { account } = useWallet();
  const { toast } = useToast();

  const aaveSupply = useCallback(async (symbol: keyof typeof ADDRESSES.tokens, amount: number) => {
    if (!account || !window.ethereum) {
      toast({ title: "Wallet not connected", description: "Connect your wallet to proceed", variant: "destructive" });
      return null;
    }

    try {
      const token = ADDRESSES.tokens[symbol];
      const amountWei = parseUnits(amount.toString(), token.decimals);

      // 1) Approve Pool to spend tokens
      const approveData = encodeFunctionData({
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ADDRESSES.aavePool as `0x${string}`, amountWei]
      });

      await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: token.address,
          data: approveData,
        }]
      });

      // 2) Supply to Aave
      const data = encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: "supply",
        args: [token.address as `0x${string}`, amountWei, account as `0x${string}`, 0]
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: ADDRESSES.aavePool,
          data,
        }]
      });

      toast({ title: "Aave supply sent", description: `${amount} ${symbol} supplied` });
      return txHash as string;
    } catch (error: any) {
      toast({ title: "Aave supply failed", description: error.message, variant: "destructive" });
      return null;
    }
  }, [account, toast]);

  const aaveWithdraw = useCallback(async (symbol: keyof typeof ADDRESSES.tokens, amount: number) => {
    if (!account || !window.ethereum) {
      toast({ title: "Wallet not connected", description: "Connect your wallet to proceed", variant: "destructive" });
      return null;
    }

    try {
      const token = ADDRESSES.tokens[symbol];
      const amountWei = parseUnits(amount.toString(), token.decimals);

      const data = encodeFunctionData({
        abi: AAVE_POOL_ABI,
        functionName: "withdraw",
        args: [token.address as `0x${string}`, amountWei, account as `0x${string}`]
      });

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: ADDRESSES.aavePool,
          data,
        }]
      });

      toast({ title: "Aave withdraw sent", description: `${amount} ${symbol} withdrawn` });
      return txHash as string;
    } catch (error: any) {
      toast({ title: "Aave withdraw failed", description: error.message, variant: "destructive" });
      return null;
    }
  }, [account, toast]);

  return {
    aaveSupply,
    aaveWithdraw,
  };
};
