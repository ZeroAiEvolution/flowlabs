-- Allow users to delete a connection they are part of (either as requester or receiver)
CREATE POLICY "Users can delete their own connections"
ON public.connections FOR DELETE
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE id = requester_id
    UNION
    SELECT user_id FROM public.profiles WHERE id = receiver_id
  )
);
