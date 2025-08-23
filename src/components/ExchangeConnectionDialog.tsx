import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useExchanges } from '@/hooks/useExchanges';
import { Plus, Shield, AlertTriangle } from 'lucide-react';

const SUPPORTED_EXCHANGES = [
  { name: 'Binance', value: 'binance' },
  { name: 'Coinbase Pro', value: 'coinbase-pro' },
  { name: 'Kraken', value: 'kraken' },
  { name: 'KuCoin', value: 'kucoin' },
];

export const ExchangeConnectionDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectExchange } = useExchanges();

  const handleConnect = async () => {
    if (!selectedExchange || !apiKey || !apiSecret) return;

    setIsConnecting(true);
    const success = await connectExchange(selectedExchange, apiKey, apiSecret);
    
    if (success) {
      setOpen(false);
      setSelectedExchange('');
      setApiKey('');
      setApiSecret('');
    }
    setIsConnecting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gradient-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Connect Exchange
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connect Exchange Account
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-warning bg-warning/5">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-sm text-warning-foreground">
                  <p className="font-medium">Security Notice</p>
                  <p className="mt-1">Only use read-only API keys. Never share keys with write permissions.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="exchange">Exchange</Label>
            <Select value={selectedExchange} onValueChange={setSelectedExchange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an exchange" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_EXCHANGES.map((exchange) => (
                  <SelectItem key={exchange.value} value={exchange.value}>
                    {exchange.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your API secret"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={!selectedExchange || !apiKey || !apiSecret || isConnecting}
              className="flex-1 gradient-primary text-primary-foreground"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};