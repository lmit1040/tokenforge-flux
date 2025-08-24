import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, ExternalLink, LogOut, Loader2 } from "lucide-react";

export const WalletConnection = () => {
  const { 
    account, 
    chainId, 
    isConnected, 
    isConnecting, 
    balance, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  const getNetworkName = (chainId: number | null) => {
    const networks: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon", 
      56: "BSC",
      43114: "Avalanche"
    };
    return chainId ? networks[chainId] || `Chain ${chainId}` : "Unknown";
  };

  const getNetworkColor = (chainId: number | null) => {
    const colors: Record<number, string> = {
      1: "bg-blue-500",
      137: "bg-purple-500",
      56: "bg-yellow-500",
      43114: "bg-red-500"
    };
    return chainId ? colors[chainId] || "bg-gray-500" : "bg-gray-500";
  };

  const getNetworkCurrency = (chainId: number | null) => {
    const symbols: Record<number, string> = {
      1: "ETH",
      137: "MATIC",
      56: "BNB",
      43114: "AVAX"
    };
    return chainId ? symbols[chainId] || "ETH" : "ETH";
  };

  const getExplorerUrl = (chainId: number | null) => {
    const explorers: Record<number, string> = {
      1: "https://etherscan.io/address/",
      137: "https://polygonscan.com/address/",
      56: "https://bscscan.com/address/",
      43114: "https://snowtrace.io/address/"
    };
    return chainId ? explorers[chainId] || "https://etherscan.io/address/" : "https://etherscan.io/address/";
  };

  if (!isConnected) {
    return (
      <Card className="gradient-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Connect your Web3 wallet to access DeFi features
          </p>
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full gradient-primary hover:opacity-90 transition-opacity"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connected
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Address</span>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`${getExplorerUrl(chainId)}${account}`, '_blank')}
                className="p-1 h-auto"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Network</span>
            <Badge className={`${getNetworkColor(chainId)} text-white`}>
              {getNetworkName(chainId)}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="text-sm font-mono">
              {balance ? `${balance} ${getNetworkCurrency(chainId)}` : "Loading..."}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};