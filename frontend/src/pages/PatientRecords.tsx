import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Users,
  Activity,
  Download,
  FileText,
  Calendar,
} from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { cache } from "@/lib/cache";
import { useSortable } from "@/hooks/useSortable";
import { PatientEditDialog } from "@/components/medical/PatientEditDialog";
import { PatientHistoryDialog } from "@/components/medical/PatientHistoryDialog";
import {
  PatientFilter,
  FilterOptions,
} from "@/components/medical/PatientFilter";
import { PatientRecord, AppointmentInfo } from "@/types/patient";
import { getPatients, getAppointments } from "@/api/services/patientService";
import { calculateAge, filterPatients } from "@/utils/patientUtils";
import { exportPatientsToCSV } from "@/utils/csvUtils";

export default function PatientRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [futureAppointments, setFutureAppointments] = useState<Set<string>>(
    new Set()
  );
  const [appointmentDetails, setAppointmentDetails] = useState<
    Map<string, AppointmentInfo>
  >(new Map());
  const [filters, setFilters] = useState<FilterOptions>({});

  // ---------- Fetch patients + appointments ----------
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch patients with cache
      const cachedPatients = cache.get<PatientRecord[]>("patient-records");
      const patients = cachedPatients ?? (await getPatients());
      if (!cachedPatients) cache.set("patient-records", patients || [], 180000);
      setPatientRecords(
        (patients || []).map((p) => ({
          ...p,
          id: (p.id || p._id || "").toString().toUpperCase(),
        }))
      );
      // Fetch future appointments with cache
      const today = new Date().toISOString().split("T")[0];
      const cacheKey = `future-appointments-${today}`;
      const cachedAppointments = cache.get<{
        patientIds: Set<string>;
        details: Map<string, AppointmentInfo>;
      }>(cacheKey);

      if (cachedAppointments) {
        setFutureAppointments(cachedAppointments.patientIds);
        setAppointmentDetails(cachedAppointments.details);
      } else {
        const appointmentsRaw: any[] = (await getAppointments()) || [];
        const futureData = appointmentsRaw.filter((a) => {
          const date = a.appointment_date || a.date || "";
          const status = a.status || "";
          return date >= today && status.toLowerCase() === "scheduled";
        });

        const patientIds = new Set<string>(futureData.map((a) => a.patient_id));
        const details = new Map<string, AppointmentInfo>();
        futureData.forEach((appointment) => {
          const doctorName =
            appointment.doctor_name ||
            appointment.doctorFullName ||
            (appointment.doctor_first_name && appointment.doctor_last_name
              ? `Dr. ${appointment.doctor_first_name} ${appointment.doctor_last_name}`
              : "Unknown Doctor");

          details.set(appointment.patient_id, {
            appointment_date: appointment.appointment_date || appointment.date,
            appointment_time: appointment.appointment_time || appointment.time,
            doctor_name: doctorName,
          });
        });

        cache.set(cacheKey, { patientIds, details }, 300000);
        setFutureAppointments(patientIds);
        setAppointmentDetails(details);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      toast({
        title: "Error",
        description: "Failed to load patient data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---------- Helper ----------
  const displayAge = (dob: string) => calculateAge(dob) ?? "N/A";

  // ---------- Filtering ----------

  const filteredPatients = useMemo(
    () => filterPatients(patientRecords, searchTerm, filters),
    [patientRecords, searchTerm, filters]
  );

  const { sortedData, requestSort, getSortIcon } =
    useSortable(filteredPatients);

  const handleScheduleAppointment = (patientId: string) => {
    window.location.href = `/appointment-scheduling?patient_id=${patientId}`;
  };

  return (
    <TooltipProvider>
      <div className="flex-1 space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Patient Records
            </h1>
            <p className="text-muted-foreground">
              View and manage existing patient records
            </p>
          </div>
          <div className="flex gap-2">
            <PatientFilter
              onFiltersChange={setFilters}
              activeFilters={filters}
            />
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                exportPatientsToCSV(filteredPatients);
                toast({
                  title: "Export Complete",
                  description: "Patient records exported successfully",
                });
              }}
            >
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-card md:col-span-2">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by patient name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Records
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {patientRecords.length}
              </div>
              <p className="text-xs text-muted-foreground">Patient records</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Recent Patients
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {
                  patientRecords.filter(
                    (p) =>
                      new Date(p.created_at) >
                      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Patient Records
              Database
            </CardTitle>
            <CardDescription>
              Complete list of all registered patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "id",
                      "first_name",
                      "phone",
                      "blood_group",
                      "date_of_birth",
                      "created_at",
                    ].map((col) => (
                      <th
                        key={col}
                        className="text-left p-3 font-medium text-muted-foreground"
                      >
                        <Button
                          variant="ghost"
                          className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                          onClick={() => requestSort(col)}
                        >
                          {col === "id"
                            ? "Patient ID"
                            : col.replace("_", " ").toUpperCase()}
                          {getSortIcon(col)}
                        </Button>
                      </th>
                    ))}
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-muted-foreground"
                      >
                        Loading patient records...
                      </td>
                    </tr>
                  ) : sortedData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-muted-foreground"
                      >
                        {searchTerm
                          ? "No patients found matching your search."
                          : "No patient records found."}
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((patient) => (
                      <tr
                        key={patient.id}
                        className="border-t hover:bg-muted/50"
                      >
                        <td className="p-3 font-medium text-primary">
                          {patient.id?.slice(0, 8)}
                        </td>
                        <td className="p-3 font-medium">
                          {patient.first_name} {patient.last_name}
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="text-sm">
                              {patient.phone || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {patient.email || "N/A"}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {patient.blood_group && (
                            <Badge variant="outline" className="text-xs">
                              {patient.blood_group.toUpperCase()}
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {displayAge(patient.date_of_birth)} •{" "}
                          {patient.gender || "N/A"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(patient.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3 flex gap-2">
                          <PatientHistoryDialog patient={patient} />
                          <PatientEditDialog
                            patient={patient}
                            onPatientUpdate={fetchData}
                          />
                          {futureAppointments.has(patient._id) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 px-2"
                                  disabled
                                >
                                  <Calendar className="h-3 w-3 mr-1" />{" "}
                                  Scheduled
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p>
                                    <strong>Date:</strong>{" "}
                                    {appointmentDetails.get(patient.id)
                                      ?.appointment_date
                                      ? new Date(
                                          appointmentDetails.get(
                                            patient.id
                                          )?.appointment_date!
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </p>
                                  <p>
                                    <strong>Time:</strong>{" "}
                                    {appointmentDetails.get(patient.id)
                                      ?.appointment_time || "N/A"}
                                  </p>
                                  <p>
                                    <strong>Doctor:</strong>{" "}
                                    {appointmentDetails.get(patient.id)
                                      ?.doctor_name || "N/A"}
                                  </p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button
                              size="sm"
                              variant="medical"
                              className="h-8 px-2"
                              onClick={() =>
                                handleScheduleAppointment(patient.id)
                              }
                            >
                              <Calendar className="h-3 w-3 mr-1" /> Schedule
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
