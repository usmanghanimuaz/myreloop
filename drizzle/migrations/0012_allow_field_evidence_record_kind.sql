ALTER TABLE public.reloop_records
  DROP CONSTRAINT reloop_records_kind_check,
  ADD CONSTRAINT reloop_records_kind_check
    CHECK (kind IN ('listings', 'interests', 'actions', 'impact', 'needs', 'activity', 'evidence', 'fieldEvidence'));
