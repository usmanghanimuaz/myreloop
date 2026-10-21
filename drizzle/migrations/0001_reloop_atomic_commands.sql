REVOKE EXECUTE ON FUNCTION public.reloop_apply_patch(jsonb,jsonb) FROM authenticated;
CREATE FUNCTION public.reloop_commit(actor uuid, upserts jsonb, removals jsonb) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb; existing public.reloop_records;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'Missing actor'; END IF;
 FOR r IN SELECT value FROM jsonb_array_elements(removals) LOOP
  SELECT * INTO existing FROM public.reloop_records WHERE key=r->>'key' FOR UPDATE;
  IF NOT FOUND OR existing.sample OR existing.owner_id <> actor OR existing.revision <> (r->>'revision')::integer THEN RAISE EXCEPTION 'Record changed or not yours'; END IF;
  DELETE FROM public.reloop_records WHERE key=existing.key;
  IF existing.kind='listings' THEN DELETE FROM public.reloop_records WHERE kind='interests' AND data->>'listingId'=existing.data->>'id'; END IF;
 END LOOP;
 FOR r IN SELECT value FROM jsonb_array_elements(upserts) LOOP
  SELECT * INTO existing FROM public.reloop_records WHERE key=r->>'key' FOR UPDATE;
  IF FOUND THEN
   IF existing.sample OR existing.owner_id <> actor OR existing.revision <> (r->>'revision')::integer OR existing.kind <> r->>'kind' THEN RAISE EXCEPTION 'Record changed or not yours'; END IF;
   UPDATE public.reloop_records SET data=r->'data', revision=revision+1 WHERE key=existing.key;
  ELSE
   IF (r->>'revision')::integer <> 0 THEN RAISE EXCEPTION 'Record changed'; END IF;
   INSERT INTO public.reloop_records(key,kind,owner_id,data) VALUES (r->>'key',r->>'kind',actor,r->'data');
  END IF;
 END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.reloop_commit(uuid,jsonb,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_commit(uuid,jsonb,jsonb) TO service_role;
COMMENT ON FUNCTION public.reloop_apply_patch(jsonb,jsonb) IS 'DEPRECATED: server-validated reloop_commit replaces raw client patches';
