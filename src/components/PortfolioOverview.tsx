import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Wallet, Coins, Activity, Zap } from "lucide-react";
import { usePortfolio } from "@/contexts/PortfolioContext";

export const PortfolioOverview = () => {
  const { totalValue, dailyChange, dailyChangePercent, positions, activePositions, yieldEarned, arbitrageProfit } = usePortfolio();

  return (
    <section id="portfolio" className="space-y-6">
      <h2 className="text-3xl font-bold">Portfolio Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="gradient-card border-0 hover:scale-105 transition-transform">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Wallet className="w-4 h-4 mr-2" />
              Total Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ${totalValue.toLocaleString()}
            </div>
            <div className={`flex items-center text-sm mt-2 ${dailyChange >= 0 ? 'text-accent' : 'text-destructive'}`}>
              {dailyChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
              ${Math.abs(dailyChange).toFixed(2)} ({Math.abs(dailyChangePercent).toFixed(2)}%)
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 hover:scale-105 transition-transform">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Active Positions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activePositions}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Across 8 protocols
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 hover:scale-105 transition-transform">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Coins className="w-4 h-4 mr-2" />
              Yield Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">${yieldEarned.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-2">
              This month
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 hover:scale-105 transition-transform">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Arbitrage Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${arbitrageProfit.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-2">
              Last 24h
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="gradient-card border-0">
        <CardHeader>
          <CardTitle>Top Holdings</CardTitle>
          <CardDescription>Your largest positions by value</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.map((position) => (
              <div key={position.symbol} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">{position.symbol}</span>
                  </div>
                  <div>
                    <div className="font-medium">{position.symbol}</div>
                    <div className="text-sm text-muted-foreground">{position.balance.toLocaleString()} tokens</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${position.value.toLocaleString()}</div>
                  <div className={`text-sm ${position.change >= 0 ? 'text-accent' : 'text-destructive'}`}>
                    {position.change >= 0 ? '+' : ''}{position.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};