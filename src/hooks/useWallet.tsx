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
    console.log('🚀 WalletProvider useEffect triggered');
    
    if (typeof window === "undefined" || !window.ethereum) {
      console.log('❌ No ethereum object found');
      return;
    }

    let mounted = true;
    
    const initializeWallet = async () => {
      try {
        console.log('🔗 Initializing wallet connection...');
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('🔍 Initial accounts check:', accounts);
        
        if (accounts.length > 0 && mounted) {
          console.log('🔗 Setting initial account:', accounts[0]);
          setAccount(accounts[0]);
          await getChainId();
          await getBalance(accounts[0]);
        }
      } catch (error) {
        console.error('❌ Error initializing wallet:', error);
      }
    };

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('🔄 ACCOUNTS CHANGED EVENT:', accounts);
      
      if (!mounted) return;
      
      if (accounts.length > 0) {
        console.log('✅ New account detected:', accounts[0]);
        setAccount(accounts[0]);
        await getBalance(accounts[0]);
      } else {
        console.log('❌ No accounts - disconnecting');
        setAccount(null);
        setBalance(null);
      }
    };

    const handleChainChanged = async (chainId: string) => {
      console.log('🔄 CHAIN CHANGED EVENT:', chainId);
      
      if (!mounted) return;
      
      const newChainId = parseInt(chainId, 16);
      console.log('🔄 Setting new chain ID:', newChainId);
      setChainId(newChainId);
      
      if (account) {
        await getBalance(account);
      }
    };

    // Initialize wallet
    initializeWallet();

    // Set up event listeners
    console.log('📡 Setting up MetaMask event listeners...');
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Manual polling as backup since MetaMask events can be unreliable
    const pollForAccountChanges = async () => {
      if (!mounted) return;
      
      try {
        const currentAccounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (currentAccounts.length > 0) {
          const currentAccount = currentAccounts[0];
          
          if (currentAccount !== account) {
            console.log('🔄 Polling detected account change from:', account, 'to:', currentAccount);
            handleAccountsChanged(currentAccounts);
          }
        } else if (account !== null) {
          console.log('🔄 Polling detected account disconnection');
          handleAccountsChanged([]);
        }
      } catch (error) {
        console.error('❌ Error polling for account changes:', error);
      }
    };

    const pollInterval = setInterval(pollForAccountChanges, 2000);

    return () => {
      console.log('🧹 Cleaning up wallet listeners');
      mounted = false;
      clearInterval(pollInterval);
      
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []); // Empty dependency array

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