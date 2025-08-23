import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExchanges } from '@/hooks/useExchanges';
import { ExchangeConnectionDialog } from './ExchangeConnectionDialog';
import { RefreshCw, TrendingUp, Activity, DollarSign, Unlink } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const ExchangePortfolioSection = () => {
  const { 
    connections, 
    balances, 
    isLoading, 
    syncBalances, 
    getTotalPortfolioValue,
    getBalancesByExchange,
    disconnectExchange 
  } = useExchanges();

  const totalValue = getTotalPortfolioValue();

  const handleSyncAll = async () => {
    await syncBalances();
  };

  const handleDisconnect = async (connectionId: string) => {
    await disconnectExchange(connectionId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Exchange Portfolio</h2>
          <p className="text-muted-foreground">
            Manage your assets across multiple exchanges
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSyncAll}
            disabled={isLoading || connections.length === 0}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
          <ExchangeConnectionDialog />
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exchange Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across {connections.length} exchanges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
            <p className="text-xs text-muted-foreground">
              Exchange accounts linked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balances.length}</div>
            <p className="text-xs text-muted-foreground">
              Different cryptocurrencies
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Tabs */}
      {connections.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-auto max-w-md">
            <TabsTrigger value="all">All Exchanges</TabsTrigger>
            {connections.map((connection) => (
              <TabsTrigger key={connection.id} value={connection.exchangeName}>
                {connection.exchangeName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Balances</CardTitle>
              </CardHeader>
              <CardContent>
                {balances.length > 0 ? (
                  <div className="space-y-2">
                    {balances.map((balance) => (
                      <div key={balance.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{balance.symbol.slice(0, 2).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-medium">{balance.symbol}</p>
                            <p className="text-sm text-muted-foreground">
                              {balance.balance.toFixed(8)} available
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(balance.usdValue)}</p>
                          {balance.lockedBalance > 0 && (
                            <p className="text-sm text-muted-foreground">
                              {balance.lockedBalance.toFixed(8)} locked
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No balances found. Try syncing your exchange data.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {connections.map((connection) => (
            <TabsContent key={connection.id} value={connection.exchangeName} className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">{connection.exchangeName}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={connection.isActive ? "default" : "secondary"}>
                        {connection.isActive ? "Active" : "Inactive"}
                      </Badge>
                      {connection.lastSyncAt && (
                        <span className="text-sm text-muted-foreground">
                          Last sync: {new Date(connection.lastSyncAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDisconnect(connection.id)}
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                </CardHeader>
                <CardContent>
                  {getBalancesByExchange(connection.exchangeName).length > 0 ? (
                    <div className="space-y-2">
                      {getBalancesByExchange(connection.exchangeName).map((balance) => (
                        <div key={balance.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold">{balance.symbol.slice(0, 2).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="font-medium">{balance.symbol}</p>
                              <p className="text-sm text-muted-foreground">
                                {balance.balance.toFixed(8)} available
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(balance.usdValue)}</p>
                            {balance.lockedBalance > 0 && (
                              <p className="text-sm text-muted-foreground">
                                {balance.lockedBalance.toFixed(8)} locked
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No balances found for this exchange.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Exchange Connections</h3>
            <p className="text-muted-foreground text-center mb-6">
              Connect your exchange accounts to view and manage your crypto assets across multiple platforms.
            </p>
            <ExchangeConnectionDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
};