-- Fix function security issues by setting proper search_path

-- Update the enable_strict_security function with proper search_path
CREATE OR REPLACE FUNCTION public.enable_strict_security()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  -- Drop bootstrap policies
  DROP POLICY IF EXISTS "Anyone can manage screen permissions during bootstrap" ON public.screen_permissions;
  DROP POLICY IF EXISTS "Anyone can manage roles during bootstrap" ON public.user_roles;
  
  -- Create strict admin-only policies
  CREATE POLICY "Admins can manage screen permissions" 
  ON public.screen_permissions 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

  CREATE POLICY "Users can view screen permissions" 
  ON public.screen_permissions 
  FOR SELECT 
  USING (true);

  CREATE POLICY "Users can view their own roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id);

  CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
$$;