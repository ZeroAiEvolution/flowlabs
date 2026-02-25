-- Add user_type and headline to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'student' CHECK (user_type IN ('student', 'professional')),
ADD COLUMN IF NOT EXISTS headline TEXT;

-- Create connections table
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(requester_id, receiver_id)
);

-- Enable RLS for connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Connections Policies

-- View connections: Users can see their own connections (either as requester or receiver)
CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = requester_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = receiver_id
  )
);

-- Send request: Authenticated users can insert
CREATE POLICY "Users can send connection requests"
ON public.connections FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = requester_id)
);

-- Update status: Receiver can update (accept/reject)
CREATE POLICY "Receiver can update connection status"
ON public.connections FOR UPDATE
USING (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = receiver_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages Policies

-- View messages: Users can see messages sent to or by them
CREATE POLICY "Users can view their messages"
ON public.messages FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = receiver_id
  )
);

-- Send messages: Users can send messages only if they are the sender
CREATE POLICY "Users can send messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.profiles WHERE id = sender_id)
);
