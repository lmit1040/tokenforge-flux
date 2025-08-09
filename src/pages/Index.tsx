import { Header } from "@/components/Header";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { TokenMinting } from "@/components/TokenMinting";
import { MiningSection } from "@/components/MiningSection";
import { ArbitrageSection } from "@/components/ArbitrageSection";
import { FlashLoansSection } from "@/components/FlashLoansSection";

const Index = () => {
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

        <PortfolioOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <TokenMinting />
          <MiningSection />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ArbitrageSection />
          <FlashLoansSection />
        </div>
      </main>
    </div>
  );
};

export default Index;