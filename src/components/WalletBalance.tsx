import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wallet, RefreshCw, TrendingUp } from "lucide-react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useWallet } from "@/hooks/useWallet";

export const WalletBalance = () => {
  const { balances, isLoading, lastUpdated, refreshBalances, totalValue } = useTokenBalances();
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <Card className="gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Wallet className="w-5 h-5 mr-2 text-accent" />
            Wallet Balance
          </CardTitle>
          <CardDescription>Connect your wallet to view balances</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center text-xl">
              <Wallet className="w-5 h-5 mr-2 text-accent" />
              Wallet Balance
            </CardTitle>
            <CardDescription>
              Your available tokens for staking
              {lastUpdated && (
                <span className="ml-2 text-xs">
                  • Updated {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBalances}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-accent" />
            <span className="font-medium">Total Value</span>
          </div>
          <span className="text-lg font-bold text-accent">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading balances...
          </div>
        ) : balances.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No tokens found in wallet
          </div>
        ) : (
          <div className="space-y-3">
            {balances.map((token, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {token.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      ${token.price.toFixed(token.symbol.includes('USD') ? 2 : 4)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-medium">
                    {parseFloat(token.balance).toLocaleString(undefined, { 
                      minimumFractionDigits: 0, 
                      maximumFractionDigits: 4 
                    })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${token.value.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};