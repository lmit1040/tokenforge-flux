import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowRightLeft, Zap, DollarSign, Target, TrendingUp, AlertCircle, Calculator } from "lucide-react";
import { useState } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";

interface EnhancedArbitrageOpportunity {
  tokenPair: string;
  exchange1: string;
  exchange2: string;
  price1: number;
  price2: number;
  profit: number;
  profitUsd: number;
  confidence: string;
  timeLeft: string;
  maxCapital: number;
  optimalFlashLoan: number;
  enhancedProfit: number;
  roi: number;
}

export const EnhancedArbitrager = () => {
  const { arbitrageOpportunities, executeArbitrage, arbitrageProfit } = usePortfolio();
  const [useFlashLoan, setUseFlashLoan] = useState(true);
  const [maxLeverage, setMaxLeverage] = useState("5");
  const [minProfitThreshold, setMinProfitThreshold] = useState("100");

  // Enhanced opportunities with flash loan calculations
  const enhancedOpportunities: EnhancedArbitrageOpportunity[] = arbitrageOpportunities.map(opp => {
    const maxCapital = 100000; // Mock max available capital
    const leverage = parseFloat(maxLeverage);
    const optimalFlashLoan = useFlashLoan ? Math.min(maxCapital * leverage, opp.profitUsd * 50) : 0;
    const flashLoanFee = optimalFlashLoan * 0.0009;
    const enhancedProfit = useFlashLoan ? 
      (optimalFlashLoan * (opp.profit / 100)) - flashLoanFee : 
      opp.profitUsd;
    const roi = enhancedProfit / (optimalFlashLoan || opp.profitUsd) * 100;

    return {
      ...opp,
      maxCapital,
      optimalFlashLoan,
      enhancedProfit,
      roi
    };
  });

  const filteredOpportunities = enhancedOpportunities.filter(
    opp => opp.enhancedProfit >= parseFloat(minProfitThreshold)
  );

  const handleExecuteEnhancedArbitrage = (index: number) => {
    const opportunity = filteredOpportunities[index];
    executeArbitrage(index);
    
    // Additional flash loan execution if enabled
    if (useFlashLoan && opportunity.optimalFlashLoan > 0) {
      // This would execute the flash loan strategy
      console.log(`Executing flash loan of $${opportunity.optimalFlashLoan.toFixed(0)} for enhanced arbitrage`);
    }
  };

  const totalPotentialProfit = filteredOpportunities.reduce((sum, opp) => sum + opp.enhancedProfit, 0);

  return (
    <section id="enhanced-arbitrager">
      <Card className="gradient-card border-0 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Target className="w-5 h-5 mr-2 text-accent" />
                Enhanced Arbitrager
              </CardTitle>
              <CardDescription>Flash loan-powered arbitrage opportunities</CardDescription>
            </div>
            <Badge variant="secondary" className="animate-pulse glow-accent">
              <Calculator className="w-3 h-3 mr-1" />
              AI-Optimized
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Configuration Panel */}
          <div className="p-4 rounded-lg bg-secondary/30 space-y-4">
            <h4 className="font-medium">Strategy Configuration</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leverage">Max Leverage</Label>
                <Input
                  id="leverage"
                  value={maxLeverage}
                  onChange={(e) => setMaxLeverage(e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <Label htmlFor="threshold">Min Profit ($)</Label>
                <Input
                  id="threshold"
                  value={minProfitThreshold}
                  onChange={(e) => setMinProfitThreshold(e.target.value)}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="flash-loan"
                checked={useFlashLoan}
                onCheckedChange={setUseFlashLoan}
              />
              <Label htmlFor="flash-loan">Use Flash Loans for Amplification</Label>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{filteredOpportunities.length}</div>
              <div className="text-sm text-muted-foreground">Qualified Opps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">${totalPotentialProfit.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">Total Potential</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">{maxLeverage}x</div>
              <div className="text-sm text-muted-foreground">Max Leverage</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">${arbitrageProfit.toFixed(0)}</div>
              <div className="text-sm text-muted-foreground">24h Profits</div>
            </div>
          </div>

          <Separator />

          {/* Enhanced Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Enhanced Opportunities</h4>
              <Button variant="outline" size="sm" className="gradient-primary text-primary-foreground">
                Execute All Profitable
              </Button>
            </div>

            {filteredOpportunities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No opportunities meet your profit threshold
              </div>
            ) : (
              filteredOpportunities.map((opp, index) => (
                <div key={index} className="p-4 rounded-lg bg-gradient-to-r from-secondary/30 to-secondary/50 space-y-3 hover:from-secondary/50 hover:to-secondary/70 transition-all border border-primary/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-lg">{opp.tokenPair}</div>
                      <div className="text-sm text-muted-foreground">
                        {opp.exchange1} → {opp.exchange2}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-accent">
                        +${opp.enhancedProfit.toFixed(0)}
                      </div>
                      <div className="text-sm text-accent">
                        {opp.roi.toFixed(1)}% ROI
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Base Profit:</span> ${opp.profitUsd}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Flash Loan:</span> ${opp.optimalFlashLoan.toFixed(0)}
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
                    onClick={() => handleExecuteEnhancedArbitrage(index)}
                  >
                    {useFlashLoan ? (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Execute Flash Arbitrage
                      </>
                    ) : (
                      <>
                        <ArrowRightLeft className="w-4 h-4 mr-2" />
                        Execute Standard Trade
                      </>
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>

          {/* Risk Warning */}
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-warning">Enhanced Risk Notice</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Flash loan arbitrage amplifies both profits and risks. Failed transactions lose gas fees and flash loan fees. 
                  Higher leverage increases MEV vulnerability.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};