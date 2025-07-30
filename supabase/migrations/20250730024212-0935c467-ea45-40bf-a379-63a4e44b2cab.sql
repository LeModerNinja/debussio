-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily concert sync at 2 AM UTC
SELECT cron.schedule(
  'daily-concert-sync',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  SELECT
    net.http_post(
      url:='https://hhwxatbibidxzduodcka.supabase.co/functions/v1/daily-concert-sync',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhod3hhdGJpYmlkeHpkdW9kY2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MzcwNjAsImV4cCI6MjA2OTAxMzA2MH0.ProsQjvVxhwQMpjWWvGpFcbv9OOzGgOavjr9uOzgCZU"}'::jsonb,
      body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);