-- Drop the problematic doctors_view to resolve security warning
-- The application can query employees table directly instead
DROP VIEW IF EXISTS public.doctors_view;