-- Add unique constraint on appointment_id for prescriptions table
-- This allows proper upsert functionality (one prescription per appointment)
ALTER TABLE public.prescriptions 
ADD CONSTRAINT unique_prescription_per_appointment 
UNIQUE (appointment_id);