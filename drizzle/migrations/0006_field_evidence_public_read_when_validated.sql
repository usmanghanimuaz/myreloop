DROP POLICY IF EXISTS "Shared and participant reads" ON public.reloop_records;

CREATE POLICY "Shared and participant reads"
ON public.reloop_records
FOR SELECT
TO anon, authenticated
USING (
  sample
  OR kind IN ('listings', 'needs')
  OR owner_id = auth.uid()
  OR (kind = 'interests' AND reloop_target_owner(data ->> 'listingId', COALESCE(data ->> 'targetKind', 'listings')) = auth.uid())
  OR (kind = 'fieldEvidence' AND COALESCE((data ->> 'validated')::boolean, false))
);