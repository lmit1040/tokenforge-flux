import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ArbitrageOpportunity } from '@/contexts/PortfolioContext';

export function useArbitrageScanner() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanForOpportunities = async () => {
    setIsScanning(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke('arbitrage-scanner');
      
      if (error) {
        console.error('Scanner error:', error);
        setError(error.message);
        return;
      }

      if (data && data.ok) {
        setOpportunities(data.opportunities || []);
        setLastScan(data.timestamp);
      } else {
        setError(data?.error || 'Unknown error occurred');
      }
    } catch (err: any) {
      console.error('Scanner exception:', err);
      setError(err.message || 'Network error');
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan every 30 seconds
  useEffect(() => {
    scanForOpportunities();
    
    const interval = setInterval(() => {
      scanForOpportunities();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    opportunities,
    isScanning,
    lastScan,
    error,
    scanForOpportunities
  };
}