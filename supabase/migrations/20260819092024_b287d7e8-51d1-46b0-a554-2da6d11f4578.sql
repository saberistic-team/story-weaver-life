REVOKE EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification(uuid, text, text, text, text) TO service_role;
