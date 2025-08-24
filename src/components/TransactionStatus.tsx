import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface StakingTransaction {
  poolName: string;
  amount: number;
  token: string;
  status: 'approving' | 'staking' | 'confirmed' | 'failed';
  approvalTx?: string;
  stakingTx?: string;
  error?: string;
}

interface TransactionStatusProps {
  transactions: {[key: string]: StakingTransaction};
  onClear: (transactionId: string) => void;
}

export const TransactionStatus = ({ transactions, onClear }: TransactionStatusProps) => {
  const transactionEntries = Object.entries(transactions);

  if (transactionEntries.length === 0) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approving':
      case 'staking':
        return 'text-warning';
      case 'confirmed':
        return 'text-success';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approving':
      case 'staking':
        return <Clock className="w-4 h-4" />;
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressValue = (tx: StakingTransaction) => {
    switch (tx.status) {
      case 'approving':
        return 25;
      case 'staking':
        return 75;
      case 'confirmed':
        return 100;
      case 'failed':
        return 0;
      default:
        return 0;
    }
  };

  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="text-lg">Transaction Status</CardTitle>
        <CardDescription>Monitor your staking transactions</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {transactionEntries.map(([transactionId, tx]) => (
          <div key={transactionId} className="p-4 bg-secondary/20 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{tx.poolName}</div>
                <div className="text-sm text-muted-foreground">
                  {tx.amount.toLocaleString()} {tx.token}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getStatusColor(tx.status)}>
                  {getStatusIcon(tx.status)}
                  <span className="ml-1 capitalize">{tx.status}</span>
                </Badge>
                
                {(tx.status === 'confirmed' || tx.status === 'failed') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onClear(transactionId)}
                    className="h-6 w-6 p-0"
                  >
                    <XCircle className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {(tx.status === 'approving' || tx.status === 'staking') && (
              <div className="space-y-2">
                <Progress value={getProgressValue(tx)} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {tx.status === 'approving' && 'Waiting for token approval...'}
                  {tx.status === 'staking' && 'Executing staking transaction...'}
                </div>
              </div>
            )}

            {tx.error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {tx.error}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-xs">
              {tx.approvalTx && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <span>Approval:</span>
                  <a 
                    href={`https://etherscan.io/tx/${tx.approvalTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center"
                  >
                    {tx.approvalTx.slice(0, 8)}...
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
              
              {tx.stakingTx && (
                <div className="flex items-center space-x-1 text-muted-foreground">
                  <span>Stake:</span>
                  <a 
                    href={`https://etherscan.io/tx/${tx.stakingTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center"
                  >
                    {tx.stakingTx.slice(0, 8)}...
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};