-- Fix security issues from the linter

-- 1. Drop and recreate the doctors_view without SECURITY DEFINER
DROP VIEW IF EXISTS public.doctors_view;

CREATE VIEW public.doctors_view AS
SELECT 
  id,
  first_name,
  last_name,
  email,
  phone,
  specialization,
  department,
  license_number,
  created_at,
  updated_at
FROM public.employees 
WHERE employee_type = 'Doctor' AND status = 'active';

-- 2. Update the function to have proper search_path setting
CREATE OR REPLACE FUNCTION public.generate_employee_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  new_id TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_id := 'EMP' || LPAD(counter::TEXT, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.employees WHERE employee_id = new_id);
    counter := counter + 1;
  END LOOP;
  RETURN new_id;
END;
$function$;