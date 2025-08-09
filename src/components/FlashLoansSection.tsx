import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, DollarSign, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

export const FlashLoansSection = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("ETH");
  const [strategy, setStrategy] = useState("");

  const protocols = [
    { name: "Aave", fee: "0.09%", available: "150M", status: "Active" },
    { name: "dYdX", fee: "0.00%", available: "89M", status: "Active" },
    { name: "Balancer", fee: "0.05%", available: "234M", status: "Active" },
    { name: "Uniswap V3", fee: "0.30%", available: "445M", status: "Active" }
  ];

  const strategies = [
    {
      name: "Arbitrage",
      description: "Price difference exploitation",
      complexity: "Medium",
      avgReturn: "0.5-3%"
    },
    {
      name: "Liquidation",
      description: "Liquidate undercollateralized positions",
      complexity: "High",
      avgReturn: "2-8%"
    },
    {
      name: "Collateral Swap",
      description: "Change collateral without closing position",
      complexity: "Low",
      avgReturn: "0.1-0.5%"
    }
  ];

  return (
    <section id="flashloans">
      <Card className="gradient-card border-0 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Zap className="w-5 h-5 mr-2 text-warning" />
                Flash Loans
              </CardTitle>
              <CardDescription>Uncollateralized instant loans</CardDescription>
            </div>
            <Badge variant="secondary" className="glow-accent">
              <Clock className="w-3 h-3 mr-1" />
              Real-time
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asset">Loan Asset</Label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ETH">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      ETH
                    </div>
                  </SelectItem>
                  <SelectItem value="USDC">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      USDC
                    </div>
                  </SelectItem>
                  <SelectItem value="DAI">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-warning rounded-full mr-2"></div>
                      DAI
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Loan Amount</Label>
              <Input
                id="amount"
                placeholder="0.00"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="strategy">Strategy</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger>
                <SelectValue placeholder="Select a strategy" />
              </SelectTrigger>
              <SelectContent>
                {strategies.map((strat, index) => (
                  <SelectItem key={index} value={strat.name}>
                    <div>
                      <div className="font-medium">{strat.name}</div>
                      <div className="text-sm text-muted-foreground">{strat.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Available Protocols</h4>
            <div className="space-y-3">
              {protocols.map((protocol, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div>
                    <div className="font-medium">{protocol.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Available: ${protocol.available}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{protocol.fee} fee</div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {protocol.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {loanAmount && selectedAsset && strategy && (
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Loan Amount:</span>
                <span className="font-medium">{loanAmount} {selectedAsset}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Est. Fee:</span>
                <span className="font-medium">~0.09% ({(parseFloat(loanAmount || "0") * 0.0009).toFixed(4)} {selectedAsset})</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Min. Profit Required:</span>
                <span className="font-medium text-warning">{(parseFloat(loanAmount || "0") * 0.001).toFixed(4)} {selectedAsset}</span>
              </div>
            </div>
          )}

          <Button 
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            disabled={!loanAmount || !selectedAsset || !strategy}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Execute Flash Loan
          </Button>

          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-destructive">High Risk Operation</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Flash loans must be repaid in the same transaction. Failed transactions lose gas fees. Use with caution.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};