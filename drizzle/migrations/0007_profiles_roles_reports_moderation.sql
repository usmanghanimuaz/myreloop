CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT '' CHECK (char_length(display_name) <= 60),
  general_area text NOT NULL DEFAULT '' CHECK (char_length(general_area) <= 80),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE TABLE public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL DEFAULT auth.uid(),
  target_kind text NOT NULL CHECK (target_kind IN ('listings','needs','fieldEvidence')),
  target_id text NOT NULL CHECK (char_length(target_id) BETWEEN 1 AND 100),
  reason text NOT NULL CHECK (reason IN ('hazardous','unsafe','personal-info','spam','misleading','other')),
  details text NOT NULL DEFAULT '' CHECK (char_length(details) <= 1000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);
GRANT SELECT, INSERT ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "File own reports" ON public.reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND status = 'open' AND reviewed_at IS NULL);
CREATE POLICY "Read own or moderate reports" ON public.reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.reloop_admin_review_report(report_id uuid, decision text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  IF decision NOT IN ('reviewed','dismissed') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  UPDATE public.reports SET status = decision, reviewed_at = now() WHERE id = report_id;
END $$;

CREATE OR REPLACE FUNCTION public.reloop_admin_pending_evidence()
RETURNS TABLE (key text, data jsonb) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501'; END IF;
  RETURN QUERY SELECT r.key, r.data FROM public.reloop_records r
    WHERE r.kind = 'fieldEvidence' AND NOT COALESCE((r.data->>'validated')::boolean, false)
    ORDER BY r.data->>'createdAt' DESC LIMIT 200;
END $$;

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
END $$;

REVOKE ALL ON FUNCTION public.reloop_admin_review_report(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reloop_admin_pending_evidence() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.reloop_admin_validate_evidence(text, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reloop_admin_review_report(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_admin_pending_evidence() TO authenticated;
GRANT EXECUTE ON FUNCTION public.reloop_admin_validate_evidence(text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

ALTER TABLE public.contact_messages ADD CONSTRAINT contact_messages_lengths CHECK (
  char_length(name) <= 100 AND char_length(email) <= 255 AND char_length(subject) <= 150 AND char_length(message) <= 2000
) NOT VALID;