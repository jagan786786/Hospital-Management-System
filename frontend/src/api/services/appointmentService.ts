import api from "../axios"; // Your axios instance
import { AppointmentInfo } from "@/types/appointment";

export const getAppointments = async (): Promise<AppointmentInfo[]> => {
  const res = await api.get("/appointments/getAppointments");
  return res.data;
};

export const getAppointmentById = async (id: string): Promise<AppointmentInfo> => {
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
