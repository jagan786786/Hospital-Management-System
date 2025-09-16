import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, User, Stethoscope, Edit, X, AlertCircle, FileText, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useSortable } from "@/hooks/useSortable";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import { cache } from "@/lib/cache";
import { TableSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton";

interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  visit_type: string;
  status: string;
  notes: string;
  department: string;
  created_at: string;
  updated_at: string;
}

interface PatientInfo {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface DoctorInfo {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department: string;
}

interface AppointmentWithDetails extends Appointment {
  patient: PatientInfo;
  doctor: DoctorInfo;
}

export default function AppointmentManagement() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithDetails | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchAppointments();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('appointment-management-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          console.log('AppointmentManagement: Appointments table changed, invalidating cache...');
          cache.invalidate('all-appointments');
          fetchAppointments();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      console.log("AppointmentManagement: Fetching all appointments...");
      
      const cacheKey = 'all-appointments';
      
      // Check cache first
      const cachedData = cache.get<AppointmentWithDetails[]>(cacheKey);
      if (cachedData) {
        console.log("AppointmentManagement: Using cached data:", cachedData.length);
        setAppointments(cachedData);
        setIsLoading(false);
        return;
      }
      
      // Fetch appointments
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: true });

      if (appointmentError) {
        console.error("AppointmentManagement: Error fetching appointments:", appointmentError);
        throw appointmentError;
      }

      if (!appointmentData || appointmentData.length === 0) {
        console.log("AppointmentManagement: No appointments found");
        setAppointments([]);
        cache.set(cacheKey, [], 300000); // Cache empty result for 5 minutes
        return;
      }

      console.log("AppointmentManagement: Fetched appointments:", appointmentData.length);

      // Get unique patient and doctor IDs
      const patientIds = [...new Set(appointmentData.map(a => a.patient_id))];
      const doctorIds = [...new Set(appointmentData.map(a => a.doctor_id))];

      // Batch fetch patient and doctor details
      const [patientResponse, doctorResponse] = await Promise.all([
        supabase
          .from('patients')
          .select('id, first_name, last_name, phone, email')
          .in('id', patientIds),
        supabase
          .from('employees')
          .select('id, first_name, last_name, specialization, department')
          .eq('employee_type', 'Doctor')
          .in('id', doctorIds)
      ]);

      if (patientResponse.error) {
        console.error("AppointmentManagement: Error fetching patients:", patientResponse.error);
        throw patientResponse.error;
      }

      if (doctorResponse.error) {
        console.error("AppointmentManagement: Error fetching doctors:", doctorResponse.error);
        throw doctorResponse.error;
      }

      // Create lookup maps
      const patientMap = new Map(patientResponse.data?.map(p => [p.id, p]) || []);
      const doctorMap = new Map(doctorResponse.data?.map(d => [d.id, d]) || []);

      // Combine data
      const appointmentsWithDetails = appointmentData.map(appointment => ({
        ...appointment,
        patient: patientMap.get(appointment.patient_id) || {
          id: appointment.patient_id,
          first_name: 'Unknown',
          last_name: 'Patient',
          phone: '',
          email: ''
        },
        doctor: doctorMap.get(appointment.doctor_id) || {
          id: appointment.doctor_id,
          first_name: 'Unknown',
          last_name: 'Doctor',
          specialization: '',
          department: ''
        }
      }));

      console.log("AppointmentManagement: Final appointments with details:", appointmentsWithDetails.length);
      
      // Cache the result for 5 minutes
      cache.set(cacheKey, appointmentsWithDetails, 300000);
      setAppointments(appointmentsWithDetails);
    } catch (error) {
      console.error("AppointmentManagement: Error in fetchAppointments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment || !newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          appointment_date: newDate,
          appointment_time: newTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAppointment.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment updated successfully"
      });

      setEditingAppointment(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive"
      });
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment cancelled successfully"
      });

      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  const handleViewHistory = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const openEditDialog = (appointment: AppointmentWithDetails) => {
    setEditingAppointment(appointment);
    setNewDate(appointment.appointment_date);
    setNewTime(appointment.appointment_time);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const filteredAppointments = appointments.filter(appointment => 
    statusFilter === 'all' || appointment.status === statusFilter
  );

  const { sortedData, requestSort, getSortIcon } = useSortable(filteredAppointments);
  const pagination = usePagination(sortedData, pageSize);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Appointment Management</h1>
          <p className="text-muted-foreground">Manage all appointments, reschedule or cancel as needed</p>
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
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{appointments.length}</div>
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
              {appointments.filter(a => a.status === 'scheduled').length}
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
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">Finished appointments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {appointments.filter(a => a.appointment_date === new Date().toISOString().split('T')[0]).length}
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
          <CardDescription>Complete list of all appointments with management options</CardDescription>
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
                      onClick={() => requestSort('appointment_date')}
                    >
                      Date & Time
                      {getSortIcon('appointment_date')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('patient.first_name')}
                    >
                      Patient
                      {getSortIcon('patient.first_name')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('doctor.first_name')}
                    >
                      Doctor
                      {getSortIcon('doctor.first_name')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('visit_type')}
                    >
                      Visit Type
                      {getSortIcon('visit_type')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('status')}
                    >
                      Status
                      {getSortIcon('status')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
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
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      {statusFilter === 'all' ? 'No appointments found.' : `No ${statusFilter} appointments found.`}
                    </td>
                  </tr>
                ) : (
                  pagination.paginatedData.map((appointment) => (
                    <tr key={appointment.id} className="border-t hover:bg-muted/50">
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{formatDate(appointment.appointment_date)}</div>
                          <div className="text-sm text-muted-foreground">{formatTime(appointment.appointment_time)}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{appointment.patient.first_name} {appointment.patient.last_name}</div>
                          <div className="text-sm text-muted-foreground">{appointment.patient.phone}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}</div>
                          <div className="text-sm text-muted-foreground">{appointment.doctor.specialization}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {appointment.visit_type.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant={getStatusBadgeVariant(appointment.status)}>
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
                            onClick={() => handleViewHistory(appointment.patient_id)}
                            title="View Patient History"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>

                          {/* Edit Prescription - Available for completed appointments */}
                          {appointment.status === 'completed' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 w-8 p-0 text-primary hover:text-primary"
                              onClick={() => handleViewHistory(appointment.patient_id)}
                              title="Edit Prescription"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          )}

                          {/* Edit and Cancel - Only for scheduled appointments */}
                          {appointment.status === 'scheduled' && (
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
                                      Update the appointment date and time for {appointment.patient.first_name} {appointment.patient.last_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="date" className="text-right">Date</Label>
                                      <Input
                                        id="date"
                                        type="date"
                                        value={newDate}
                                        onChange={(e) => setNewDate(e.target.value)}
                                        className="col-span-3"
                                      />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                      <Label htmlFor="time" className="text-right">Time</Label>
                                      <Input
                                        id="time"
                                        type="time"
                                        value={newTime}
                                        onChange={(e) => setNewTime(e.target.value)}
                                        className="col-span-3"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="submit" onClick={handleUpdateAppointment}>
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
                                    <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to cancel the appointment for {appointment.patient.first_name} {appointment.patient.last_name} on {formatDate(appointment.appointment_date)} at {formatTime(appointment.appointment_time)}?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleCancelAppointment(appointment.id)}
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
                          {appointment.status === 'cancelled' && (
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