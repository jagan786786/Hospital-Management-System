import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Users, UserPlus, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { registerPatient } from "@/api/services/patientService";

export default function PatientOnboarding() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    medicalHistory: ""
  });
  const [totalPatients, setTotalPatients] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useEffect(() => {
  //   fetchPatientStats();
  //   // Subscribe to realtime changes
  //   const channel = supabase
  //     .channel('patient-changes')
  //     .on('postgres_changes', 
  //       { event: 'INSERT', schema: 'public', table: 'patients' },
  //       () => fetchPatientStats()
  //     )
  //     .subscribe();

  //   return () => { supabase.removeChannel(channel); };
  // }, []);

  // const fetchPatientStats = async () => {
  //   const { count } = await supabase.from('patients').select('*', { count: 'exact', head: true });
  //   setTotalPatients(count || 0);
  // };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid =
  formData.firstName.trim() !== "" &&
  formData.lastName.trim() !== "" &&
  formData.phone.trim() !== "";

const handleSubmit = async () => {
  if (!formData.firstName || !formData.lastName || !formData.phone) {
        if (!formData.firstName) {
        toast({ title: "Error", description: "First Name is required", variant: "destructive" });
        return;
       }
       if (!formData.lastName) {
        toast({ title: "Error", description: "Last Name is required", variant: "destructive" });
        return;
      } 
      if (!formData.phone) {
        toast({ title: "Error", description: "Phone Number is required", variant: "destructive" });
        return;
      }  
    
    return;
  }
    setIsSubmitting(true);
  try {
    await registerPatient({
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      email: formData.email,
      date_of_birth: formData.dateOfBirth || null,
      gender: formData.gender,
      blood_group: formData.bloodGroup,
      address: formData.address,
      medical_history: formData.medicalHistory,
    });

    toast({ title: "Success", description: "Patient registered successfully!" });
    setFormData({ firstName: "", lastName: "", phone: "", email: "", dateOfBirth: "", gender: "", bloodGroup: "", address: "", medicalHistory: "" });

    // fetchPatientStats();
  } catch (error) {
    console.log(error, "Error Message")
    toast({ title: "Error", description: error.response.data.message, variant: "destructive" });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Patient Onboarding</h1>
          <p className="text-muted-foreground">Register new patients and manage their information</p>
        </div>
        {/* <Button className="bg-primary hover:bg-primary-hover text-primary-foreground">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button> */}
      </div>

      {/* Stats Cards
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalPatients}</div>
            <p className="text-xs text-muted-foreground">Real-time count</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">23</div>
            <p className="text-xs text-muted-foreground">Awaiting documents</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Registration Form */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            New Patient Registration
          </CardTitle>
          <CardDescription>Fill in patient details to create a new record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="Enter first name" 
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="phone" 
                  placeholder="Enter phone number" 
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter email address" 
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input 
                id="dob" 
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a+">A+</SelectItem>
                  <SelectItem value="a-">A-</SelectItem>
                  <SelectItem value="b+">B+</SelectItem>
                  <SelectItem value="b-">B-</SelectItem>
                  <SelectItem value="ab+">AB+</SelectItem>
                  <SelectItem value="ab-">AB-</SelectItem>
                  <SelectItem value="o+">O+</SelectItem>
                  <SelectItem value="o-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea 
                id="address" 
                placeholder="Enter complete address" 
                className="pl-10 min-h-[80px]"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical-history">Medical History</Label>
            <Textarea 
              id="medical-history" 
              placeholder="Enter any relevant medical history, allergies, or conditions" 
              className="min-h-[100px]"
              value={formData.medicalHistory}
              onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
            />
          </div>

          <div className="flex gap-4 pt-4">
            {/* <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register Patient"}
            </Button> */}
            <Button 
              className="bg-primary hover:bg-primary-hover text-primary-foreground flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}  // 🔹 disable if not valid
            >
              {isSubmitting ? "Registering..." : "Register Patient"}
            </Button>
            {/* <Button variant="outline" className="flex-1">
              Save as Draft
            </Button> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}