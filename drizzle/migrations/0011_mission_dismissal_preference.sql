ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS mission_dismissed boolean NOT NULL DEFAULT false;
COMMENT ON COLUMN public.profiles.mission_dismissed IS 'Private mission-popup dismissal preference; owner-only through existing profile RLS. Not a role or permission.';
CREATE OR REPLACE FUNCTION public.reloop_mission_preference(dismiss boolean DEFAULT false) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE result boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required' USING ERRCODE = '42501'; END IF;
  IF dismiss THEN
    UPDATE public.profiles SET mission_dismissed = true WHERE id = auth.uid();
    IF NOT FOUND THEN RAISE EXCEPTION 'Profile unavailable'; END IF;
  END IF;
  SELECT mission_dismissed INTO result FROM public.profiles WHERE id = auth.uid();
  RETURN coalesce(result, false);
END $$;
REVOKE ALL ON FUNCTION public.reloop_mission_preference(boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reloop_mission_preference(boolean) TO authenticated;
