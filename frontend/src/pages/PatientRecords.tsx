import { useState, useEffect } from "react";
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
  Eye,
  Edit,
  Filter,
  Download,
  FileText,
  Calendar,
  Trash,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useSortable } from "@/hooks/useSortable";

interface PatientRecord {
  id: string;
  _id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  medical_history: string;
  created_at: string;
  updated_at: string;
}

interface AppointmentInfo {
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

const BASE_URL = "http://localhost:4000/api";

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

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  // Fetch patients
  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${BASE_URL}/patients/getPatients`);
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data: PatientRecord[] = await res.json();

      // Normalize: ensure each patient has an `id` field
      const normalized = data.map((p) => ({
        ...p,
        id: p.id || p._id,
      }));

      setPatientRecords(normalized || []);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast({
        title: "Error",
        description: "Failed to fetch patient records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/getAppointments`);
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data: AppointmentInfo[] = await res.json();

      const today = new Date().toISOString().split("T")[0];
      const future = data.filter(
        (a) => a.visit_date >= today && a.status.toLowerCase() === "scheduled"
      );

      const patientIds = new Set(future.map((a) => a.patient));
      const details = new Map<string, AppointmentInfo>();
      future.forEach((a) => details.set(a.patient, a));

      setFutureAppointments(patientIds);
      setAppointmentDetails(details);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Schedule appointment
  const scheduleAppointment = async (patientId: string) => {
    try {
      const res = await fetch(`${BASE_URL}/appointments/createAppointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient: patientId,
          doctor: "64a987654321abcdef987654", // Replace with real doctor ID
          visit_date: new Date().toISOString().split("T")[0],
          visit_time: "10:00 AM",
          visit_type: "Consultation",
          doctor_department: "General",
          status: "Scheduled",
        }),
      });

      if (!res.ok) throw new Error("Failed to schedule appointment");

      toast({ title: "Success", description: "Appointment scheduled" });
      fetchAppointments();
    } catch {
      toast({
        title: "Error",
        description: "Could not schedule appointment",
        variant: "destructive",
      });
    }
  };

  // Delete appointment
  const deleteAppointment = async (id: string) => {
    try {
      const res = await fetch(
        `${BASE_URL}/appointments/deleteAppointment/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Failed to delete appointment");

      toast({ title: "Success", description: "Appointment deleted" });
      fetchAppointments();
    } catch {
      toast({
        title: "Error",
        description: "Could not delete appointment",
        variant: "destructive",
      });
    }
  };

  const filteredPatients = patientRecords.filter(
    (patient) =>
      `${patient.first_name} ${patient.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { sortedData, requestSort, getSortIcon } =
    useSortable(filteredPatients);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
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
            <Button variant="outline" className="border-border">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="border-border">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Search & Stats */}
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
                  patientRecords.filter((p) => {
                    const createdDate = new Date(p.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return createdDate > weekAgo;
                  }).length
                }
              </div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Patient Records Database
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
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                        onClick={() => requestSort("id")}
                      >
                        Patient ID
                        {getSortIcon("id")}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                        onClick={() => requestSort("first_name")}
                      >
                        Name
                        {getSortIcon("first_name")}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                        onClick={() => requestSort("phone")}
                      >
                        Contact
                        {getSortIcon("phone")}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                        onClick={() => requestSort("blood_group")}
                      >
                        Blood Group
                        {getSortIcon("blood_group")}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                        onClick={() => requestSort("date_of_birth")}
                      >
                        Age/Gender
                        {getSortIcon("date_of_birth")}
                      </Button>
                    </th>
                    <th className="text-left p-3 font-medium text-muted-foreground">
                      <Button
                        variant="ghost"
                        className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                        onClick={() => requestSort("created_at")}
                      >
                        Created
                        {getSortIcon("created_at")}
                      </Button>
                    </th>
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
                          : "No patient records found. Add patients from the Patient Onboarding page."}
                      </td>
                    </tr>
                  ) : (
                    sortedData.map((patient) => {
                      const appt = appointmentDetails.get(patient.id);

                      return (
                        <tr
                          key={patient.id}
                          className="border-t hover:bg-muted/50"
                        >
                          <td className="p-3 font-medium text-primary">
                            {patient.id?.slice(0, 8)}
                          </td>
                          <td className="p-3">
                            <div className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </div>
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
                            {calculateAge(patient.date_of_birth)} •{" "}
                            {patient.gender || "N/A"}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {new Date(patient.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>

                              {appt ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-8 px-2"
                                    >
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Scheduled
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <div className="text-sm">
                                      <p>
                                        <strong>Date:</strong>{" "}
                                        {new Date(
                                          appt.visit_date
                                        ).toLocaleDateString()}
                                      </p>
                                      <p>
                                        <strong>Time:</strong> {appt.visit_time}
                                      </p>
                                      <p>
                                        <strong>Doctor ID:</strong>{" "}
                                        {appt.doctor}
                                      </p>
                                      <p>
                                        <strong>Department:</strong>{" "}
                                        {appt.doctor_department}
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="mt-2"
                                        onClick={() =>
                                          deleteAppointment(appt._id)
                                        }
                                      >
                                        <Trash className="h-3 w-3 mr-1" />
                                        Cancel
                                      </Button>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="medical"
                                  className="h-8 px-2"
                                  onClick={() =>
                                    scheduleAppointment(patient.id)
                                  }
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Schedule
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
