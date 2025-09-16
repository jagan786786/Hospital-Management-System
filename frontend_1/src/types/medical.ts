export interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  appointmentTime: string;
  status: "waiting" | "in-progress" | "completed";
  visitType: "follow-up" | "new-patient" | "consultation";
  avatar?: string;
  // Patient details
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
}

export interface PatientVisit {
  id: string;
  patientId: string;
  date: string;
  time: string;
  visitNumber: number;
  
  // Vitals
  bloodPressure?: string;
  pulse?: string;
  height?: string;
  weight?: string;
  bmi?: string;
  spo2?: string;
  
  // Clinical data
  complaints: string[];
  medicines: Medicine[];
  advice?: string;
  testsPresc: string;
  nextVisit?: string;
  
  // Status
  status: "scheduled" | "in-progress" | "completed";
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  timeFreqDuration: string;
  notes?: string;
  availableInInventory: boolean;
  relatedComplaints?: string[];
}

export interface MedicineInventory {
  id: string;
  name: string;
  genericName?: string;
  strength: string;
  form: string; // tablet, capsule, syrup, etc.
  manufacturer: string;
  stockQuantity: number;
  expiryDate: string;
  batchNumber: string;
  commonComplaints: string[];
}

export interface HistoricalVisit {
  id: string;
  date: string;
  complaints: string[];
  medicines: Medicine[];
  advice?: string;
  testsPresc: string;
  doctorNotes?: string;
}