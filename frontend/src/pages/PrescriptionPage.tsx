import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HashtagInput } from "@/components/medical/HashtagInput";
import { MedicineTable } from "@/components/medical/MedicineTable";
import {
  ArrowLeft,
  Save,
  Printer,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import {
  Patient,
  PatientVisit,
  Medicine,
  HistoricalVisit,
} from "@/types/medical";
import { PatientRecord } from "@/types/patient";
import { SimplifiedAppointment } from "@/types/appointment";
import { Prescription } from "@/types/prescription";

import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getPatientsById } from "@/api/services/patientService";
import {
  getAppointmentsByParams,
  updateAppointment,
} from "@/api/services/appointmentService";
import {
  getPrescriptionsByPatientId,
  upsertPrescription,
} from "@/api/services/prescriptionService";

// Historical visits will be loaded from the database (prescriptions table)

export default function PrescriptionPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();

  // Get patient_id and appointment_id from URL params or query string
  const urlParams = new URLSearchParams(window.location.search);
  const patientIdFromQuery = urlParams.get("patient_id");
  const appointmentIdFromQuery = urlParams.get("appointment_id");

  const actualPatientId = patientId || patientIdFromQuery;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [visitData, setVisitData] = useState<
    Partial<PatientVisit> & { prescriptionId?: string }
  >({
    complaints: [],
    medicines: [],
    advice: "",
    testsPresc: "",
    nextVisit: "",
    bloodPressure: "",
    pulse: "",
    height: "",
    weight: "",
    bmi: "",
    spo2: "",
  });
  const [historicalVisits, setHistoricalVisits] = useState<HistoricalVisit[]>(
    []
  );
  const [appointmentInfo, setAppointmentInfo] = useState<{
    id: string;
    doctor_id: string;
    status: string;
  } | null>(null);

  // useEffect(() => {
  //   const fetchPatientData = async () => {
  //     if (!actualPatientId) {
  //       console.error("No patient ID provided");
  //       setIsLoading(false);
  //       return;
  //     }

  //     try {
  //       console.log("Fetching patient data for ID:", actualPatientId);
  //       console.log("Appointment ID from query:", appointmentIdFromQuery);
  //       const today = new Date().toISOString().split("T")[0];

  //       // 1) Patient basic info
  //       const { data: patientData, error: patientError } = await supabase
  //         .from("patients")
  //         .select("*")
  //         .eq("id", actualPatientId)
  //         .single();
  //       if (patientError) throw patientError;
  //       if (!patientData) {
  //         setIsLoading(false);
  //         return;
  //       }

  //       const age = patientData.date_of_birth
  //         ? new Date().getFullYear() -
  //           new Date(patientData.date_of_birth).getFullYear()
  //         : 0;

  // // 2) Today's appointment (id+doctor) - prioritize query param appointment ID
  // let appointmentQuery = supabase
  //   .from("appointments")
  //   .select("id, doctor_id, appointment_time, visit_type, status")
  //   .eq("patient_id", actualPatientId);

  // // If we have a specific appointment ID from query, use it
  // if (appointmentIdFromQuery) {
  //   appointmentQuery = appointmentQuery.eq("id", appointmentIdFromQuery);
  // } else {
  //   // Otherwise get today's appointment
  //   appointmentQuery = appointmentQuery.eq("appointment_date", today);
  // }

  // const { data: appointmentData } = await appointmentQuery.maybeSingle();

  // let appointmentTime = "Not scheduled";
  // let visitType = "consultation";
  // let status = "waiting";
  // let apptId: string | null = null;
  // let doctorId: string | null = null;

  // if (appointmentData) {
  //   apptId = appointmentData.id;
  //   doctorId = appointmentData.doctor_id;
  //   appointmentTime = new Date(
  //     `2000-01-01T${appointmentData.appointment_time}`
  //   ).toLocaleTimeString("en-US", {
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  //   visitType = appointmentData.visit_type || "consultation";
  //   status = appointmentData.status || "waiting";
  //   setAppointmentInfo({ id: apptId, doctor_id: doctorId!, status });
  // } else {
  //   setAppointmentInfo(null);
  // }

  // const patient: Patient = {
  //   id: patientData.id,
  //   name: `${patientData.first_name} ${patientData.last_name}`,
  //   age,
  //   phone: patientData.phone || "",
  //   appointmentTime,
  //   status: status as "waiting" | "in-progress" | "completed",
  //   visitType: visitType as "follow-up" | "new-patient" | "consultation",
  //   dateOfBirth: patientData.date_of_birth || "",
  //   address: patientData.address || "",
  //   emergencyContact: "",
  // };
  // setPatient(patient);

  //       // 3) Load prescriptions history
  //       const { data: prescriptions, error: prescError } = await supabase
  //         .from("prescriptions")
  //         .select("*")
  //         .eq("patient_id", actualPatientId)
  //         .order("visit_date", { ascending: false });
  //       if (prescError) throw prescError;

  //       const history: HistoricalVisit[] = (prescriptions || []).map(
  //         (p: any) => ({
  //           id: p.id,
  //           date: p.visit_date,
  //           complaints: Array.isArray(p.complaints) ? p.complaints : [],
  //           medicines: Array.isArray(p.medicines)
  //             ? (p.medicines as unknown as Medicine[])
  //             : [],
  //           advice: p.advice || "",
  //           testsPresc: p.tests_prescribed || "",
  //           doctorNotes: p.doctor_notes || "",
  //         })
  //       );
  //       setHistoricalVisits(history);

  //       // 4) If today's prescription exists, prefill editable form
  //       if (apptId) {
  //         const todayPresc = (prescriptions || []).find(
  //           (p: any) => p.appointment_id === apptId
  //         );
  //         if (todayPresc) {
  //           setVisitData({
  //             complaints: Array.isArray(todayPresc.complaints)
  //               ? todayPresc.complaints
  //               : [],
  //             medicines: Array.isArray(todayPresc.medicines)
  //               ? (todayPresc.medicines as unknown as Medicine[])
  //               : [],
  //             advice: todayPresc.advice || "",
  //             testsPresc: todayPresc.tests_prescribed || "",
  //             nextVisit: todayPresc.next_visit || "",
  //             bloodPressure: todayPresc.blood_pressure || "",
  //             pulse: todayPresc.pulse || "",
  //             height: todayPresc.height || "",
  //             weight: todayPresc.weight || "",
  //             bmi: todayPresc.bmi || "",
  //             spo2: todayPresc.spo2 || "",
  //           });
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error in fetchPatientData:", error);
  //       toast.error("Failed to fetch patient data");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchPatientData();
  // }, [actualPatientId, appointmentIdFromQuery]);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!actualPatientId) {
        console.error("No patient ID provided");
        setIsLoading(false);
        return;
      }

      try {
        console.log("Fetching patient data for ID:", actualPatientId);
        console.log("Appointment ID from query:", appointmentIdFromQuery);
        const today = new Date().toISOString().split("T")[0];

        // 1) Patient basic info
        // --------------------------------------------------------------------------------
        // Fetch patient data using the new service
        const patientData: PatientRecord = await getPatientsById(
          actualPatientId
        );

        // We simulate the Supabase error handling: if service returns no data (e.g., throws 404 or returns null/undefined)
        if (!patientData) {
          // No direct patientError variable needed as the API client handles the error state via try/catch
          setIsLoading(false);
          return;
        }

        // Use an empty object for data destructuring to keep existing structure
        const patientError = null; // No need for error object with try/catch

        // This destructuring is for structural equivalence to the original code
        const data: PatientRecord = patientData;

        if (patientError) throw patientError; // This line is primarily for structure
        if (!data) {
          // Use data instead of patientData to maintain variable names for subsequent logic
          setIsLoading(false);
          return;
        }

        const age = data.date_of_birth
          ? new Date().getFullYear() -
            new Date(data.date_of_birth).getFullYear()
          : 0;
        // --------------------------------------------------------------------------------

        // 2) Today's appointment (id+doctor) - prioritize query param appointment ID
        // --------------------------------------------------------------------------------
        // Determine the query parameters: appointmentIdFromQuery OR today's date
        const appointmentList: SimplifiedAppointment[] =
          await getAppointmentsByParams(
            actualPatientId,
            appointmentIdFromQuery,
            appointmentIdFromQuery ? undefined : today
          );

        // Simulate Supabase maybeSingle(): take the first item or null
        const appointmentData =
          appointmentList.length > 0 ? appointmentList[0] : null;

        // The original code used a destructured variable name 'data', changing this locally to 'appointmentData'
        // to match the original block's effect:
        // const { data: appointmentData } = await appointmentQuery.maybeSingle();
        // Since the service returns the data directly, we use appointmentData.
        // --------------------------------------------------------------------------------

        let appointmentTime = "Not scheduled";
        let visitType = "consultation";
        let status = "waiting";
        let apptId: string | null = null;
        let doctorId: string | null = null;

        if (appointmentData) {
          apptId = appointmentData.id;
          doctorId = appointmentData.doctor_id;
          appointmentTime = new Date(
            `2000-01-01T${appointmentData.appointment_time}`
          ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          visitType = appointmentData.visit_type || "consultation";
          status = appointmentData.status || "waiting";
          setAppointmentInfo({ id: apptId, doctor_id: doctorId!, status });
        } else {
          setAppointmentInfo(null);
        }
        console.log("Total Appointment Details", appointmentInfo);
        const patient: Patient = {
          id: data._id, // Using 'data' for patient object construction
          name: `${data.first_name} ${data.last_name}`,
          age,
          phone: data.phone || "",
          appointmentTime,
          status: status as "waiting" | "in-progress" | "completed",
          visitType: visitType as "follow-up" | "new-patient" | "consultation",
          dateOfBirth: data.date_of_birth || "",
          address: data.address || "",
          emergencyContact: "",
        };
        setPatient(patient);

        // 3) Load prescriptions history
        // --------------------------------------------------------------------------------
        // Fetch prescriptions history using the new service
        const prescriptions: Prescription[] = await getPrescriptionsByPatientId(
          actualPatientId
        );
        // We simulate the Supabase structure by setting error to null
        const prescError = null;

        if (prescError) throw prescError; // This line is primarily for structure
        // --------------------------------------------------------------------------------

        const history: HistoricalVisit[] = (prescriptions || []).map(
          (p: any) => ({
            id: p.id,
            date: p.visit_date,
            complaints: Array.isArray(p.complaints) ? p.complaints : [],
            medicines: Array.isArray(p.medicines)
              ? (p.medicines as unknown as Medicine[])
              : [],
            advice: p.advice || "",
            testsPresc: p.tests_prescribed || "",
            doctorNotes: p.doctor_notes || "",
          })
        );
        setHistoricalVisits(history);

        // 4) If today's prescription exists, prefill editable form
        // ... (rest of the prefill logic remains the same)
        if (apptId) {
          const todayPresc = (prescriptions || []).find(
            (p: any) => p.appointment_id === apptId
          );
          if (todayPresc) {
            setVisitData((prev) => ({
              ...prev,
              complaints: Array.isArray(todayPresc.complaints)
                ? todayPresc.complaints
                : [],
              medicines: Array.isArray(todayPresc.medicines)
                ? (todayPresc.medicines as unknown as Medicine[])
                : [],
              advice: todayPresc.advice || "",
              testsPresc: todayPresc.tests_prescribed || "",
              nextVisit: todayPresc.next_visit || "",
              bloodPressure: todayPresc.blood_pressure || "",
              pulse: todayPresc.pulse || "",
              height: todayPresc.height || "",
              weight: todayPresc.weight || "",
              bmi: todayPresc.bmi || "",
              spo2: todayPresc.spo2 || "",
              // ✅ Add this line to track existing prescription
              prescriptionId: todayPresc._id || todayPresc._id,
            }));
          } else {
            // No prescription for today → clear prescriptionId to ensure upsert creates new
            setVisitData((prev) => ({
              ...prev,
              prescriptionId: undefined,
            }));
          }
        }
      } catch (error) {
        console.error("Error in fetchPatientData:", error);
        toast.error("Failed to fetch patient data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientData();
  }, [actualPatientId, appointmentIdFromQuery]);

  const handleVitalsChange = (field: string, value: string) => {
    console.log("Vitals change triggered →", { field, value, prev: visitData });
    setVisitData((prev) => ({ ...prev, [field]: value }));

    // Auto-calculate BMI if height and weight are provided
    if (field === "height" || field === "weight") {
      const height =
        field === "height"
          ? parseFloat(value)
          : parseFloat(visitData.height || "0");
      const weight =
        field === "weight"
          ? parseFloat(value)
          : parseFloat(visitData.weight || "0");

      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100; // assuming height in cm
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setVisitData((prev) => ({ ...prev, bmi }));
      }
    }
  };

  // Medicine suggestions
  const handleComplaintsChange = async (complaints: string[]) => {
    console.log(
      "handleComplaintsChange triggered with complaints:",
      complaints
    );
    console.log("Current appointment info:", appointmentInfo);
    setVisitData((prev) => ({ ...prev, complaints }));

    // Auto-suggest medicines based on doctor's patterns when complaints are added
    if (complaints.length > 0 && appointmentInfo?.doctor_id) {
      console.log(
        "Attempting to get medicine suggestions for doctor:",
        appointmentInfo.doctor_id
      );
      try {
        const { getDoctorMedicineSuggestions } = await import(
          "@/lib/medicineAnalytics"
        );
        console.log("Successfully imported getDoctorMedicineSuggestions");

        const suggestions = await getDoctorMedicineSuggestions(
          appointmentInfo.doctor_id,
          complaints
        );
        console.log("Got suggestions:", suggestions);

        if (suggestions.length > 0) {
          // Filter out suggestions that are already prescribed
          const newSuggestions = suggestions.filter(
            (suggestion) =>
              !visitData.medicines?.some(
                (existing) =>
                  existing.name.toLowerCase() === suggestion.name.toLowerCase()
              )
          );
          console.log("New suggestions after filtering:", newSuggestions);

          if (newSuggestions.length > 0) {
            const updatedMedicines = [
              ...(visitData.medicines || []),
              ...newSuggestions.map((suggestion) => ({
                ...suggestion,
                notes: `Auto-suggested (${suggestion.confidence}% confidence, prescribed ${suggestion.frequency} times recently)`,
              })),
            ];
            console.log("About to set updated medicines:", updatedMedicines);
            setVisitData((prev) => ({ ...prev, medicines: updatedMedicines }));

            if (newSuggestions.length === 1) {
              toast.success(
                `Added 1 suggested medicine based on your prescription patterns`
              );
            } else {
              toast.success(
                `Added ${newSuggestions.length} suggested medicines based on your prescription patterns`
              );
            }
          } else {
            console.log("No new suggestions to add (all already prescribed)");
          }
        } else {
          console.log("No suggestions found for these complaints");
        }
      } catch (error) {
        console.error("Error getting medicine suggestions:", error);
        toast.error("Failed to load medicine suggestions");
      }
    } else {
      console.log("Not getting suggestions because:", {
        complaintsLength: complaints.length,
        doctorId: appointmentInfo?.doctor_id,
      });
    }
  };

  const handleMedicinesChange = (medicines: Medicine[]) => {
    setVisitData((prev) => ({ ...prev, medicines }));
  };

  const handleSave = async () => {
    if (!visitData.complaints?.length) {
      toast.error("Please add at least one complaint");
      return;
    }

    if (!appointmentInfo?.id || !appointmentInfo?.doctor_id) {
      toast.error("No appointment information found");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];

      const prescriptionData = {
        _id: visitData.prescriptionId,
        appointment_id: appointmentInfo.id,
        patient_id: actualPatientId,
        doctor_id: appointmentInfo.doctor_id,
        visit_date: today,
        blood_pressure: visitData.bloodPressure || null,
        pulse: visitData.pulse || null,
        height: visitData.height || null,
        weight: visitData.weight || null,
        bmi: visitData.bmi || null,
        spo2: visitData.spo2 || null,
        complaints: visitData.complaints || [],
        medicines: (visitData.medicines || []) as any, // Cast to Json for database
        advice: visitData.advice || null,
        tests_prescribed: visitData.testsPresc || null,
        next_visit: visitData.nextVisit || null,
      };

      // Upsert prescription data
      // const { error } = await supabase
      //   .from("prescriptions")
      //   .upsert(prescriptionData, {
      //     onConflict: "appointment_id",
      //     ignoreDuplicates: false,
      //   });

      // if (error) throw error;

      try {
        const prescriptionResult = await upsertPrescription(prescriptionData);
        setVisitData((prev) => ({
          ...prev,
          prescriptionId: prescriptionResult._id, // store the returned _id
        }));
        toast.success("Prescription saved successfully!");
      } catch (error) {
        console.error("Error upserting prescription:", error);
        toast.error("Failed to save prescription");
      }

      // Refresh the page data to show updated history
      window.location.reload();
    } catch (error) {
      console.error("Error saving prescription:", error);
      toast.error("Failed to save prescription");
    }
  };

  const handleSubmitComplete = async () => {
    if (!visitData.complaints?.length) {
      toast.error(
        "Please add at least one complaint before completing appointment"
      );
      return;
    }

    if (!appointmentInfo?.id || !appointmentInfo?.doctor_id) {
      toast.error("No appointment information found");
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      console.log("Lets see prescription", visitData);
      const prescriptionData = {
        _id: visitData.prescriptionId,
        appointment_id: appointmentInfo.id,
        patient_id: actualPatientId,
        doctor_id: appointmentInfo.doctor_id,
        visit_date: today,
        blood_pressure: visitData.bloodPressure || null,
        pulse: visitData.pulse || null,
        height: visitData.height || null,
        weight: visitData.weight || null,
        bmi: visitData.bmi || null,
        spo2: visitData.spo2 || null,
        complaints: visitData.complaints || [],
        medicines: (visitData.medicines || []) as any,
        advice: visitData.advice || null,
        tests_prescribed: visitData.testsPresc || null,
        next_visit: visitData.nextVisit || null,
      };

      // 1. Save prescription data
      // const { error: prescError } = await supabase
      //   .from("prescriptions")
      //   .upsert(prescriptionData, {
      //     onConflict: "appointment_id",
      //     ignoreDuplicates: false,
      //   });

      // if (prescError) throw prescError;

      try {
        const prescriptionResult = await upsertPrescription(prescriptionData);
        setVisitData((prev) => ({
          ...prev,
          prescriptionId: prescriptionResult._id, // store the returned _id
        }));
      } catch (error) {
        console.error("Error upserting prescription:", error);
        toast.error("Failed to save prescription");
      }
      // 2. Mark appointment as completed
      // const { error: apptError } = await supabase
      //   .from("appointments")
      //   .update({ status: "completed" })
      //   .eq("id", appointmentInfo.id);

      // if (apptError) throw apptError;

      // toast.success("Appointment completed and prescription saved!");

      try {
        await updateAppointment(appointmentInfo.id, { status: "Completed" });
      } catch (error) {
        console.error("Error updating appointment status:", error);
        toast.error("Failed to mark appointment as completed");
        return;
      }

      // Navigate back to patient list after completion
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error("Failed to complete appointment");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Patient Data...</h2>
          <p className="text-muted-foreground">
            Fetching patient information from database...
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Patient not found</h2>
          <p className="text-muted-foreground mb-4">
            The patient with ID {actualPatientId} was not found in the database.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patient List
          </Button>
        </div>
      </div>
    );
  }

  const currentDateTime = new Date().toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-calm p-8 prescription-container">
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            .print-only {
              display: block !important;
            }
            body {
              background: white !important;
            }
            .prescription-container {
              padding: 20px !important;
              max-width: 100% !important;
            }
            .shadow-elegant, .shadow-card {
              box-shadow: none !important;
              border: 1px solid #ddd !important;
            }
          }
        `}
      </style>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header - Hidden during print */}
        <div className="flex items-center justify-between no-print">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Patients
          </Button>

          <div className="flex gap-2">
            <Button onClick={handleSave} variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSubmitComplete}
              variant="medical"
              disabled={patient?.status === "completed"}
            >
              <Save className="w-4 h-4 mr-2" />
              {patient?.status === "completed"
                ? "Completed"
                : "Submit & Complete"}
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Prescription Header */}
        <Card className="shadow-elegant">
          <CardHeader className="bg-gradient-medical text-primary-foreground">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Medical Prescription</h1>
              <p className="text-primary-foreground/80 mt-1">
                {/* Dr. Sarah Mitchell - Internal Medicine */}
                {(() => {
                  const doctor = localStorage.getItem("user");
                  console.log("From LOcal storage", doctor);
                  if (doctor) {
                    try {
                      const parsed = JSON.parse(doctor);
                      return `Dr. ${parsed.name}`;
                    } catch (err) {
                      console.error(
                        "Failed to parse doctor details from localStorage",
                        err
                      );
                      return "Dr. Unknown";
                    }
                  }
                  return "Dr. Unknown";
                })()}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Patient Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="font-medium">{patient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Age:</span>
                    <span className="font-medium">{patient.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="font-medium">{patient.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient ID:</span>
                    <span className="font-medium">
                      {patient.id ? `#${patient.id.padStart(6, "0")}` : ""}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Visit Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date & Time:</span>
                    <span className="font-medium">{currentDateTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visit Type:</span>
                    <Badge variant="outline">
                      {patient.visitType.replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Appointment:</span>
                    <span className="font-medium">
                      {patient.appointmentTime}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-primary" />
              Patient Vitals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Blood Pressure
                </label>
                <Input
                  placeholder="120/80"
                  value={visitData.bloodPressure || ""}
                  onChange={(e) =>
                    handleVitalsChange("bloodPressure", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Pulse (bpm)
                </label>
                <Input
                  placeholder="72"
                  type="number"
                  value={visitData.pulse || ""}
                  onChange={(e) => handleVitalsChange("pulse", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Height (cm)
                </label>
                <Input
                  placeholder="170"
                  type="number"
                  value={visitData.height || ""}
                  onChange={(e) => handleVitalsChange("height", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Weight (kg)
                </label>
                <Input
                  placeholder="70"
                  type="number"
                  value={visitData.weight || ""}
                  onChange={(e) => handleVitalsChange("weight", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  BMI
                </label>
                <Input
                  placeholder="24.2"
                  value={visitData.bmi || ""}
                  onChange={(e) => handleVitalsChange("bmi", e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  SpO2 (%)
                </label>
                <Input
                  placeholder="98"
                  type="number"
                  value={visitData.spo2 || ""}
                  onChange={(e) => handleVitalsChange("spo2", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Patient Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <HashtagInput
              value={visitData.complaints || []}
              onChange={handleComplaintsChange}
              placeholder="Type patient complaints (e.g., fever, headache) and press space..."
            />
          </CardContent>
        </Card>

        {/* Medicines */}
        <Card className="shadow-card">
          <CardContent className="p-6">
            <MedicineTable
              medicines={visitData.medicines || []}
              onChange={handleMedicinesChange}
              complaints={visitData.complaints || []}
            />
          </CardContent>
        </Card>

        {/* Advice & Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Medical Advice</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter medical advice for the patient..."
                value={visitData.advice || ""}
                onChange={(e) =>
                  setVisitData((prev) => ({ ...prev, advice: e.target.value }))
                }
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Tests Prescribed</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter prescribed tests..."
                value={visitData.testsPresc || ""}
                onChange={(e) =>
                  setVisitData((prev) => ({
                    ...prev,
                    testsPresc: e.target.value,
                  }))
                }
                className="min-h-[120px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Next Visit */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Next Visit</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Schedule next visit date and time..."
              value={visitData.nextVisit || ""}
              onChange={(e) =>
                setVisitData((prev) => ({ ...prev, nextVisit: e.target.value }))
              }
            />
          </CardContent>
        </Card>

        {/* Historical Visits - Hidden during print */}
        <Card className="shadow-card no-print">
          <CardHeader>
            <CardTitle>Patient History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Show today's prescription if it exists */}
              {patient?.status === "completed" &&
                appointmentInfo &&
                historicalVisits.some(
                  (v) => v.date === new Date().toISOString().split("T")[0]
                ) && (
                  <div className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        {new Date().toLocaleDateString()}
                      </h4>
                      <div className="flex gap-2">
                        <Badge variant="default">Today's Visit</Badge>
                        <Badge
                          variant="outline"
                          className="border-orange-500 text-orange-600"
                        >
                          Editable Above ↑
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 italic">
                      ℹ️ This visit's data is currently displayed in the
                      editable form above and can be modified.
                    </p>

                    {(() => {
                      const todayVisit = historicalVisits.find(
                        (v) => v.date === new Date().toISOString().split("T")[0]
                      );
                      if (!todayVisit) return null;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-muted-foreground">
                              Complaints:
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {todayVisit.complaints.map((complaint, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {complaint}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="font-medium text-muted-foreground">
                              Medicines:
                            </span>
                            <div className="mt-1">
                              {todayVisit.medicines.map((med, idx) => (
                                <div key={idx} className="text-xs">
                                  {med.name} - {med.dosage}
                                </div>
                              ))}
                            </div>
                          </div>

                          {todayVisit.advice && (
                            <div>
                              <span className="font-medium text-muted-foreground">
                                Advice:
                              </span>
                              <p className="text-xs mt-1">
                                {todayVisit.advice}
                              </p>
                            </div>
                          )}

                          {todayVisit.testsPresc && (
                            <div>
                              <span className="font-medium text-muted-foreground">
                                Tests:
                              </span>
                              <p className="text-xs mt-1">
                                {todayVisit.testsPresc}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

              {/* Previous visits */}
              {historicalVisits
                .filter(
                  (visit) =>
                    visit.date !== new Date().toISOString().split("T")[0]
                ) // Exclude today's visit
                .map((visit) => (
                  <div
                    key={visit.id}
                    className="border rounded-lg p-4 bg-muted/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">
                        {new Date(visit.date).toLocaleDateString()}
                      </h4>
                      <Badge variant="outline">Previous Visit</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">
                          Complaints:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {visit.complaints.map((complaint, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {complaint}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-muted-foreground">
                          Medicines:
                        </span>
                        <div className="mt-1">
                          {visit.medicines.map((med, idx) => (
                            <div key={idx} className="text-xs">
                              {med.name} - {med.dosage}
                            </div>
                          ))}
                        </div>
                      </div>

                      {visit.advice && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Advice:
                          </span>
                          <p className="text-xs mt-1">{visit.advice}</p>
                        </div>
                      )}

                      {visit.testsPresc && (
                        <div>
                          <span className="font-medium text-muted-foreground">
                            Tests:
                          </span>
                          <p className="text-xs mt-1">{visit.testsPresc}</p>
                        </div>
                      )}
                    </div>

                    {visit.doctorNotes && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="font-medium text-muted-foreground text-xs">
                          Doctor's Notes:
                        </span>
                        <p className="text-xs mt-1 italic">
                          {visit.doctorNotes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

              {historicalVisits.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No previous visits recorded for this patient.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
