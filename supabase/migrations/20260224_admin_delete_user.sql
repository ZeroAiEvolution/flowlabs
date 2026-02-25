-- Create an admin function to securely delete a user from auth.users
-- This cascades down and removes their `profiles`, `connections`, and `messages` rows 
-- since those tables reference auth.users or profiles (assuming ON DELETE CASCADE)

CREATE OR REPLACE FUNCTION admin_delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Verify the caller is an admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users.';
  END IF;

  -- 2. Delete the user's records from dependent tables to prevent foreign key violations.
  -- This requires finding the user's profile ID first.
  DECLARE
    target_profile_id UUID;
  BEGIN
    SELECT id INTO target_profile_id FROM profiles WHERE user_id = target_user_id;

    IF target_profile_id IS NOT NULL THEN
      -- Delete connections where the user is either the requester or the receiver
      DELETE FROM connections WHERE requester_id = target_profile_id OR receiver_id = target_profile_id;
      
      -- Delete messages where the user is either the sender or the receiver
      DELETE FROM messages WHERE sender_id = target_profile_id OR receiver_id = target_profile_id;
      
      -- Delete any blocked relationships
      DELETE FROM blocked_users WHERE blocker_id = target_profile_id OR blocked_id = target_profile_id;
      
      -- Delete student projects
      DELETE FROM student_projects WHERE author_id = target_profile_id;
    END IF;
  END;

  -- 3. Delete the user from the auth schema.
  -- This will cascade to delete the remaining `profiles` and `user_roles` entries automatically.
  DELETE FROM auth.users WHERE id = target_user_id;
  
END;
$$;
