CREATE TABLE public.reloop_records (
  key text PRIMARY KEY,
  kind text NOT NULL CHECK (kind IN ('listings','interests','actions','impact','needs','activity','evidence')),
  owner_id uuid,
  sample boolean NOT NULL DEFAULT false,
  data jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  CHECK (jsonb_typeof(data) = 'object'),
  CHECK (sample OR owner_id IS NOT NULL)
);
GRANT SELECT ON public.reloop_records TO anon, authenticated;
GRANT ALL ON public.reloop_records TO service_role;
ALTER TABLE public.reloop_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shared and participant reads" ON public.reloop_records FOR SELECT TO anon, authenticated USING (
 sample OR kind IN ('listings','needs') OR owner_id = auth.uid() OR
 (kind = 'interests' AND EXISTS (SELECT 1 FROM public.reloop_records l WHERE l.kind = 'listings' AND l.data->>'id' = reloop_records.data->>'listingId' AND l.owner_id = auth.uid()))
);
CREATE INDEX reloop_owner_kind ON public.reloop_records(owner_id, kind);
CREATE INDEX reloop_listing_id ON public.reloop_records((data->>'id')) WHERE kind='listings';
CREATE FUNCTION public.reloop_apply_patch(upserts jsonb, removals jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb; existing public.reloop_records; uid uuid := auth.uid();
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Sign in to save'; END IF;
 IF jsonb_array_length(upserts) > 100 OR jsonb_array_length(removals) > 100 THEN RAISE EXCEPTION 'Too many changes'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(removals) LOOP
  SELECT * INTO existing FROM public.reloop_records WHERE key=r->>'key' FOR UPDATE;
  IF NOT FOUND OR existing.sample OR existing.owner_id <> uid OR existing.revision <> (r->>'revision')::integer THEN RAISE EXCEPTION 'Record changed or not yours'; END IF;
  DELETE FROM public.reloop_records WHERE key=existing.key;
 END LOOP;
 FOR r IN SELECT value FROM jsonb_array_elements(upserts) LOOP
  SELECT * INTO existing FROM public.reloop_records WHERE key=r->>'key' FOR UPDATE;
  IF FOUND THEN
   IF existing.sample OR existing.owner_id <> uid OR existing.revision <> (r->>'revision')::integer OR existing.kind <> r->>'kind' THEN RAISE EXCEPTION 'Record changed or not yours'; END IF;
   UPDATE public.reloop_records SET data=r->'data', revision=revision+1 WHERE key=existing.key;
  ELSE
   IF (r->>'revision')::integer <> 0 THEN RAISE EXCEPTION 'Record changed'; END IF;
   INSERT INTO public.reloop_records(key,kind,owner_id,data) VALUES (r->>'key',r->>'kind',uid,r->'data');
  END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.reloop_apply_patch(jsonb,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reloop_apply_patch(jsonb,jsonb) TO authenticated;
