-- Add columns for WhatsApp-style message deletion features
ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS deleted_for UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_deleted_for_everyone BOOLEAN DEFAULT false;

-- Allow users to UPDATE messages they are involved in (for read receipts and deletions)
CREATE POLICY "Users can update their messages"
ON public.messages FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = receiver_id
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = sender_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = receiver_id
  )
);
