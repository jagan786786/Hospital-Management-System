import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Users, Shield, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Role = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'pharmacist' | 'hr';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_type: string;
  roles?: Role[];
}

const allRoles: Role[] = ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'hr'];

const getRoleDescription = (role: Role): string => {
  const descriptions = {
    admin: "Full system access and management",
    doctor: "Patient care and prescription management",
    nurse: "Patient care and basic management",
    receptionist: "Patient registration and appointments",
    pharmacist: "Medicine inventory and dispensing",
    hr: "Employee management and HR functions"
  };
  return descriptions[role];
};

const getRoleColor = (role: Role): string => {
  const colors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    doctor: "bg-blue-100 text-blue-800 border-blue-200",
    nurse: "bg-green-100 text-green-800 border-green-200",
    receptionist: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pharmacist: "bg-purple-100 text-purple-800 border-purple-200",
    hr: "bg-orange-100 text-orange-800 border-orange-200"
  };
  return colors[role];
};

const UserRoleManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadEmployeesWithRoles();
  }, []);

  const loadEmployeesWithRoles = async () => {
    try {
      setLoading(true);
      
      // Load employees
      const { data: employeesData, error: empError } = await supabase
        .from('employees')
        .select('id, first_name, last_name, email, employee_type')
        .order('first_name');

      if (empError) throw empError;

      // Load user roles for each employee
      const employeesWithRoles = await Promise.all(
        (employeesData || []).map(async (emp) => {
          // Note: This assumes employee.id maps to auth.users.id
          // You might need to adjust this based on your auth setup
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', emp.id);

          return {
            ...emp,
            roles: roles?.map(r => r.role as Role) || []
          };
        })
      );

      setEmployees(employeesWithRoles);
    } catch (error) {
      console.error('Error loading employees with roles:', error);
      toast({
        title: "Error",
        description: "Failed to load employees and roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: Role, hasRole: boolean) => {
    try {
      if (hasRole) {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role });

        if (error) throw error;
      } else {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);

        if (error) throw error;
      }

      // Update local state
      setEmployees(prev => prev.map(emp => {
        if (emp.id === userId) {
          const updatedRoles = hasRole 
            ? [...(emp.roles || []), role]
            : (emp.roles || []).filter(r => r !== role);
          return { ...emp, roles: updatedRoles };
        }
        return emp;
      }));

      toast({
        title: "Success",
        description: `Role ${hasRole ? 'added' : 'removed'} successfully`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const hasRole = (employee: Employee, role: Role): boolean => {
    return employee.roles?.includes(role) || false;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Loading user roles...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">User Role Management</h1>
        <p className="text-muted-foreground">
          Assign roles to employees to control their access to different screens and features
        </p>
      </div>

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Employee Role Assignment
          </CardTitle>
          <CardDescription>
            Select an employee to manage their roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="employee-select">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee-select" className="w-full">
                  <SelectValue placeholder="Choose an employee to manage roles" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} - {emp.employee_type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedEmployee && (
              <div className="border-t pt-4">
                {(() => {
                  const employee = employees.find(e => e.id === selectedEmployee);
                  if (!employee) return null;

                  return (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">Managing roles for:</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.first_name} {employee.last_name} ({employee.email})
                        </p>
                        <div className="flex gap-2 mt-2">
                          {employee.roles?.map(role => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {role}
                            </Badge>
                          ))}
                          {(!employee.roles || employee.roles.length === 0) && (
                            <Badge variant="outline">No roles assigned</Badge>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Available Roles</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {allRoles.map(role => {
                            const employeeHasRole = hasRole(employee, role);
                            
                            return (
                              <div key={role} className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
                                employeeHasRole ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                              }`}>
                                <Checkbox
                                  id={`role-${role}`}
                                  checked={employeeHasRole}
                                  onCheckedChange={(checked) => 
                                    updateUserRole(employee.id, role, checked as boolean)
                                  }
                                />
                                <div className="flex-1">
                                  <Label 
                                    htmlFor={`role-${role}`}
                                    className="text-sm font-medium capitalize cursor-pointer block"
                                  >
                                    {role}
                                  </Label>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {getRoleDescription(role)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* All Employees Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Roles Overview</CardTitle>
          <CardDescription>
            Current role assignments for all employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No employees found</p>
            ) : (
              employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{emp.first_name} {emp.last_name}</h4>
                      <Badge variant="outline" className="text-xs">{emp.employee_type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{emp.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 max-w-md">
                    {emp.roles && emp.roles.length > 0 ? (
                      emp.roles.map(role => (
                        <Badge key={role} className={getRoleColor(role) + " text-xs"}>
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs">No roles</Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManagement;