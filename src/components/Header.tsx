import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Activity, Settings } from "lucide-react";

export const Header = () => {
  return (
    <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg gradient-primary animate-pulse-glow"></div>
            <h1 className="text-2xl font-bold">DeFiSuite</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#portfolio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Portfolio</a>
            <a href="#mint" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mint</a>
            <a href="#mine" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Mine</a>
            <a href="#arbitrage" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Arbitrage</a>
            <a href="#flashloans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Flash Loans</a>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="hidden sm:flex">
            <Activity className="w-3 h-3 mr-1" />
            Mainnet
          </Badge>
          
          <Button variant="outline" size="sm">
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </Button>
          
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};