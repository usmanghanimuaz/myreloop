CREATE OR REPLACE FUNCTION public.reloop_target_owner(target_id text, target_kind text) RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT owner_id FROM public.reloop_records WHERE kind=target_kind AND data->>'id'=target_id LIMIT 1 $$;
REVOKE ALL ON FUNCTION public.reloop_target_owner(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reloop_target_owner(text,text) TO anon,authenticated,service_role;
ALTER POLICY "Shared and participant reads" ON public.reloop_records USING (sample OR kind IN ('listings','needs') OR owner_id=auth.uid() OR (kind='interests' AND public.reloop_target_owner(data->>'listingId',coalesce(data->>'targetKind','listings'))=auth.uid()));
CREATE POLICY "Photo upload own folder" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='reloop-photos' AND (storage.foldername(name))[1]=auth.uid()::text AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp'));
CREATE POLICY "Read listing photos" ON storage.objects FOR SELECT TO anon,authenticated USING (bucket_id='reloop-photos' AND ((storage.foldername(name))[1]=auth.uid()::text OR EXISTS(SELECT 1 FROM public.reloop_records WHERE kind='listings' AND data->'photos' ? name)));
CREATE POLICY "Remove own photos" ON storage.objects FOR DELETE TO authenticated USING(bucket_id='reloop-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE OR REPLACE FUNCTION public.reloop_workflow(actor uuid, request_id text, decision text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE req public.reloop_records; target public.reloop_records; target_kind text; st text; next_status text; q numeric; u text;
BEGIN
 SELECT * INTO req FROM public.reloop_records WHERE kind='interests' AND data->>'id'=request_id FOR UPDATE;
 IF NOT FOUND OR req.sample THEN RAISE EXCEPTION 'Request unavailable'; END IF;
 target_kind:=coalesce(req.data->>'targetKind','listings');
 SELECT * INTO target FROM public.reloop_records WHERE kind=target_kind AND data->>'id'=req.data->>'listingId' FOR UPDATE;
 IF NOT FOUND OR target.sample OR actor IS NULL OR actor NOT IN (req.owner_id,target.owner_id) THEN RAISE EXCEPTION 'Not a participant'; END IF;
 st:=coalesce(req.data->>'status','pending');
 IF decision IN ('accept','reject') THEN
  IF actor<>target.owner_id OR st<>'pending' THEN RAISE EXCEPTION 'Only owner can respond to pending requests'; END IF;
  IF decision='accept' THEN
   IF coalesce(target.data->>'status','open') NOT IN ('available','open') THEN RAISE EXCEPTION 'Item no longer available'; END IF;
   IF target_kind='needs' AND req.data->>'unit'<>target.data->>'unit' THEN RAISE EXCEPTION 'Offer unit must match need'; END IF;
   next_status:='accepted';
   UPDATE public.reloop_records SET data=jsonb_set(data,'{status}','"reserved"'),revision=revision+1 WHERE key=target.key;
   UPDATE public.reloop_records SET data=jsonb_set(data,'{status}','"rejected"'),revision=revision+1 WHERE kind='interests' AND key<>req.key AND data->>'listingId'=req.data->>'listingId' AND coalesce(data->>'status','pending')='pending';
  ELSE next_status:='rejected'; END IF;
 ELSIF decision='confirm' THEN
  IF st NOT IN ('accepted','handover') THEN RAISE EXCEPTION 'Accept first'; END IF;
  IF req.data->>'confirmedBy'=actor::text THEN RAISE EXCEPTION 'Already confirmed; waiting for other participant'; END IF;
  IF st='accepted' THEN
   next_status:='handover'; req.data:=jsonb_set(req.data,'{confirmedBy}',to_jsonb(actor::text));
  ELSE
   next_status:='completed';
   q:=CASE WHEN target_kind='needs' THEN (req.data->>'quantity')::numeric ELSE (target.data->>'quantity')::numeric END;
   u:=CASE WHEN target_kind='needs' THEN req.data->>'unit' ELSE target.data->>'unit' END;
   IF target_kind='needs' AND q<(target.data->>'quantity')::numeric THEN RAISE EXCEPTION 'Offer must fulfill requested quantity'; END IF;
   UPDATE public.reloop_records SET data=jsonb_set(data,'{status}',to_jsonb(CASE WHEN target_kind='needs' THEN 'fulfilled' ELSE 'exchanged' END)),revision=revision+1 WHERE key=target.key;
   INSERT INTO public.reloop_records(key,kind,owner_id,data) VALUES('impact:handover:'||request_id,'impact',target.owner_id,jsonb_build_object('id','handover-'||request_id,'source','exchange','sourceId',target.data->>'id','category',target.data->>'category','quantity',q,'unit',u,'diversion','reuse','completed',true,'note','Completed handover: '||coalesce(target.data->>'title',target.data->>'description'),'createdAt',now(),'origin','user'));
  END IF;
 ELSIF decision='cancel' THEN
  IF st NOT IN ('pending','accepted','handover') THEN RAISE EXCEPTION 'Cannot cancel'; END IF;
  next_status:='cancelled';
  IF st IN ('accepted','handover') THEN UPDATE public.reloop_records SET data=jsonb_set(data,'{status}',to_jsonb(CASE WHEN target_kind='needs' THEN 'open' ELSE 'available' END)),revision=revision+1 WHERE key=target.key; END IF;
 ELSE RAISE EXCEPTION 'Invalid decision'; END IF;
 UPDATE public.reloop_records SET data=jsonb_set(req.data,'{status}',to_jsonb(next_status)),revision=revision+1 WHERE key=req.key;
END $$;
REVOKE ALL ON FUNCTION public.reloop_workflow(uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_workflow(uuid,text,text) TO service_role;