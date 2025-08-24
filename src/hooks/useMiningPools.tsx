import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  riskLevel?: 'Low' | 'Medium' | 'High';
}

interface MiningPoolsResponse {
  pools: MiningPool[];
  lastUpdated: string;
  totalPools: number;
}

export const useMiningPools = () => {
  const [pools, setPools] = useState<MiningPool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPools = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching live mining pools...');
      
      const { data, error } = await supabase.functions.invoke('mining-pools', {
        body: {}
      });

      if (error) {
        console.error('Error fetching mining pools:', error);
        toast({
          title: "Failed to fetch mining pools",
          description: "Using cached data",
          variant: "destructive"
        });
        return;
      }

      const response = data as MiningPoolsResponse;
      
      if (response.pools && Array.isArray(response.pools)) {
        setPools(response.pools);
        setLastUpdated(response.lastUpdated);
        console.log(`Updated with ${response.pools.length} live mining pools`);
      }

    } catch (error) {
      console.error('Mining pools fetch error:', error);
      toast({
        title: "Error fetching pools",
        description: "Check console for details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and periodic updates
  useEffect(() => {
    fetchPools();
    
    // Update every 30 seconds
    const interval = setInterval(fetchPools, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const refreshPools = () => {
    fetchPools();
  };

  return {
    pools,
    isLoading,
    lastUpdated,
    refreshPools,
    totalPools: pools.length
  };
};