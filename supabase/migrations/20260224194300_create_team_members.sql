CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL,
  image_url text,
  bio text,
  linkedin_url text,
  twitter_url text,
  github_url text,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Team members are viewable by everyone" 
  ON public.team_members FOR SELECT 
  USING (true);

CREATE POLICY "Team members are insertable by admins only" 
  ON public.team_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Team members are updateable by admins only" 
  ON public.team_members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Team members are deletable by admins only" 
  ON public.team_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Insert original hardcoded data
INSERT INTO public.team_members (name, role, bio, linkedin_url, twitter_url, github_url, order_index)
VALUES 
  ('Parshwa Shah', 'Founder, Full Stack Developer', 'Passionate about building communities that empower students', 'https://linkedin.com/', 'https://twitter.com/', 'https://github.com/', 1),
  ('Prakash Chaudhary', 'Founder, Developer', 'Developer with a love for clean code', 'https://linkedin.com/', 'https://twitter.com/', 'https://github.com/', 2);
