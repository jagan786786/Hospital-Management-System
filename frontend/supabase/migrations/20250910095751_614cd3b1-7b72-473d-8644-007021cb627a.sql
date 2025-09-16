-- Add sample patients (past, present, future reference)
INSERT INTO public.patients (first_name, last_name, phone, email, date_of_birth, gender, blood_group, address, medical_history) VALUES
('John', 'Smith', '+1 (555) 123-4567', 'john.smith@email.com', '1979-03-15', 'male', 'o+', '123 Main St, City, State', 'Hypertension, Diabetes'),
('Sarah', 'Johnson', '+1 (555) 234-5678', 'sarah.johnson@email.com', '1992-07-22', 'female', 'a+', '456 Oak Ave, City, State', 'Allergic to penicillin'),
('Michael', 'Brown', '+1 (555) 345-6789', 'michael.brown@email.com', '1966-12-10', 'male', 'b+', '789 Pine Rd, City, State', 'Asthma, High cholesterol'),
('Emily', 'Davis', '+1 (555) 456-7890', 'emily.davis@email.com', '1996-05-18', 'female', 'ab+', '321 Elm St, City, State', 'No known allergies'),
('Robert', 'Wilson', '+1 (555) 567-8901', 'robert.wilson@email.com', '1959-09-03', 'male', 'o-', '654 Maple Dr, City, State', 'Heart disease, Arthritis'),
('Lisa', 'Garcia', '+1 (555) 678-9012', 'lisa.garcia@email.com', '1985-11-28', 'female', 'a-', '987 Cedar Ln, City, State', 'Migraine, Anxiety'),
('David', 'Martinez', '+1 (555) 789-0123', 'david.martinez@email.com', '1973-04-14', 'male', 'b-', '147 Birch Way, City, State', 'Diabetes Type 2'),
('Jennifer', 'Rodriguez', '+1 (555) 890-1234', 'jennifer.rodriguez@email.com', '1988-08-07', 'female', 'ab-', '258 Spruce Ct, City, State', 'Thyroid disorder')
ON CONFLICT (phone) DO NOTHING;

-- Add sample appointments (past, present, future)
INSERT INTO public.appointments (patient_id, doctor_id, appointment_date, appointment_time, visit_type, department, status, notes) 
SELECT 
  p.id as patient_id,
  d.id as doctor_id,
  sample_appointments.appointment_date,
  sample_appointments.appointment_time,
  sample_appointments.visit_type,
  sample_appointments.department,
  sample_appointments.status,
  sample_appointments.notes
FROM (
  -- Past appointments (2 weeks ago)
  SELECT 
    'John' as first_name, 'Smith' as last_name,
    (CURRENT_DATE - INTERVAL '14 days')::date as appointment_date,
    '09:00:00'::time as appointment_time,
    'follow-up' as visit_type,
    'Cardiology' as department,
    'completed' as status,
    'Regular follow-up for hypertension management' as notes
  UNION ALL
  SELECT 
    'Sarah', 'Johnson',
    (CURRENT_DATE - INTERVAL '10 days')::date,
    '10:30:00'::time,
    'consultation',
    'Cardiology',
    'completed',
    'Initial consultation for allergic reactions'
  UNION ALL
  SELECT 
    'Michael', 'Brown',
    (CURRENT_DATE - INTERVAL '7 days')::date,
    '14:00:00'::time,
    'follow-up',
    'Cardiology',
    'completed',
    'Asthma management review'
  UNION ALL
  -- Today's appointments (present)
  SELECT 
    'Emily', 'Davis',
    CURRENT_DATE,
    '09:30:00'::time,
    'new-patient',
    'Ophthalmology',
    'scheduled',
    'First-time visit for routine checkup'
  UNION ALL
  SELECT 
    'Robert', 'Wilson',
    CURRENT_DATE,
    '10:00:00'::time,
    'follow-up',
    'Cardiology',
    'in-progress',
    'Heart disease monitoring'
  UNION ALL
  SELECT 
    'Lisa', 'Garcia',
    CURRENT_DATE,
    '11:30:00'::time,
    'consultation',
    'Ophthalmology',
    'waiting',
    'Consultation for chronic migraines'
  UNION ALL
  SELECT 
    'John', 'Smith',
    CURRENT_DATE,
    '15:00:00'::time,
    'follow-up',
    'Cardiology',
    'scheduled',
    'Diabetes management follow-up'
  UNION ALL
  -- Future appointments
  SELECT 
    'David', 'Martinez',
    (CURRENT_DATE + INTERVAL '3 days')::date,
    '09:00:00'::time,
    'follow-up',
    'Cardiology',
    'scheduled',
    'Diabetes Type 2 management'
  UNION ALL
  SELECT 
    'Jennifer', 'Rodriguez',
    (CURRENT_DATE + INTERVAL '5 days')::date,
    '11:00:00'::time,
    'new-patient',
    'Ophthalmology',
    'scheduled',
    'Initial consultation for thyroid disorder'
  UNION ALL
  SELECT 
    'Sarah', 'Johnson',
    (CURRENT_DATE + INTERVAL '7 days')::date,
    '14:30:00'::time,
    'follow-up',
    'Cardiology',
    'scheduled',
    'Follow-up for allergy management'
  UNION ALL
  SELECT 
    'Michael', 'Brown',
    (CURRENT_DATE + INTERVAL '10 days')::date,
    '10:15:00'::time,
    'follow-up',
    'Cardiology',
    'scheduled',
    'Asthma medication review'
  UNION ALL
  SELECT 
    'Emily', 'Davis',
    (CURRENT_DATE + INTERVAL '14 days')::date,
    '16:00:00'::time,
    'follow-up',
    'Ophthalmology',
    'scheduled',
    'Follow-up after initial consultation'
) sample_appointments
JOIN public.patients p ON p.first_name = sample_appointments.first_name AND p.last_name = sample_appointments.last_name
JOIN public.employees d ON d.employee_type = 'Doctor' AND d.department = sample_appointments.department;