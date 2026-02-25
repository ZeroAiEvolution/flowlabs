-- Add profession field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN profession text CHECK (profession IN ('student', 'professional'));

-- Add index for faster filtering by profession
CREATE INDEX idx_profiles_profession ON public.profiles(profession);

-- Update the handle_new_user function to include profession from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, avatar_url, profession)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name', 
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'profession'
  );
  RETURN NEW;
END;
$function$;