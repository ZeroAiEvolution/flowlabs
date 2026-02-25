-- Add is_fully_funded column
ALTER TABLE public.opportunities 
ADD COLUMN is_fully_funded BOOLEAN DEFAULT false;
