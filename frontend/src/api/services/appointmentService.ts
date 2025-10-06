import api from "../axios";
import {
  AppointmentInfo,
  SimplifiedAppointment,
  GetAppointmentsParams,
} from "@/types/appointment";

export const getAppointments = async (): Promise<AppointmentInfo[]> => {
  const res = await api.get("/appointments/getAppointments");
  return res.data;
};

export const getAppointmentById = async (
  id: string
): Promise<AppointmentInfo> => {
  const res = await api.get(`/appointments/getAppointmentById/${id}`);
  return res.data;
};

export const createAppointment = async (
  payload: Partial<AppointmentInfo>
): Promise<AppointmentInfo> => {
  const res = await api.post("/appointments/createAppointment", payload);
  return res.data;
};

export const updateAppointment = async (
  id: string,
  payload: Partial<AppointmentInfo>
): Promise<AppointmentInfo> => {
  const res = await api.put(`/appointments/updateAppointment/${id}`, payload);
  return res.data;
};

export const deleteAppointmentById = async (id: string): Promise<void> => {
  await api.delete(`/appointments/deleteAppointment/${id}`);
};

export const getTodaysOrSpecificAppointment = async (
  actualPatientId: string,
  appointmentIdFromQuery?: string
): Promise<SimplifiedAppointment[]> => {
  try {
    const res = await api.get("/appointments/getAppointments");
    const allAppointments: AppointmentInfo[] = res.data;

    const today = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    // Filter by patient
    let patientAppointments = allAppointments.filter(
      (app) => (app.patient as any)._id === actualPatientId
    );

    // If specific appointment ID is provided, prioritize it
    if (appointmentIdFromQuery) {
      patientAppointments = patientAppointments.filter(
        (app) => app._id === appointmentIdFromQuery
      );
    } else {
      // Otherwise get only today's appointments
      patientAppointments = patientAppointments.filter(
        (app) => app.visit_date.split("T")[0] === today
      );
    }

    // Map to simplified object
    return patientAppointments.map((app) => ({
      id: app._id,
      doctor_id: (app.doctor as any)._id,
      appointment_time: app.visit_time,
      visit_type: app.visit_type,
      status: app.status,
    }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
};

export const getAppointmentsByParams = async (
  patientId: string,
  appointmentId?: string,
  appointmentDate?: string
): Promise<SimplifiedAppointment[]> => {
  const params: any = { patientId };
  if (appointmentId) params.appointmentId = appointmentId;
  if (appointmentDate) params.appointmentDate = appointmentDate;

  const res = await api.get("/appointments/getAppointmentsByParams", {
    params,
  });
  return res.data;
};
