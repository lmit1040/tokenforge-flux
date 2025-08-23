-- Create exchange connections table for user exchange accounts
CREATE TABLE public.exchange_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exchange_name TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL,
  api_secret_encrypted TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.exchange_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for exchange connections
CREATE POLICY "Users can view their own exchange connections" 
ON public.exchange_connections 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exchange connections" 
ON public.exchange_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exchange connections" 
ON public.exchange_connections 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exchange connections" 
ON public.exchange_connections 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create external balances table for tracking exchange balances
CREATE TABLE public.external_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exchange_connection_id UUID NOT NULL REFERENCES public.exchange_connections(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  available_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  locked_balance DECIMAL(18, 8) NOT NULL DEFAULT 0,
  usd_value DECIMAL(18, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.external_balances ENABLE ROW LEVEL SECURITY;

-- Create policies for external balances
CREATE POLICY "Users can view their own external balances" 
ON public.external_balances 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own external balances" 
ON public.external_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own external balances" 
ON public.external_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own external balances" 
ON public.external_balances 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_exchange_connections_updated_at
BEFORE UPDATE ON public.exchange_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_exchange_connections_user_id ON public.exchange_connections(user_id);
CREATE INDEX idx_external_balances_user_id ON public.external_balances(user_id);
CREATE INDEX idx_external_balances_exchange_connection_id ON public.external_balances(exchange_connection_id);