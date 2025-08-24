import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Minus, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTokenBalances } from "@/hooks/useTokenBalances";
import { useWallet } from "@/hooks/useWallet";

interface UnstakeDialogProps {
  poolName: string;
  poolIndex: number;
  userStake: number;
  onUnstake: (poolIndex: number, amount: number, token: string) => void;
}

export const UnstakeDialog = ({ poolName, poolIndex, userStake, onUnstake }: UnstakeDialogProps) => {
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("USDC");
  const [isOpen, setIsOpen] = useState(false);
  
  const { getStakedInPool, stakedPositions } = useTokenBalances();
  const { isConnected } = useWallet();

  // Get staked amounts for this pool by token
  const poolStakes = stakedPositions.filter(pos => pos.poolName === poolName);
  
  const handleUnstake = () => {
    const unstakeAmount = parseFloat(amount);
    if (unstakeAmount > 0) {
      onUnstake(poolIndex, unstakeAmount, selectedToken);
      setAmount("");
      setIsOpen(false);
    }
  };

  const getMaxUnstakeAmount = (token: string) => {
    return getStakedInPool(token, poolName);
  };

  const setMaxAmount = () => {
    const maxAmount = getMaxUnstakeAmount(selectedToken);
    setAmount(maxAmount.toString());
  };

  if (userStake === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <Minus className="w-4 h-4 mr-1" />
          Unstake
        </Button>
      </DialogTrigger>
      
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unstake from {poolName}</DialogTitle>
          <DialogDescription>
            Withdraw your staked tokens from this pool
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isConnected && (
            <div className="flex items-center space-x-2 p-3 bg-warning/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm text-warning">Connect wallet to unstake</span>
            </div>
          )}

          {/* Show current stakes by token */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Current Stakes</Label>
            {poolStakes.length > 0 ? (
              <div className="space-y-2">
                {poolStakes.map((stake, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-secondary/20 rounded">
                    <span className="text-sm">{stake.symbol}</span>
                    <Badge variant="outline">
                      {stake.amount.toLocaleString()} staked
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No stakes found</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-select">Token</Label>
            <Select
              value={selectedToken}
              onValueChange={setSelectedToken}
              disabled={!isConnected}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from(new Set(poolStakes.map(s => s.symbol))).map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol} ({getStakedInPool(symbol, poolName).toLocaleString()} staked)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount">Amount to Unstake</Label>
              <Button
                variant="link"
                size="sm"
                onClick={setMaxAmount}
                className="h-auto p-0 text-xs"
                disabled={!isConnected}
              >
                Max: {getMaxUnstakeAmount(selectedToken).toLocaleString()}
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={!isConnected}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnstake}
              disabled={
                !isConnected ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > getMaxUnstakeAmount(selectedToken)
              }
              className="flex-1"
            >
              Unstake
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};