import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pickaxe, TrendingUp, Clock, Zap, Wallet, AlertTriangle } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useWallet } from "@/hooks/useWallet";
import { TransactionStatus } from "@/components/TransactionStatus";
import { UnstakeDialog } from "@/components/UnstakeDialog";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const MiningSection = () => {
  const { miningPools, stakeInPool, unstakeFromPool, harvestRewards } = usePortfolio();
  const { balances, hasEnoughBalance, getTokenBalance, isLoading: balancesLoading } = useTokenBalances();
  const { pendingTransactions, clearTransaction } = useBlockchain();
  const { isConnected } = useWallet();
  const [stakeAmounts, setStakeAmounts] = useState<{ [key: number]: string }>({});
  const [selectedTokens, setSelectedTokens] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const totalStaked = miningPools.reduce((sum, pool) => sum + pool.userStake, 0);
  const totalEarned = miningPools.reduce((sum, pool) => sum + pool.earned, 0);
  const avgAPY = miningPools.reduce((sum, pool) => sum + pool.apy, 0) / miningPools.length;

  const handleStake = (poolIndex: number) => {
    const amount = parseFloat(stakeAmounts[poolIndex] || "0");
    const selectedToken = selectedTokens[poolIndex] || 'USDC';
    
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to stake tokens",
        variant: "destructive"
      });
      return;
    }

    if (amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid stake amount",
        variant: "destructive"
      });
      return;
    }

    if (!hasEnoughBalance(selectedToken, amount)) {
      const tokenBalance = getTokenBalance(selectedToken);
      toast({
        title: "Insufficient balance",
        description: `You need ${amount} ${selectedToken} but only have ${tokenBalance?.balance || '0'}`,
        variant: "destructive"
      });
      return;
    }

    stakeInPool(poolIndex, amount, selectedToken);
    setStakeAmounts(prev => ({ ...prev, [poolIndex]: "" }));
  };

  const handleHarvest = (poolIndex: number) => {
    harvestRewards(poolIndex);
  };

  const handleExploreNewPools = () => {
    toast({
      title: "Discovering New Pools",
      description: "Scanning for new high-yield opportunities...",
    });
  };

  return (
    <section id="mine">
      <Card className="gradient-card border-0 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Pickaxe className="w-5 h-5 mr-2 text-accent" />
                Yield Mining
              </CardTitle>
              <CardDescription>Stake tokens and earn rewards</CardDescription>
            </div>
            <Badge variant="secondary" className="glow-accent">
              <Zap className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Transaction Status */}
          {Object.keys(pendingTransactions).length > 0 && (
            <TransactionStatus 
              transactions={pendingTransactions} 
              onClear={clearTransaction} 
            />
          )}
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent">${(totalStaked / 1000).toFixed(1)}K</div>
              <div className="text-sm text-muted-foreground">Total Staked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">${totalEarned.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">{avgAPY.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg APY</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Active Positions</h4>
            {miningPools.map((pool, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{pool.name}</div>
                    <div className="text-sm text-muted-foreground">
                      TVL: ${(pool.tvl / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="text-accent">
                      {pool.apy}% APY
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {pool.rewards.map((reward, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {reward}
                    </Badge>
                  ))}
                </div>

                <Progress value={pool.progress} className="h-2" />

                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-muted-foreground">Staked: </span>
                    <span className="font-medium">${pool.userStake.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Earned: </span>
                    <span className="font-medium text-accent">${pool.earned}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {!isConnected && (
                    <div className="flex items-center space-x-2 p-2 bg-warning/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <span className="text-sm text-warning">Connect wallet to stake</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleHarvest(index)}
                      disabled={pool.earned === 0}
                    >
                      Harvest
                    </Button>
                    
                    <UnstakeDialog
                      poolName={pool.name}
                      poolIndex={index}
                      userStake={pool.userStake}
                      onUnstake={unstakeFromPool}
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Select
                      value={selectedTokens[index] || 'USDC'}
                      onValueChange={(value) => setSelectedTokens(prev => ({ ...prev, [index]: value }))}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {balances.length > 0 ? (
                          balances.map((token) => (
                            <SelectItem key={token.symbol} value={token.symbol}>
                              {token.symbol}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="DAI">DAI</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="flex-1"
                      value={stakeAmounts[index] || ""}
                      onChange={(e) => setStakeAmounts(prev => ({ ...prev, [index]: e.target.value }))}
                      disabled={!isConnected}
                    />
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleStake(index)}
                      disabled={!isConnected || !stakeAmounts[index] || parseFloat(stakeAmounts[index]) <= 0 || balancesLoading}
                    >
                      Stake
                    </Button>
                  </div>
                  
                  {isConnected && (
                    <div className="text-xs text-muted-foreground">
                      Available: {(() => {
                        const selectedToken = selectedTokens[index] || 'USDC';
                        const tokenBalance = getTokenBalance(selectedToken);
                        return tokenBalance ? `${parseFloat(tokenBalance.availableBalance).toFixed(4)} ${selectedToken}` : `0 ${selectedToken}`;
                      })()} | 
                      Staked: {(() => {
                        const selectedToken = selectedTokens[index] || 'USDC';
                        const tokenBalance = getTokenBalance(selectedToken);
                        return tokenBalance ? `${parseFloat(tokenBalance.stakedBalance).toFixed(4)} ${selectedToken}` : `0 ${selectedToken}`;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button 
            className="w-full gradient-accent text-accent-foreground hover:opacity-90 transition-opacity"
            onClick={handleExploreNewPools}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Explore New Pools
          </Button>

          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              Next reward in 2h 34m
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};