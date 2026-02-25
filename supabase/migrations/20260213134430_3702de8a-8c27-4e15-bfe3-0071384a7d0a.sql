
-- Add embed_code column for storing embed HTML (YouTube iframes, etc.)
ALTER TABLE public.content ADD COLUMN embed_code TEXT DEFAULT NULL;
