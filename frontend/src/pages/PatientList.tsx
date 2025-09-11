import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Calendar, Users, Clock, Phone, User, Stethoscope, FileText, Eye, Edit } from "lucide-react";
import { Patient } from "@/types/medical";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useSortable } from "@/hooks/useSortable";
import { cache } from "@/lib/cache";
import { TableSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton";
import { useNavigate } from "react-router-dom";

interface AppointmentWithDetails {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  visit_type: string;
  status: string;
  notes: string;
  department: string;
  patient: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    date_of_birth: string;
  };
  doctor: {
    id: string;
    first_name: string;
    last_name: string;
    specialization: string;
    department: string;
  };
}

interface PatientTableRow {
  id: string;
  appointmentId: string;
  patientName: string;
  age: number;
  phone: string;
  appointmentTime: string;
  visitType: string;
  department: string;
  doctorName: string;
  specialization: string;
  status: "waiting" | "in-progress" | "completed";
}

export default function PatientList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [patientRows, setPatientRows] = useState<PatientTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchTodaysPatients();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('patient-list-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          console.log('PatientList: Appointments table changed, invalidating cache...');
          const today = new Date().toISOString().split('T')[0];
          cache.invalidate(`todays-patients-${today}`);
          fetchTodaysPatients();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchTodaysPatients = async () => {
    try {
      setIsLoading(true);
      console.log("PatientList: Fetching today's appointments...");
      
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `todays-patients-${today}`;
      
      // Check cache first
      const cachedData = cache.get<PatientTableRow[]>(cacheKey);
      if (cachedData) {
        console.log("PatientList: Using cached data:", cachedData.length);
        setPatientRows(cachedData);
        setIsLoading(false);
        return;
      }
      
      // Fetch today's appointments
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('*')
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (appointmentError) {
        console.error("PatientList: Error fetching appointments:", appointmentError);
        throw appointmentError;
      }

      if (!appointmentData || appointmentData.length === 0) {
        console.log("PatientList: No appointments found for today");
        setPatientRows([]);
        cache.set(cacheKey, [], 180000); // Cache empty result for 3 minutes
        return;
      }

      console.log("PatientList: Fetched appointments:", appointmentData.length);

      // Get unique patient and doctor IDs
      const patientIds = [...new Set(appointmentData.map(a => a.patient_id))];
      const doctorIds = [...new Set(appointmentData.map(a => a.doctor_id))];

      // Batch fetch patient and doctor details
      const [patientResponse, doctorResponse] = await Promise.all([
        supabase
          .from('patients')
          .select('id, first_name, last_name, phone, email, date_of_birth')
          .in('id', patientIds),
        supabase
          .from('employees')
          .select('id, first_name, last_name, specialization, department')
          .eq('employee_type', 'Doctor')
          .in('id', doctorIds)
      ]);

      if (patientResponse.error) {
        console.error("PatientList: Error fetching patients:", patientResponse.error);
        throw patientResponse.error;
      }

      if (doctorResponse.error) {
        console.error("PatientList: Error fetching doctors:", doctorResponse.error);
        throw doctorResponse.error;
      }

      // Create lookup maps
      const patientMap = new Map(patientResponse.data?.map(p => [p.id, p]) || []);
      const doctorMap = new Map(doctorResponse.data?.map(d => [d.id, d]) || []);

      // Combine appointment data with patient/doctor details
      const appointmentsWithDetails: AppointmentWithDetails[] = appointmentData.map(appointment => ({
        ...appointment,
        patient: patientMap.get(appointment.patient_id) || {
          id: appointment.patient_id,
          first_name: 'Unknown',
          last_name: 'Patient',
          phone: '',
          email: '',
          date_of_birth: ''
        },
        doctor: doctorMap.get(appointment.doctor_id) || {
          id: appointment.doctor_id,
          first_name: 'Unknown',
          last_name: 'Doctor',
          specialization: '',
          department: ''
        }
      }));

      // Convert to PatientTableRow format
      const patientTableRows: PatientTableRow[] = appointmentsWithDetails.map(apt => {
        const age = apt.patient.date_of_birth ? 
          new Date().getFullYear() - new Date(apt.patient.date_of_birth).getFullYear() : 0;
        
        // Map appointment status to patient queue status
        let queueStatus: "waiting" | "in-progress" | "completed";
        switch (apt.status) {
          case 'in-progress':
            queueStatus = 'in-progress';
            break;
          case 'completed':
            queueStatus = 'completed';
            break;
          default:
            queueStatus = 'waiting';
        }

        return {
          id: apt.patient.id,
          appointmentId: apt.id,
          patientName: `${apt.patient.first_name} ${apt.patient.last_name}`,
          age: age,
          phone: apt.patient.phone,
          appointmentTime: new Date(`2000-01-01T${apt.appointment_time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          visitType: apt.visit_type,
          department: apt.department,
          doctorName: `${apt.doctor.first_name} ${apt.doctor.last_name}`,
          specialization: apt.doctor.specialization,
          status: queueStatus
        };
      });

      // Sort by appointment time for first-come-first-serve (earliest appointments first)
      patientTableRows.sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));

      console.log("PatientList: Final patient table rows:", patientTableRows.length);
      
      // Cache the result for 3 minutes
      cache.set(cacheKey, patientTableRows, 180000);
      setPatientRows(patientTableRows);
    } catch (error) {
      console.error("PatientList: Error in fetchTodaysPatients:", error);
      toast.error("Failed to fetch today's patients");
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredPatients = patientRows.filter(patient => {
    const matchesSearch = patient.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const { sortedData, requestSort, getSortIcon } = useSortable(filteredPatients);

  const handleStartConsultation = async (patient: PatientTableRow) => {
    try {
      // Update appointment status to in-progress
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'in-progress' })
        .eq('id', patient.appointmentId);

      if (error) throw error;

      toast.success(`Started consultation for ${patient.patientName}`);
      
      // Navigate to prescription page
      navigate(`/prescription?patient_id=${patient.id}&appointment_id=${patient.appointmentId}`);
    } catch (error) {
      console.error('Error starting consultation:', error);
      toast.error('Failed to start consultation');
    }
  };

  const handleViewHistory = (patientId: string) => {
    navigate(`/patient/${patientId}`);
  };

  const handleCompleteConsultation = async (patient: PatientTableRow) => {
    try {
      // Update appointment status to completed
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', patient.appointmentId);

      if (error) throw error;

      toast.success(`Completed consultation for ${patient.patientName}`);
      
      // Refresh the list
      const today = new Date().toISOString().split('T')[0];
      cache.invalidate(`todays-patients-${today}`);
      fetchTodaysPatients();
    } catch (error) {
      console.error('Error completing consultation:', error);
      toast.error('Failed to complete consultation');
    }
  };

  const getStatusCount = (status: string) => {
    return patientRows.filter(p => p.status === status).length;
  };

  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
          <h1 className="text-3xl font-bold text-foreground">Patient Management</h1>
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
                <p className="text-2xl font-bold text-warning">{getStatusCount("waiting")}</p>
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
                <p className="text-2xl font-bold text-primary">{getStatusCount("in-progress")}</p>
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
                <p className="text-2xl font-bold text-success">{getStatusCount("completed")}</p>
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
                <p className="text-2xl font-bold text-accent">{patientRows.length}</p>
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
                    onClick={() => requestSort('patientName')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Patient Name
                    {getSortIcon('patientName')}
                  </Button>
                </TableHead>
                <TableHead className="w-[80px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('age')}
                  >
                    Age
                    {getSortIcon('age')}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('phone')}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Phone
                    {getSortIcon('phone')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('appointmentTime')}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Time
                    {getSortIcon('appointmentTime')}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('visitType')}
                  >
                    Visit Type
                    {getSortIcon('visitType')}
                  </Button>
                </TableHead>
                <TableHead className="w-[140px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('department')}
                  >
                    Department
                    {getSortIcon('department')}
                  </Button>
                </TableHead>
                <TableHead className="w-[180px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('doctorName')}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Doctor
                    {getSortIcon('doctorName')}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                    onClick={() => requestSort('status')}
                  >
                    Status
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((patient) => (
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
                      {patient.visitType.replace('-', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {patient.department}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.doctorName}</div>
                      <div className="text-sm text-muted-foreground">{patient.specialization}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        patient.status === "in-progress" ? "default" :
                        patient.status === "waiting" ? "secondary" :
                        "outline"
                      }
                      className={
                        patient.status === "in-progress" ? "bg-blue-100 text-blue-800 border-blue-200" :
                        patient.status === "waiting" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                        "bg-green-100 text-green-800 border-green-200"
                      }
                    >
                      {patient.status === "in-progress" ? "In Progress" :
                       patient.status === "waiting" ? "Waiting" :
                       "Completed"}
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
                            onClick={() => navigate(`/prescription?patient_id=${patient.id}&appointment_id=${patient.appointmentId}`)}
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
                          onClick={() => navigate(`/prescription?patient_id=${patient.id}&appointment_id=${patient.appointmentId}`)}
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
        </CardContent>
      </Card>

      {sortedData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "No patients scheduled for today."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}