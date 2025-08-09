import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Target, TrendingUp, AlertCircle, Zap } from "lucide-react";

export const ArbitrageSection = () => {
  const opportunities = [
    {
      tokenPair: "ETH/USDC",
      exchange1: "Uniswap V3",
      exchange2: "SushiSwap",
      price1: 2847.32,
      price2: 2851.89,
      profit: 0.16,
      profitUsd: 456.78,
      confidence: "High",
      timeLeft: "4m 23s"
    },
    {
      tokenPair: "LINK/ETH",
      exchange1: "Balancer",
      exchange2: "1inch",
      price1: 0.00521,
      price2: 0.00527,
      profit: 1.15,
      profitUsd: 234.56,
      confidence: "Medium",
      timeLeft: "7m 45s"
    },
    {
      tokenPair: "UNI/USDT",
      exchange1: "Curve",
      exchange2: "Uniswap V2",
      price1: 12.45,
      price2: 12.62,
      profit: 1.37,
      profitUsd: 189.23,
      confidence: "High",
      timeLeft: "2m 11s"
    }
  ];

  return (
    <section id="arbitrage">
      <Card className="gradient-card border-0 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <ArrowRightLeft className="w-5 h-5 mr-2 text-primary" />
                Arbitrage Opportunities
              </CardTitle>
              <CardDescription>Cross-DEX price differences</CardDescription>
            </div>
            <Badge variant="secondary" className="animate-pulse glow-primary">
              <Target className="w-3 h-3 mr-1" />
              Scanning
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">47</div>
              <div className="text-sm text-muted-foreground">Active Opps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">$1.2K</div>
              <div className="text-sm text-muted-foreground">24h Profit</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">92%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Top Opportunities</h4>
              <Button variant="outline" size="sm">
                Auto Execute
              </Button>
            </div>

            {opportunities.map((opp, index) => (
              <div key={index} className="p-4 rounded-lg bg-secondary/50 space-y-3 hover:bg-secondary/70 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-lg">{opp.tokenPair}</div>
                    <div className="text-sm text-muted-foreground">
                      {opp.exchange1} → {opp.exchange2}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-accent">
                      +${opp.profitUsd}
                    </div>
                    <div className="text-sm text-accent">
                      {opp.profit}% profit
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="space-x-4">
                    <span>
                      <span className="text-muted-foreground">Buy:</span> ${opp.price1}
                    </span>
                    <span>
                      <span className="text-muted-foreground">Sell:</span> ${opp.price2}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={opp.confidence === "High" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {opp.confidence}
                    </Badge>
                    <span className="text-muted-foreground">{opp.timeLeft}</span>
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full hover:gradient-primary hover:text-primary-foreground transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Execute Trade
                </Button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-warning">Risk Notice</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Arbitrage involves MEV risk and gas fees. Prices can change rapidly during execution.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};