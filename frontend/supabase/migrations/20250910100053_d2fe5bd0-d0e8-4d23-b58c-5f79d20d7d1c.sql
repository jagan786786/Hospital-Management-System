-- Add sample appointments for today's patient queue with correct status values
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
  -- Today's appointments (present) - Patient Queue
  SELECT 
    'Emily' as first_name, 'Davis' as last_name,
    CURRENT_DATE as appointment_date,
    TIME '09:30:00' as appointment_time,
    'new-patient' as visit_type,
    'Ophthalmology' as department,
    'scheduled' as status,
    'First-time visit for routine checkup' as notes
  UNION ALL
  SELECT 
    'Robert', 'Wilson',
    CURRENT_DATE,
    TIME '10:00:00',
    'follow-up',
    'Cardiology',
    'in-progress',
    'Heart disease monitoring'
  UNION ALL
  SELECT 
    'Lisa', 'Garcia',
    CURRENT_DATE,
    TIME '11:30:00',
    'consultation',
    'Ophthalmology',
    'scheduled',
    'Consultation for chronic migraines'
  UNION ALL
  SELECT 
    'John', 'Smith',
    CURRENT_DATE,
    TIME '15:00:00',
    'follow-up',
    'Cardiology',
    'scheduled',
    'Diabetes management follow-up'
  UNION ALL
  -- Past appointments (completed)
  SELECT 
    'Sarah', 'Johnson',
    (CURRENT_DATE - INTERVAL '3 days')::date,
    TIME '10:30:00',
    'consultation',
    'Cardiology',
    'completed',
    'Initial consultation for allergic reactions'
  UNION ALL
  SELECT 
    'Michael', 'Brown',
    (CURRENT_DATE - INTERVAL '1 days')::date,
    TIME '14:00:00',
    'follow-up',
    'Cardiology',
    'completed',
    'Asthma management review'
  UNION ALL
  -- Future appointments
  SELECT 
    'David', 'Martinez',
    (CURRENT_DATE + INTERVAL '3 days')::date,
    TIME '09:00:00',
    'follow-up',
    'Cardiology',
    'scheduled',
    'Diabetes Type 2 management'
  UNION ALL
  SELECT 
    'Jennifer', 'Rodriguez',
    (CURRENT_DATE + INTERVAL '5 days')::date,
    TIME '11:00:00',
    'new-patient',
    'Ophthalmology',
    'scheduled',
    'Initial consultation for thyroid disorder'
) sample_appointments
JOIN public.patients p ON p.first_name = sample_appointments.first_name AND p.last_name = sample_appointments.last_name
JOIN public.employees d ON d.employee_type = 'Doctor' AND d.department = sample_appointments.department;