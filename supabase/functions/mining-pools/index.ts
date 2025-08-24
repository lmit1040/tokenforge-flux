import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MiningPool {
  name: string;
  apy: number;
  tvl: number;
  rewards: string[];
  userStake: number;
  earned: number;
  progress: number;
  protocol: string;
  chain: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching live mining pools data...');

    // Simulate fetching from multiple DeFi protocols
    const livePoolsData: MiningPool[] = [
      // Uniswap V3 pools
      {
        name: "ETH/USDC V3",
        apy: 28.7 + (Math.random() * 10 - 5), // Simulate price volatility
        tvl: 145000000 + (Math.random() * 20000000 - 10000000),
        rewards: ["UNI", "ETH", "USDC"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Uniswap V3",
        chain: "Ethereum",
        riskLevel: "Low"
      },
      {
        name: "WBTC/ETH V3", 
        apy: 22.3 + (Math.random() * 8 - 4),
        tvl: 89000000 + (Math.random() * 15000000 - 7500000),
        rewards: ["UNI", "WBTC", "ETH"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Uniswap V3",
        chain: "Ethereum",
        riskLevel: "Medium"
      },
      // Aave pools
      {
        name: "USDC Lending",
        apy: 12.8 + (Math.random() * 6 - 3),
        tvl: 234000000 + (Math.random() * 30000000 - 15000000),
        rewards: ["AAVE", "stkAAVE"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Aave V3",
        chain: "Ethereum",
        riskLevel: "Low"
      },
      {
        name: "ETH Lending",
        apy: 8.4 + (Math.random() * 4 - 2),
        tvl: 187000000 + (Math.random() * 25000000 - 12500000),
        rewards: ["AAVE"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Aave V3",
        chain: "Ethereum",
        riskLevel: "Low"
      },
      // Compound pools
      {
        name: "COMP Staking",
        apy: 16.2 + (Math.random() * 7 - 3.5),
        tvl: 67000000 + (Math.random() * 10000000 - 5000000),
        rewards: ["COMP"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Compound V3",
        chain: "Ethereum",
        riskLevel: "Medium"
      },
      // Curve pools
      {
        name: "3CRV Pool",
        apy: 19.6 + (Math.random() * 8 - 4),
        tvl: 156000000 + (Math.random() * 20000000 - 10000000),
        rewards: ["CRV", "CVX"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Curve Finance",
        chain: "Ethereum",
        riskLevel: "Low"
      },
      // Yearn vaults
      {
        name: "yvUSDC Vault",
        apy: 24.1 + (Math.random() * 9 - 4.5),
        tvl: 78000000 + (Math.random() * 12000000 - 6000000),
        rewards: ["YFI", "USDC"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Yearn Finance",
        chain: "Ethereum",
        riskLevel: "Medium"
      },
      // Polygon pools
      {
        name: "MATIC/USDC QuickSwap",
        apy: 34.5 + (Math.random() * 12 - 6),
        tvl: 45000000 + (Math.random() * 8000000 - 4000000),
        rewards: ["QUICK", "MATIC", "USDC"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "QuickSwap",
        chain: "Polygon",
        riskLevel: "High"
      },
      // Arbitrum pools
      {
        name: "ARB/ETH Camelot",
        apy: 41.8 + (Math.random() * 15 - 7.5),
        tvl: 32000000 + (Math.random() * 6000000 - 3000000),
        rewards: ["ARB", "GRAIL", "ETH"],
        userStake: 0,
        earned: 0,
        progress: 0,
        protocol: "Camelot",
        chain: "Arbitrum",
        riskLevel: "High"
      }
    ];

    // Sort by APY descending
    livePoolsData.sort((a, b) => b.apy - a.apy);

    console.log(`Found ${livePoolsData.length} live mining pools`);

    return new Response(
      JSON.stringify({ 
        pools: livePoolsData,
        lastUpdated: new Date().toISOString(),
        totalPools: livePoolsData.length
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );

  } catch (error) {
    console.error('Error fetching mining pools:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch mining pools data',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
})