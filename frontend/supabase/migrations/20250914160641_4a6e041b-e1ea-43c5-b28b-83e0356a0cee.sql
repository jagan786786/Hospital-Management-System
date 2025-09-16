-- Temporarily update policies to allow initial bootstrap
-- This allows any authenticated user to manage permissions during initial setup

-- Update screen_permissions policies to be more permissive during bootstrap
DROP POLICY IF EXISTS "Admins can manage screen permissions" ON public.screen_permissions;
DROP POLICY IF EXISTS "Users can view screen permissions" ON public.screen_permissions;

CREATE POLICY "Anyone can manage screen permissions during bootstrap" 
ON public.screen_permissions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Update user_roles policies to be more permissive during bootstrap  
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Anyone can manage roles during bootstrap" 
ON public.user_roles 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create a function to finalize security after first admin is set up
CREATE OR REPLACE FUNCTION public.enable_strict_security()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
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