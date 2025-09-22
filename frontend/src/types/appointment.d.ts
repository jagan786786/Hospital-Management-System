export interface AppointmentInfo {
  _id: string;
  patient: string;
  doctor: string;
  visit_date: string;
  visit_time: string;
  visit_type: string;
  doctor_department: string;
  additional_notes?: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Cancelled";
}

export interface PatientTableRow {
  id: string;
  appointmentId: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentTime: string;
  visitType: string;
  department: string;
  doctorName: string;
  specialization: string;
  status: "waiting" | "in-progress" | "completed";
}
