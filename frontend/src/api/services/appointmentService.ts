import api from "../axios";
import { AppointmentInfo } from "@/types/appointment";


// Appointments API
export const getAppointments = async (): Promise<AppointmentInfo[]> => {
  const res = await api.get("/appointments/getAppointments");
  return res.data;
};


export const createAppointment = async (payload: Partial<AppointmentInfo>) => {
  const res = await api.post("/appointments/createAppointment", payload);
  return res.data;
};

export const deleteAppointmentById = async (id: string) => {
  const res = await api.delete(`/appointments/deleteAppointment/${id}`);
  return res.data;
};