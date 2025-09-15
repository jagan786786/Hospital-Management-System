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
