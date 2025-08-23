import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Zap, DollarSign, AlertTriangle, Clock, TrendingUp, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { useFlashLoans } from "@/hooks/useFlashLoans";
import { useWallet } from "@/hooks/useWallet";

export const FlashLoansSection = () => {
  const { executeFlashLoan } = usePortfolio();
  const { isLoading, lastQuote, getFlashLoanQuote, executeFlashLoan: executeRealFlashLoan, getAvailableLiquidity } = useFlashLoans();
  const { account, isConnected } = useWallet();
  const [loanAmount, setLoanAmount] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("ETH");
  const [strategy, setStrategy] = useState("");
  const [liquidity, setLiquidity] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadLiquidity = async () => {
      const assets = ['ETH', 'USDC', 'DAI'];
      const liquidityData = {};
      for (const asset of assets) {
        liquidityData[asset] = await getAvailableLiquidity(asset);
      }
      setLiquidity(liquidityData);
    };
    loadLiquidity();
  }, []);

  const handleGetQuote = async () => {
    if (loanAmount && selectedAsset && strategy) {
      await getFlashLoanQuote(selectedAsset, loanAmount, strategy);
    }
  };

  const handleExecuteFlashLoan = async () => {
    if (loanAmount && selectedAsset && strategy && account) {
      const result = await executeRealFlashLoan(selectedAsset, loanAmount, strategy, account);
      if (result.success) {
        executeFlashLoan(selectedAsset, loanAmount, strategy); // Update portfolio context
        setLoanAmount("");
        setStrategy("");
      }
    }
  };

  const protocols = [
    { 
      name: "Aave V3", 
      fee: "0.09%", 
      available: liquidity.ETH ? `${(liquidity.ETH.available / 1000).toFixed(0)}K ETH` : "Loading...", 
      status: "Active",
      apy: liquidity.ETH?.apy || 0
    },
    { 
      name: "Aave V3 USDC", 
      fee: "0.09%", 
      available: liquidity.USDC ? `${(liquidity.USDC.available / 1000000).toFixed(0)}M USDC` : "Loading...", 
      status: "Active",
      apy: liquidity.USDC?.apy || 0
    },
    { 
      name: "Aave V3 DAI", 
      fee: "0.09%", 
      available: liquidity.DAI ? `${(liquidity.DAI.available / 1000000).toFixed(0)}M DAI` : "Loading...", 
      status: "Active",
      apy: liquidity.DAI?.apy || 0
    }
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

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleGetQuote}
              disabled={!loanAmount || !selectedAsset || !strategy || isLoading}
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Get Live Quote
            </Button>
          </div>

          {lastQuote && (
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 space-y-3">
              <h4 className="font-medium text-accent">Live Flash Loan Quote</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Loan Amount:</span>
                  <span className="font-medium">{lastQuote.amount} {lastQuote.asset}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee (0.09%):</span>
                  <span className="font-medium">{lastQuote.fee.toFixed(4)} {lastQuote.asset}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected Profit:</span>
                  <span className="font-medium text-accent">{lastQuote.expectedProfit.toFixed(4)} {lastQuote.asset}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gas Estimate:</span>
                  <span className="font-medium">{lastQuote.gasEstimate}</span>
                </div>
              </div>
            </div>
          )}

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
                    <div className="text-xs text-muted-foreground">APY: {protocol.apy}%</div>
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
            disabled={!loanAmount || !selectedAsset || !strategy || !isConnected || isLoading}
            onClick={handleExecuteFlashLoan}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {isLoading ? 'Executing...' : 'Execute Flash Loan'}
          </Button>

          {!isConnected && (
            <div className="text-center text-sm text-muted-foreground">
              Connect your wallet to execute flash loans
            </div>
          )}

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