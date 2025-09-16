-- Create an enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'hr');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create screen_permissions table
CREATE TABLE public.screen_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screen_id TEXT NOT NULL,
    role app_role NOT NULL,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (screen_id, role)
);

-- Enable RLS on screen_permissions
ALTER TABLE public.screen_permissions ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user can access screen
CREATE OR REPLACE FUNCTION public.can_access_screen(_user_id uuid, _screen_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.screen_permissions sp ON ur.role = sp.role
    WHERE ur.user_id = _user_id
      AND sp.screen_id = _screen_id
      AND sp.enabled = true
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for screen_permissions
CREATE POLICY "Admins can manage screen permissions" 
ON public.screen_permissions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view screen permissions" 
ON public.screen_permissions 
FOR SELECT 
USING (true);

-- Insert default screen permissions
INSERT INTO public.screen_permissions (screen_id, role, enabled) VALUES
-- Patient Management
('patient-queue', 'doctor', true),
('patient-queue', 'nurse', true),
('patient-onboarding', 'receptionist', true),
('patient-onboarding', 'nurse', true),
('patient-records', 'doctor', true),
('patient-records', 'nurse', true),
('appointment-scheduling', 'receptionist', true),
('appointments', 'doctor', true),
('appointments', 'nurse', true),
('appointments', 'receptionist', true),

-- Doctor Management
('prescription', 'doctor', true),

-- Inventory Management
('medicine-stock', 'pharmacist', true),
('medicine-stock', 'admin', true),
('stock-reports', 'pharmacist', true),
('stock-reports', 'admin', true),

-- HR Management
('employee-onboarding', 'hr', true),
('employee-onboarding', 'admin', true),
('employees', 'hr', true),
('employees', 'admin', true),

-- Administration
('screens', 'admin', true),
('settings', 'admin', true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_screen_permissions_updated_at
    BEFORE UPDATE ON public.screen_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();