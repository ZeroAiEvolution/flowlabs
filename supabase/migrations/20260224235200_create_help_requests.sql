-- Create help_requests table
CREATE TABLE public.help_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Career Guidance', 'Stress Relief', 'Motivation', 'Technical Help', 'Other')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_requests ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can create their own help requests" 
ON public.help_requests FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own help requests" 
ON public.help_requests FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all help requests" 
ON public.help_requests FOR SELECT 
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);

CREATE POLICY "Admins can update all help requests" 
ON public.help_requests FOR UPDATE 
USING (
  auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin')
);
