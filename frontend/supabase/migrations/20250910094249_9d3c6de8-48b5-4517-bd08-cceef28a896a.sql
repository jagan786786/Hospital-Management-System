-- Add doctor-specific fields to employees table
ALTER TABLE public.employees 
ADD COLUMN specialization TEXT,
ADD COLUMN license_number TEXT;

-- Update the employee_type check constraint to ensure Doctor is included
ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_employee_type_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_employee_type_check 
CHECK (employee_type IN ('Nurse', 'Receptionist', 'Doctor', 'Admin', 'Accountant', 'House Help', 'Floor Warden'));

-- Copy existing doctors data to employees table
INSERT INTO public.employees (
  id, employee_id, first_name, last_name, email, phone, employee_type, 
  department, specialization, license_number, date_of_joining, status, created_at, updated_at
)
SELECT 
  id, 
  COALESCE(license_number, 'DOC' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')) as employee_id,
  first_name, 
  last_name, 
  email, 
  phone, 
  'Doctor' as employee_type,
  department,
  specialization,
  license_number,
  CURRENT_DATE as date_of_joining,
  'active' as status,
  created_at,
  updated_at
FROM public.doctors
ON CONFLICT (id) DO UPDATE SET
  employee_type = 'Doctor',
  specialization = EXCLUDED.specialization,
  license_number = EXCLUDED.license_number,
  department = EXCLUDED.department;

-- Create a view to maintain backward compatibility (optional)
CREATE OR REPLACE VIEW public.doctors_view AS
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

-- Update appointments table foreign key to reference employees instead of doctors
-- First, ensure all doctor_id values exist in employees
UPDATE public.appointments 
SET doctor_id = doctor_id 
WHERE doctor_id IN (SELECT id FROM public.employees WHERE employee_type = 'Doctor');

-- Note: We keep the doctors table for now to avoid breaking existing references
-- It can be dropped later after all code is updated