-- Create community_partners table
CREATE TABLE public.community_partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_partners ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Partners are viewable by everyone" 
ON public.community_partners FOR SELECT USING (true);

-- Allow admins to do everything
CREATE POLICY "Admins can manage partners" 
ON public.community_partners FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_community_partners_updated_at
BEFORE UPDATE ON public.community_partners
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
