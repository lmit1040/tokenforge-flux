import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Pickaxe, TrendingUp, Clock, Zap } from "lucide-react";

export const MiningSection = () => {
  const miningPools = [
    {
      name: "ETH/USDC LP",
      apy: 24.5,
      tvl: 125000000,
      rewards: ["ETH", "USDC", "COMP"],
      userStake: 15000,
      earned: 247.89,
      progress: 68
    },
    {
      name: "LINK Staking",
      apy: 18.2,
      tvl: 89000000,
      rewards: ["LINK"],
      userStake: 8500,
      earned: 156.32,
      progress: 45
    },
    {
      name: "Yield Farming",
      apy: 31.8,
      tvl: 45000000,
      rewards: ["FARM", "ETH"],
      userStake: 5200,
      earned: 89.45,
      progress: 23
    }
  ];

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
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-accent">$28.7K</div>
              <div className="text-sm text-muted-foreground">Total Staked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">$493</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">23.4%</div>
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

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Harvest
                  </Button>
                  <Button variant="secondary" size="sm" className="flex-1">
                    Add Stake
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full gradient-accent text-accent-foreground hover:opacity-90 transition-opacity">
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