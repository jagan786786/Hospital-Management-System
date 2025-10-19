import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  Stethoscope,
  Edit,
  X,
  Eye,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSortable } from "@/hooks/useSortable";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import { TableSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton";

import {
  getAppointments,
  updateAppointment,
} from "../api/services/appointmentService";
import { getPatients } from "../api/services/patientService";
import { getEmployeeById } from "../api/services/employeService";

import { AppointmentInfo } from "@/types/appointment";
import { PatientRecord } from "@/types/patient";
import { Employee } from "@/types/employee";
import { useAuth } from "@/context/AuthContext";

interface AppointmentWithDetails extends AppointmentInfo {
  patientDetail: PatientRecord;
  doctorDetail: Employee;
}

interface AppointmentManagementProps {
  showOnlyDoctor?: boolean;
}

export default function AppointmentManagement({ showOnlyDoctor = false }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] =
    useState<AppointmentWithDetails | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);

  // Fetch all appointments + full patient & doctor details
  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const appointmentData: AppointmentInfo[] = await getAppointments();
      const patientData: PatientRecord[] = await getPatients();

      const patientMap = new Map<string, PatientRecord>();
      patientData.forEach((p) => {
        if (p._id) patientMap.set(p._id, p);
      });
      const detailedAppointments: AppointmentWithDetails[] = await Promise.all(
        appointmentData.map(async (appt) => {
          const patientDetail =
            typeof appt.patient === "string"
              ? patientMap.get(appt.patient)!
              : (appt.patient as PatientRecord);

          const doctorDetail: Employee =
            typeof appt.doctor === "string"
              ? await getEmployeeById(appt.doctor)
              : (appt.doctor as Employee);

          return {
            ...appt,
            patientDetail,
            doctorDetail,
          };
        })
      );

      const filteredAppointments = showOnlyDoctor
        ? detailedAppointments.filter(
            (appt) => appt.doctorDetail?._id === user?.id
          )
        : detailedAppointments;

      setAppointments(filteredAppointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [showOnlyDoctor, user?.id]);

  const handleUpdateAppointment = async () => {
    if (!editingAppointment || !newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAppointment(editingAppointment._id, {
        visit_date: newDate,
        visit_time: newTime,
      });

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      });

      setEditingAppointment(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      });
    }
  };

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const todaysCount = appointments.filter((a) => {
    // Normalize appointment date to YYYY-MM-DD
    const apptDateStr = new Date(a.visit_date).toISOString().split("T")[0];

    const isToday = apptDateStr === todayStr;

    if (showOnlyDoctor) {
      return isToday && a.doctorDetail._id === user?.id;
    }

    return isToday;
  }).length;

  const handleViewHistory = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      // Update the appointment status to "cancelled"
      await updateAppointment(appointmentId, { status: "Cancelled" });

      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been successfully cancelled.",
        variant: "destructive",
      });

      // Refresh appointments to reflect the change
      fetchAppointments();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setNewDate(appointment.visit_date);
    setNewTime(appointment.visit_time);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "default";
      case "In-Progress":
        return "secondary";
      case "Completed":
        return "success";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredAppointments = appointments.filter(
    (appt) => statusFilter === "all" || appt.status === statusFilter
  );

  const { sortedData, requestSort, getSortIcon } =
    useSortable(filteredAppointments);
  const pagination = usePagination(sortedData, pageSize);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return ""; // fallback
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Appointment Management
          </h1>
          <p className="text-muted-foreground">
            Manage all appointments, reschedule or cancel as needed
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Appointments</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {appointments.length}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {appointments.filter((a) => a.status === "Scheduled").length}
            </div>
            <p className="text-xs text-muted-foreground">Active appointments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {appointments.filter((a) => a.status === "Completed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Finished appointments
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {todaysCount}
            </div>

            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Appointments Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            All Appointments
          </CardTitle>
          <CardDescription>
            Complete list of all appointments with management options
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
                      onClick={() => requestSort("appointment_date")}
                    >
                      Date & Time
                      {getSortIcon("appointment_date")}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort("patient.first_name")}
                    >
                      Patient
                      {getSortIcon("patient.first_name")}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort("doctor.first_name")}
                    >
                      Doctor
                      {getSortIcon("doctor.first_name")}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort("visit_type")}
                    >
                      Visit Type
                      {getSortIcon("visit_type")}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button
                      variant="ghost"
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort("status")}
                    >
                      Status
                      {getSortIcon("status")}
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
                    <td colSpan={6} className="p-8">
                      <div className="space-y-6">
                        <StatsSkeleton count={4} />
                        <TableSkeleton rows={5} columns={6} />
                      </div>
                    </td>
                  </tr>
                ) : pagination.paginatedData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-muted-foreground"
                    >
                      {statusFilter === "all"
                        ? "No appointments found."
                        : `No ${statusFilter} appointments found.`}
                    </td>
                  </tr>
                ) : (
                  pagination.paginatedData.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="border-t hover:bg-muted/50"
                    >
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {formatDate(appointment.visit_date)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(appointment.visit_time)}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {appointment.patientDetail.first_name}{" "}
                            {appointment.patientDetail.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.patientDetail.phone}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">
                            Dr. {appointment.doctorDetail.first_name}{" "}
                            {appointment.doctorDetail.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {appointment.doctorDetail.department}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {appointment.visit_type.replace("-", " ")}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={getStatusBadgeVariant(appointment.status)}
                        >
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          {/* View History - Available for all appointments */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() =>
                              handleViewHistory(appointment.patientDetail._id)
                            }
                            title="View Patient History"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>

                          {/* Edit Prescription - Available for completed appointments */}
                          {appointment.status === "Completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 w-8 p-0 text-primary hover:text-primary"
                              onClick={() =>
                                handleViewHistory(appointment.patientDetail._id)
                              }
                              title="Edit Prescription"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Edit and Cancel - Only for scheduled appointments */}
                          {appointment.status === "Scheduled" && (
                            <>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => openEditDialog(appointment)}
                                    title="Edit Appointment"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Appointment</DialogTitle>
                                    <DialogDescription>
                                      Update the appointment date and time for{" "}
                                      {appointment.patientDetail.first_name}{" "}
                                      {appointment.patientDetail.last_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="date"
                                        className="text-right"
                                      >
                                        Date
                                      </Label>
                                      <Input
                                        id="date"
                                        type="date"
                                        value={newDate}
                                        onChange={(e) =>
                                          setNewDate(e.target.value)
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label
                                        htmlFor="time"
                                        className="text-right"
                                      >
                                        Time
                                      </Label>
                                      <Input
                                        id="time"
                                        type="time"
                                        value={newTime}
                                        onChange={(e) =>
                                          setNewTime(e.target.value)
                                        }
                                        className="col-span-3"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button
                                      type="submit"
                                      onClick={handleUpdateAppointment}
                                    >
                                      Update Appointment
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    title="Cancel Appointment"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancel Appointment
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel the
                                      appointment for{" "}
                                      {appointment.patientDetail.first_name}{" "}
                                      {appointment.patientDetail.last_name} on{" "}
                                      {formatDate(appointment.visit_date)} at{" "}
                                      {formatTime(appointment.visit_time)}? This
                                      action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Keep Appointment
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleCancelAppointment(appointment._id)
                                      }
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Cancel Appointment
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}

                          {/* Status indicator for cancelled appointments */}
                          {appointment.status === "Cancelled" && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <AlertCircle className="h-3 w-3" />
                              Cancelled
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <TablePagination
              {...pagination}
              onPageSizeChange={(size) => setPageSize(size)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
