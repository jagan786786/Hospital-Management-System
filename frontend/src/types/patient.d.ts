// src/types/patient.ts
export interface PatientRecord {
  id?: string; // ✅ required
  _id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  gender?: string;
  blood_group?: string;
  date_of_birth: string;
  address?: string;
  created_at: string;
  medical_history: string; // ✅ must be required
}

export interface AppointmentInfo {
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
}

export interface AgeRange {
  min?: number;
  max?: number;
}

export interface DateRange {
  start?: string;
  end?: string;
}

export interface FilterOptions {
  gender?: string;
  bloodGroup?: string;
  ageRange?: AgeRange;
  dateRange?: DateRange;
}
