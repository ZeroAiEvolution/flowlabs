-- Remove all opportunities (Hackathons, Events, etc.) where the date is in the past
DELETE FROM public.opportunities 
WHERE date < NOW();
