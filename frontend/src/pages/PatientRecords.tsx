import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Users, Activity, Clock, Eye, Edit, Filter, Download, FileText, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cache } from "@/lib/cache";
import { useSortable } from "@/hooks/useSortable";

interface PatientRecord {
  id: string;
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
  appointment_date: string;
  appointment_time: string;
  doctor_name: string;
}

export default function PatientRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [futureAppointments, setFutureAppointments] = useState<Set<string>>(new Set());
  const [appointmentDetails, setAppointmentDetails] = useState<Map<string, AppointmentInfo>>(new Map());

  useEffect(() => {
    fetchPatients();
    fetchFutureAppointments();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('patient-records-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'patients' },
        () => {
          console.log('PatientRecords: Patients table changed, refetching...');
          cache.invalidate('patient-records');
          fetchPatients();
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          console.log('PatientRecords: Appointments table changed, invalidating cache...');
          const today = new Date().toISOString().split('T')[0];
          cache.invalidate(`future-appointments-${today}`);
          fetchFutureAppointments();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchPatients = async () => {
    try {
      console.log("PatientRecords: Starting to fetch patients...");
      
      // Check cache first for faster loading
      const cachedPatients = cache.get<PatientRecord[]>('patient-records');
      if (cachedPatients) {
        console.log("PatientRecords: Using cached patients:", cachedPatients.length);
        setPatientRecords(cachedPatients);
        setIsLoading(false);
        return;
      }

      console.log("PatientRecords: Fetching patients from database...");
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error("PatientRecords: Database error:", error);
        throw error;
      }
      
      console.log("PatientRecords: Fetched patients:", data?.length || 0);
      const patients = data || [];
      setPatientRecords(patients);
      // Cache for 3 minutes
      cache.set('patient-records', patients, 180000);
    } catch (error) {
      console.error("PatientRecords: Error in fetchPatients:", error);
      toast({ 
        title: "Error", 
        description: "Failed to fetch patient records", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFutureAppointments = async () => {
    try {
      console.log("PatientRecords: Starting to fetch future appointments...");
      
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `future-appointments-${today}`;
      
      // Check cache first
      const cachedAppointments = cache.get<{
        patientIds: Set<string>;
        details: Map<string, AppointmentInfo>;
      }>(cacheKey);
      
      if (cachedAppointments) {
        console.log("PatientRecords: Using cached appointment data");
        setFutureAppointments(cachedAppointments.patientIds);
        setAppointmentDetails(cachedAppointments.details);
        return;
      }

      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .select('patient_id, appointment_date, appointment_time, doctor_id')
        .gte('appointment_date', today)
        .eq('status', 'scheduled');

      if (appointmentError) {
        console.error("PatientRecords: Appointment query error:", appointmentError);
        throw appointmentError;
      }
      
      console.log("PatientRecords: Fetched appointments:", appointmentData?.length || 0);
      
      const patientIds = new Set(appointmentData?.map(appointment => appointment.patient_id) || []);
      const details = new Map<string, AppointmentInfo>();
      
      // Fetch doctor details for each appointment
      if (appointmentData && appointmentData.length > 0) {
        const doctorIds = [...new Set(appointmentData.map(a => a.doctor_id))];
        console.log("PatientRecords: Fetching doctor details for IDs:", doctorIds);
        
        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('id, first_name, last_name')
          .in('id', doctorIds);

        if (doctorError) {
          console.error("PatientRecords: Doctor query error:", doctorError);
          throw doctorError;
        }

        console.log("PatientRecords: Fetched doctors:", doctorData?.length || 0);
        const doctorMap = new Map(doctorData?.map(doc => [doc.id, `Dr. ${doc.first_name} ${doc.last_name}`]) || []);
        
        appointmentData.forEach(appointment => {
          details.set(appointment.patient_id, {
            appointment_date: appointment.appointment_date,
            appointment_time: appointment.appointment_time,
            doctor_name: doctorMap.get(appointment.doctor_id) || 'Unknown Doctor'
          });
        });
      }
      
      console.log("PatientRecords: Final appointment details:", details.size);
      
      // Cache for 5 minutes
      cache.set(cacheKey, { patientIds, details }, 300000);
      
      setFutureAppointments(patientIds);
      setAppointmentDetails(details);
    } catch (error) {
      console.error('PatientRecords: Error fetching future appointments:', error);
      // Don't throw error to prevent breaking the entire page
    }
  };

  const handleScheduleAppointment = (patientId: string) => {
    window.location.href = `/appointment-scheduling?patient_id=${patientId}`;
  };

  const filteredPatients = patientRecords.filter(patient =>
    `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const { sortedData, requestSort, getSortIcon } = useSortable(filteredPatients);

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
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
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Records</h1>
            <p className="text-muted-foreground">View and manage existing patient records</p>
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

      {/* Search and Stats */}
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
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{patientRecords.length}</div>
            <p className="text-xs text-muted-foreground">Patient records</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Patients</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {patientRecords.filter(p => {
                const createdDate = new Date(p.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return createdDate > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Records Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Patient Records Database
          </CardTitle>
          <CardDescription>Complete list of all registered patients</CardDescription>
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
                      onClick={() => requestSort('id')}
                    >
                      Patient ID
                      {getSortIcon('id')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('first_name')}
                    >
                      Name
                      {getSortIcon('first_name')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('phone')}
                    >
                      Contact
                      {getSortIcon('phone')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('blood_group')}
                    >
                      Blood Group
                      {getSortIcon('blood_group')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('date_of_birth')}
                    >
                      Age/Gender
                      {getSortIcon('date_of_birth')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">
                    <Button 
                      variant="ghost" 
                      className="h-auto p-0 font-medium justify-start hover:bg-transparent"
                      onClick={() => requestSort('created_at')}
                    >
                      Created
                      {getSortIcon('created_at')}
                    </Button>
                  </th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Loading patient records...
                    </td>
                  </tr>
                ) : sortedData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      {searchTerm ? 'No patients found matching your search.' : 'No patient records found. Add patients from the Patient Onboarding page.'}
                    </td>
                  </tr>
                ) : (
                  sortedData.map((patient) => (
                    <tr key={patient.id} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-medium text-primary">{patient.id.slice(0, 8)}</td>
                      <td className="p-3">
                        <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <div className="text-sm">{patient.phone || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">{patient.email || 'N/A'}</div>
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
                        {calculateAge(patient.date_of_birth)} • {patient.gender || 'N/A'}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(patient.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Edit className="h-3 w-3" />
                          </Button>
                           {futureAppointments.has(patient.id) ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="secondary"
                                  className="h-8 px-2"
                                  disabled={true}
                                >
                                  <Calendar className="h-3 w-3 mr-1" />
                                  Scheduled
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p><strong>Date:</strong> {new Date(appointmentDetails.get(patient.id)?.appointment_date || '').toLocaleDateString()}</p>
                                  <p><strong>Time:</strong> {appointmentDetails.get(patient.id)?.appointment_time}</p>
                                  <p><strong>Doctor:</strong> {appointmentDetails.get(patient.id)?.doctor_name}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="medical"
                              className="h-8 px-2"
                              onClick={() => handleScheduleAppointment(patient.id)}
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
                          )}
                        </div>
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