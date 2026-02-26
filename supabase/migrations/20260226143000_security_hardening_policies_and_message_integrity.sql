-- Security hardening migration

-- 1) Fix help_requests ownership policies (user_id stores profiles.id, not auth.users.id)
DROP POLICY IF EXISTS "Users can create their own help requests" ON public.help_requests;
DROP POLICY IF EXISTS "Users can view their own help requests" ON public.help_requests;

CREATE POLICY "Users can create their own help requests"
ON public.help_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = help_requests.user_id
      AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own help requests"
ON public.help_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = help_requests.user_id
      AND p.user_id = auth.uid()
  )
);

-- 2) Fix team_members admin policies (profiles.is_admin does not exist)
DROP POLICY IF EXISTS "Team members are insertable by admins only" ON public.team_members;
DROP POLICY IF EXISTS "Team members are updateable by admins only" ON public.team_members;
DROP POLICY IF EXISTS "Team members are deletable by admins only" ON public.team_members;

CREATE POLICY "Team members are insertable by admins only"
ON public.team_members
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Team members are updateable by admins only"
ON public.team_members
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Team members are deletable by admins only"
ON public.team_members
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 3) Prevent message payload tampering during UPDATE
--    Keep content/sender/receiver/created_at immutable after INSERT.
CREATE OR REPLACE FUNCTION public.prevent_message_core_field_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.sender_id IS DISTINCT FROM OLD.sender_id
     OR NEW.receiver_id IS DISTINCT FROM OLD.receiver_id
     OR NEW.content IS DISTINCT FROM OLD.content
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Message core fields are immutable after creation.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_message_core_field_update_trg ON public.messages;
CREATE TRIGGER prevent_message_core_field_update_trg
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.prevent_message_core_field_update();
