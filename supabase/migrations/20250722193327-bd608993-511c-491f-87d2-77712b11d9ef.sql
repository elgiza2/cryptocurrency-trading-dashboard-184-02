-- Fix security warning by moving extensions to extensions schema instead of public
DROP EXTENSION IF EXISTS pg_cron CASCADE;
DROP EXTENSION IF EXISTS pg_net CASCADE;

-- Create extensions in the extensions schema (recommended by Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Re-create the cron job with proper schema reference
SELECT extensions.cron.schedule(
  'create-giveaways-every-4-hours',
  '0 */4 * * *', -- Every 4 hours at minute 0
  $$
  SELECT
    extensions.net.http_post(
        url:='https://rupieauysdqrpklthwno.supabase.co/functions/v1/create-giveaways',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cGllYXV5c2RxcnBrbHRod25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxOTI3MjAsImV4cCI6MjA2ODc2ODcyMH0.wFHbf69VPwhX4-4IL0w82KZLtls3Y3u-31FiMQK9Xwo"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);