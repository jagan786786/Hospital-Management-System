import { PatientRecord, AppointmentInfo, FilterOptions } from "@/types/patient";




export const calculateAge = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return "N/A";
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

// Normalize IDs to uppercase
export const normalizePatientRecords = (patients: PatientRecord[]) =>
  patients.map(p => ({ ...p, id: (p.id || p._id || "").toString().toUpperCase() }));

// Process future appointments
export const processFutureAppointments = (appointmentsRaw: any[]): { patientIds: Set<string>; details: Map<string, AppointmentInfo> } => {
  const today = new Date().toISOString().split("T")[0];
  const futureData = appointmentsRaw.filter(a => (a.appointment_date || a.date || "") >= today && a.status?.toLowerCase() === "scheduled");

  const patientIds = new Set(futureData.map(a => a.patient_id));
  const details = new Map<string, AppointmentInfo>();

  futureData.forEach(a => {
    const doctorName = a.doctor_name || a.doctorFullName || (a.doctor_first_name && a.doctor_last_name ? `Dr. ${a.doctor_first_name} ${a.doctor_last_name}` : "Unknown Doctor");
    details.set(a.patient_id, {
      appointment_date: a.appointment_date || a.date,
      appointment_time: a.appointment_time || a.time,
      doctor_name: doctorName,
    });
  });

  return { patientIds, details };
};

// Filter patients based on search and filters
export const filterPatients = (patients: PatientRecord[], searchTerm: string, filters: FilterOptions) =>
  patients.filter(patient => {
    const searchMatch =
      !searchTerm ||
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!searchMatch) return false;

    if (filters.gender && patient.gender !== filters.gender) return false;
    if (filters.bloodGroup && patient.blood_group?.toLowerCase() !== filters.bloodGroup.toLowerCase()) return false;

    // if (filters.ageRange) {
    //   const age = calculateAge(patient.date_of_birth);
    //   if (age !== null) {
    //     if (filters.ageRange.min !== undefined && age < filters.ageRange.min) return false;
    //     if (filters.ageRange.max !== undefined && age > filters.ageRange.max) return false;
    //   }
    // }

    // if (filters.dateRange) {
    //   const createdDate = new Date(patient.created_at);
    //   if (filters.dateRange.start && createdDate < new Date(filters.dateRange.start)) return false;
    //   if (filters.dateRange.end && createdDate > new Date(filters.dateRange.end)) return false;
    // }

    return true;
  });
