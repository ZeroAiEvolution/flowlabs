ALTER TABLE public.help_requests
DROP CONSTRAINT help_requests_user_id_fkey,
ADD CONSTRAINT help_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
