-- Remove competitions where registration is confirmed closed
-- Microsoft Imagine Cup 2026: Registration closed Jan 9, 2026
DELETE FROM public.opportunities 
WHERE title = 'Microsoft Imagine Cup 2026';

-- Remove any other events that have already started/passed
-- (Includes CES, NIDAR, HackerOne Bug Hunt, AI Cybercon, etc. if not already deleted)
DELETE FROM public.opportunities 
WHERE date < NOW();

-- Note: DD Robocon India 2026 is kept as Late Registration is open until Feb 18, 2026.
