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
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useSortable } from "@/hooks/useSortable";

interface PatientRecord {
  _id: string;
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

const BASE_URL = "http://localhost:4000/api/patients"; 
export default function PatientRecords() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
  try {
    setIsLoading(true);
    const res = await fetch(`${BASE_URL}/getPatients`);
    if (!res.ok) throw new Error("Failed to fetch patients");
    const data = await res.json();
    setPatientRecords(data.patients || []);
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

        {/* Patient Records Table */}
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
                        onClick={() => requestSort("_id")}
                      >
                        Patient ID
                        {getSortIcon("_id")}
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
                    sortedData.map((patient) => (
                      <tr
                        key={patient._id}
                        className="border-t hover:bg-muted/50"
                      >
                        <td className="p-3 font-medium text-primary">
                          {patient._id.slice(0, 8)}
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
                            <Button
                              size="sm"
                              variant="medical"
                              className="h-8 px-2"
                              onClick={() =>
                                (window.location.href = `/appointment-scheduling?patient_id=${patient._id}`)
                              }
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Schedule
                            </Button>
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
