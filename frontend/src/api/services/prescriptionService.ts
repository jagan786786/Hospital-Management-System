import api from "../axios";
import { PrescriptionsInfo, HistoricalVisit } from "@/types/prescription";

export const getPrescriptions = async (): Promise<PrescriptionsInfo[]> => {
  const res = await api.get("/prescriptions/getPrescriptions");
  return res.data;
};

export const getPrescriptionById = async (
  id: string
): Promise<PrescriptionsInfo> => {
  const res = await api.get(`/prescriptions/getPrescriptionById/${id}`);
  return res.data;
};

export const createPrescription = async (
  payload: Partial<PrescriptionsInfo>
): Promise<PrescriptionsInfo> => {
  const res = await api.post("/prescriptions/createPrescription", payload);
  return res.data;
};

export const updatePrescription = async (
  id: string,
  payload: Partial<PrescriptionsInfo>
): Promise<PrescriptionsInfo> => {
  const res = await api.put(`/prescriptions/updatePrescription/${id}`, payload);
  return res.data;
};

export const getPrescriptionHistoryByPatient = async (
  patientId: string
): Promise<HistoricalVisit[]> => {
  try {
    const all: PrescriptionsInfo[] = await getPrescriptions();
    // Filter only prescriptions for this patient
    const filtered = (all || []).filter((p) => p.patient_id === patientId);

    // Sort by visit_date descending (newest first)
    filtered.sort((a, b) => {
      const ta = a.visit_date ? new Date(a.visit_date).getTime() : 0;
      const tb = b.visit_date ? new Date(b.visit_date).getTime() : 0;
      return tb - ta;
    });

    // Map to HistoricalVisit (normalize arrays / provide defaults)
    const history: HistoricalVisit[] = filtered.map((p) => ({
      id: p._id,
      date: p.visit_date ?? null,
      complaints: Array.isArray(p.complaints) ? p.complaints : [],
      medicines: Array.isArray(p.medicines) ? p.medicines : [],
      advice: p.advice ?? "",
      testsPresc: p.tests_prescribed ?? "",
      doctorNotes: p.doctor_notes ?? "",
      nextVisit: p.next_visit ?? null,
      bloodPressure: p.blood_pressure ?? null,
      pulse: p.pulse ?? null,
      height: p.height ?? null,
      weight: p.weight ?? null,
      bmi: p.bmi ?? null,
      spo2: p.spo2 ?? null,
    }));

    return history;
  } catch (error) {
    console.error("getPrescriptionHistoryByPatient error:", error);
    return [];
  }
};
