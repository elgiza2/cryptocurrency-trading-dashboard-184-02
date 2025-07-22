-- Enable real-time updates for missions table
ALTER TABLE public.missions REPLICA IDENTITY FULL;

-- Add missions table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;