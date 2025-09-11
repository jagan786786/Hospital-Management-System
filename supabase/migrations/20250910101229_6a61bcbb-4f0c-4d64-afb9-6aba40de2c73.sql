-- Insert sample patients
INSERT INTO public.patients (id, first_name, last_name, phone, email, date_of_birth, gender, blood_group, address) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John', 'Smith', '555-0101', 'john.smith@email.com', '1985-03-15', 'Male', 'A+', '123 Main St, City'),
('550e8400-e29b-41d4-a716-446655440002', 'Sarah', 'Johnson', '555-0102', 'sarah.j@email.com', '1990-07-22', 'Female', 'B+', '456 Oak Ave, City'),
('550e8400-e29b-41d4-a716-446655440003', 'Michael', 'Brown', '555-0103', 'mike.brown@email.com', '1978-11-08', 'Male', 'O+', '789 Pine St, City'),
('550e8400-e29b-41d4-a716-446655440004', 'Emily', 'Davis', '555-0104', 'emily.davis@email.com', '1992-05-14', 'Female', 'AB+', '321 Elm St, City'),
('550e8400-e29b-41d4-a716-446655440005', 'Robert', 'Wilson', '555-0105', 'rob.wilson@email.com', '1983-09-30', 'Male', 'A-', '654 Maple Dr, City');

-- Insert sample doctors (employees)
INSERT INTO public.employees (id, employee_id, first_name, last_name, email, phone, employee_type, department, specialization, license_number, status, salary, date_of_joining) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'EMP0001', 'Dr. James', 'Anderson', 'j.anderson@hospital.com', '555-1001', 'Doctor', 'Cardiology', 'Cardiologist', 'MD12345', 'active', 150000, '2020-01-15'),
('660e8400-e29b-41d4-a716-446655440002', 'EMP0002', 'Dr. Lisa', 'Parker', 'l.parker@hospital.com', '555-1002', 'Doctor', 'Internal Medicine', 'General Physician', 'MD12346', 'active', 120000, '2019-03-20'),
('660e8400-e29b-41d4-a716-446655440003', 'EMP0003', 'Dr. Mark', 'Thompson', 'm.thompson@hospital.com', '555-1003', 'Doctor', 'Orthopedics', 'Orthopedic Surgeon', 'MD12347', 'active', 180000, '2021-06-10');

-- Insert today's appointments with the requested status distribution
-- 2 completed, 2 waiting, 1 in progress
INSERT INTO public.appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, department, visit_type, notes) VALUES
-- Completed appointments
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '09:00:00', 'completed', 'Cardiology', 'follow-up', 'Regular checkup completed'),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, '10:30:00', 'completed', 'Internal Medicine', 'new-patient', 'Initial consultation completed'),

-- Waiting appointments  
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, '14:00:00', 'scheduled', 'Orthopedics', 'consultation', 'Knee pain consultation'),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '15:30:00', 'scheduled', 'Cardiology', 'follow-up', 'Blood pressure follow-up'),

-- In progress appointment
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, '13:15:00', 'in-progress', 'Internal Medicine', 'consultation', 'General health consultation');