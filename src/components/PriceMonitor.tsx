import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useRealTimePrices } from '@/hooks/useRealTimePrices';

export function PriceMonitor() {
  const { prices, isLoading, error, refreshPrices } = useRealTimePrices();

  return (
    <Card className="bg-gradient-to-br from-background to-secondary/10 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold text-foreground">Live Prices</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={refreshPrices}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}
        
        {prices.map((price) => (
          <div key={price.symbol} className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border/30">
            <div className="flex items-center space-x-3">
              <div className="text-sm font-medium text-foreground">
                {price.symbol}
              </div>
              <Badge 
                variant={price.change24h >= 0 ? "default" : "destructive"}
                className="flex items-center space-x-1"
              >
                {price.change24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%</span>
              </Badge>
            </div>
            
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                ${price.price.toLocaleString(undefined, { 
                  minimumFractionDigits: price.price > 1 ? 2 : 6,
                  maximumFractionDigits: price.price > 1 ? 2 : 6 
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                Vol: ${(price.volume24h / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-xs text-muted-foreground text-center pt-2">
          Updates every 30 seconds
        </div>
      </CardContent>
    </Card>
  );
}