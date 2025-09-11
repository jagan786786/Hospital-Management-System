-- Enable RLS on the doctors_view
ALTER VIEW public.doctors_view SET (security_barrier=true);