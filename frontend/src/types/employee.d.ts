export interface RoleType {
  role: string;       // MongoDB ObjectId
  role_name: string;  // Role name
}

export interface EmployeeType {
  primary_role_type: RoleType;
  secondary_role_type?: RoleType[];
}


export interface Employee {
  _id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  employee_type: EmployeeType;
  department: string | null;
  date_of_joining: string;
  salary: number | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}
