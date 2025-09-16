-- Fix visit_type constraint and create sample data
-- 1) Upsert demo doctors (employees)
WITH upsert_employees AS (
  INSERT INTO public.employees (
    employee_id, first_name, last_name, email, phone, employee_type, department, specialization, license_number, status, salary, date_of_joining
  ) VALUES
    ('EMP_DEMO_DOC1', 'James', 'Anderson', 'j.anderson@hospital.com', '555-1001', 'Doctor', 'Cardiology', 'Cardiologist', 'MD12345', 'active', 150000, '2020-01-15'),
    ('EMP_DEMO_DOC2', 'Lisa', 'Parker', 'l.parker@hospital.com', '555-1002', 'Doctor', 'Internal Medicine', 'General Physician', 'MD12346', 'active', 120000, '2019-03-20'),
    ('EMP_DEMO_DOC3', 'Mark', 'Thompson', 'm.thompson@hospital.com', '555-1003', 'Doctor', 'Orthopedics', 'Orthopedic Surgeon', 'MD12347', 'active', 180000, '2021-06-10')
  ON CONFLICT (employee_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    employee_type = EXCLUDED.employee_type,
    department = EXCLUDED.department,
    specialization = EXCLUDED.specialization,
    license_number = EXCLUDED.license_number,
    status = EXCLUDED.status
  RETURNING id, employee_id
)
SELECT 1;

-- 2) Upsert demo patients
INSERT INTO public.patients (id, first_name, last_name, phone, email, date_of_birth, gender, blood_group, address)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', '555-0101', 'john.smith@email.com', '1985-03-15', 'Male', 'A+', '123 Main St'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '555-0102', 'sarah.j@email.com', '1990-07-22', 'Female', 'B+', '456 Oak Ave'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Michael', 'Brown', '555-0103', 'mike.brown@email.com', '1978-11-08', 'Male', 'O+', '789 Pine St'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Emily', 'Davis', '555-0104', 'emily.davis@email.com', '1992-05-14', 'Female', 'AB+', '321 Elm St'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Robert', 'Wilson', '555-0105', 'rob.wilson@email.com', '1983-09-30', 'Male', 'A-', '654 Maple Dr')
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  date_of_birth = EXCLUDED.date_of_birth,
  gender = EXCLUDED.gender,
  blood_group = EXCLUDED.blood_group,
  address = EXCLUDED.address;

-- 3) Reset previous demo appointments for today
DELETE FROM public.appointments 
WHERE appointment_date = CURRENT_DATE 
  AND notes LIKE 'DEMO - %';

-- 4) Insert today's appointments with correct visit_type values: 2 completed, 2 waiting (scheduled), 1 in-progress
INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, status, department, visit_type, notes)
VALUES
-- Completed (2)
('550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM public.employees WHERE employee_id = 'EMP_DEMO_DOC1'), CURRENT_DATE, '09:00:00', 'completed', 'Cardiology', 'follow-up', 'DEMO - Regular checkup completed'),
('550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM public.employees WHERE employee_id = 'EMP_DEMO_DOC2'), CURRENT_DATE, '10:30:00', 'completed', 'Internal Medicine', 'consultation', 'DEMO - Initial consultation completed'),
-- Waiting (scheduled) (2)
('550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM public.employees WHERE employee_id = 'EMP_DEMO_DOC3'), CURRENT_DATE, '14:00:00', 'scheduled', 'Orthopedics', 'consultation', 'DEMO - Knee pain consultation'),
('550e8400-e29b-41d4-a716-446655440004', (SELECT id FROM public.employees WHERE employee_id = 'EMP_DEMO_DOC1'), CURRENT_DATE, '15:30:00', 'scheduled', 'Cardiology', 'follow-up', 'DEMO - Blood pressure follow-up'),
-- In Progress (1)  
('550e8400-e29b-41d4-a716-446655440005', (SELECT id FROM public.employees WHERE employee_id = 'EMP_DEMO_DOC2'), CURRENT_DATE, '13:15:00', 'in-progress', 'Internal Medicine', 'consultation', 'DEMO - General health consultation');