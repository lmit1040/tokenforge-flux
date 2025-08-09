import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Coins, Sparkles, Shield, Info } from "lucide-react";
import { useState } from "react";

export const TokenMinting = () => {
  const [tokenStandard, setTokenStandard] = useState("ERC20");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");

  return (
    <section id="mint">
      <Card className="gradient-card border-0 h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Coins className="w-5 h-5 mr-2 text-primary" />
                Token Minting
              </CardTitle>
              <CardDescription>Create custom ERC20 or ERC3643 tokens</CardDescription>
            </div>
            <Badge variant="secondary" className="glow-primary">
              <Sparkles className="w-3 h-3 mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="standard">Token Standard</Label>
              <Select value={tokenStandard} onValueChange={setTokenStandard}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ERC20">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      ERC20 - Fungible Token
                    </div>
                  </SelectItem>
                  <SelectItem value="ERC3643">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      ERC3643 - Security Token
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  placeholder="MyToken"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  placeholder="MTK"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="supply">Total Supply</Label>
              <Input
                id="supply"
                placeholder="1000000"
                value={totalSupply}
                onChange={(e) => setTotalSupply(e.target.value)}
              />
            </div>
          </div>

          {tokenStandard === "ERC3643" && (
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-start space-x-2">
                <Shield className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Security Token Requirements</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    ERC3643 tokens require KYC/AML compliance and identity verification for holders.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Gas Fee</span>
              <span className="font-medium">0.0045 ETH (~$8.92)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deployment Time</span>
              <span className="font-medium">~2 minutes</span>
            </div>
          </div>

          <Button 
            className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
            disabled={!tokenName || !tokenSymbol || !totalSupply}
          >
            <Coins className="w-4 h-4 mr-2" />
            Deploy Token Contract
          </Button>

          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            <span>Contracts are verified automatically on Etherscan</span>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};