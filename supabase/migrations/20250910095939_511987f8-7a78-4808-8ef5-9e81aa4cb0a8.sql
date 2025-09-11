-- Add sample patients (past, present, future reference)
INSERT INTO public.patients (first_name, last_name, phone, email, date_of_birth, gender, blood_group, address, medical_history) 
SELECT 'John', 'Smith', '+1 (555) 123-4567', 'john.smith@email.com', '1979-03-15', 'male', 'o+', '123 Main St, City, State', 'Hypertension, Diabetes'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'John' AND last_name = 'Smith')
UNION ALL
SELECT 'Sarah', 'Johnson', '+1 (555) 234-5678', 'sarah.johnson@email.com', '1992-07-22', 'female', 'a+', '456 Oak Ave, City, State', 'Allergic to penicillin'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'Sarah' AND last_name = 'Johnson')
UNION ALL
SELECT 'Michael', 'Brown', '+1 (555) 345-6789', 'michael.brown@email.com', '1966-12-10', 'male', 'b+', '789 Pine Rd, City, State', 'Asthma, High cholesterol'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'Michael' AND last_name = 'Brown')
UNION ALL
SELECT 'Emily', 'Davis', '+1 (555) 456-7890', 'emily.davis@email.com', '1996-05-18', 'female', 'ab+', '321 Elm St, City, State', 'No known allergies'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'Emily' AND last_name = 'Davis')
UNION ALL
SELECT 'Robert', 'Wilson', '+1 (555) 567-8901', 'robert.wilson@email.com', '1959-09-03', 'male', 'o-', '654 Maple Dr, City, State', 'Heart disease, Arthritis'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'Robert' AND last_name = 'Wilson')
UNION ALL
SELECT 'Lisa', 'Garcia', '+1 (555) 678-9012', 'lisa.garcia@email.com', '1985-11-28', 'female', 'a-', '987 Cedar Ln, City, State', 'Migraine, Anxiety'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'Lisa' AND last_name = 'Garcia')
UNION ALL
SELECT 'David', 'Martinez', '+1 (555) 789-0123', 'david.martinez@email.com', '1973-04-14', 'male', 'b-', '147 Birch Way, City, State', 'Diabetes Type 2'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'David' AND last_name = 'Martinez')
UNION ALL
SELECT 'Jennifer', 'Rodriguez', '+1 (555) 890-1234', 'jennifer.rodriguez@email.com', '1988-08-07', 'female', 'ab-', '258 Spruce Ct, City, State', 'Thyroid disorder'
WHERE NOT EXISTS (SELECT 1 FROM public.patients WHERE first_name = 'Jennifer' AND last_name = 'Rodriguez');