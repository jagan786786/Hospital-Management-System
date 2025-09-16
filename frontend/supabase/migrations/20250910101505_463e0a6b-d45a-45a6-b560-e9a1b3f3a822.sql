-- Insert sample patients if they don't exist
INSERT INTO public.patients (id, first_name, last_name, phone, email, date_of_birth, gender, blood_group, address) 
SELECT * FROM (VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', '555-0101', 'john.smith@email.com', '1985-03-15', 'Male', 'A+', '123 Main St, City'),
('550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '555-0102', 'sarah.j@email.com', '1990-07-22', 'Female', 'B+', '456 Oak Ave, City'),
('550e8400-e29b-41d4-a716-446655440003', 'Michael', 'Brown', '555-0103', 'mike.brown@email.com', '1978-11-08', 'Male', 'O+', '789 Pine St, City'),
('550e8400-e29b-41d4-a716-446655440004', 'Emily', 'Davis', '555-0104', 'emily.davis@email.com', '1992-05-14', 'Female', 'AB+', '321 Elm St, City'),
('550e8400-e29b-41d4-a716-446655440005', 'Robert', 'Wilson', '555-0105', 'rob.wilson@email.com', '1983-09-30', 'Male', 'A-', '654 Maple Dr, City')
) AS new_patients(id, first_name, last_name, phone, email, date_of_birth, gender, blood_group, address)
WHERE NOT EXISTS (SELECT 1 FROM patients WHERE patients.id = new_patients.id);

-- Get some existing doctor IDs to use for appointments
-- Insert today's appointments with the requested status distribution using existing doctors
-- 2 completed, 2 waiting, 1 in progress
DO $$
DECLARE
  doctor_ids uuid[];
BEGIN
  -- Get existing doctor IDs
  SELECT ARRAY(SELECT id FROM employees WHERE employee_type = 'Doctor' LIMIT 3) INTO doctor_ids;
  
  -- Insert appointments if we have doctors
  IF array_length(doctor_ids, 1) >= 3 THEN
    INSERT INTO public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, department, visit_type, notes) 
    SELECT * FROM (VALUES
    -- Completed appointments
    ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', doctor_ids[1], CURRENT_DATE, '09:00:00', 'completed', 'Cardiology', 'follow-up', 'Regular checkup completed'),
    ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', doctor_ids[2], CURRENT_DATE, '10:30:00', 'completed', 'Internal Medicine', 'new-patient', 'Initial consultation completed'),

    -- Waiting appointments  
    ('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', doctor_ids[3], CURRENT_DATE, '14:00:00', 'scheduled', 'Orthopedics', 'consultation', 'Knee pain consultation'),
    ('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', doctor_ids[1], CURRENT_DATE, '15:30:00', 'scheduled', 'Cardiology', 'follow-up', 'Blood pressure follow-up'),

    -- In progress appointment
    ('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', doctor_ids[2], CURRENT_DATE, '13:15:00', 'in-progress', 'Internal Medicine', 'consultation', 'General health consultation')
    ) AS new_appointments(id, patient_id, doctor_id, appointment_date, appointment_time, status, department, visit_type, notes)
    WHERE NOT EXISTS (SELECT 1 FROM appointments WHERE appointments.id = new_appointments.id);
  END IF;
END $$;