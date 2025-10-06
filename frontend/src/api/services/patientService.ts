import api from "../axios";
import { PatientRecord, AppointmentInfo } from "@/types/patient";

// Patients
export const getPatients = async (): Promise<PatientRecord[]> => {
  const res = await api.get("/patients/getPatients");
  return res.data;
};

export const getPatientsById = async (id: string): Promise<PatientRecord> => {
  const res = await api.get(`/patients/${id}`);
  return res.data;
};

export const registerPatient = async (patient: Partial<PatientRecord>) => {
  const res = await api.post("/patients/regsiterPatient", patient);
  return res.data;
};

// Appointments
export const getAppointments = async (): Promise<AppointmentInfo[]> => {
  const res = await api.get("/appointments/getAppointments");
  return res.data;
};

export const scheduleAppointment = async (
  patientId: string,
  doctorId: string = "64a987654321abcdef987654", // default doctor ID
  visitTime: string = "10:00 AM",
  visitType: string = "Consultation",
  department: string = "General"
): Promise<void> => {
  await api.post("/appointments/createAppointment", {
    patient: patientId,
    doctor: doctorId,
    visit_date: new Date().toISOString().split("T")[0],
    visit_time: visitTime,
    visit_type: visitType,
    doctor_department: department,
    status: "Scheduled",
  });
};

export const deleteAppointment = async (
  appointmentId: string
): Promise<void> => {
  await api.delete(`/appointments/deleteAppointment/${appointmentId}`);
};

// ✅ Get future appointments
export const getFutureAppointments = async (): Promise<{
  patientIds: Set<string>;
  details: Map<string, AppointmentInfo>;
}> => {
  const { data } = await api.get("/appointments/future");

  const patientIds = new Set<string>();
  const details = new Map<string, AppointmentInfo>();

  data.forEach((appt: any) => {
    patientIds.add(appt.patient_id);
    details.set(appt.patient_id, {
      appointment_date: appt.appointment_date,
      appointment_time: appt.appointment_time,
      doctor_name: appt.doctor_name,
    });
  });

  return { patientIds, details };
};
