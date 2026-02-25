-- Remove all competitions (and other opportunities) where the date is in the past
DELETE FROM public.opportunities 
WHERE date < NOW();
