REVOKE ALL ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM authenticated;
REVOKE ALL ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO service_role;