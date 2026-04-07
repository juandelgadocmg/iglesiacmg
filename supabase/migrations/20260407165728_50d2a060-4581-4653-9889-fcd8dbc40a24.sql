CREATE OR REPLACE FUNCTION public.get_users_for_export()
RETURNS TABLE(user_id uuid, display_name text, email text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.display_name, u.email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.user_id
  ORDER BY p.display_name;
$$;