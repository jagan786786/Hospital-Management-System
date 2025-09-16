-- Create doctors table
CREATE TABLE public.doctors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  specialization TEXT NOT NULL,
  department TEXT,
  phone TEXT,
  email TEXT,
  license_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  visit_type TEXT NOT NULL CHECK (visit_type IN ('follow-up', 'new-admission', 'first-time-visit', 'others')),
  department TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for doctors (public access for now)
CREATE POLICY "Public can read doctors" 
ON public.doctors 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert doctors" 
ON public.doctors 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update doctors" 
ON public.doctors 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete doctors" 
ON public.doctors 
FOR DELETE 
USING (true);

-- Create policies for appointments (public access for now)
CREATE POLICY "Public can read appointments" 
ON public.appointments 
FOR SELECT 
USING (true);

CREATE POLICY "Public can insert appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Public can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (true);

CREATE POLICY "Public can delete appointments" 
ON public.appointments 
FOR DELETE 
USING (true);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_doctors_updated_at
BEFORE UPDATE ON public.doctors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample doctors with Indian departments
INSERT INTO public.doctors (first_name, last_name, specialization, department, phone, email, license_number) VALUES
('Raj', 'Sharma', 'Cardiologist', 'Cardiology', '+91-9876543210', 'raj.sharma@example.com', 'MH12345'),
('Priya', 'Patel', 'Neurologist', 'Neurology', '+91-9876543211', 'priya.patel@example.com', 'MH12346'),
('Arjun', 'Kumar', 'Orthopedist', 'Orthopedics', '+91-9876543212', 'arjun.kumar@example.com', 'MH12347'),
('Sunita', 'Singh', 'Pediatrician', 'Pediatrics', '+91-9876543213', 'sunita.singh@example.com', 'MH12348'),
('Vikram', 'Gupta', 'General Physician', 'General Medicine', '+91-9876543214', 'vikram.gupta@example.com', 'MH12349'),
('Meera', 'Reddy', 'Gynecologist', 'Obstetrics & Gynecology', '+91-9876543215', 'meera.reddy@example.com', 'MH12350'),
('Amit', 'Joshi', 'Dermatologist', 'Dermatology', '+91-9876543216', 'amit.joshi@example.com', 'MH12351'),
('Kavya', 'Nair', 'Psychiatrist', 'Psychiatry', '+91-9876543217', 'kavya.nair@example.com', 'MH12352'),
('Rohit', 'Agarwal', 'ENT Specialist', 'ENT', '+91-9876543218', 'rohit.agarwal@example.com', 'MH12353'),
('Anjali', 'Verma', 'Ophthalmologist', 'Ophthalmology', '+91-9876543219', 'anjali.verma@example.com', 'MH12354');