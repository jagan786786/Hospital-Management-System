-- Insert sample prescription data for better medicine suggestions demo
-- Creating sample prescriptions for different doctors with various complaint patterns

-- Sample data for doctor Raj Sharma (361b3ab1-6394-4cc5-849f-3a039f3650a3)
INSERT INTO prescriptions (
  id, appointment_id, patient_id, doctor_id, visit_date, 
  complaints, medicines, advice, tests_prescribed, next_visit,
  blood_pressure, pulse, height, weight, bmi, spo2
) VALUES 
-- Prescription 1 for Dr. Raj Sharma - Fever pattern
(gen_random_uuid(), gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', '361b3ab1-6394-4cc5-849f-3a039f3650a3', '2025-09-05',
'["#fever", "#headache", "#bodyache"]'::text[],
'[{"id": "med-1", "name": "Paracetamol", "dosage": "500mg", "timeFreqDuration": "1-1-1", "notes": "After food", "availableInInventory": true}]'::jsonb,
'Rest and plenty of fluids', 'Blood test if fever persists', 'After 3 days',
'120/80', '78', '170', '65', '22.5', '98'),

-- Prescription 2 for Dr. Raj Sharma - Fever + cough pattern  
(gen_random_uuid(), gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', '361b3ab1-6394-4cc5-849f-3a039f3650a3', '2025-09-03',
'["#fever", "#cough", "#sorethroat"]'::text[],
'[{"id": "med-2", "name": "Paracetamol", "dosage": "500mg", "timeFreqDuration": "1-1-1", "notes": "After food", "availableInInventory": true}, {"id": "med-3", "name": "Cough Syrup", "dosage": "10ml", "timeFreqDuration": "1-0-1", "notes": "Before food", "availableInInventory": true}]'::jsonb,
'Avoid cold drinks', 'None', 'After 5 days',
'118/75', '82', '175', '70', '22.9', '97'),

-- Prescription 3 for Dr. Raj Sharma - Diabetes pattern
(gen_random_uuid(), gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', '361b3ab1-6394-4cc5-849f-3a039f3650a3', '2025-09-01',
'["#diabetes", "#highsugar", "#thirst"]'::text[],
'[{"id": "med-4", "name": "Metformin", "dosage": "500mg", "timeFreqDuration": "1-0-1", "notes": "After meals", "availableInInventory": true}]'::jsonb,
'Control diet and exercise', 'HbA1c, Random glucose', 'After 1 month',
'130/85', '75', '168', '75', '26.6', '96'),

-- Sample data for doctor Priya Patel (6daff670-ffca-4b2f-89c6-fa1fea6f5075)
-- Prescription 4 for Dr. Priya Patel - Hypertension pattern
(gen_random_uuid(), gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440004', '6daff670-ffca-4b2f-89c6-fa1fea6f5075', '2025-09-07',
'["#hypertension", "#bloodpressure", "#dizziness"]'::text[],
'[{"id": "med-5", "name": "Amlodipine", "dosage": "5mg", "timeFreqDuration": "1-0-0", "notes": "Morning", "availableInInventory": true}]'::jsonb,
'Reduce salt intake', 'Lipid profile', 'After 2 weeks',
'150/95', '68', '165', '72', '26.4', '98'),

-- Prescription 5 for Dr. Priya Patel - Fever pattern (similar to Dr. Raj)
(gen_random_uuid(), gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440005', '6daff670-ffca-4b2f-89c6-fa1fea6f5075', '2025-09-04',
'["#fever", "#bodyache", "#weakness"]'::text[],
'[{"id": "med-6", "name": "Paracetamol", "dosage": "500mg", "timeFreqDuration": "1-1-1", "notes": "After food", "availableInInventory": true}, {"id": "med-7", "name": "Multivitamin", "dosage": "1 tab", "timeFreqDuration": "1-0-0", "notes": "After breakfast", "availableInInventory": true}]'::jsonb,
'Rest and hydration', 'CBC if needed', 'After 3 days',
'115/70', '80', '160', '58', '22.7', '99'),

-- Sample for Dr. Arjun Kumar (469b5a26-895d-4330-be6d-c176c714d80c)
-- Prescription 6 for Dr. Arjun Kumar - Gastric issues
(gen_random_uuid(), gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440006', '469b5a26-895d-4330-be6d-c176c714d80c', '2025-09-06',
'["#acidity", "#gastric", "#stomachpain"]'::text[],
'[{"id": "med-8", "name": "Omeprazole", "dosage": "20mg", "timeFreqDuration": "1-0-0", "notes": "Before breakfast", "availableInInventory": true}]'::jsonb,
'Avoid spicy food', 'None', 'After 1 week',
'122/78', '72', '172', '68', '23.0', '98');