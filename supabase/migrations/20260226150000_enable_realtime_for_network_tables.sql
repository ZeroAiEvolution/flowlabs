-- Enable Supabase Realtime replication for networking tables
-- Required for postgres_changes subscriptions to receive events.

DO $$
BEGIN
  -- Add messages table to realtime publication
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  -- Add connections table to realtime publication (useful for request/accept sync)
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'connections'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.connections;
  END IF;
END
$$;
