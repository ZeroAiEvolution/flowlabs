-- Fix 1: Content table - Allow authors to view their own unpublished content
DROP POLICY IF EXISTS "Published content is viewable by everyone" ON public.content;

CREATE POLICY "Content is viewable by authors, admins, or if published"
ON public.content
FOR SELECT
USING (
  (is_published = true) 
  OR (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = content.author_id AND profiles.user_id = auth.uid())) 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Fix 2: User roles - Change RESTRICTIVE policies to PERMISSIVE
-- Drop existing restrictive SELECT policies
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Recreate as PERMISSIVE policies (default behavior, uses OR logic)
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));