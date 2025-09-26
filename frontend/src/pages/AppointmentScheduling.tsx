import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  Search,
  Clock,
  User,
  Stethoscope,
  Building2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
// import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cache } from "@/lib/cache";
import { getPatients } from "@/api/services/patientService";
import { getEmployees } from "@/api/services/employeService";
import {
  getAppointments,
  createAppointment,
} from "@/api/services/appointmentService";

// Indian Medical Departments
const INDIAN_DEPARTMENTS = [
  "General Medicine",
  "Pediatrics",
  "Obstetrics & Gynecology",
  "Surgery",
  "Orthopedics",
  "Cardiology",
  "Neurology",
  "Psychiatry",
  "Dermatology",
  "ENT",
  "Ophthalmology",
  "Anesthesiology",
  "Radiology",
  "Pathology",
  "Emergency Medicine",
  "Pulmonology",
  "Gastroenterology",
  "Nephrology",
  "Endocrinology",
  "Rheumatology",
  "Oncology",
  "Urology",
  "Plastic Surgery",
  "Neurosurgery",
  "Cardiac Surgery",
];

const appointmentSchema = z.object({
  patient_id: z.string().min(1, "Please select a patient"),
  doctor_id: z.string().min(1, "Please select a doctor"),
  appointment_date: z.date({
    required_error: "Please select an appointment date",
  }),
  appointment_time: z.string().min(1, "Please select an appointment time"),
  visit_type: z.string().min(1, "Please select a visit type"),
  department: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  created_at: string;
}

interface Doctor {
  id: string;
  first_name: string;
  last_name: string;
  specialization: string;
  department: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
}

export default function AppointmentScheduling() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPatientId = searchParams.get("patient_id");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientOpen, setPatientOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [lastVisitDate, setLastVisitDate] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patient_id: preselectedPatientId || "",
      doctor_id: "",
      appointment_time: "",
      visit_type: "",
      department: "",
      notes: "",
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchPatients(), fetchDoctors()]);
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (preselectedPatientId && patients.length > 0) {
      console.log(
        "AppointmentScheduling: Setting preselected patient:",
        preselectedPatientId
      );
      const patient = patients.find((p) => p.id === preselectedPatientId);
      if (patient) {
        console.log("AppointmentScheduling: Found patient:", patient);
        setSelectedPatient(patient);
        form.setValue("patient_id", patient.id);
        checkLastVisit(patient.id);
      } else {
        console.log("AppointmentScheduling: Patient not found in list");
      }
    }
  }, [preselectedPatientId, patients, form]);

  // Fetch Patients using API
  const fetchPatients = async () => {
    try {
      const cachedPatients = cache.get<Patient[]>("patients");
      if (cachedPatients) {
        setPatients(cachedPatients);
        return;
      }

      const patientRecords = await getPatients();

      // 🔄 Transform PatientRecord → Patient
      const patients: Patient[] = patientRecords.map((p) => ({
        id: p._id || "", // ensure non-optional
        first_name: p.first_name,
        last_name: p.last_name,
        date_of_birth: p.date_of_birth,
        gender: p.gender,
        phone: p.phone,
        created_at: new Date().toISOString(),
      }));

      setPatients(patients);
      cache.set("patients", patients, 300000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch patients",
        variant: "destructive",
      });
    }
  };

  // Fetch Doctor using API
  const fetchDoctors = async () => {
    try {
      const cachedDoctors = cache.get<Doctor[]>("doctors");
      if (cachedDoctors) {
        setDoctors(cachedDoctors);
        return;
      }

      const employees = await getEmployees();
      const doctors = employees
        .filter(
          (emp: any) =>
            emp.employee_type.primary_role_type?.role_name === "Doctor"
        )
        .map((doc: any) => ({
          id: doc._id,
          first_name: doc.first_name,
          last_name: doc.last_name,
          specialization: doc.specialization || "",
          department: doc.department || "",
        }));
      console.log("Doctor deta;s", doctors);
      setDoctors(doctors);
      cache.set("doctors", doctors, 600000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch doctors",
        variant: "destructive",
      });
    }
  };

  // Check Last Visit using API
  const checkLastVisit = async (patientId: string) => {
    try {
      const appointments = await getAppointments();

      const completedAppointments = appointments
        .filter(
          (appt) => appt.patient === patientId && appt.status === "Completed"
        )
        .sort(
          (a, b) =>
            new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
        );
      console.log(
        "AppointmentScheduling: Fetched appointments for last visit check:",
        completedAppointments
      );
      if (completedAppointments.length > 0) {
        setLastVisitDate(completedAppointments[0].visit_date);
      } else {
        setLastVisitDate(null);
      }
    } catch (error) {
      console.error("Error checking last visit:", error);
      setLastVisitDate(null);
    }
  };

  const getAvailableVisitTypes = () => {
    console.log(
      "AppointmentScheduling: Getting visit types, lastVisitDate:",
      lastVisitDate
    );

    const types = [
      { value: "Consultation", label: "Consultation" },
      { value: "Follow-up", label: "Follow up" },
      { value: "others", label: "Others" },
    ];
    console.log("last visit:", lastVisitDate);
    // Add follow-up if patient visited within 7 days
    if (lastVisitDate) {
      const lastVisit = new Date(lastVisitDate);
      const today = new Date();
      const daysDiff = Math.floor(
        (today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24)
      );

      console.log("AppointmentScheduling: Days since last visit:", daysDiff);

      if (daysDiff <= 7) {
        types.unshift({ value: "Follow-up", label: "Follow up" });
        console.log("AppointmentScheduling: Added follow-up option");
      }
    }

    // Add first-time visit if no previous appointments exist
    if (!lastVisitDate) {
      types.unshift({ value: "First Time Visit", label: "First time visit" });
      console.log("AppointmentScheduling: Added first-time visit option");
    }

    console.log("AppointmentScheduling: Available visit types:", types);
    return types;
  };
  // On submit of the form
  const onSubmit = async (data: AppointmentForm) => {
    setIsSubmitting(true);
    try {
      await createAppointment({
        patient: data.patient_id, // ✅ use `patient` instead of `patient_id`
        doctor: data.doctor_id, // ✅ use `doctor` instead of `doctor_id`
        visit_date: format(data.appointment_date, "yyyy-MM-dd"),
        visit_time: data.appointment_time,
        visit_type: data.visit_type,
        doctor_department: data.department || null,
        additional_notes: data.notes || null,
        status: "Scheduled",
      });

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
        variant: "default",
      });

      cache.invalidate("patient-records");
      cache.invalidate("patients");

      navigate("/appointments");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableTimeSlots = (selectedDate: Date | undefined) => {
    const allTimeSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
      "17:30",
      "18:00",
      "18:30",
    ];

    if (!selectedDate) return allTimeSlots;

    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    if (!isToday) return allTimeSlots;

    // If today is selected, filter out past time slots
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    return allTimeSlots.filter((timeSlot) => {
      const [hours, minutes] = timeSlot.split(":").map(Number);
      const slotTimeInMinutes = hours * 60 + minutes;
      return slotTimeInMinutes > currentTimeInMinutes;
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Schedule Appointment
            </h1>
            <p className="text-muted-foreground">Loading appointment form...</p>
          </div>
        </div>
        <Card className="shadow-card">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Loading patients and doctors...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Schedule Appointment
          </h1>
          <p className="text-muted-foreground">
            Schedule appointments for registered patients with doctors
          </p>
        </div>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Appointment Details
          </CardTitle>
          <CardDescription>
            All fields marked with * are mandatory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <FormField
                  control={form.control}
                  name="patient_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Select Patient *
                      </FormLabel>
                      <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedPatient
                                ? `${selectedPatient.first_name} ${selectedPatient.last_name}`
                                : "Search and select patient..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search patients..." />
                            <CommandList>
                              <CommandEmpty>No patients found.</CommandEmpty>
                              <CommandGroup>
                                {patients.map((patient) => (
                                  <CommandItem
                                    key={patient.id}
                                    value={`${patient.first_name} ${patient.last_name}`}
                                    onSelect={() => {
                                      console.log(
                                        "AppointmentScheduling: Patient selected:",
                                        patient
                                      );
                                      setSelectedPatient(patient);
                                      field.onChange(patient.id);
                                      setPatientOpen(false);
                                      checkLastVisit(patient.id);
                                      // Reset visit type when patient changes
                                      form.setValue("visit_type", "");
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span>
                                        {patient.first_name} {patient.last_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {patient.phone}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Doctor Selection */}
                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Select Doctor *
                      </FormLabel>
                      <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedDoctor
                                ? `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`
                                : "Search and select doctor..."}
                              <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0">
                          <Command>
                            <CommandInput placeholder="Search doctors..." />
                            <CommandList>
                              <CommandEmpty>No doctors found.</CommandEmpty>
                              <CommandGroup>
                                {doctors.map((doctor) => (
                                  <CommandItem
                                    key={doctor.id}
                                    value={`${doctor.first_name} ${doctor.last_name}`}
                                    onSelect={() => {
                                      setSelectedDoctor(doctor);
                                      field.onChange(doctor.id);
                                      setDoctorOpen(false);
                                      // Auto-fill department if available
                                      if (doctor.department) {
                                        form.setValue(
                                          "department",
                                          doctor.department
                                        );
                                      }
                                    }}
                                  >
                                    <div className="flex flex-col">
                                      <span>
                                        Dr. {doctor.first_name}{" "}
                                        {doctor.last_name}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {doctor.specialization} •{" "}
                                        {doctor.department}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visit Date */}
                <FormField
                  control={form.control}
                  name="appointment_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Visit Date *
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick appointment date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              field.onChange(date);
                              // Clear selected time when date changes to avoid past time selection
                              form.setValue("appointment_time", "");
                            }}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const compareDate = new Date(date);
                              compareDate.setHours(0, 0, 0, 0);
                              return compareDate < today;
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visit Time */}
                <FormField
                  control={form.control}
                  name="appointment_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Visit Time *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableTimeSlots(
                            form.watch("appointment_date")
                          ).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Visit Type */}
                <FormField
                  control={form.control}
                  name="visit_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Visit Type *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select visit type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAvailableVisitTypes().map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department */}
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Department
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log(
                            "AppointmentScheduling: Visit type selected:",
                            value
                          );
                          field.onChange(value);
                        }}
                        value={field.value}
                        key={`visit-type-${selectedPatient?.id || "none"}`}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDIAN_DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional notes or special requirements..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                  variant="medical"
                >
                  {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/patient-records")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
