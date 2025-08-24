import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TokenMinting } from "@/components/TokenMinting";
import { MiningSection } from "@/components/MiningSection";
import { ArbitrageSection } from "@/components/ArbitrageSection";
import { FlashLoansSection } from "@/components/FlashLoansSection";
import { EnhancedArbitrager } from "@/components/EnhancedArbitrager";
import { PriceMonitor } from "@/components/PriceMonitor";
import { WalletConnection } from "@/components/WalletConnection";
import { WalletBalance } from "@/components/WalletBalance";
import { ExchangePortfolioSection } from "@/components/ExchangePortfolioSection";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DeFi Protocol Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced token operations, arbitrage opportunities, and flash loan protocols 
            supporting ERC20 and ERC3643 standards
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <PortfolioOverview />
          <WalletConnection />
          <WalletBalance />
        </div>
        
        <ExchangePortfolioSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TokenMinting />
              <MiningSection />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ArbitrageSection />
              <FlashLoansSection />
            </div>
            
            <EnhancedArbitrager />
          </div>
          
          <div className="space-y-8">
            <PriceMonitor />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;