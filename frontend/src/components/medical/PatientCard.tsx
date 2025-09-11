import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Phone, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Patient {
  id: string;
  name: string;
  age: number;
  phone: string;
  appointmentTime: string;
  status: "waiting" | "in-progress" | "completed";
  visitType: "follow-up" | "new-patient" | "consultation";
  avatar?: string;
}

interface PatientCardProps {
  patient: Patient;
}

const statusColors = {
  waiting: "bg-warning/20 text-warning-foreground border-warning/30",
  "in-progress": "bg-primary/20 text-primary-foreground border-primary/30",
  completed: "bg-success/20 text-success-foreground border-success/30",
};

const visitTypeColors = {
  "follow-up": "bg-secondary text-secondary-foreground",
  "new-patient": "bg-accent/20 text-accent-foreground border-accent/30", 
  "consultation": "bg-muted text-muted-foreground",
};

export function PatientCard({ patient }: PatientCardProps) {
  const navigate = useNavigate();

  const handleViewPatient = () => {
    navigate(`/patient/${patient.id}`);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="hover:shadow-medical transition-medical cursor-pointer group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 border-2 border-primary/20">
              <AvatarImage src={patient.avatar} />
              <AvatarFallback className="bg-gradient-medical text-primary-foreground font-medium">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{patient.name}</h3>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="text-sm">{patient.age} years</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
              </div>
            </div>
          </div>
          <Badge className={statusColors[patient.status]} variant="outline">
            {patient.status.replace("-", " ")}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{patient.appointmentTime}</span>
            </div>
            <Badge className={visitTypeColors[patient.visitType]} variant="outline">
              {patient.visitType.replace("-", " ")}
            </Badge>
          </div>
          
          <Button 
            onClick={handleViewPatient}
            variant="medical" 
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-smooth"
          >
            View Patient
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}