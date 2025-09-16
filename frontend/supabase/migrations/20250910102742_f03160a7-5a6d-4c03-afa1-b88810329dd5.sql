-- Create table to store prescription/visit data
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  visit_date DATE NOT NULL,
  
  -- Patient vitals
  blood_pressure TEXT,
  pulse TEXT,
  height TEXT,
  weight TEXT,
  bmi TEXT,
  spo2 TEXT,
  
  -- Medical data
  complaints TEXT[] DEFAULT '{}',
  medicines JSONB DEFAULT '[]',
  advice TEXT,
  tests_prescribed TEXT,
  next_visit TEXT,
  doctor_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key constraints
  CONSTRAINT fk_prescription_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for prescriptions
CREATE POLICY "Public can view prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (true);

CREATE POLICY "Public can create prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update prescriptions" 
ON public.prescriptions 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete prescriptions" 
ON public.prescriptions 
FOR DELETE 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_prescriptions_appointment_id ON public.prescriptions(appointment_id);
CREATE INDEX idx_prescriptions_patient_id ON public.prescriptions(patient_id);
CREATE INDEX idx_prescriptions_visit_date ON public.prescriptions(visit_date);