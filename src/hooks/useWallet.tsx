import { useState, useEffect, createContext, useContext } from "react";
import { useToast } from "./use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  balance: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const SUPPORTED_NETWORKS = {
  1: { name: "Ethereum Mainnet", rpc: "https://ethereum.rpc.com" },
  137: { name: "Polygon", rpc: "https://polygon-rpc.com" },
  56: { name: "BSC", rpc: "https://bsc-dataseed.binance.org" },
  43114: { name: "Avalanche", rpc: "https://api.avax.network/ext/bc/C/rpc" },
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const { toast } = useToast();

  const isConnected = !!account;

  useEffect(() => {
    console.log('🚀 Wallet provider initialized');
    
    if (typeof window === "undefined" || !window.ethereum) {
      console.log('❌ MetaMask not found');
      return;
    }

    let isActive = true;

    // Check initial connection
    const checkInitialConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('🔍 Initial accounts:', accounts);
        
        if (accounts.length > 0 && isActive) {
          const initialAccount = accounts[0];
          console.log('🔗 Found existing account:', initialAccount);
          
          // Get chain ID first
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const parsedChainId = parseInt(chainId, 16);
          
          console.log('🌐 Chain ID:', parsedChainId);
          
          // Set account and chain simultaneously
          setAccount(initialAccount);
          setChainId(parsedChainId);
          
          // Get balance with retry logic
          try {
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [initialAccount, 'latest']
            });
            const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
            console.log('💰 Initial balance:', balanceInEth, 'ETH');
            setBalance(balanceInEth);
          } catch (balanceError) {
            console.error('❌ Error getting initial balance:', balanceError);
            // Retry after a short delay
            setTimeout(async () => {
              try {
                const retryBalance = await window.ethereum.request({
                  method: 'eth_getBalance',
                  params: [initialAccount, 'latest']
                });
                const retryBalanceInEth = (parseInt(retryBalance, 16) / Math.pow(10, 18)).toFixed(4);
                console.log('💰 Retry balance:', retryBalanceInEth, 'ETH');
                setBalance(retryBalanceInEth);
              } catch (retryError) {
                console.error('❌ Retry balance failed:', retryError);
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('❌ Error checking initial connection:', error);
      }
    };

    // Account change handler
    const handleAccountsChanged = async (accounts: string[]) => {
      if (!isActive) return;
      
      console.log('🔄 MetaMask accounts changed:', accounts);
      
      if (accounts.length === 0) {
        console.log('❌ All accounts disconnected');
        setAccount(null);
        setBalance(null);
        return;
      }

      const newAccount = accounts[0];
      console.log('✅ Switching to account:', newAccount);
      
      // Update account immediately
      setAccount(newAccount);
      
      try {
        // Fetch new balance
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [newAccount, 'latest']
        });
        const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
        console.log('💰 New account balance:', balanceInEth);
        setBalance(balanceInEth);
      } catch (error) {
        console.error('❌ Error fetching balance for new account:', error);
      }
    };

    // Chain change handler
    const handleChainChanged = async (chainId: string) => {
      if (!isActive) return;

      console.log('🔄 Chain changed to:', chainId);
      const newChainId = parseInt(chainId, 16);
      console.log('🌐 New chain ID parsed:', newChainId);
      
      // Update chain ID first
      setChainId(newChainId);

      // Refresh account and balance for the new chain
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const currentAccount = accounts[0];
          console.log('🔄 Refreshing balance for account after chain change:', currentAccount);
          // Update account in case it's not in sync
          setAccount(currentAccount);
          await getBalance(currentAccount);
          
          toast({
            title: "Network switched",
            description: `Switched to ${SUPPORTED_NETWORKS[newChainId as keyof typeof SUPPORTED_NETWORKS]?.name || `Chain ${newChainId}`}`,
          });
        }
      } catch (error) {
        console.error('❌ Error updating account after chain change:', error);
      }
    };

    // Set up event listeners
    console.log('📡 Setting up MetaMask event listeners');
    
    // Use both event names for better compatibility
    const chainChangeHandler = (chainId: string) => handleChainChanged(chainId);
    const accountChangeHandler = (accounts: string[]) => handleAccountsChanged(accounts);
    
    window.ethereum.on('accountsChanged', accountChangeHandler);
    window.ethereum.on('chainChanged', chainChangeHandler);
    
    // Also listen for networkChanged (legacy)
    window.ethereum.on('networkChanged', chainChangeHandler);

    // Initialize
    checkInitialConnection();

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up wallet provider');
      isActive = false;
      
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', accountChangeHandler);
        window.ethereum.removeListener('chainChanged', chainChangeHandler);
        window.ethereum.removeListener('networkChanged', chainChangeHandler);
      } else if (window.ethereum?.off) {
        window.ethereum.off('accountsChanged', accountChangeHandler);
        window.ethereum.off('chainChanged', chainChangeHandler);
        window.ethereum.off('networkChanged', chainChangeHandler);
      }
    };
  }, []); // Empty deps - only run once

  const getChainId = async () => {
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(chainId, 16));
    } catch (error) {
      console.error('Error getting chain ID:', error);
    }
  };

  const getBalance = async (address: string) => {
    console.log('💰 Getting balance for address:', address);
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest']
      });
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      console.log('💰 Balance received:', balanceInEth, 'ETH');
      setBalance(balanceInEth);
    } catch (error) {
      console.error('❌ Error getting balance:', error);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Web3 wallet",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await getChainId();
        await getBalance(accounts[0]);
        
        toast({
          title: "Wallet connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setBalance(null);
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
    } catch (error: any) {
      // If the chain doesn't exist, add it
      if (error.code === 4902) {
        const network = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS];
        if (network) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${targetChainId.toString(16)}`,
                chainName: network.name,
                rpcUrls: [network.rpc],
              }],
            });
          } catch (addError) {
            toast({
              title: "Network switch failed",
              description: "Failed to add network",
              variant: "destructive",
            });
          }
        }
      } else {
        toast({
          title: "Network switch failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <WalletContext.Provider value={{
      account,
      chainId,
      isConnected,
      isConnecting,
      balance,
      connectWallet,
      disconnectWallet,
      switchNetwork,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};