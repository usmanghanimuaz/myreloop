ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '' CHECK (char_length(first_name) <= 60),
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '' CHECK (char_length(last_name) <= 60),
  ADD COLUMN IF NOT EXISTS phone text NOT NULL DEFAULT '' CHECK (phone = '' OR phone ~ '^\+?[0-9 ()-]{7,20}$'),
  ADD COLUMN IF NOT EXISTS notify_requests boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_updates boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS terms_version text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;
COMMENT ON COLUMN public.profiles.phone IS 'Private, optional, unverified. Owner-only via RLS; never shown publicly.';

-- Profile creation for every signup method (email or Google). Profile fields only; never roles.
CREATE OR REPLACE FUNCTION public.reloop_handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE m jsonb := coalesce(NEW.raw_user_meta_data, '{}'::jsonb);
  fn text := left(btrim(coalesce(m->>'first_name', m->>'given_name', split_part(coalesce(m->>'full_name', m->>'name', ''), ' ', 1))), 60);
  ln text := left(btrim(coalesce(m->>'last_name', m->>'family_name', '')), 60);
  tv text := left(coalesce(m->>'terms_version', ''), 20);
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, first_name, last_name, display_name, terms_version, terms_accepted_at)
    VALUES (NEW.id, fn, ln, left(fn, 60), tv, CASE WHEN tv <> '' THEN now() END)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN others THEN
    INSERT INTO public.profiles (id) VALUES (NEW.id) ON CONFLICT (id) DO NOTHING;
  END;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.reloop_handle_new_user() FROM public, anon, authenticated;
CREATE TRIGGER reloop_on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.reloop_handle_new_user();

-- Backfill: every existing account gets a profile row (keeps existing rows untouched).
INSERT INTO public.profiles (id) SELECT u.id FROM auth.users u ON CONFLICT (id) DO NOTHING;

-- Audit trail of moderator actions.
CREATE TABLE public.moderation_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  target_kind text NOT NULL,
  target_id text NOT NULL,
  note text NOT NULL DEFAULT '' CHECK (char_length(note) <= 500),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.moderation_log TO authenticated;
GRANT ALL ON public.moderation_log TO service_role;
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read moderation log" ON public.moderation_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Member posting restrictions set by admins (checked server-side before every write).
CREATE TABLE public.member_restrictions (
  user_id uuid PRIMARY KEY,
  reason text NOT NULL DEFAULT '' CHECK (char_length(reason) <= 300),
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.member_restrictions TO authenticated;
GRANT ALL ON public.member_restrictions TO service_role;
ALTER TABLE public.member_restrictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own or admin read restrictions" ON public.member_restrictions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.reloop_admin_review_report(report_id uuid, decision text, note text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rep public.reports;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF decision NOT IN ('reviewed','dismissed') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  UPDATE public.reports SET status = decision, reviewed_at = now() WHERE id = report_id RETURNING * INTO rep;
  IF NOT FOUND THEN RAISE EXCEPTION 'Report not found'; END IF;
  INSERT INTO public.moderation_log(actor_id, action, target_kind, target_id, note)
    VALUES (auth.uid(), 'report_' || decision, 'report', report_id::text, left(coalesce(note,''), 500));
END $$;
DROP FUNCTION IF EXISTS public.reloop_admin_review_report(uuid, text);

CREATE OR REPLACE FUNCTION public.reloop_admin_validate_evidence(evidence_key text, approve boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF approve THEN
    UPDATE public.reloop_records SET data = jsonb_set(data, '{validated}', 'true'::jsonb), revision = revision + 1
      WHERE key = evidence_key AND kind = 'fieldEvidence';
  ELSE
    UPDATE public.reloop_records SET data = jsonb_set(jsonb_set(data, '{validated}', 'false'::jsonb), '{rejected}', 'true'::jsonb), revision = revision + 1
      WHERE key = evidence_key AND kind = 'fieldEvidence';
  END IF;
  INSERT INTO public.moderation_log(actor_id, action, target_kind, target_id)
    VALUES (auth.uid(), CASE WHEN approve THEN 'evidence_approved' ELSE 'evidence_rejected' END, 'fieldEvidence', evidence_key);
END $$;

-- Close a reported listing or need (status only; content is kept for the owner).
CREATE OR REPLACE FUNCTION public.reloop_admin_close_record(target_kind text, target_id text, note text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF target_kind NOT IN ('listings','needs') THEN RAISE EXCEPTION 'Invalid target'; END IF;
  UPDATE public.reloop_records
    SET data = jsonb_set(jsonb_set(data, '{status}', to_jsonb('closed'::text)), '{moderated}', 'true'::jsonb), revision = revision + 1
    WHERE kind = target_kind AND data->>'id' = target_id AND NOT sample;
  IF NOT FOUND THEN RAISE EXCEPTION 'Record not found'; END IF;
  INSERT INTO public.moderation_log(actor_id, action, target_kind, target_id, note)
    VALUES (auth.uid(), 'record_closed', target_kind, target_id, left(coalesce(note,''), 500));
END $$;

CREATE OR REPLACE FUNCTION public.reloop_admin_set_restriction(member uuid, restrict boolean, reason text DEFAULT '')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF member = auth.uid() THEN RAISE EXCEPTION 'You cannot restrict yourself'; END IF;
  IF restrict THEN
    INSERT INTO public.member_restrictions(user_id, reason, created_by) VALUES (member, left(coalesce(reason,''),300), auth.uid())
      ON CONFLICT (user_id) DO UPDATE SET reason = EXCLUDED.reason, created_by = EXCLUDED.created_by, created_at = now();
  ELSE
    DELETE FROM public.member_restrictions WHERE user_id = member;
  END IF;
  INSERT INTO public.moderation_log(actor_id, action, target_kind, target_id, note)
    VALUES (auth.uid(), CASE WHEN restrict THEN 'member_restricted' ELSE 'member_unrestricted' END, 'member', member::text, left(coalesce(reason,''),500));
END $$;

-- Owner of a reported target, for admin member controls only.
CREATE OR REPLACE FUNCTION public.reloop_admin_target_owner(target_kind text, target_id text)
RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE o uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  SELECT owner_id INTO o FROM public.reloop_records WHERE kind = target_kind AND (data->>'id' = target_id OR key = target_id) LIMIT 1;
  RETURN o;
END $$;

REVOKE EXECUTE ON FUNCTION public.reloop_admin_review_report(uuid, text, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.reloop_admin_close_record(text, text, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.reloop_admin_set_restriction(uuid, boolean, text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.reloop_admin_target_owner(text, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reloop_admin_review_report(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_admin_close_record(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_admin_set_restriction(uuid, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_admin_target_owner(text, text) TO authenticated;