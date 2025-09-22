import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  FileText,
  Eye,
  Stethoscope,
  Phone,
  User,
  Users,
  Search,
  Calendar,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAppointments,
  updateAppointment,
} from "../api/services/appointmentService";
import { getPatients } from "../api/services/patientService";
import { getEmployeeById } from "../api/services/employeService";
import { AppointmentInfo, PatientTableRow } from "../types/appointment";
import { useSortable } from "@/hooks/useSortable";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import { StatsSkeleton, TableSkeleton } from "@/components/LoadingSkeleton";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Employee } from "@/types/employee";
import { PatientRecord } from "@/types/patient";

export default function PatientList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [patientRows, setPatientRows] = useState<PatientTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(10);

  // Fetch today's patients
  useEffect(() => {
    const fetchTodaysPatients = async () => {
      try {
        setIsLoading(true);
        const today = new Date().toISOString().split("T")[0];

        //  Fetch all appointments
        const appointments: AppointmentInfo[] = await getAppointments();
        const todaysAppointments = appointments.filter((a) => {
          const visitDate = new Date(a.visit_date).toISOString().split("T")[0];
          return visitDate === today;
        });

        if (!todaysAppointments.length) {
          setPatientRows([]);
          return;
        }

        //  Get unique patient & doctor IDs
        const patientIds = Array.from(
          new Set(
            todaysAppointments.map((a) =>
              typeof a.patient === "string"
                ? a.patient
                : (a.patient as PatientRecord)._id
            )
          )
        );
        const doctorIds = Array.from(
          new Set(
            todaysAppointments.map((a) =>
              typeof a.doctor === "string"
                ? a.doctor
                : (a.doctor as Employee)._id
            )
          )
        );

        //  Fetch patient & doctor details
        const allPatients = await getPatients(); // returns all patients
        const patients = allPatients.filter((p) => patientIds.includes(p._id));

        const doctors = await Promise.all(
          doctorIds.map((id) => getEmployeeById(id))
        );

        const patientMap = new Map(patients.map((p) => [p._id, p]));
        const doctorMap = new Map(doctors.map((d) => [d._id, d]));

        // Map appointments to table rows
        const rows: PatientTableRow[] = todaysAppointments.map((a) => {
          const patientId =
            typeof a.patient === "string"
              ? a.patient
              : (a.patient as PatientRecord)._id;

          const doctorId =
            typeof a.doctor === "string"
              ? a.doctor
              : (a.doctor as Employee)._id;

          const patient = patientMap.get(patientId);
          const doctor = doctorMap.get(doctorId);

          const age = patient.date_of_birth
            ? new Date().getFullYear() -
              new Date(patient.date_of_birth).getFullYear()
            : 0;

          let status: "waiting" | "in-progress" | "completed";
          switch (a.status) {
            case "In-Progress":
              status = "in-progress";
              break;
            case "Completed":
              status = "completed";
              break;
            default:
              status = "waiting";
          }

          return {
            id: patient._id,
            appointmentId: a._id,
            patientName: `${patient.first_name} ${patient.last_name}`,
            age,
            phone: patient.phone || "",
            appointmentTime: a.visit_time,
            visitType: a.visit_type,
            department: a.doctor_department,
            doctorName: `${doctor.first_name} ${doctor.last_name}`,
            specialization: (doctor as any).specialization || "",
            status,
          };
        });

        setPatientRows(rows);
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch today's patients");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodaysPatients();
  }, []);

  // Filtered + sorted + paginated data
  const filteredPatients = useMemo(() => {
    return patientRows.filter((patient) => {
      const matchesSearch =
        patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [patientRows, searchTerm, statusFilter]);

  const { sortedData, requestSort, getSortIcon } =
    useSortable(filteredPatients);
  const pagination = usePagination(sortedData, pageSize);

  const handleStartConsultation = async (patient: PatientTableRow) => {
    try {
      await updateAppointment(patient.appointmentId, { status: "In-Progress" });
      toast.success(`Started consultation for ${patient.patientName}`);
      navigate(
        `/prescription?patient_id=${patient.id}&appointment_id=${patient.appointmentId}`
      );
    } catch {
      toast.error("Failed to start consultation");
    }
  };

  const handleViewHistory = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleCompleteConsultation = async (patient: PatientTableRow) => {
    try {
      await updateAppointment(patient.appointmentId, { status: "Completed" });
      toast.success(`Completed consultation for ${patient.patientName}`);
      const today = new Date().toISOString().split("T")[0];

      const refreshedAppointments = await getAppointments();
      setPatientRows(
        refreshedAppointments
          .filter((a) => a.visit_date === today)
          .map((a) => ({
            id: a._id!,
            appointmentId: a._id!,
            patientName: a.patient,
            age: 0,
            phone: "",
            appointmentTime: a.visit_time,
            visitType: a.visit_type,
            department: a.doctor_department,
            doctorName: "",
            specialization: "",
            status:
              a.status === "In-Progress"
                ? "in-progress"
                : a.status === "Completed"
                ? "completed"
                : "waiting",
          }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete consultation");
    }
  };

  const getStatusCount = (status: string) => {
    return patientRows.filter((p) => p.status === status).length;
  };

  const todayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton count={4} />

        {/* Search Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="h-10 w-full bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <TableSkeleton rows={8} columns={8} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Patient Management
          </h1>
          <p className="text-muted-foreground mt-1">{todayDate}</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            {patientRows.length} Patients Today
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Waiting</p>
                <p className="text-2xl font-bold text-warning">
                  {getStatusCount("waiting")}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-primary">
                  {getStatusCount("in-progress")}
                </p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-success">
                  {getStatusCount("completed")}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-success/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-accent">
                  {patientRows.length}
                </p>
              </div>
              <Users className="w-8 h-8 text-accent/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search patients by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All ({patientRows.length})
              </Button>
              <Button
                variant={statusFilter === "waiting" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("waiting")}
              >
                Waiting ({getStatusCount("waiting")})
              </Button>
              <Button
                variant={statusFilter === "in-progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("in-progress")}
              >
                In Progress ({getStatusCount("in-progress")})
              </Button>
              <Button
                variant={statusFilter === "completed" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("completed")}
              >
                Completed ({getStatusCount("completed")})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("patientName")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Patient Name
                    {getSortIcon("patientName")}
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("age")}
                  >
                    Age
                    {getSortIcon("age")}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("phone")}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                    {getSortIcon("phone")}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("appointmentTime")}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Time
                    {getSortIcon("appointmentTime")}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("visitType")}
                  >
                    Visit Type
                    {getSortIcon("visitType")}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("department")}
                  >
                    Department
                    {getSortIcon("department")}
                  </Button>
                </TableHead>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("doctorName")}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Doctor
                    {getSortIcon("doctorName")}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort("status")}
                  >
                    Status
                    {getSortIcon("status")}
                  </Button>
                </TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.paginatedData.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-semibold">{patient.patientName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.age}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.phone}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {patient.appointmentTime}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {patient.visitType.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.department}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.doctorName}</div>
                      <div className="text-sm text-muted-foreground">
                        {patient.specialization}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        patient.status === "in-progress"
                          ? "default"
                          : patient.status === "waiting"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        patient.status === "in-progress"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : patient.status === "waiting"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      {patient.status === "in-progress"
                        ? "In Progress"
                        : patient.status === "waiting"
                        ? "Waiting"
                        : "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {/* View Patient History */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => handleViewHistory(patient.id)}
                        title="View Patient History"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>

                      {/* Action buttons based on status */}
                      {patient.status === "waiting" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 px-3"
                          onClick={() => handleStartConsultation(patient)}
                          title="Start Consultation & Fill Prescription"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}

                      {patient.status === "in-progress" && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 px-3"
                            onClick={() =>
                              navigate(
                                `/prescription?patient_id=${patient.id}&appointment_id=${patient.appointmentId}`
                              )
                            }
                            title="Continue Prescription"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Continue
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3"
                            onClick={() => handleCompleteConsultation(patient)}
                            title="Complete Consultation"
                          >
                            Complete
                          </Button>
                        </>
                      )}

                      {patient.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3"
                          onClick={() =>
                            navigate(
                              `/prescription?patient_id=${patient.id}&appointment_id=${patient.appointmentId}`
                            )
                          }
                          title="View/Edit Prescription"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            {...pagination}
            onPageSizeChange={(size) => setPageSize(size)}
          />
        </CardContent>
      </Card>

      {pagination.totalItems === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No patients scheduled for today."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
