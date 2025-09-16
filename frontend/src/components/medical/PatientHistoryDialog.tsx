import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, Download, Calendar, User, FileText, Pill, ChevronDown, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PatientRecord {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
}

interface PrescriptionData {
  id: string;
  visit_date: string;
  complaints: string[];
  medicines: any;
  advice: string;
  tests_prescribed: string;
  next_visit: string;
  doctor_notes: string;
  blood_pressure: string;
  pulse: string;
  height: string;
  weight: string;
  bmi: string;
  spo2: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialization: string;
  } | null;
}

interface PatientHistoryDialogProps {
  patient: PatientRecord;
}

export function PatientHistoryDialog({ patient }: PatientHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState<PrescriptionData[]>([]);
  const [expandedVisits, setExpandedVisits] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchPatientHistory();
    }
  }, [open, patient.id]);

  const fetchPatientHistory = async () => {
    try {
      setIsLoading(true);
      
      // First, fetch prescriptions
      const { data: prescriptionData, error: prescriptionError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patient.id)
        .order('visit_date', { ascending: false });

      if (prescriptionError) throw prescriptionError;
      
      if (!prescriptionData || prescriptionData.length === 0) {
        setPrescriptions([]);
        return;
      }

      // Get unique doctor IDs
      const doctorIds = [...new Set(prescriptionData.map(p => p.doctor_id))];
      
      // Fetch doctor details
      const { data: doctorData, error: doctorError } = await supabase
        .from('doctors')
        .select('id, first_name, last_name, specialization')
        .in('id', doctorIds);

      if (doctorError) throw doctorError;

      // Create doctor lookup map
      const doctorMap = new Map(doctorData?.map(doc => [doc.id, doc]) || []);

      // Combine prescription and doctor data
      const combinedData = prescriptionData.map(prescription => ({
        ...prescription,
        doctor: doctorMap.get(prescription.doctor_id) || null
      }));
      
      setPrescriptions(combinedData as unknown as PrescriptionData[]);
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch patient history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  const downloadHistory = () => {
    const historyData = {
      patient: {
        name: `${patient.first_name} ${patient.last_name}`,
        age: calculateAge(patient.date_of_birth),
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        blood_group: patient.blood_group,
      },
      visits: prescriptions.map(prescription => ({
        date: prescription.visit_date,
        doctor: `Dr. ${prescription.doctor?.first_name} ${prescription.doctor?.last_name}`,
        specialization: prescription.doctor?.specialization,
        complaints: prescription.complaints,
        vitals: {
          blood_pressure: prescription.blood_pressure,
          pulse: prescription.pulse,
          height: prescription.height,
          weight: prescription.weight,
          bmi: prescription.bmi,
          spo2: prescription.spo2,
        },
        medicines: Array.isArray(prescription.medicines) ? prescription.medicines : [],
        advice: prescription.advice,
        tests_prescribed: prescription.tests_prescribed,
        next_visit: prescription.next_visit,
        doctor_notes: prescription.doctor_notes,
      }))
    };

    const dataStr = JSON.stringify(historyData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `patient_history_${patient.first_name}_${patient.last_name}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Download Started",
      description: "Patient history has been downloaded as JSON file",
    });
  };

  const downloadSinglePrescription = (prescription: PrescriptionData, index: number) => {
    const prescriptionData = {
      patient: {
        name: `${patient.first_name} ${patient.last_name}`,
        age: calculateAge(patient.date_of_birth),
        gender: patient.gender,
        phone: patient.phone,
        email: patient.email,
        blood_group: patient.blood_group,
      },
      visit: {
        visit_number: prescriptions.length - index,
        date: prescription.visit_date,
        doctor: `Dr. ${prescription.doctor?.first_name} ${prescription.doctor?.last_name}`,
        specialization: prescription.doctor?.specialization,
        complaints: prescription.complaints,
        vitals: {
          blood_pressure: prescription.blood_pressure,
          pulse: prescription.pulse,
          height: prescription.height,
          weight: prescription.weight,
          bmi: prescription.bmi,
          spo2: prescription.spo2,
        },
        medicines: Array.isArray(prescription.medicines) ? prescription.medicines : [],
        advice: prescription.advice,
        tests_prescribed: prescription.tests_prescribed,
        next_visit: prescription.next_visit,
        doctor_notes: prescription.doctor_notes,
      }
    };

    const dataStr = JSON.stringify(prescriptionData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const visitDate = new Date(prescription.visit_date).toISOString().split('T')[0];
    const exportFileDefaultName = `prescription_${patient.first_name}_${patient.last_name}_visit_${prescriptions.length - index}_${visitDate}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: "Prescription Downloaded",
      description: `Visit #${prescriptions.length - index} prescription has been downloaded`,
    });
  };

  const toggleVisitExpansion = (visitId: string) => {
    const newExpandedVisits = new Set(expandedVisits);
    if (newExpandedVisits.has(visitId)) {
      newExpandedVisits.delete(visitId);
    } else {
      newExpandedVisits.add(visitId);
    }
    setExpandedVisits(newExpandedVisits);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <Eye className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Patient History - {patient.first_name} {patient.last_name}
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadHistory}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download History
            </Button>
          </div>
          <DialogDescription>
            View complete medical history and download individual prescriptions
          </DialogDescription>
        </DialogHeader>

        {/* Patient Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patient Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{calculateAge(patient.date_of_birth)} years</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gender</p>
                <p className="font-medium">{patient.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <Badge variant="outline">{patient.blood_group?.toUpperCase() || 'N/A'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{patient.phone || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit History */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Visit History ({prescriptions.length} visits)</h3>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading patient history...
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No visit history found for this patient.
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription, index) => {
                const isExpanded = expandedVisits.has(prescription.id);
                const visitNumber = prescriptions.length - index;
                
                return (
                  <Card key={prescription.id}>
                    <Collapsible 
                      open={isExpanded} 
                      onOpenChange={() => toggleVisitExpansion(prescription.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              Visit #{visitNumber} - {new Date(prescription.visit_date).toLocaleDateString()}
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 ml-2" />
                              ) : (
                                <ChevronRight className="h-4 w-4 ml-2" />
                              )}
                            </CardTitle>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <Badge variant="secondary">
                                Dr. {prescription.doctor?.first_name} {prescription.doctor?.last_name}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadSinglePrescription(prescription, index)}
                                className="h-8 px-2"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                          
                          {/* Visit Summary (always visible) */}
                          <div className="text-left">
                            <CardDescription className="flex items-center gap-4">
                              <span>{prescription.doctor?.specialization}</span>
                              {prescription.complaints && prescription.complaints.length > 0 && (
                                <>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm">
                                    Complaints: {prescription.complaints.slice(0, 2).join(', ')}
                                    {prescription.complaints.length > 2 && ' +' + (prescription.complaints.length - 2) + ' more'}
                                  </span>
                                </>
                              )}
                              {prescription.medicines && Array.isArray(prescription.medicines) && prescription.medicines.length > 0 && (
                                <>
                                  <Separator orientation="vertical" className="h-4" />
                                  <span className="text-sm flex items-center gap-1">
                                    <Pill className="h-3 w-3" />
                                    {prescription.medicines.length} medicine{prescription.medicines.length !== 1 ? 's' : ''}
                                  </span>
                                </>
                              )}
                            </CardDescription>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0 space-y-4">
                          {/* Complaints */}
                          {prescription.complaints && prescription.complaints.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Chief Complaints:</h5>
                              <div className="flex flex-wrap gap-1">
                                {prescription.complaints.map((complaint, idx) => (
                                  <Badge key={idx} variant="outline">{complaint}</Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Vitals */}
                          <div>
                            <h5 className="font-semibold text-sm mb-2">Vitals:</h5>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                              {prescription.blood_pressure && (
                                <div>BP: {prescription.blood_pressure}</div>
                              )}
                              {prescription.pulse && (
                                <div>Pulse: {prescription.pulse}</div>
                              )}
                              {prescription.height && (
                                <div>Height: {prescription.height}</div>
                              )}
                              {prescription.weight && (
                                <div>Weight: {prescription.weight}</div>
                              )}
                              {prescription.bmi && (
                                <div>BMI: {prescription.bmi}</div>
                              )}
                              {prescription.spo2 && (
                                <div>SPO2: {prescription.spo2}</div>
                              )}
                            </div>
                          </div>

                          {/* Medicines */}
                          {prescription.medicines && Array.isArray(prescription.medicines) && prescription.medicines.length > 0 && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Pill className="h-4 w-4" />
                                Prescribed Medicines:
                              </h5>
                              <div className="space-y-2">
                                {(prescription.medicines as any[]).map((medicine: any, idx: number) => (
                                  <div key={idx} className="bg-muted/50 p-3 rounded-lg">
                                    <div className="font-medium">{medicine.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {medicine.dosage} - {medicine.timeFreqDuration}
                                    </div>
                                    {medicine.notes && (
                                      <div className="text-sm text-muted-foreground italic">
                                        {medicine.notes}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tests */}
                          {prescription.tests_prescribed && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Tests Prescribed:</h5>
                              <p className="text-sm bg-muted/50 p-2 rounded">{prescription.tests_prescribed}</p>
                            </div>
                          )}

                          {/* Advice */}
                          {prescription.advice && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Advice:</h5>
                              <p className="text-sm bg-muted/50 p-2 rounded">{prescription.advice}</p>
                            </div>
                          )}

                          {/* Doctor Notes */}
                          {prescription.doctor_notes && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Doctor's Notes:</h5>
                              <p className="text-sm bg-muted/50 p-2 rounded">{prescription.doctor_notes}</p>
                            </div>
                          )}

                          {/* Next Visit */}
                          {prescription.next_visit && (
                            <div>
                              <h5 className="font-semibold text-sm mb-2">Next Visit:</h5>
                              <p className="text-sm">{prescription.next_visit}</p>
                            </div>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}