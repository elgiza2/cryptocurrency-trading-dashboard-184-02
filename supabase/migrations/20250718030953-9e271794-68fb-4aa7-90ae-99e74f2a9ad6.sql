-- Create mining sessions table
CREATE TABLE public.mining_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  end_time timestamp with time zone,
  duration_hours integer NOT NULL DEFAULT 8,
  reward_amount numeric NOT NULL DEFAULT 125.5,
  is_active boolean NOT NULL DEFAULT true,
  is_completed boolean NOT NULL DEFAULT false,
  is_claimed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mining_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own mining sessions" 
ON public.mining_sessions 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own mining sessions" 
ON public.mining_sessions 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own mining sessions" 
ON public.mining_sessions 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mining_sessions_updated_at
BEFORE UPDATE ON public.mining_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();