-- Insert sample prescription data using existing appointments for better medicine suggestions demo
INSERT INTO prescriptions (
  appointment_id, patient_id, doctor_id, visit_date, 
  complaints, medicines, advice, tests_prescribed, next_visit,
  blood_pressure, pulse, height, weight, bmi, spo2
) VALUES 
-- Prescription using existing appointment 1719ca39-a6f9-426c-8786-7c06213ea28e (Dr. 35a03a1e-2e99-4671-9a21-c1e857103634, Patient 550e8400-e29b-41d4-a716-446655440001)
('1719ca39-a6f9-426c-8786-7c06213ea28e', '550e8400-e29b-41d4-a716-446655440001', '35a03a1e-2e99-4671-9a21-c1e857103634', '2025-09-08',
'{"#fever", "#headache", "#bodyache"}',
'[{"id": "med-fever-1", "name": "Paracetamol", "dosage": "500mg", "timeFreqDuration": "1-1-1", "notes": "After food", "availableInInventory": true}]'::jsonb,
'Rest and plenty of fluids', 'Blood test if fever persists', 'After 3 days',
'120/80', '78', '170', '65', '22.5', '98'),

-- Prescription using existing appointment 09fa4251-5535-46dd-8701-25bf37a86202 (Dr. 45828eac-65cd-467a-b102-d415396121b2, Patient 550e8400-e29b-41d4-a716-446655440002)
('09fa4251-5535-46dd-8701-25bf37a86202', '550e8400-e29b-41d4-a716-446655440002', '45828eac-65cd-467a-b102-d415396121b2', '2025-09-07',
'{"#fever", "#cough", "#sorethroat"}',
'[{"id": "med-fever-2", "name": "Paracetamol", "dosage": "500mg", "timeFreqDuration": "1-1-1", "notes": "After food", "availableInInventory": true}, {"id": "med-cough-1", "name": "Cough Syrup", "dosage": "10ml", "timeFreqDuration": "1-0-1", "notes": "Before food", "availableInInventory": true}]'::jsonb,
'Avoid cold drinks', 'None', 'After 5 days',
'118/75', '82', '175', '70', '22.9', '97'),

-- Prescription using existing appointment 33e9bea5-62d1-44f1-94b4-0d0b33c83ca2 (Dr. 0c4a3cec-abfe-4c5c-bcd7-91e98cf58b71, Patient 550e8400-e29b-41d4-a716-446655440003)
('33e9bea5-62d1-44f1-94b4-0d0b33c83ca2', '550e8400-e29b-41d4-a716-446655440003', '0c4a3cec-abfe-4c5c-bcd7-91e98cf58b71', '2025-09-06',
'{"#diabetes", "#highsugar", "#thirst"}',
'[{"id": "med-diabetes-1", "name": "Metformin", "dosage": "500mg", "timeFreqDuration": "1-0-1", "notes": "After meals", "availableInInventory": true}]'::jsonb,
'Control diet and exercise', 'HbA1c, Random glucose', 'After 1 month',
'130/85', '75', '168', '75', '26.6', '96');