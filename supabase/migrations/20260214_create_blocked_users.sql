CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blocker_id UUID REFERENCES profiles(id) NOT NULL,
  blocked_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(blocker_id, blocked_id)
);

-- Enable RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own blocks
CREATE POLICY "Users can view their blocked users"
  ON blocked_users FOR SELECT
  USING (
    exists (
      select 1 from profiles
      where profiles.id = blocked_users.blocker_id
      and profiles.user_id = auth.uid()
    )
  );

-- Users can insert blocks (block someone)
CREATE POLICY "Users can block others"
  ON blocked_users FOR INSERT
  WITH CHECK (
    exists (
      select 1 from profiles
      where profiles.id = blocked_users.blocker_id
      and profiles.user_id = auth.uid()
    )
  );

-- Users can delete blocks (unblock)
CREATE POLICY "Users can unblock"
  ON blocked_users FOR DELETE
  USING (
    exists (
      select 1 from profiles
      where profiles.id = blocked_users.blocker_id
      and profiles.user_id = auth.uid()
    )
  );
