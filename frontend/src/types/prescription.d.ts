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
