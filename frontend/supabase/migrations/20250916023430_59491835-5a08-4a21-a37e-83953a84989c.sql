-- Add foreign key constraint between prescriptions and doctors tables
ALTER TABLE prescriptions 
ADD CONSTRAINT prescriptions_doctor_id_fkey 
FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT;