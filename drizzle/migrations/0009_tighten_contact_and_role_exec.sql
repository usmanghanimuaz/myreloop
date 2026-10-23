DROP POLICY IF EXISTS "Anyone can send a contact or report message" ON public.contact_messages;
CREATE POLICY "Anyone can send a valid contact or report message" ON public.contact_messages
FOR INSERT TO anon, authenticated
WITH CHECK (
  kind IN ('contact','report')
  AND char_length(btrim(name)) BETWEEN 2 AND 100
  AND char_length(email) BETWEEN 3 AND 255 AND email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  AND char_length(btrim(subject)) BETWEEN 3 AND 150
  AND char_length(btrim(message)) BETWEEN 10 AND 2000
);
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;