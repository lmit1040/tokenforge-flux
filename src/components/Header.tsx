import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { Wallet, Settings, Bell, LogOut, User } from "lucide-react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { isConnected, account } = useWallet();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center glow-primary">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-foreground">DeFi Suite</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isConnected && (
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                <Wallet className="w-3 h-3 mr-1" />
                {account?.slice(0, 6)}...{account?.slice(-4)}
              </Badge>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={signOut}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};