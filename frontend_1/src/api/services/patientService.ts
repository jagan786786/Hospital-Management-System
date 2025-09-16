import api from "../axios";
import { Patient, AppointmentInfo } from "@/types/patient";

// Patients
export const getPatients = async (): Promise<Patient[]> => {
  const res = await api.get("/patients/getPatients");
  return res.data;
};

export const registerPatient = async (patient: Patient): Promise<Patient> => {
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

export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  await api.delete(`/appointments/deleteAppointment/${appointmentId}`);
};
