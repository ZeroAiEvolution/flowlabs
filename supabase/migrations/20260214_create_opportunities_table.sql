-- Create opportunities table
CREATE TABLE public.opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('Hackathons', 'Events', 'Competitions', 'Networking')),
  date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Opportunities are viewable by everyone" 
ON public.opportunities FOR SELECT USING (true);

CREATE POLICY "Admins can manage opportunities" 
ON public.opportunities FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
