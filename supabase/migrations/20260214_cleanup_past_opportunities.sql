-- Delete opportunities that have already started (date is in the past)
DELETE FROM public.opportunities 
WHERE date < NOW();
