import { PatientRecord } from "@/types/patient";
import { calculateAge } from "./patientUtils";

export const exportPatientsToCSV = (patients: PatientRecord[]) => {
  const csvHeaders = ["Patient ID","Name","Phone","Email","Age","Gender","Blood Group","Address","Created Date"];
  const csvData = patients.map(p => [
    p.id.slice(0,8),
    `${p.first_name} ${p.last_name}`,
    p.phone || "",
    p.email || "",
    calculateAge(p.date_of_birth) ?? "N/A",
    p.gender || "",
    p.blood_group?.toUpperCase() || "",
    p.address || "",
    new Date(p.created_at).toLocaleDateString(),
  ]);

  const csvContent = [
    csvHeaders.join(","),
    ...csvData.map(row => row.map(f => typeof f === "string" && f.includes(",") ? `"${f}"` : f).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `patient_records_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
