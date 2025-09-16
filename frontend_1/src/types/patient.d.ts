export interface Patient {
  _id?: string; // MongoDB id
  id?: string;  // fallback if backend sends plain id
  first_name: string;
  last_name: string;
  age?: number;
  gender: string;
  address?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  blood_group?: string;
  medical_history?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PatientFormValues {
  first_name: string;
  last_name: string;
  age?: number;
  gender: string;
  address?: string;
  phone?: string;
  email?: string;
  date_of_birth?: string;
  blood_group?: string;
  medical_history?: string;
}

export interface AppointmentInfo {
  _id: string;
  patient: string;
  doctor: string;
  visit_date: string;
  visit_time: string;
  visit_type: string;
  doctor_department: string;
  additional_notes?: string;
  status: string;
}
