import { useState, useEffect, useMemo } from "react";
import ReactSelect from "react-select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Edit,
  UserCheck,
  UserX,
  Building2,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { Employee } from "@/types/employee";
import { format } from "date-fns";
import { usePagination } from "@/hooks/usePagination";
import { TablePagination } from "@/components/ui/table-pagination";
import {
  getEmployees,
  updateEmployee,
  getRoles,
} from "@/api/services/employeService";

// -------------------- Schema --------------------
const employeeSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  primary_role: z.string().optional(),
  secondary_roles: z.array(z.string()).optional(),
  department: z.string().optional(),
  salary: z.string().optional(),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  date_of_joining: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

// -------------------- Helper --------------------
const filterEmployees = (employees: Employee[], searchTerm: string) => {
  if (!searchTerm) return employees;
  const term = searchTerm.toLowerCase();
  return employees.filter(
    (emp) =>
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(term) ||
      (emp.employee_id || "").toLowerCase().includes(term)
  );
};

// -------------------- Component --------------------
export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  // ---------------- Fetch employees ----------------
  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ---------------- Fetch roles ----------------
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(
          response.data.map((r: any) => ({ value: r._id, label: r.name }))
        );
      } catch (err) {
        console.error(err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  // ---------------- Filtered employees ----------------
  const filteredEmployees = useMemo(
    () => filterEmployees(employees, searchTerm),
    [employees, searchTerm]
  );

  // ---------------- Pagination (applied to filtered) ----------------
  const pagination = usePagination(filteredEmployees, pageSize);

  // ---------------- Employee status toggle ----------------
  const toggleEmployeeStatus = async (employee: Employee) => {
    const newStatus = employee.status === "active" ? "inactive" : "active";
    try {
      await updateEmployee(employee._id, { status: newStatus });
      toast.success(
        `Employee ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully`
      );
      fetchEmployees();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update employee status");
    }
  };

  // ---------------- Edit dialog ----------------
  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      phone: employee.phone,
      primary_role: employee.employee_type?.primary_role_type?.role || "",
      secondary_roles:
        employee.employee_type?.secondary_role_type?.map((r) => r.role) || [],
      department: employee.department || "",
      salary: employee.salary?.toString() || "",
      address: employee.address || "",
      emergency_contact_name: employee.emergency_contact_name || "",
      emergency_contact_phone: employee.emergency_contact_phone || "",
      date_of_joining: employee.date_of_joining,
    });
    setIsDialogOpen(true);
  };

  // ---------------- Update employee ----------------
  const onSubmit = async (data: EmployeeFormData) => {
    if (!editingEmployee) return;
    setIsSubmitting(true);
    try {
      const primaryRole = roles.find((r) => r.value === data.primary_role);
      const secondaryRoles = (data.secondary_roles || [])
        .filter((r) => r !== data.primary_role)
        .map((roleId) => roles.find((r) => r.value === roleId))
        .filter(Boolean);

      await updateEmployee(editingEmployee._id, {
        ...data,
        employee_type: {
          primary_role_type: primaryRole
            ? { role: primaryRole.value, role_name: primaryRole.label }
            : null,
          secondary_role_type: secondaryRoles.map((r) => ({
            role: r!.value,
            role_name: r!.label,
          })),
        },
        salary: data.salary ? parseFloat(data.salary) : null,
      });

      toast.success("Employee updated successfully!");
      setIsDialogOpen(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to update employee record");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return <div className="text-center p-6">Loading employees...</div>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Employee Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all hospital employees
          </p>
        </div>
      </div>

      {/* 🔹 Search Input */}
      <Card>
        <CardContent>
          <Input
            placeholder="Search by Employee Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Employee Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <CardTitle>All Employees ({filteredEmployees.length})</CardTitle>
          </div>
          <CardDescription>
            Manage employee records, update information, and toggle status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Employee Role Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Joining Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-6 text-muted-foreground"
                    >
                      {searchTerm
                        ? "No employees found matching your search."
                        : "No employees found."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pagination.paginatedData.map((employee) => (
                    <TableRow key={employee._id}>
                      <TableCell className="font-mono text-sm">
                        {employee.employee_id}
                      </TableCell>
                      <TableCell>
                        {employee.first_name} {employee.last_name}
                      </TableCell>
                      <TableCell className="flex flex-wrap gap-1">
                        {employee.employee_type?.primary_role_type && (
                          <Badge variant="default">
                            {employee.employee_type.primary_role_type.role_name}
                          </Badge>
                        )}
                        {employee.employee_type?.secondary_role_type?.map(
                          (role, idx) => (
                            <Badge key={idx} variant="secondary">
                              {role.role_name}
                            </Badge>
                          )
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {employee.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.department || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {format(
                            new Date(employee.date_of_joining),
                            "MMM dd, yyyy"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            employee.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {employee.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant={
                              employee.status === "active"
                                ? "destructive"
                                : "default"
                            }
                            size="sm"
                            onClick={() => toggleEmployeeStatus(employee)}
                          >
                            {employee.status === "active" ? (
                              <UserX className="w-4 h-4" />
                            ) : (
                              <UserCheck className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination {...pagination} onPageSizeChange={setPageSize} />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information. Email and phone must be unique.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* First Name */}
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Last Name */}
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Primary Role */}
              <FormField
                control={form.control}
                name="primary_role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select primary role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Secondary Roles */}
              <FormField
                control={form.control}
                name="secondary_roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Roles</FormLabel>
                    <FormControl>
                      <ReactSelect
                        isMulti
                        options={roles}
                        value={roles.filter((r) =>
                          field.value?.includes(r.value)
                        )}
                        onChange={(selected) =>
                          field.onChange(selected.map((s) => s.value))
                        }
                      />
                    </FormControl>
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
                    <FormLabel>Department</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Date of Joining */}
              <FormField
                control={form.control}
                name="date_of_joining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Joining</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Salary */}
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Emergency Contact */}
              <FormField
                control={form.control}
                name="emergency_contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergency_contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Address */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Updating..." : "Update Employee"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
