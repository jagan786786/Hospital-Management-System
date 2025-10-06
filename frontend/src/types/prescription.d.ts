export interface MedicineItem {
  _id?: string;
  name: string;
  dosage?: string;
  duration?: string;
}

export type ComplaintsField = string | string[] | null;

// This matches the API payload you pasted
export interface PrescriptionsInfo {
  status: string;
  _id: string;
  appointment_id?: string | null;
  patient_id?: string | null;
  doctor_id?: string | null;
  blood_pressure?: string | null;
  pulse?: string | null;
  height?: string | null;
  weight?: string | null;
  bmi?: string | null;
  spo2?: string | null;
  complaints?: ComplaintsField;
  medicines?: MedicineItem[];
  advice?: string | null;
  tests_prescribed?: string | null;
  next_visit?: string | null;
  doctor_notes?: string | null;
  visit_date?: string | null; // ISO date string
  createdAt?: string | null;
  updatedAt?: string | null;
  __v?: number;
}

export interface HistoricalVisit {
  id: string; // maps from _id
  date?: string | null; // visit_date
  complaints: string[]; // normalized to array
  medicines: MedicineItem[]; // normalized to array
  advice: string;
  testsPresc: string;
  doctorNotes: string;
  nextVisit?: string | null;
  bloodPressure?: string | null;
  pulse?: string | null;
  height?: string | null;
  weight?: string | null;
  bmi?: string | null;
  spo2?: string | null;
}

interface GetPrescriptionsParams {
  patientId: string;
  appointmentId?: string;
}

export interface Prescription {
  _id: string;
  appointment_id: string;
  patient_id: {
    _id: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
  doctor_id: {
    _id: string;
    first_name: string;
    last_name: string;
    department: string;
    employee_type: any;
  };
  visit_date: string;
  blood_pressure?: string;
  pulse?: string;
  height?: string;
  weight?: string;
  bmi?: string;
  spo2?: string;
  complaints: string[];
  medicines: any[];
  advice?: string;
  tests_prescribed?: string;
  next_visit?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}
