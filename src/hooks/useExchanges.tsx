import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface ExchangeBalance {
  id: string;
  symbol: string;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  usdValue: number;
  lastUpdated: string;
}

interface ExchangeConnection {
  id: string;
  exchangeName: string;
  isActive: boolean;
  lastSyncAt: string | null;
  createdAt: string;
}

interface ExchangeContextType {
  connections: ExchangeConnection[];
  balances: ExchangeBalance[];
  isLoading: boolean;
  connectExchange: (exchangeName: string, apiKey: string, apiSecret: string) => Promise<boolean>;
  disconnectExchange: (connectionId: string) => Promise<boolean>;
  syncBalances: (connectionId?: string) => Promise<void>;
  getTotalPortfolioValue: () => number;
  getBalancesByExchange: (exchangeName: string) => ExchangeBalance[];
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined);

export const useExchanges = () => {
  const context = useContext(ExchangeContext);
  if (!context) {
    throw new Error('useExchanges must be used within an ExchangeProvider');
  }
  return context;
};

interface ExchangeProviderProps {
  children: ReactNode;
}

export const ExchangeProvider = ({ children }: ExchangeProviderProps) => {
  const [connections, setConnections] = useState<ExchangeConnection[]>([]);
  const [balances, setBalances] = useState<ExchangeBalance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadConnections();
      loadBalances();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      const { data, error } = await supabase
        .from('exchange_connections')
        .select('id, exchange_name, is_active, last_sync_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConnections(data.map(conn => ({
        id: conn.id,
        exchangeName: conn.exchange_name,
        isActive: conn.is_active,
        lastSyncAt: conn.last_sync_at,
        createdAt: conn.created_at,
      })));
    } catch (error) {
      console.error('Error loading connections:', error);
      toast({
        title: "Error",
        description: "Failed to load exchange connections",
        variant: "destructive",
      });
    }
  };

  const loadBalances = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('external_balances')
        .select(`
          id,
          symbol,
          balance,
          available_balance,
          locked_balance,
          usd_value,
          last_updated,
          exchange_connections!inner(exchange_name)
        `)
        .order('usd_value', { ascending: false });

      if (error) throw error;

      setBalances(data.map(balance => ({
        id: balance.id,
        symbol: balance.symbol,
        balance: parseFloat(balance.balance.toString()),
        availableBalance: parseFloat(balance.available_balance.toString()),
        lockedBalance: parseFloat(balance.locked_balance.toString()),
        usdValue: parseFloat(balance.usd_value.toString()),
        lastUpdated: balance.last_updated,
      })));
    } catch (error) {
      console.error('Error loading balances:', error);
      toast({
        title: "Error",
        description: "Failed to load exchange balances",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const connectExchange = async (exchangeName: string, apiKey: string, apiSecret: string): Promise<boolean> => {
    try {
      // Call edge function to encrypt and store credentials
      const { data, error } = await supabase.functions.invoke('connect-exchange', {
        body: {
          exchangeName,
          apiKey,
          apiSecret,
        },
      });

      if (error) throw error;

      toast({
        title: "Exchange Connected",
        description: `Successfully connected to ${exchangeName}`,
      });

      await loadConnections();
      await syncBalances(data.connectionId);
      return true;
    } catch (error) {
      console.error('Error connecting exchange:', error);
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${exchangeName}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const disconnectExchange = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('exchange_connections')
        .update({ is_active: false })
        .eq('id', connectionId);

      if (error) throw error;

      toast({
        title: "Exchange Disconnected",
        description: "Exchange connection has been disabled",
      });

      await loadConnections();
      await loadBalances();
      return true;
    } catch (error) {
      console.error('Error disconnecting exchange:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect exchange",
        variant: "destructive",
      });
      return false;
    }
  };

  const syncBalances = async (connectionId?: string): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('sync-exchange-balances', {
        body: { connectionId },
      });

      if (error) throw error;

      toast({
        title: "Sync Complete",
        description: "Exchange balances have been updated",
      });

      await loadBalances();
    } catch (error) {
      console.error('Error syncing balances:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync exchange balances",
        variant: "destructive",
      });
    }
  };

  const getTotalPortfolioValue = (): number => {
    return balances.reduce((total, balance) => total + balance.usdValue, 0);
  };

  const getBalancesByExchange = (exchangeName: string): ExchangeBalance[] => {
    return balances.filter(balance => 
      connections.some(conn => 
        conn.exchangeName === exchangeName && conn.isActive
      )
    );
  };

  const value: ExchangeContextType = {
    connections,
    balances,
    isLoading,
    connectExchange,
    disconnectExchange,
    syncBalances,
    getTotalPortfolioValue,
    getBalancesByExchange,
  };

  return (
    <ExchangeContext.Provider value={value}>
      {children}
    </ExchangeContext.Provider>
  );
};